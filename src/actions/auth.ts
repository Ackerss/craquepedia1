"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ready } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
/** senha provisória que um colega define (pode ser curta, a pessoa troca depois) */
const MIN_TEMP = 4;

export async function login(_: unknown, form: FormData) {
  await ready();
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/") || "/";
  const [u] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (u?.lockedUntil && u.lockedUntil > new Date()) {
    const min = Math.ceil((u.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Muitas tentativas erradas. Por segurança, tente de novo em ${min} minuto(s).` };
  }
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) {
    if (u) {
      // bloqueia por 15 minutos depois de 5 erros seguidos (evita chutarem a senha)
      const fails = u.failedLogins + 1;
      await db
        .update(users)
        .set(fails >= MAX_FAILS ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000) } : { failedLogins: fails })
        .where(eq(users.id, u.id));
      if (fails >= MAX_FAILS) return { error: `Senha errada ${MAX_FAILS} vezes. Acesso bloqueado por ${LOCK_MINUTES} minutos.` };
    }
    return { error: "Usuário ou senha incorretos." };
  }
  if (u.failedLogins || u.lockedUntil) await db.update(users).set({ failedLogins: 0, lockedUntil: null }).where(eq(users.id, u.id));
  const token = await signSession({ uid: u.id, name: u.name, username: u.username });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  // só redireciona para páginas internas (evita "//site-externo")
  redirect(/^\/(?![/\\])/.test(next) ? next : "/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function changePassword(_: unknown, form: FormData) {
  const s = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next.length < 8) return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  const [u] = await db.select().from(users).where(eq(users.id, s.uid)).limit(1);
  if (!u || !(await bcrypt.compare(current, u.passwordHash))) return { error: "Senha atual incorreta." };
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 10), mustChangePassword: false }).where(eq(users.id, s.uid));
  revalidatePath("/", "layout");
  return { ok: "Senha alterada com sucesso." };
}

export async function createUser(_: unknown, form: FormData) {
  await requireUser();
  const username = String(form.get("username") ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!username || !name) return { error: "Preencha nome e usuário." };
  if (password.length < MIN_TEMP) return { error: `A senha precisa ter pelo menos ${MIN_TEMP} caracteres.` };
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  if (exists.length) return { error: "Esse usuário já existe. Use \"Definir senha\" ao lado do nome dele." };
  await db.insert(users).values({
    username,
    name,
    passwordHash: await bcrypt.hash(password, 10),
    color: String(form.get("color") || "#3b82f6"),
    mustChangePassword: true,
  });
  revalidatePath("/configuracoes");
  return { ok: `Acesso de ${name} criado. Usuário: ${username}. No primeiro login ele verá um aviso para trocar a senha.`, username };
}

/** Define uma senha provisória para outra pessoa da equipe (esqueceu a senha, primeiro acesso etc.). */
export async function setUserPassword(userId: string, _: unknown, form: FormData) {
  const s = await requireUser();
  if (userId === s.uid) return { error: "Para a sua própria senha, use \"Minha senha\"." };
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_TEMP) return { error: `A senha precisa ter pelo menos ${MIN_TEMP} caracteres.` };
  const [u] = await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, 10), mustChangePassword: true, failedLogins: 0, lockedUntil: null })
    .where(eq(users.id, userId))
    .returning({ username: users.username, name: users.name });
  if (!u) return { error: "Usuário não encontrado." };
  revalidatePath("/configuracoes");
  return { ok: `Senha de ${u.name} definida. Usuário: ${u.username}.`, username: u.username };
}

/** Primeiro acesso: só funciona enquanto não existe nenhum usuário. */
export async function setupFirstUser(_: unknown, form: FormData) {
  await ready();
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length) return { error: "O primeiro acesso já foi configurado. Faça login." };
  const name = String(form.get("name") ?? "").trim();
  const username = String(form.get("username") ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  const password = String(form.get("password") ?? "");
  if (!name || !username) return { error: "Preencha nome e usuário." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  const [u] = await db.insert(users).values({ name, username, passwordHash: await bcrypt.hash(password, 10) }).returning();
  const token = await signSession({ uid: u.id, name: u.name, username: u.username });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE });
  redirect("/");
}
