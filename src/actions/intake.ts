"use server";

import { randomBytes } from "node:crypto";
import { and, eq, ilike, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/db";
import { athletes, files, intakes, orders, packages, type NewAthlete } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { aiAvailable, enrichAthlete, reviewAthlete } from "@/lib/ai";
import { getAthlete, logActivity, ready, uniqueSlug } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { createDeliverablesFor } from "@/lib/work";
import { checkIntake } from "@/lib/intake-check";
import { imageMime } from "@/lib/server-utils";
import { extractLinks, fmtDate, heightCm, onlyDigits, slugify, str, weightKg } from "@/lib/utils";

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

/** Posições na ordem em que o atleta marcou (a primeira é a principal). */
function orderedPositions(form: FormData) {
  const picked = form.getAll("position").map(String).filter(Boolean);
  const order = String(form.get("positionOrder") ?? "").split("|").filter((p) => picked.includes(p));
  return [...new Set([...order, ...picked])].join(", ");
}

type IntakeResult = { error?: string; ok?: boolean };

/** Público: o atleta envia o formulário. Tudo o que vem depois é automático. */
export async function submitIntake(token: string, _: unknown, form: FormData): Promise<IntakeResult> {
  await ready();
  const [intake] = await db.select().from(intakes).where(eq(intakes.token, token)).limit(1);
  if (!intake) return { error: "Link inválido. Peça um novo link à Craquepedia." };
  if (intake.status !== "aberto") return { error: "Este formulário já foi enviado. Obrigado!" };
  if (form.get("consent") !== "on") return { error: "É preciso aceitar o uso dos dados para continuar." };

  for (const [k, v] of form.entries()) {
    if (typeof v === "string" && !k.startsWith("$") && v.length > (k.startsWith("sd_") || ["historico", "conquistas", "numeros", "bio", "playingStyle", "videos"].includes(k) ? 6000 : 300))
      return { error: "Algum campo ficou comprido demais. Resuma um pouco e envie de novo." };
  }
  const problem = checkIntake((n) => String(form.get(n) ?? ""));
  if (problem) return { error: problem.error };

  // trava: se o mesmo link for enviado duas vezes ao mesmo tempo (duas abas), só o primeiro passa
  const [locked] = await db
    .update(intakes)
    .set({ status: "enviando" })
    .where(and(eq(intakes.id, intake.id), eq(intakes.status, "aberto")))
    .returning({ id: intakes.id });
  if (!locked) return { error: "Este formulário já foi enviado. Obrigado!" };
  try {
    return await saveIntake(intake, form);
  } catch (err) {
    console.error("[intake]", err);
    await db.update(intakes).set({ status: "aberto" }).where(eq(intakes.id, intake.id)).catch(() => {});
    return { error: "Não conseguimos salvar agora. Seus dados continuam aqui: tente enviar de novo em instantes." };
  }
}

async function saveIntake(intake: typeof intakes.$inferSelect, form: FormData): Promise<IntakeResult> {
  const fullName = String(form.get("fullName")).trim().replace(/\s+/g, " ");
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
    position: orderedPositions(form) || null,
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
    heightCm: heightCm(form.get("heightCm")),
    weightKg: weightKg(form.get("weightKg")),
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
    videos: extractLinks(String(form.get("videos") ?? "")).map((url, i) => ({ title: `Vídeo ${i + 1}`, url })),
    sportData,
    source: str(form.get("source")),
    notes: [
      ["Clubes e trajetória", form.get("historico")],
      ["Conquistas", form.get("conquistas")],
      ["Números", form.get("numeros")],
      ["Objetivo", form.get("objetivo")],
      ["Vídeos (como o atleta escreveu)", form.get("videos")],
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
    // escolaridade: junta com o que já existia (campos que o formulário não tem, como série e GPA, ficam)
    if (filled.education) filled.education = { ...(current?.education ?? {}), ...Object.fromEntries(Object.entries(values.education ?? {}).filter(([, v]) => v)) };
    // vídeos: mantém os antigos e acrescenta só os novos
    if (filled.videos) {
      const old = current?.videos ?? [];
      const fresh = (values.videos ?? []).filter((v) => !old.some((o) => o.url === v.url));
      filled.videos = [...old, ...fresh.map((v, i) => ({ ...v, title: `Vídeo ${old.length + i + 1}` }))];
    }
    // textos já revisados pela equipe/IA não são trocados pelo texto cru do atleta (o texto novo vai para as observações)
    const extra: string[] = [];
    for (const k of ["bio", "playingStyle"] as const) {
      if (filled[k] && current?.[k] && current[k] !== filled[k]) {
        extra.push(`${k === "bio" ? "Sobre o atleta" : "Estilo de jogo"} (texto do atleta): ${filled[k]}`);
        delete filled[k];
      }
    }
    // dados de carreira digitados de novo pelo atleta entram como observação, sem apagar as listas organizadas
    const notesNew = [filled.notes, ...extra].filter(Boolean).join("\n\n");
    if (notesNew) filled.notes = current?.notes ? `${current.notes}\n\n--- Atualização do atleta (${fmtDate(new Date())}) ---\n${notesNew}` : notesNew;
    if (current?.status && current.status !== "lead") delete filled.status;
    await db.update(athletes).set({ ...filled, updatedAt: new Date() }).where(eq(athletes.id, athleteId));
  } else {
    // endereço público: apelido + sobrenome (sem repetir o sobrenome se o apelido já tiver)
    const last = fullName.split(" ").slice(-1)[0];
    const nick = values.nickname ?? "";
    const base = nick ? (slugify(nick).split("-").includes(slugify(last)) ? nick : `${nick} ${last}`) : fullName;
    // dois envios com o mesmo nome no mesmo segundo podem disputar o mesmo endereço: tenta de novo com outro
    let row: { id: string } | undefined;
    for (let attempt = 0; !row; attempt++) {
      const slug = await uniqueSlug(attempt ? `${base} ${attempt + 1}` : base);
      try {
        [row] = await db
          .insert(athletes)
          .values({ ...(values as NewAthlete), slug, responsibleId: intake.createdBy })
          .returning({ id: athletes.id });
      } catch (e) {
        if (attempt >= 3 || !String((e as Error)?.message ?? e).includes("slug")) throw e;
      }
    }
    athleteId = row.id;
    // mesmo atleta mandando de novo por outro link? avisa a equipe (não junta sozinho)
    const tail = onlyDigits(values.phone).slice(-8);
    const twins = await db
      .select({ id: athletes.id, fullName: athletes.fullName, phone: athletes.phone })
      .from(athletes)
      .where(and(ne(athletes.id, row.id), or(ilike(athletes.fullName, fullName), tail.length === 8 ? ilike(athletes.phone, `%${tail.slice(0, 4)}%${tail.slice(4)}%`) : undefined)));
    const twin = twins.find((t) => t.fullName.toLowerCase() === fullName.toLowerCase() || onlyDigits(t.phone).endsWith(tail));
    if (twin) await logActivity("formulario", `Atenção: ${fullName} pode ser o mesmo atleta já cadastrado como ${twin.fullName}. Confira se não ficou duplicado.`, row.id, null);
  }

  // Fotos
  const photos = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 8);
  const photoIds: string[] = [];
  for (const f of photos) {
    if (f.size > 6 * 1024 * 1024) continue;
    const data = Buffer.from(await f.arrayBuffer());
    const mime = imageMime(data);
    if (!mime) continue; // não é uma imagem que o navegador consiga mostrar
    const [fr] = await db
      .insert(files)
      .values({
        athleteId,
        kind: photoIds.length === 0 ? "photo" : "gallery",
        name: f.name,
        mime,
        size: f.size,
        data,
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
    .set({ status: "recebido", athleteId, sport, payload: raw, photoIds, submittedAt: new Date(), clientName: fullName })
    .where(eq(intakes.id, intake.id));
  await logActivity("formulario", `${fullName} enviou o formulário`, athleteId, null);

  // IA roda depois da resposta (o atleta não espera)
  const aid = athleteId;
  after(async () => {
    try {
      const a = await getAthlete(aid);
      if (!a || !(await aiAvailable())) {
        await db.update(intakes).set({ status: "processado" }).where(eq(intakes.id, intake.id));
        return;
      }
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
      await db.update(intakes).set({ status: "processado" }).where(eq(intakes.id, intake.id)).catch(() => {});
      await logActivity("ia", `A IA não conseguiu organizar o formulário: ${String((err as Error)?.message ?? err).slice(0, 140)}. Use "Organizar com IA" no perfil.`, aid, null).catch(() => {});
    }
  });

  return { ok: true };
}
