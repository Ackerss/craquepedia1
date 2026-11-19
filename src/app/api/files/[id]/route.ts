import { eq } from "drizzle-orm";
import { db } from "@/db";
import { files } from "@/db/schema";
import { ready } from "@/lib/data";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("not found", { status: 404 });
  await ready();
  const [f] = await db.select().from(files).where(eq(files.id, id)).limit(1);
  if (!f) return new Response("not found", { status: 404 });
  return new Response(new Uint8Array(f.data), {
    headers: {
      "Content-Type": f.mime,
      "Content-Length": String(f.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
