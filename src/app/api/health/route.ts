import { ready } from "@/lib/data";
import { aiEnabled } from "@/lib/ai";

export async function GET() {
  try {
    await ready();
    return Response.json({ ok: true, db: true, ai: aiEnabled() });
  } catch (e) {
    return Response.json({ ok: false, error: String((e as Error).message).slice(0, 200) }, { status: 500 });
  }
}
