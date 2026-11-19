import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __cqSql?: ReturnType<typeof postgres> };

function makeClient() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  return postgres(url, {
    prepare: false, // compatível com o pooler do Supabase (modo transação)
    max: isLocal ? 10 : 3,
    idle_timeout: 20,
    onnotice: () => {},
    ssl: isLocal ? false : "require",
  });
}

export const sql = globalForDb.__cqSql ?? makeClient();
if (process.env.NODE_ENV !== "production") globalForDb.__cqSql = sql;

export const db = drizzle(sql, { schema });
export { schema };
