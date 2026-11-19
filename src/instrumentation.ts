export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && (process.env.DATABASE_URL || process.env.POSTGRES_URL)) {
    const { ensureDatabase } = await import("./db/setup");
    await ensureDatabase().catch((e) => console.error("[craquepedia] falha ao preparar o banco:", e));
  }
}
