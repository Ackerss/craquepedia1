import "server-only";
import { and, asc, desc, eq, ilike, inArray, lte, ne, or, sql as dsql } from "drizzle-orm";
import { db } from "@/db";
import { activities, athletes, contacts, deliverables, intakes, orders, outreach, packages, payments, services, settings, users } from "@/db/schema";
import { ensureDatabase } from "@/db/setup";
import { slugify, todayISO } from "./utils";

export async function ready() {
  await ensureDatabase();
}

export async function logActivity(type: string, message: string, athleteId?: string | null, userId?: string | null) {
  await db.insert(activities).values({ type, message, athleteId: athleteId ?? null, userId: userId ?? null });
}

export async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "atleta";
  let slug = base;
  for (let i = 2; i < 500; i++) {
    const found = await db
      .select({ id: athletes.id })
      .from(athletes)
      .where(ignoreId ? and(eq(athletes.slug, slug), ne(athletes.id, ignoreId)) : eq(athletes.slug, slug))
      .limit(1);
    if (!found.length) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export async function listUsers() {
  await ready();
  return db.select({ id: users.id, name: users.name, username: users.username, color: users.color, mustChangePassword: users.mustChangePassword }).from(users).orderBy(asc(users.name));
}

export async function listServices(onlyActive = false) {
  await ready();
  const q = db.select().from(services).orderBy(asc(services.sort), asc(services.name));
  const all = await q;
  return onlyActive ? all.filter((s) => s.active) : all;
}

export async function listPackages(onlyActive = false) {
  await ready();
  const all = await db.select().from(packages).orderBy(asc(packages.sort), asc(packages.name));
  return onlyActive ? all.filter((p) => p.active) : all;
}

export async function listAthletes(opts: { q?: string; sport?: string; status?: string } = {}) {
  await ready();
  const conds = [];
  if (opts.q) {
    const like = `%${opts.q}%`;
    conds.push(or(ilike(athletes.fullName, like), ilike(athletes.nickname, like), ilike(athletes.currentClub, like), ilike(athletes.city, like)));
  }
  if (opts.sport) conds.push(eq(athletes.sport, opts.sport));
  if (opts.status) conds.push(eq(athletes.status, opts.status));
  const rows = await db
    .select({
      id: athletes.id,
      slug: athletes.slug,
      fullName: athletes.fullName,
      nickname: athletes.nickname,
      sport: athletes.sport,
      position: athletes.position,
      birthDate: athletes.birthDate,
      city: athletes.city,
      state: athletes.state,
      currentClub: athletes.currentClub,
      status: athletes.status,
      photoId: athletes.photoId,
      phone: athletes.phone,
      aiScore: athletes.aiScore,
      responsibleId: athletes.responsibleId,
      createdAt: athletes.createdAt,
    })
    .from(athletes)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(athletes.updatedAt));
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const dl = await db
    .select({ athleteId: deliverables.athleteId, stage: deliverables.stage, n: dsql<number>`count(*)::int` })
    .from(deliverables)
    .where(inArray(deliverables.athleteId, ids))
    .groupBy(deliverables.athleteId, deliverables.stage);
  return rows.map((r) => {
    const mine = dl.filter((d) => d.athleteId === r.id);
    const total = mine.reduce((s, d) => s + d.n, 0);
    const done = mine.filter((d) => d.stage === "entregue").reduce((s, d) => s + d.n, 0);
    return { ...r, deliveriesTotal: total, deliveriesDone: done };
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getAthlete(id: string) {
  if (!UUID.test(id)) return null; // endereço digitado errado → "não encontrado", não erro
  await ready();
  const [a] = await db.select().from(athletes).where(eq(athletes.id, id)).limit(1);
  return a ?? null;
}

export async function getAthleteBySlug(slug: string) {
  await ready();
  const [a] = await db.select().from(athletes).where(eq(athletes.slug, slug)).limit(1);
  return a ?? null;
}

export async function getAthleteBundle(id: string) {
  const a = await getAthlete(id);
  if (!a) return null;
  const [dels, ords, acts, gallery] = await Promise.all([
    db.select().from(deliverables).where(eq(deliverables.athleteId, id)).orderBy(asc(deliverables.createdAt)),
    db.select().from(orders).where(eq(orders.athleteId, id)).orderBy(desc(orders.createdAt)),
    db.select().from(activities).where(eq(activities.athleteId, id)).orderBy(desc(activities.createdAt)).limit(40),
    listGallery(id),
  ]);
  const orderIds = ords.map((o) => o.id);
  const pays = orderIds.length
    ? await db.select().from(payments).where(inArray(payments.orderId, orderIds)).orderBy(desc(payments.paidAt))
    : [];
  return { athlete: a, deliverables: dels, orders: ords, payments: pays, activities: acts, gallery };
}

export async function listGallery(athleteId: string) {
  const { files } = await import("@/db/schema");
  return db
    .select({ id: files.id, kind: files.kind, name: files.name, width: files.width, height: files.height, createdAt: files.createdAt })
    .from(files)
    .where(and(eq(files.athleteId, athleteId), ne(files.kind, "document")))
    .orderBy(asc(files.createdAt));
}

export async function listDeliverables() {
  await ready();
  return db
    .select({
      d: deliverables,
      athleteName: athletes.fullName,
      athleteNickname: athletes.nickname,
      athleteSport: athletes.sport,
      athletePhoto: athletes.photoId,
      athletePhone: athletes.phone,
      guardianName: athletes.guardianName,
      guardianPhone: athletes.guardianPhone,
      athleteSlug: athletes.slug,
    })
    .from(deliverables)
    .innerJoin(athletes, eq(athletes.id, deliverables.athleteId))
    .orderBy(asc(deliverables.dueDate), asc(deliverables.createdAt));
}

export async function listOrders() {
  await ready();
  return db
    .select({ o: orders, athleteName: athletes.fullName, athleteId: athletes.id, athletePhone: athletes.phone, guardianName: athletes.guardianName, guardianPhone: athletes.guardianPhone })
    .from(orders)
    .innerJoin(athletes, eq(athletes.id, orders.athleteId))
    .orderBy(desc(orders.createdAt));
}

export async function listPaymentsSince(isoDate: string) {
  return db
    .select({ p: payments, title: orders.title, athleteName: athletes.fullName, athleteId: athletes.id })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .innerJoin(athletes, eq(athletes.id, orders.athleteId))
    .where(dsql`${payments.paidAt} >= ${isoDate} and ${payments.paidAt} <= ${todayISO()}`)
    .orderBy(desc(payments.paidAt));
}

/** A equipe abriu o atleta: formulários dele deixam de contar como "novos". */
export async function markIntakesSeen(athleteId: string) {
  await db
    .update(intakes)
    .set({ seenAt: new Date() })
    .where(and(eq(intakes.athleteId, athleteId), dsql`${intakes.submittedAt} is not null`, dsql`${intakes.seenAt} is null`));
}

export async function listIntakes() {
  await ready();
  return db.select().from(intakes).orderBy(desc(intakes.createdAt)).limit(100);
}

export async function recentActivities(limit = 15) {
  return db
    .select({ a: activities, athleteName: athletes.fullName, userName: users.name })
    .from(activities)
    .leftJoin(athletes, eq(athletes.id, activities.athleteId))
    .leftJoin(users, eq(users.id, activities.userId))
    .orderBy(desc(activities.createdAt))
    .limit(limit);
}

export type CompanySettings = {
  name: string;
  whatsapp: string;
  instagram: string;
  email: string;
  site: string;
  pix: string;
};

const DEFAULT_COMPANY: CompanySettings = {
  name: "Craquepedia",
  whatsapp: "",
  instagram: "@craquepedia",
  email: "",
  site: "",
  pix: "",
};

export async function getCompany(): Promise<CompanySettings> {
  await ready();
  const [row] = await db.select().from(settings).where(eq(settings.key, "company")).limit(1);
  return { ...DEFAULT_COMPANY, ...((row?.value as Partial<CompanySettings>) ?? {}) };
}

export async function listContacts() {
  await ready();
  return db
    .select({
      c: contacts,
      // nomes de tabela escritos por extenso: sem isso o "id" da subconsulta era lido como o do próprio envio (dava sempre 0)
      sent: dsql<number>`(select count(*)::int from "outreach" o where o."contact_id" = "contacts"."id")`,
      positive: dsql<number>`(select count(*)::int from "outreach" o where o."contact_id" = "contacts"."id" and o."status" in ('interessado','teste','respondeu'))`,
    })
    .from(contacts)
    .orderBy(asc(contacts.name));
}

export async function listOutreachForAthlete(athleteId: string) {
  await ready();
  return db
    .select({ o: outreach, c: contacts })
    .from(outreach)
    .innerJoin(contacts, eq(outreach.contactId, contacts.id))
    .where(eq(outreach.athleteId, athleteId))
    .orderBy(desc(outreach.sentAt), desc(outreach.createdAt));
}

export async function listPendingFollowUps() {
  await ready();
  return db
    .select({ o: outreach, c: contacts, athleteName: athletes.fullName, athleteNickname: athletes.nickname, athleteSport: athletes.sport, athleteSlug: athletes.slug })
    .from(outreach)
    .innerJoin(contacts, eq(outreach.contactId, contacts.id))
    .innerJoin(athletes, eq(outreach.athleteId, athletes.id))
    .where(and(eq(outreach.status, "enviado"), lte(outreach.followUpAt, todayISO())))
    .orderBy(asc(outreach.followUpAt))
    .limit(10);
}
