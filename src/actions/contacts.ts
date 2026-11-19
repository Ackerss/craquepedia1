"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contacts, outreach } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getAthlete, logActivity } from "@/lib/data";
import { str, todayISO } from "@/lib/utils";

function contactFromForm(form: FormData) {
  return {
    name: str(form.get("name")) ?? "",
    organization: str(form.get("organization")),
    kind: str(form.get("kind")) ?? "clube",
    sports: form.getAll("sports").map(String).filter(Boolean),
    country: str(form.get("country")) ?? "Brasil",
    city: str(form.get("city")),
    email: str(form.get("email")),
    phone: str(form.get("phone"))?.replace(/\D/g, "") || null,
    instagram: str(form.get("instagram")),
    notes: str(form.get("notes")),
  };
}

export async function saveContact(_: unknown, form: FormData) {
  await requireUser();
  const id = str(form.get("id"));
  const data = contactFromForm(form);
  if (!data.name) return { error: "Informe o nome do contato." };
  if (!data.email && !data.phone) return { error: "Informe pelo menos um WhatsApp ou e-mail." };
  if (id) await db.update(contacts).set(data).where(eq(contacts.id, id));
  else await db.insert(contacts).values(data);
  revalidatePath("/contatos");
  return { ok: true };
}

export async function deleteContact(id: string) {
  await requireUser();
  await db.delete(contacts).where(eq(contacts.id, id));
  revalidatePath("/contatos");
}

/** Registra que o material do atleta foi enviado para um ou mais contatos. */
export async function logOutreach(athleteId: string, contactIds: string[], channel: string, notes?: string) {
  const s = await requireUser();
  if (!contactIds.length) return { error: "Escolha pelo menos um contato." };
  const today = todayISO();
  const follow = new Date(today + "T12:00:00");
  follow.setDate(follow.getDate() + 7);
  await db.insert(outreach).values(
    contactIds.map((contactId) => ({
      athleteId,
      contactId,
      channel,
      notes: notes || null,
      sentAt: today,
      followUpAt: follow.toISOString().slice(0, 10),
      userId: s.uid,
    })),
  );
  const a = await getAthlete(athleteId);
  await logActivity("divulgacao", `Enviou o material de ${a?.nickname || a?.fullName} para ${contactIds.length} contato(s)`, athleteId, s.uid);
  revalidatePath(`/atletas/${athleteId}`);
  revalidatePath("/contatos");
  revalidatePath("/");
  return { ok: true };
}

export async function setOutreachStatus(id: string, status: string, athleteId: string) {
  await requireUser();
  await db
    .update(outreach)
    .set({ status, updatedAt: new Date(), followUpAt: status === "enviado" ? undefined : null })
    .where(eq(outreach.id, id));
  revalidatePath(`/atletas/${athleteId}`);
  revalidatePath("/contatos");
  revalidatePath("/");
}

export async function setOutreachNotes(id: string, notes: string, athleteId: string) {
  await requireUser();
  await db.update(outreach).set({ notes, updatedAt: new Date() }).where(eq(outreach.id, id));
  revalidatePath(`/atletas/${athleteId}`);
}

export async function deleteOutreach(id: string, athleteId: string) {
  await requireUser();
  await db.delete(outreach).where(eq(outreach.id, id));
  revalidatePath(`/atletas/${athleteId}`);
  revalidatePath("/contatos");
}
