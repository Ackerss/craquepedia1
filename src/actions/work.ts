"use server";

import { eq, inArray, sql as dsql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { athletes, deliverables, orders, packages, payments, services } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { createDeliverablesFor } from "@/lib/work";
import { logActivity } from "@/lib/data";
import { brl, parseBRL, str, todayISO } from "@/lib/utils";

function refresh(athleteId?: string) {
  if (athleteId) revalidatePath(`/atletas/${athleteId}`);
  revalidatePath("/entregas");
  revalidatePath("/financeiro");
  revalidatePath("/");
}

/** Contratação: cria o pedido (financeiro) e todas as entregas automaticamente. */
export async function contractServices(athleteId: string, _: unknown, form: FormData) {
  const s = await requireUser();
  const packageId = str(form.get("packageId"));
  let keys = form.getAll("services").map(String);
  let title = "Serviços avulsos";
  let total = parseBRL(form.get("total"));
  if (packageId) {
    const [p] = await db.select().from(packages).where(eq(packages.id, packageId));
    if (p) {
      keys = Array.from(new Set([...p.serviceKeys, ...keys]));
      title = `Pacote ${p.name}`;
      if (!form.get("total")) total = p.priceCents;
    }
  } else if (!form.get("total") && keys.length) {
    const svc = await db.select().from(services).where(inArray(services.key, keys));
    total = svc.reduce((sum, x) => sum + x.priceCents, 0);
  }
  if (!keys.length) return { error: "Escolha um pacote ou pelo menos um serviço." };
  const paidNow = parseBRL(form.get("paidNow"));
  const status = paidNow >= total && total > 0 ? "pago" : paidNow > 0 ? "parcial" : total === 0 ? "pago" : "aberto";
  const [o] = await db
    .insert(orders)
    .values({
      athleteId,
      packageId,
      title,
      totalCents: total,
      paidCents: paidNow,
      status,
      paymentMethod: str(form.get("paymentMethod")),
      dueDate: str(form.get("dueDate")),
      notes: str(form.get("notes")),
    })
    .returning({ id: orders.id });
  if (paidNow > 0) {
    await db.insert(payments).values({ orderId: o.id, amountCents: paidNow, method: str(form.get("paymentMethod")), paidAt: todayISO() });
  }
  await createDeliverablesFor(athleteId, keys, { orderId: o.id, assigneeId: str(form.get("assigneeId")) });
  await db.update(athletes).set({ status: "ativo", updatedAt: new Date() }).where(eq(athletes.id, athleteId));
  await logActivity("contrato", `Contratou ${title} (${brl(total)}) — ${keys.length} entrega(s) criadas`, athleteId, s.uid);
  refresh(athleteId);
  return { ok: true };
}

export async function addDeliverable(athleteId: string, serviceKey: string) {
  await requireUser();
  await createDeliverablesFor(athleteId, [serviceKey]);
  refresh(athleteId);
}

export async function moveDeliverable(id: string, stage: string) {
  const s = await requireUser();
  const [d] = await db
    .update(deliverables)
    .set({ stage, updatedAt: new Date(), deliveredAt: stage === "entregue" ? new Date() : null })
    .where(eq(deliverables.id, id))
    .returning();
  if (d && stage === "entregue") await logActivity("entrega", `Entregou: ${d.title}`, d.athleteId, s.uid);
  refresh(d?.athleteId);
}

export async function updateDeliverable(id: string, _: unknown, form: FormData) {
  await requireUser();
  const [d] = await db
    .update(deliverables)
    .set({
      title: str(form.get("title")) ?? "Entrega",
      assigneeId: str(form.get("assigneeId")),
      dueDate: str(form.get("dueDate")),
      link: str(form.get("link")),
      notes: str(form.get("notes")),
      stage: str(form.get("stage")) ?? "a_fazer",
      updatedAt: new Date(),
    })
    .where(eq(deliverables.id, id))
    .returning();
  refresh(d?.athleteId);
  return { ok: true };
}

export async function toggleChecklistItem(id: string, index: number) {
  await requireUser();
  const [d] = await db.select().from(deliverables).where(eq(deliverables.id, id));
  if (!d) return;
  const list = [...d.checklist];
  if (!list[index]) return;
  list[index] = { ...list[index], done: !list[index].done };
  const allDone = list.length > 0 && list.every((i) => i.done);
  const stage = d.stage === "a_fazer" && list.some((i) => i.done) ? "producao" : d.stage;
  await db
    .update(deliverables)
    .set({ checklist: list, stage: allDone && d.stage !== "entregue" ? "revisao" : stage, updatedAt: new Date() })
    .where(eq(deliverables.id, id));
  refresh(d.athleteId);
}

export async function deleteDeliverable(id: string) {
  await requireUser();
  const [d] = await db.delete(deliverables).where(eq(deliverables.id, id)).returning();
  refresh(d?.athleteId);
}

export async function addPayment(orderId: string, _: unknown, form: FormData) {
  const s = await requireUser();
  const amount = parseBRL(form.get("amount"));
  if (amount <= 0) return { error: "Informe o valor recebido." };
  await db.insert(payments).values({
    orderId,
    amountCents: amount,
    method: str(form.get("method")),
    paidAt: str(form.get("paidAt")) ?? todayISO(),
  });
  const [o] = await db
    .update(orders)
    .set({ paidCents: dsql`${orders.paidCents} + ${amount}` })
    .where(eq(orders.id, orderId))
    .returning();
  if (o) {
    const status = o.paidCents >= o.totalCents ? "pago" : o.paidCents > 0 ? "parcial" : "aberto";
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    await logActivity("pagamento", `Recebeu ${brl(amount)} — ${o.title}`, o.athleteId, s.uid);
  }
  refresh(o?.athleteId);
  return { ok: true };
}

export async function cancelOrder(orderId: string) {
  const s = await requireUser();
  const [o] = await db.update(orders).set({ status: "cancelado" }).where(eq(orders.id, orderId)).returning();
  if (o) await logActivity("contrato", `Cancelou ${o.title}`, o.athleteId, s.uid);
  refresh(o?.athleteId);
}

export async function deleteOrder(orderId: string) {
  await requireUser();
  const [o] = await db.delete(orders).where(eq(orders.id, orderId)).returning();
  refresh(o?.athleteId);
}
