"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { packages, services, settings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { parseBRL, slugify, str } from "@/lib/utils";

export async function saveService(id: string | null, _: unknown, form: FormData) {
  await requireUser();
  const name = str(form.get("name"));
  if (!name) return { error: "Informe o nome do serviço." };
  const values = {
    name,
    description: str(form.get("description")),
    priceCents: parseBRL(form.get("price")),
    defaultDays: Number(form.get("defaultDays") || 7),
    icon: str(form.get("icon")) ?? "FileText",
    active: form.get("active") === "on",
  };
  if (id) await db.update(services).set(values).where(eq(services.id, id));
  else await db.insert(services).values({ ...values, key: slugify(name).replace(/-/g, "_") + "_" + Date.now().toString(36).slice(-3), sort: 50 });
  revalidatePath("/configuracoes");
  return { ok: "Serviço salvo." };
}

export async function savePackage(id: string | null, _: unknown, form: FormData) {
  await requireUser();
  const name = str(form.get("name"));
  if (!name) return { error: "Informe o nome do pacote." };
  const values = {
    name,
    description: str(form.get("description")),
    priceCents: parseBRL(form.get("price")),
    serviceKeys: form.getAll("services").map(String),
    highlight: form.get("highlight") === "on",
    active: form.get("active") === "on",
  };
  if (!values.serviceKeys.length) return { error: "Escolha pelo menos um serviço." };
  if (id) await db.update(packages).set(values).where(eq(packages.id, id));
  else await db.insert(packages).values({ ...values, sort: 50 });
  revalidatePath("/configuracoes");
  return { ok: "Pacote salvo." };
}

export async function deletePackage(id: string) {
  await requireUser();
  await db.delete(packages).where(eq(packages.id, id));
  revalidatePath("/configuracoes");
}

export async function saveCompany(_: unknown, form: FormData) {
  await requireUser();
  const value = {
    name: str(form.get("name")) ?? "Craquepedia",
    whatsapp: str(form.get("whatsapp")) ?? "",
    instagram: str(form.get("instagram")) ?? "",
    email: str(form.get("email")) ?? "",
    site: str(form.get("site")) ?? "",
    pix: str(form.get("pix")) ?? "",
  };
  await db
    .insert(settings)
    .values({ key: "company", value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
  revalidatePath("/", "layout");
  return { ok: "Dados da empresa salvos." };
}
