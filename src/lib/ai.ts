import "server-only";
import { generateText as aiGenerate, type LanguageModel } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings, type Achievement, type AIReview, type Athlete, type CareerItem, type ReviewField, type ReviewIssue, type StatItem } from "@/db/schema";
import { ready } from "./data";
import { getSport } from "./sports";
import { ageFrom } from "./utils";

// Duas fontes de IA, nesta ordem:
// 1) Gemini direto do Google, com a chave grátis do Google AI Studio (colada em Configurações) — mais econômico.
// 2) Vercel AI Gateway (autenticação automática na Vercel) — reserva, caso a chave falhe ou acabe a cota do dia.
const GATEWAY_MODELS = [process.env.AI_MODEL, "google/gemini-2.5-flash", "openai/gpt-4o-mini"].filter(Boolean) as string[];
export const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (recomendado: rápido e grátis)" },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite (mais econômico)" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (mais caprichado, cota grátis menor)" },
] as const;

export type AISettings = { geminiKey?: string; model?: string };

export async function getAISettings(): Promise<AISettings> {
  await ready();
  const [row] = await db.select().from(settings).where(eq(settings.key, "ai")).limit(1);
  return (row?.value as AISettings) ?? {};
}

function geminiKey(cfg: AISettings) {
  return cfg.geminiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
}

/** Vercel AI Gateway disponível (na Vercel é automático). */
export function aiEnabled() {
  return !!(process.env.VERCEL || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

/** Alguma IA disponível (chave Gemini ou Vercel). */
export async function aiAvailable() {
  return aiEnabled() || !!geminiKey(await getAISettings());
}

export async function aiStatus() {
  const cfg = await getAISettings();
  const key = geminiKey(cfg);
  return {
    gemini: !!key,
    geminiFromSettings: !!cfg.geminiKey,
    keyHint: key ? `••••${key.slice(-4)}` : "",
    model: cfg.model || GEMINI_MODELS[0].id,
    gateway: aiEnabled(),
  };
}

type Candidate = { label: string; model: LanguageModel; gateway: boolean };

async function candidates(): Promise<Candidate[]> {
  const cfg = await getAISettings();
  const list: Candidate[] = [];
  const key = geminiKey(cfg);
  if (key) {
    const google = createGoogleGenerativeAI({ apiKey: key });
    const id = cfg.model || GEMINI_MODELS[0].id;
    list.push({ label: `Gemini (${id})`, model: google(id), gateway: false });
    if (id !== "gemini-2.5-flash-lite") list.push({ label: "Gemini (gemini-2.5-flash-lite)", model: google("gemini-2.5-flash-lite"), gateway: false });
  }
  if (aiEnabled()) for (const m of GATEWAY_MODELS) list.push({ label: `Vercel (${m})`, model: m, gateway: true });
  return list;
}

/** Chama a IA com fallback automático. Devolve o texto e qual IA respondeu. */
async function askWith(prompt: string, json = true): Promise<{ text: string; provider: string }> {
  const list = await candidates();
  if (!list.length) throw new Error("IA não configurada: cole a chave do Gemini em Configurações → Inteligência artificial.");
  let lastErr: unknown;
  let gatewayBlocked = false;
  for (const c of list) {
    if (c.gateway && gatewayBlocked) continue;
    try {
      const res = await aiGenerate({
        model: c.model,
        prompt: json ? prompt + "\n\nIMPORTANTE: responda somente com JSON válido, sem markdown." : prompt,
        temperature: json ? 0.3 : 0.8,
        maxRetries: 1,
      });
      return { text: res.text, provider: c.label };
    } catch (e) {
      lastErr = e;
      const msg = String((e as Error)?.message ?? e);
      if (c.gateway && /authentication|No authentication|OIDC|api key/i.test(msg)) gatewayBlocked = true;
    }
  }
  const msg = String((lastErr as Error)?.message ?? lastErr);
  if (/API key not valid|API_KEY_INVALID/i.test(msg)) throw new Error("A chave do Gemini é inválida. Confira em Configurações → Inteligência artificial.");
  if (/quota|RESOURCE_EXHAUSTED|429/i.test(msg)) throw new Error("A cota grátis do Gemini acabou por hoje. Tente mais tarde ou troque o modelo em Configurações.");
  if (/authentication|OIDC|api key/i.test(msg)) throw new Error("IA indisponível: cole a chave do Gemini em Configurações → Inteligência artificial.");
  throw new Error("Falha na IA: " + msg.slice(0, 300));
}

async function ask(prompt: string, json = true): Promise<string> {
  return (await askWith(prompt, json)).text;
}

/** Teste rápido usado no botão "Testar IA" das Configurações. */
export async function pingAI() {
  const r = await askWith("Responda apenas: OK", false);
  return r.provider;
}

function parseJSON<T>(txt: string): T {
  const clean = txt.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(clean) as T;
  } catch {
    const a = clean.indexOf("{");
    const b = clean.lastIndexOf("}");
    if (a >= 0 && b > a) return JSON.parse(clean.slice(a, b + 1)) as T;
    throw new Error("A IA respondeu num formato inesperado. Tente de novo.");
  }
}

export function athleteContext(a: Athlete, raw?: Record<string, unknown> | null) {
  const sport = getSport(a.sport);
  const age = ageFrom(a.birthDate);
  const sd = Object.entries(a.sportData ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${sport.fields.find((f) => f.key === k)?.label ?? k}: ${v}`)
    .join("\n");
  return `
Nome: ${a.fullName}${a.nickname ? ` (apelido esportivo: ${a.nickname})` : ""}
Esporte: ${sport.name}
${sport.positionLabel}: ${a.position ?? "-"}
Idade: ${age ?? "-"} | Nascimento: ${a.birthDate ?? "-"}
Cidade: ${[a.city, a.state].filter(Boolean).join("/") || "-"}
Nacionalidade: ${a.nationality ?? "-"}${a.secondNationality ? ` / ${a.secondNationality}` : ""}
Altura: ${a.heightCm ? a.heightCm + " cm" : "-"} | Peso: ${a.weightKg ? a.weightKg + " kg" : "-"} | Lado dominante: ${a.dominantSide ?? "-"}
${sport.clubLabel}: ${a.currentClub ?? "-"}
Estilo de jogo: ${a.playingStyle ?? "-"}
Bio atual: ${a.bio ?? "-"}
Conquistas: ${JSON.stringify(a.achievements ?? [])}
Carreira: ${JSON.stringify(a.career ?? [])}
Estatísticas: ${JSON.stringify(a.stats ?? [])}
Escolaridade: ${JSON.stringify(a.education ?? {})}
Idiomas: ${a.languages ?? "-"}
Dados específicos:
${sd || "-"}
${raw ? `\nRESPOSTAS ORIGINAIS DO FORMULÁRIO (texto livre do atleta):\n${JSON.stringify(raw, null, 2)}` : ""}
`.trim();
}

export type Enrichment = {
  bio: string;
  bioShort: string;
  bioEn: string;
  playingStyle: string;
  playingStyleEn: string;
  achievements: Achievement[];
  career: CareerItem[];
  stats: StatItem[];
  missing: string[];
  tips: string[];
  score: number;
};

/** Organiza e melhora o perfil do atleta sem inventar informações. */
export async function enrichAthlete(a: Athlete, raw?: Record<string, unknown> | null): Promise<Enrichment> {
  const prompt = `Você é redator(a) e analista de uma agência brasileira de marketing esportivo (Craquepedia), especialista em currículos de atletas para clubes, olheiros e universidades.

Organize e melhore o perfil abaixo. REGRAS ABSOLUTAS:
- NUNCA invente fatos, números, clubes, títulos ou datas. Use apenas o que está nos dados.
- Corrija ortografia, padronize nomes de competições e clubes, e transforme textos soltos em listas estruturadas.
- Escreva em português do Brasil, tom profissional e confiante, em terceira pessoa.
- Se um dado não existir, deixe o campo vazio ("" ou []).

DADOS:
${athleteContext(a, raw)}

Responda APENAS com JSON neste formato:
{
  "bio": "biografia profissional de 90 a 140 palavras, 3ª pessoa",
  "bioShort": "resumo de impacto com no máximo 30 palavras (para cartão e topo do currículo)",
  "bioEn": "tradução natural da bio para o inglês (estilo recrutamento esportivo internacional)",
  "playingStyle": "estilo de jogo/características em 1 a 3 frases (vazio se não houver base)",
  "playingStyleEn": "mesmo texto em inglês",
  "achievements": [{"year": "2024", "title": "Campeão Paulista Sub-17", "description": "detalhe opcional"}],
  "career": [{"club": "Nome do clube", "period": "2022 - Atual", "role": "categoria/posição", "highlights": "destaques opcionais"}],
  "stats": [{"label": "Gols", "value": "32"}],
  "missing": ["informações importantes que faltam para um currículo forte, em frases curtas"],
  "tips": ["2 a 4 dicas práticas para a equipe melhorar o material deste atleta"],
  "score": 0
}
Ordene achievements e career do mais recente para o mais antigo. "score" é a completude do perfil de 0 a 100.`;
  const out = parseJSON<Partial<Enrichment>>(await ask(prompt));
  return {
    bio: out.bio ?? "",
    bioShort: out.bioShort ?? "",
    bioEn: out.bioEn ?? "",
    playingStyle: out.playingStyle ?? "",
    playingStyleEn: out.playingStyleEn ?? "",
    achievements: Array.isArray(out.achievements) ? out.achievements.filter((x) => x?.title) : [],
    career: Array.isArray(out.career) ? out.career.filter((x) => x?.club) : [],
    stats: Array.isArray(out.stats) ? out.stats.filter((x) => x?.label && x?.value) : [],
    missing: Array.isArray(out.missing) ? out.missing : [],
    tips: Array.isArray(out.tips) ? out.tips : [],
    score: Math.max(0, Math.min(100, Number(out.score) || 0)),
  };
}

export const TEXT_KINDS = {
  whatsapp_entrega: "Mensagem de WhatsApp para enviar os materiais prontos ao atleta (curta, calorosa, com emojis moderados).",
  instagram: "Legenda de Instagram apresentando o atleta como novo cliente/destaque da Craquepedia, com 5 a 8 hashtags.",
  clubes: "E-mail curto e profissional para apresentar o atleta a clubes e olheiros (assunto + corpo).",
  youtube: "Título (até 90 caracteres) e descrição otimizada para o vídeo de melhores momentos no YouTube, com tags no final.",
  roteiro_video: "Roteiro do vídeo highlight: abertura, sequência de cenas sugeridas por característica, legendas na tela e encerramento (60 a 120 segundos).",
  ingles: "Apresentação do atleta em inglês para clubes do exterior ou universidades dos EUA (e-mail com assunto e corpo).",
} as const;

export type TextKind = keyof typeof TEXT_KINDS;

export async function generateText(a: Athlete, kind: TextKind): Promise<string> {
  const prompt = `Você trabalha na Craquepedia, agência que valoriza a carreira de atletas. Escreva: ${TEXT_KINDS[kind]}
Use somente fatos dos dados abaixo, sem inventar números ou títulos. Responda apenas com o texto final, sem comentários.

DADOS DO ATLETA:
${athleteContext(a)}`;
  return (await ask(prompt, false)).trim();
}

/** Lê o texto livre do formulário e devolve campos estruturados (usado no recebimento automático). */
export async function translateBio(text: string): Promise<string> {
  const out = await ask(
    `Traduza para inglês natural de recrutamento esportivo, mantendo os fatos. Responda apenas com o texto.\n\n${text}`,
    false,
  );
  return out.trim();
}

/* ---------------- Revisão por IA ---------------- */

const FIELDS: Record<ReviewField, string> = {
  bio: "Bio (português)",
  bioShort: "Resumo curto",
  bioEn: "Bio em inglês",
  playingStyle: "Estilo de jogo",
  playingStyleEn: "Estilo de jogo em inglês",
};

/**
 * Revisor: confere o perfil como um editor experiente faria antes de mandar o currículo
 * para um clube — erros, incoerências, exageros, tradução e o que falta para a modalidade.
 */
export async function reviewAthlete(a: Athlete): Promise<AIReview> {
  const sport = getSport(a.sport);
  const texts = (Object.keys(FIELDS) as ReviewField[]).map((k) => `[${k}] ${FIELDS[k]}: ${a[k] ? a[k] : "(vazio)"}`).join("\n");
  const prompt = `Você é o revisor final da Craquepedia, agência brasileira que monta currículos e portfólios de atletas para clubes, olheiros e universidades.
Antes de o material ir para o atleta e para os clubes, revise o perfil abaixo com olhar crítico de quem recruta atletas de ${sport.name}.

CONFIRA:
1. Ortografia, gramática e pontuação dos textos em português; textos em 3ª pessoa e tom profissional.
2. Tradução para o inglês: fiel, natural e sem erros (termos certos do esporte em inglês).
3. Coerência: idade x categoria, datas e ordem da carreira, clube atual x histórico, altura/peso plausíveis para a idade e a posição, números de estatísticas plausíveis, títulos repetidos.
4. Exageros ou frases vazias que um olheiro descartaria ("melhor do Brasil", "craque nato" etc.) e afirmações sem base nos dados.
5. O que falta e mais pesa para recrutadores de ${sport.name} nesta posição (ex.: vídeo, estatísticas, medidas, marcas, responsável para menor de idade, contatos).
6. Dados de contato com cara de erro (telefone sem DDD, e-mail inválido, Instagram com espaço).

REGRAS:
- Nunca invente fatos. A sugestão de texto só pode reorganizar e corrigir o que já existe.
- Quando o problema for num dos textos abaixo, preencha "field" com a chave entre colchetes e "suggestion" com o texto completo corrigido, pronto para substituir.
- Para os demais problemas, deixe "field" e "suggestion" vazios e explique em "detail" o que a equipe deve fazer.
- Máximo de 10 itens, do mais importante para o menos importante. Não repita itens.
- "level": "erro" (precisa corrigir antes de enviar), "atencao" (deveria ajustar) ou "dica" (melhoria opcional).
- "verdict": "pronto" (pode enviar), "ajustar" (enviar só após ajustes) ou "incompleto" (faltam dados essenciais).

TEXTOS ATUAIS:
${texts}

DADOS COMPLETOS:
${athleteContext(a)}
Responsável: ${a.guardianName ?? "-"} ${a.guardianPhone ?? ""}
Telefone: ${a.phone ?? "-"} | E-mail: ${a.email ?? "-"} | Instagram: ${a.instagram ?? "-"}
Vídeos: ${(a.videos ?? []).length}

Responda APENAS com JSON:
{
  "score": 0,
  "verdict": "ajustar",
  "summary": "2 frases dizendo se o material está bom para enviar e o principal ponto",
  "strengths": ["até 3 pontos fortes do perfil"],
  "issues": [{"level": "erro", "area": "Bio", "title": "título curto", "detail": "explicação objetiva", "field": "bio", "suggestion": "texto corrigido completo"}]
}
"score" vai de 0 a 100 e mede o quanto o material está pronto para impressionar um recrutador.`;
  const { text, provider } = await askWith(prompt);
  const out = parseJSON<Partial<AIReview>>(text);
  const levels = ["erro", "atencao", "dica"];
  const issues: ReviewIssue[] = (Array.isArray(out.issues) ? out.issues : [])
    .filter((i) => i && i.title)
    .slice(0, 12)
    .map((i) => {
      const field = i.field && i.field in FIELDS ? (i.field as ReviewField) : undefined;
      const suggestion = field && typeof i.suggestion === "string" && i.suggestion.trim() ? i.suggestion.trim() : undefined;
      return {
        level: (levels.includes(i.level) ? i.level : "atencao") as ReviewIssue["level"],
        area: String(i.area ?? (field ? FIELDS[field] : "Perfil")).slice(0, 40),
        title: String(i.title).slice(0, 140),
        detail: String(i.detail ?? "").slice(0, 600),
        ...(field && suggestion ? { field, suggestion } : {}),
      };
    });
  const verdict = (["pronto", "ajustar", "incompleto"].includes(out.verdict as string) ? out.verdict : issues.some((i) => i.level === "erro") ? "ajustar" : "pronto") as AIReview["verdict"];
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(out.score) || 0))),
    verdict,
    summary: String(out.summary ?? "").slice(0, 500),
    strengths: (Array.isArray(out.strengths) ? out.strengths : []).map(String).slice(0, 3),
    issues,
    provider,
  };
}

export const REVIEW_FIELD_LABELS = FIELDS;
