import { eq } from "drizzle-orm";
import { db } from "@/db";
import { files } from "@/db/schema";
import { ready } from "@/lib/data";

const SAFE = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("not found", { status: 404 });
  await ready();
  const [f] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  if (!f) return new Response("not found", { status: 404 });
  // só entrega como imagem o que é imagem de verdade; qualquer outra coisa vai como download (nunca roda script no site)
  const safe = SAFE.has(f.mime) ? f.mime : "application/octet-stream";
  return new Response(new Uint8Array(f.data), {
    headers: {
      "Content-Type": safe,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
      ...(safe === "application/octet-stream" ? { "Content-Disposition": `attachment; filename="${encodeURIComponent(f.name ?? "arquivo")}"` } : {}),
      "Content-Length": String(f.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
