import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "cq_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

let cachedKey: Uint8Array | null = null;

/** Usa AUTH_SECRET; se não existir, deriva uma chave estável da conexão do banco (nunca exposta). */
async function key() {
  if (cachedKey) return cachedKey;
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return (cachedKey = new TextEncoder().encode(s));
  const base = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!base) throw new Error("AUTH_SECRET não configurado");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("cq-session::" + base));
  return (cachedKey = new Uint8Array(digest));
}

export type SessionData = { uid: string; name: string; username: string };

export async function signSession(data: SessionData) {
  return new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(await key());
}

export async function verifySession(token?: string | null): Promise<SessionData | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await key());
    return { uid: String(payload.uid), name: String(payload.name), username: String(payload.username) };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE;
