"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/db";
import { athletes, files, intakes, orders, packages, type NewAthlete } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { aiAvailable, enrichAthlete, reviewAthlete } from "@/lib/ai";
import { getAthlete, logActivity, ready, uniqueSlug } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { createDeliverablesFor } from "@/lib/work";
import { int, str } from "@/lib/utils";

export async function createIntake(_: unknown, form: FormData) {
  const s = await requireUser();
  const token = randomBytes(12).toString("base64url");
  const athleteId = str(form.get("athleteId"));
  const [row] = await db
    .insert(intakes)
    .values({
      token,
      athleteId,
      clientName: str(form.get("clientName")),
      clientPhone: str(form.get("clientPhone")),
      sport: str(form.get("sport")),
      packageId: str(form.get("packageId")),
      createdBy: s.uid,
    })
    .returning();
  await logActivity("formulario", `Gerou link de formulário${row.clientName ? ` para ${row.clientName}` : ""}`, athleteId, s.uid);
  revalidatePath("/formularios");
  return { ok: true, token: row.token, id: row.id };
}

export async function deleteIntake(id: string) {
  await requireUser();
  await db.delete(intakes).where(eq(intakes.id, id));
  revalidatePath("/formularios");
}

type IntakeResult = { error?: string; ok?: boolean };

/** Público: o atleta envia o formulário. Tudo o que vem depois é automático. */
export async function submitIntake(token: string, _: unknown, form: FormData): Promise<IntakeResult> {
  await ready();
  const [intake] = await db.select().from(intakes).where(eq(intakes.token, token)).limit(1);
  if (!intake) return { error: "Link inválido. Peça um novo link à Craquepedia." };
  if (intake.status !== "aberto") return { error: "Este formulário já foi enviado. Obrigado!" };
  if (form.get("consent") !== "on") return { error: "É preciso aceitar o uso dos dados para continuar." };

  const fullName = str(form.get("fullName"));
  if (!fullName || fullName.split(/\s+/).length < 2) return { error: "Informe o nome completo." };
  const sport = str(form.get("sport")) ?? intake.sport ?? "outro";
  const def = getSport(sport);

  const sportData: Record<string, string> = {};
  for (const f of def.fields) {
    const v = form.getAll(`sd_${f.key}`).map(String).filter(Boolean);
    if (v.length) sportData[f.key] = v.join(", ");
  }
  const raw: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string" && v.trim() && !k.startsWith("$")) raw[k] = v;

  const values: Partial<NewAthlete> = {
    fullName,
    nickname: str(form.get("nickname")),
    sport,
    position: form.getAll("position").map(String).filter(Boolean).join(", ") || null,
    birthDate: str(form.get("birthDate")),
    gender: str(form.get("gender")),
    nationality: str(form.get("nationality")) ?? "Brasileira",
    secondNationality: str(form.get("secondNationality")),
    city: str(form.get("city")),
    state: str(form.get("state"))?.toUpperCase() ?? null,
    phone: str(form.get("phone")) ?? intake.clientPhone,
    email: str(form.get("email")),
    instagram: str(form.get("instagram")),
    otherSocials: str(form.get("otherSocials")),
    guardianName: str(form.get("guardianName")),
    guardianPhone: str(form.get("guardianPhone")),
    heightCm: int(form.get("heightCm")),
    weightKg: int(form.get("weightKg")),
    dominantSide: str(form.get("dominantSide")),
    currentClub: str(form.get("currentClub")),
    playingStyle: str(form.get("playingStyle")),
    bio: str(form.get("bio")),
    languages: str(form.get("languages")),
    education: {
      school: str(form.get("edu_school")) ?? undefined,
      grade: str(form.get("edu_grade")) ?? undefined,
      graduationYear: str(form.get("edu_graduationYear")) ?? undefined,
      english: str(form.get("edu_english")) ?? undefined,
    },
    videos: String(form.get("videos") ?? "")
      .split(/\s+/)
      .filter((u) => /^https?:\/\//.test(u))
      .map((url, i) => ({ title: `Vídeo ${i + 1}`, url })),
    sportData,
    source: str(form.get("source")),
    notes: [
      ["Clubes e trajetória", form.get("historico")],
      ["Conquistas", form.get("conquistas")],
      ["Números", form.get("numeros")],
      ["Objetivo", form.get("objetivo")],
    ]
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${String(v).trim()}`)
      .join("\n\n") || null,
    consentAt: new Date(),
    status: "ativo",
  };

  let athleteId = intake.athleteId;
  if (athleteId && (await getAthlete(athleteId))) {
    // Atualiza só o que o atleta preencheu (não apaga o que já existe)
    const filled = Object.fromEntries(
      Object.entries(values).filter(([, v]) => {
        if (v === null || v === undefined || v === "") return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === "object" && !(v instanceof Date)) return Object.values(v).some(Boolean);
        return true;
      }),
    );
    const current = await getAthlete(athleteId);
    if (filled.notes && current?.notes) filled.notes = `${current.notes}\n\n--- Atualização do atleta ---\n${filled.notes}`;
    await db.update(athletes).set({ ...filled, updatedAt: new Date() }).where(eq(athletes.id, athleteId));
  } else {
    const slug = await uniqueSlug(values.nickname ? `${values.nickname} ${fullName.split(" ").slice(-1)[0]}` : fullName);
    const [row] = await db
      .insert(athletes)
      .values({ ...(values as NewAthlete), slug, responsibleId: intake.createdBy })
      .returning({ id: athletes.id });
    athleteId = row.id;
  }

  // Fotos
  const photos = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 8);
  const photoIds: string[] = [];
  for (const [i, f] of photos.entries()) {
    if (!f.type.startsWith("image/") || f.size > 6 * 1024 * 1024) continue;
    const [fr] = await db
      .insert(files)
      .values({
        athleteId,
        kind: i === 0 ? "photo" : "gallery",
        name: f.name,
        mime: f.type,
        size: f.size,
        data: Buffer.from(await f.arrayBuffer()),
      })
      .returning({ id: files.id });
    photoIds.push(fr.id);
  }
  if (photoIds[0]) await db.update(athletes).set({ photoId: photoIds[0] }).where(eq(athletes.id, athleteId));

  // Pacote já combinado → cria pedido e entregas automaticamente
  if (intake.packageId) {
    const [p] = await db.select().from(packages).where(eq(packages.id, intake.packageId));
    if (p) {
      const [o] = await db
        .insert(orders)
        .values({ athleteId, packageId: p.id, title: `Pacote ${p.name}`, totalCents: p.priceCents, status: "aberto" })
        .returning({ id: orders.id });
      await createDeliverablesFor(athleteId, p.serviceKeys, { orderId: o.id, assigneeId: intake.createdBy });
    }
  }

  await db
    .update(intakes)
    .set({ status: "recebido", athleteId, payload: raw, photoIds, submittedAt: new Date(), clientName: fullName })
    .where(eq(intakes.id, intake.id));
  await logActivity("formulario", `${fullName} enviou o formulário`, athleteId, null);

  // IA roda depois da resposta (o atleta não espera)
  const aid = athleteId;
  after(async () => {
    try {
      const a = await getAthlete(aid);
      if (!a || !(await aiAvailable())) return;
      const e = await enrichAthlete(a, raw);
      await db
        .update(athletes)
        .set({
          bio: e.bio || a.bio,
          bioShort: e.bioShort || a.bioShort,
          bioEn: e.bioEn || a.bioEn,
          playingStyle: e.playingStyle || a.playingStyle,
          playingStyleEn: e.playingStyleEn || a.playingStyleEn,
          achievements: e.achievements.length ? e.achievements : a.achievements,
          career: e.career.length ? e.career : a.career,
          stats: e.stats.length ? e.stats : a.stats,
          aiMissing: e.missing,
          aiTips: e.tips,
          aiScore: e.score,
          updatedAt: new Date(),
        })
        .where(eq(athletes.id, aid));
      await db.update(intakes).set({ status: "processado" }).where(eq(intakes.id, intake.id));
      await logActivity("ia", `IA organizou o perfil recebido (nota ${e.score})`, aid, null);
      // em seguida a IA revisora confere o resultado (erros, incoerências, o que falta)
      const fresh = await getAthlete(aid);
      if (fresh) {
        const r = await reviewAthlete(fresh);
        await db.update(athletes).set({ aiReview: r, aiReviewedAt: new Date() }).where(eq(athletes.id, aid));
        await logActivity("ia", `IA revisou o perfil recebido (nota ${r.score})`, aid, null);
      }
    } catch (err) {
      console.error("[intake ai]", err);
    }
  });

  return { ok: true };
}
