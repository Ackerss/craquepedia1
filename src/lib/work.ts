import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { athletes, deliverables, services } from "@/db/schema";
import { DEFAULT_CHECKLISTS } from "@/lib/catalog";
import { todayISO } from "@/lib/utils";

/** Cria as entregas de uma lista de serviços (com prazo, responsável e checklist padrão). */
export async function createDeliverablesFor(
  athleteId: string,
  serviceKeys: string[],
  opts: { orderId?: string | null; assigneeId?: string | null } = {},
) {
  if (!serviceKeys.length) return;
  const svc = await db.select().from(services).where(inArray(services.key, serviceKeys));
  const [a] = await db.select({ responsibleId: athletes.responsibleId }).from(athletes).where(eq(athletes.id, athleteId));
  const rows = serviceKeys
    .map((k) => svc.find((s) => s.key === k))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .map((s) => ({
      athleteId,
      orderId: opts.orderId ?? null,
      serviceKey: s.key,
      title: s.name,
      stage: "a_fazer",
      assigneeId: opts.assigneeId ?? a?.responsibleId ?? null,
      dueDate: todayISO(s.defaultDays),
      checklist: (DEFAULT_CHECKLISTS[s.key] ?? []).map((text) => ({ text, done: false })),
    }));
  if (rows.length) await db.insert(deliverables).values(rows);
}

