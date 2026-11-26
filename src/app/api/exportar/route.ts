import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { athletes, contacts, orders, payments } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { ready } from "@/lib/data";
import { ATHLETE_STATUS, ORDER_STATUS } from "@/lib/catalog";
import { CONTACT_KINDS } from "@/lib/outreach";
import { getSport } from "@/lib/sports";
import { ageFrom, fmtDate, todayISO } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Planilha (CSV com ";" — abre direto no Excel e no Google Planilhas). */
function csv(rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
}

const money = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

export async function GET(req: Request) {
  if (!(await getSession())) return new Response("não autorizado", { status: 401 });
  await ready();
  const tipo = new URL(req.url).searchParams.get("tipo") ?? "atletas";
  let rows: (string | number | null | undefined)[][] = [];

  if (tipo === "financeiro") {
    const list = await db
      .select({ o: orders, name: athletes.fullName })
      .from(orders)
      .innerJoin(athletes, eq(athletes.id, orders.athleteId))
      .orderBy(desc(orders.createdAt));
    const pays = await db.select().from(payments);
    rows = [["Data", "Atleta", "Contrato", "Total (R$)", "Recebido (R$)", "Falta (R$)", "Status", "Vencimento", "Forma", "Pagamentos"]];
    for (const { o, name } of list) {
      const ps = pays.filter((p) => p.orderId === o.id);
      rows.push([
        fmtDate(o.createdAt),
        name,
        o.title,
        money(o.totalCents),
        money(o.paidCents),
        money(o.status === "cancelado" ? 0 : Math.max(0, o.totalCents - o.paidCents)),
        ORDER_STATUS.find((s) => s.key === o.status)?.label ?? o.status,
        fmtDate(o.dueDate),
        o.paymentMethod,
        ps.map((p) => `${fmtDate(p.paidAt)} ${money(p.amountCents)}${p.method ? ` (${p.method})` : ""}`).join(" | "),
      ]);
    }
  } else if (tipo === "contatos") {
    const list = await db.select().from(contacts).orderBy(contacts.name);
    rows = [["Nome", "Organização", "Tipo", "Esportes", "País", "Cidade", "WhatsApp", "E-mail", "Instagram", "Observações"]];
    for (const c of list)
      rows.push([
        c.name,
        c.organization,
        CONTACT_KINDS.find((k) => k.key === c.kind)?.label ?? c.kind,
        c.sports.map((s) => getSport(s).name).join(", "),
        c.country,
        c.city,
        c.phone,
        c.email,
        c.instagram,
        c.notes,
      ]);
  } else {
    const list = await db.select().from(athletes).orderBy(athletes.fullName);
    rows = [["Nome", "Apelido", "Esporte", "Posição", "Nascimento", "Idade", "Cidade", "UF", "Clube", "WhatsApp", "E-mail", "Instagram", "Responsável", "Tel. responsável", "Status", "Altura (cm)", "Peso (kg)", "Cadastro"]];
    for (const a of list)
      rows.push([
        a.fullName,
        a.nickname,
        getSport(a.sport).name,
        a.position,
        fmtDate(a.birthDate),
        ageFrom(a.birthDate),
        a.city,
        a.state,
        a.currentClub,
        a.phone,
        a.email,
        a.instagram,
        a.guardianName,
        a.guardianPhone,
        ATHLETE_STATUS.find((s) => s.key === a.status)?.label ?? a.status,
        a.heightCm,
        a.weightKg,
        fmtDate(a.createdAt),
      ]);
  }
  const name = `craquepedia-${tipo}-${todayISO()}.csv`;
  return new Response(csv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" },
  });
}
