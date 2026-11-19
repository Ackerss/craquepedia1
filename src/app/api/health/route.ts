import { ready } from "@/lib/data";
import { aiStatus } from "@/lib/ai";

export async function GET() {
  try {
    await ready();
    const ai = await aiStatus();
    return Response.json({ ok: true, db: true, ai: ai.gemini || ai.gateway, gemini: ai.gemini, gateway: ai.gateway });
  } catch (e) {
    return Response.json({ ok: false, error: String((e as Error).message).slice(0, 200) }, { status: 500 });
  }
}
