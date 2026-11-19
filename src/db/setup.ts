import bcrypt from "bcryptjs";
import { sql } from "./index";
import { MIGRATIONS } from "./migrations.generated";
import { DEFAULT_PACKAGES, DEFAULT_SERVICES } from "@/lib/catalog";

let ready: Promise<void> | null = null;

/** Cria/atualiza as tabelas e o conteúdo inicial. Seguro para rodar várias vezes. */
export function ensureDatabase() {
  if (!ready) ready = run().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

async function run() {
  await sql`CREATE TABLE IF NOT EXISTS _cq_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
  const done = new Set((await sql<{ name: string }[]>`SELECT name FROM _cq_migrations`).map((r) => r.name));
  for (const m of MIGRATIONS) {
    if (done.has(m.name)) continue;
    await sql.begin(async (tx) => {
      // trava para evitar duas instâncias migrando ao mesmo tempo
      await tx`SELECT pg_advisory_xact_lock(424242)`;
      const again = await tx`SELECT 1 FROM _cq_migrations WHERE name = ${m.name}`;
      if (again.length) return;
      for (const s of m.statements) await tx.unsafe(s);
      await tx`INSERT INTO _cq_migrations (name) VALUES (${m.name})`;
    });
  }
  await seed();
}

async function seed() {
  const [{ count: svcCount }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM services`;
  if (svcCount === 0) {
    for (const s of DEFAULT_SERVICES) {
      await sql`INSERT INTO services (key, name, description, price_cents, default_days, icon, automatic, sort)
        VALUES (${s.key}, ${s.name}, ${s.description}, ${s.priceCents}, ${s.defaultDays}, ${s.icon}, ${s.automatic}, ${s.sort})
        ON CONFLICT (key) DO NOTHING`;
    }
  }
  const [{ count: pkgCount }] = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM packages`;
  if (pkgCount === 0) {
    for (const p of DEFAULT_PACKAGES) {
      await sql`INSERT INTO packages (name, description, price_cents, service_keys, highlight, sort)
        VALUES (${p.name}, ${p.description}, ${p.priceCents}, ${JSON.stringify(p.serviceKeys)}::jsonb, ${p.highlight}, ${p.sort})`;
    }
  }
  // Usuários iniciais: definidos por variáveis de ambiente (só cria se não existirem)
  const initial = [
    { username: "jacson", name: "Jacson", color: "#10b981", pass: process.env.SEED_PASSWORD_JACSON },
    { username: "diego", name: "Diego", color: "#3b82f6", pass: process.env.SEED_PASSWORD_DIEGO },
  ];
  for (const u of initial) {
    if (!u.pass) continue;
    const exists = await sql`SELECT 1 FROM users WHERE username = ${u.username}`;
    if (exists.length) continue;
    const hash = await bcrypt.hash(u.pass, 10);
    await sql`INSERT INTO users (username, name, password_hash, color) VALUES (${u.username}, ${u.name}, ${hash}, ${u.color})
      ON CONFLICT (username) DO NOTHING`;
  }
}
