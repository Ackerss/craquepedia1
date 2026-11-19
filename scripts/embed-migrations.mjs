// Gera src/db/migrations.generated.ts a partir de drizzle/*.sql
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
const files = readdirSync("drizzle").filter((f) => f.endsWith(".sql")).sort();
const list = files.map((f) => ({
  name: f.replace(/\.sql$/, ""),
  statements: readFileSync(`drizzle/${f}`, "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean),
}));
writeFileSync(
  "src/db/migrations.generated.ts",
  "// Arquivo gerado por scripts/embed-migrations.mjs — não editar\n" +
    `export const MIGRATIONS: { name: string; statements: string[] }[] = ${JSON.stringify(list, null, 2)};\n`,
);
console.log(`${list.length} migração(ões) embutida(s)`);
