"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { athletes, files, type NewAthlete } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { enrichAthlete, generateText, reviewAthlete, type TextKind } from "@/lib/ai";
import { getAthlete, logActivity, ready, uniqueSlug } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { ATHLETE_STATUS } from "@/lib/catalog";
import { heightCm, int, str, weightKg } from "@/lib/utils";
import { imageMime } from "@/lib/server-utils";

function json<T>(v: FormDataEntryValue | null, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(String(v)) as T;
  } catch {
    return fallback;
  }
}

function parseAthleteForm(form: FormData): Partial<NewAthlete> {
  const sport = str(form.get("sport")) ?? "futebol";
  const def = getSport(sport);
  const sportData: Record<string, string> = {};
  for (const f of def.fields) {
    const v = form.getAll(`sd_${f.key}`).map(String).filter(Boolean);
    if (v.length) sportData[f.key] = v.join(", ");
  }
  return {
    fullName: str(form.get("fullName")) ?? "",
    nickname: str(form.get("nickname")),
    sport,
    position: str(form.get("position")),
    birthDate: str(form.get("birthDate")),
    gender: str(form.get("gender")),
    nationality: str(form.get("nationality")),
    secondNationality: str(form.get("secondNationality")),
    city: str(form.get("city")),
    state: str(form.get("state"))?.toUpperCase() ?? null,
    phone: str(form.get("phone")),
    email: str(form.get("email")),
    instagram: str(form.get("instagram")),
    otherSocials: str(form.get("otherSocials")),
    guardianName: str(form.get("guardianName")),
    guardianPhone: str(form.get("guardianPhone")),
    heightCm: heightCm(form.get("heightCm")),
    weightKg: weightKg(form.get("weightKg")),
    dominantSide: str(form.get("dominantSide")),
    currentClub: str(form.get("currentClub")),
    agent: str(form.get("agent")),
    bio: str(form.get("bio")),
    bioShort: str(form.get("bioShort")),
    bioEn: str(form.get("bioEn")),
    playingStyle: str(form.get("playingStyle")),
    playingStyleEn: str(form.get("playingStyleEn")),
    languages: str(form.get("languages")),
    achievements: json(form.get("achievements"), []),
    career: json(form.get("career"), []),
    stats: json(form.get("stats"), []),
    videos: json(form.get("videos"), []),
    education: {
      school: str(form.get("edu_school")) ?? undefined,
      grade: str(form.get("edu_grade")) ?? undefined,
      graduationYear: str(form.get("edu_graduationYear")) ?? undefined,
      gpa: str(form.get("edu_gpa")) ?? undefined,
      english: str(form.get("edu_english")) ?? undefined,
      satAct: str(form.get("edu_satAct")) ?? undefined,
    },
    sportData,
    source: str(form.get("source")),
    notes: str(form.get("notes")),
    responsibleId: str(form.get("responsibleId")),
    status: str(form.get("status")) ?? "ativo",
    accent: str(form.get("accent")) ?? "#10b981",
  };
}

export async function createAthlete(_: unknown, form: FormData) {
  const s = await requireUser();
  await ready();
  const data = parseAthleteForm(form);
  if (!data.fullName || data.fullName.length < 3) return { error: "Informe o nome completo do atleta." };
  const slug = await uniqueSlug(data.nickname ? `${data.nickname} ${data.fullName.split(" ").slice(-1)[0]}` : data.fullName);
  const [row] = await db
    .insert(athletes)
    .values({ ...(data as NewAthlete), slug, responsibleId: data.responsibleId ?? s.uid })
    .returning({ id: athletes.id });
  await logActivity("atleta_criado", `Cadastrou ${data.fullName}`, row.id, s.uid);
  revalidatePath("/atletas");
  redirect(`/atletas/${row.id}?novo=1`);
}

export async function updateAthlete(id: string, _: unknown, form: FormData) {
  const s = await requireUser();
  const data = parseAthleteForm(form);
  if (!data.fullName || data.fullName.length < 3) return { error: "Informe o nome completo do atleta." };
  await db.update(athletes).set({ ...data, updatedAt: new Date() }).where(eq(athletes.id, id));
  await logActivity("atleta_editado", `Atualizou o perfil de ${data.fullName}`, id, s.uid);
  revalidatePath(`/atletas/${id}`);
  redirect(`/atletas/${id}`);
}

export async function setAthleteStatus(id: string, status: string) {
  const s = await requireUser();
  await db.update(athletes).set({ status, updatedAt: new Date() }).where(eq(athletes.id, id));
  await logActivity("status", `Status alterado para ${ATHLETE_STATUS.find((x) => x.key === status)?.label ?? status}`, id, s.uid);
  revalidatePath(`/atletas/${id}`);
  revalidatePath("/atletas");
}

export async function setAthleteField(
  id: string,
  field: "accent" | "publicEnabled" | "responsibleId" | "portfolioTheme" | "resumeTemplate",
  value: string | boolean,
) {
  await requireUser();
  if ((field === "responsibleId" || field === "resumeTemplate") && value === "") value = null as unknown as string;
  await db.update(athletes).set({ [field]: value, updatedAt: new Date() }).where(eq(athletes.id, id));
  revalidatePath(`/atletas/${id}`);
}

export async function deleteAthlete(id: string) {
  const s = await requireUser();
  const a = await getAthlete(id);
  await db.delete(athletes).where(eq(athletes.id, id));
  await logActivity("atleta_excluido", `Excluiu ${a?.fullName ?? "atleta"}`, null, s.uid);
  revalidatePath("/atletas");
  redirect("/atletas");
}

/** IA: organiza, corrige e completa o perfil com base no que já existe. */
export async function runAthleteAI(id: string, mode: "fill" | "overwrite" = "fill") {
  const s = await requireUser();
  const a = await getAthlete(id);
  if (!a) return { error: "Atleta não encontrado." };
  try {
    const e = await enrichAthlete(a);
    const pick = <T,>(cur: T, next: T, empty: (v: T) => boolean) => (mode === "overwrite" || empty(cur) ? next : cur);
    const emptyStr = (v: string | null) => !v || !v.trim();
    const emptyArr = (v: unknown[]) => !v || v.length === 0;
    await db
      .update(athletes)
      .set({
        bio: pick(a.bio, e.bio || a.bio, emptyStr),
        bioShort: pick(a.bioShort, e.bioShort || a.bioShort, emptyStr),
        bioEn: pick(a.bioEn, e.bioEn || a.bioEn, emptyStr),
        playingStyle: pick(a.playingStyle, e.playingStyle || a.playingStyle, emptyStr),
        playingStyleEn: pick(a.playingStyleEn, e.playingStyleEn || a.playingStyleEn, emptyStr),
        achievements: e.achievements.length ? pick(a.achievements, e.achievements, emptyArr) : a.achievements,
        career: e.career.length ? pick(a.career, e.career, emptyArr) : a.career,
        stats: e.stats.length ? pick(a.stats, e.stats, emptyArr) : a.stats,
        aiMissing: e.missing,
        aiTips: e.tips,
        aiScore: e.score,
        updatedAt: new Date(),
      })
      .where(eq(athletes.id, id));
    await logActivity("ia", `IA organizou o perfil (nota ${e.score})`, id, s.uid);
    revalidatePath(`/atletas/${id}`);
    return { ok: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/** IA revisora: aponta erros, incoerências e o que falta antes de entregar. */
export async function reviewAthleteAI(id: string) {
  const s = await requireUser();
  const a = await getAthlete(id);
  if (!a) return { error: "Atleta não encontrado." };
  try {
    const r = await reviewAthlete(a);
    const now = new Date();
    await db.update(athletes).set({ aiReview: r, aiReviewedAt: now, updatedAt: now }).where(eq(athletes.id, id));
    await logActivity("ia", `IA revisou o perfil (nota ${r.score})`, id, s.uid);
    revalidatePath(`/atletas/${id}`);
    return { ok: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/** Aplica (ou ignora) uma sugestão da revisão. */
export async function resolveReviewIssue(id: string, index: number, action: "aplicar" | "ignorar") {
  await requireUser();
  const a = await getAthlete(id);
  const review = a?.aiReview;
  const issue = review?.issues[index];
  if (!a || !review || !issue) return { error: "Revisão não encontrada. Rode a revisão de novo." };
  const issues = review.issues.map((x, i) => (i === index ? { ...x, status: action === "aplicar" ? ("aplicado" as const) : ("ignorado" as const) } : x));
  const set: Partial<typeof athletes.$inferInsert> = { aiReview: { ...review, issues } };
  if (action === "aplicar" && issue.field && issue.suggestion) set[issue.field] = issue.suggestion;
  const now = new Date();
  // aplicar muda o texto, mas a revisão continua valendo para os outros itens
  await db.update(athletes).set({ ...set, aiReviewedAt: now, updatedAt: now }).where(eq(athletes.id, id));
  revalidatePath(`/atletas/${id}`);
  return { ok: true };
}

export async function generateAthleteText(id: string, kind: TextKind) {
  await requireUser();
  const a = await getAthlete(id);
  if (!a) return { error: "Atleta não encontrado." };
  try {
    return { text: await generateText(a, kind) };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/* ---------- Arquivos (fotos) ---------- */

export async function uploadAthleteFiles(athleteId: string, kind: "photo" | "gallery" | "cover", form: FormData) {
  const s = await requireUser();
  const list = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!list.length) return { error: "Nenhum arquivo enviado." };
  const ids: string[] = [];
  for (const f of list) {
    if (f.size > 6 * 1024 * 1024) return { error: `"${f.name}" é muito grande (máx. 6 MB).` };
    const buf = Buffer.from(await f.arrayBuffer());
    const mime = imageMime(buf);
    if (!mime) return { error: `"${f.name}" não é uma foto que o navegador consiga abrir. Use JPG, PNG ou WEBP.` };
    const [row] = await db
      .insert(files)
      .values({
        athleteId,
        kind: kind === "cover" ? "gallery" : kind,
        name: f.name,
        mime,
        size: f.size,
        width: int(form.get("width")) ?? null,
        height: int(form.get("height")) ?? null,
        data: buf,
      })
      .returning({ id: files.id });
    ids.push(row.id);
  }
  if (kind === "photo" && ids[0]) await db.update(athletes).set({ photoId: ids[0], updatedAt: new Date() }).where(eq(athletes.id, athleteId));
  if (kind === "cover" && ids[0]) await db.update(athletes).set({ coverId: ids[0], updatedAt: new Date() }).where(eq(athletes.id, athleteId));
  await logActivity("arquivo", kind === "photo" ? "Atualizou a foto principal" : kind === "cover" ? "Trocou a foto de capa" : `Adicionou ${ids.length} foto(s) à galeria`, athleteId, s.uid);
  revalidatePath(`/atletas/${athleteId}`);
  return { ok: true, ids };
}

export async function setMainPhoto(athleteId: string, fileId: string, which: "photo" | "cover" = "photo") {
  await requireUser();
  await db
    .update(athletes)
    .set(which === "photo" ? { photoId: fileId } : { coverId: fileId })
    .where(eq(athletes.id, athleteId));
  revalidatePath(`/atletas/${athleteId}`);
}

export async function deleteFile(athleteId: string, fileId: string) {
  await requireUser();
  await db.delete(files).where(and(eq(files.id, fileId), eq(files.athleteId, athleteId)));
  const a = await getAthlete(athleteId);
  if (a?.photoId === fileId) await db.update(athletes).set({ photoId: null }).where(eq(athletes.id, athleteId));
  if (a?.coverId === fileId) await db.update(athletes).set({ coverId: null }).where(eq(athletes.id, athleteId));
  revalidatePath(`/atletas/${athleteId}`);
}
