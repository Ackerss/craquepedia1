"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ready } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";

export async function login(_: unknown, form: FormData) {
  await ready();
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/") || "/";
  const [u] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) {
    return { error: "Usuário ou senha incorretos." };
  }
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
  await db.update(users).set({ passwordHash: await bcrypt.hash(next, 10) }).where(eq(users.id, s.uid));
  return { ok: "Senha alterada com sucesso." };
}

export async function createUser(_: unknown, form: FormData) {
  await requireUser();
  const username = String(form.get("username") ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!username || !name) return { error: "Preencha nome e usuário." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
  if (exists.length) return { error: "Esse usuário já existe." };
  await db.insert(users).values({ username, name, passwordHash: await bcrypt.hash(password, 10), color: String(form.get("color") || "#8b5cf6") });
  return { ok: `Usuário ${username} criado.` };
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
