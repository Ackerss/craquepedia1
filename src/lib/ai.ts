import "server-only";
import { generateText as aiGenerate } from "ai";
import type { Achievement, Athlete, CareerItem, StatItem } from "@/db/schema";
import { getSport } from "./sports";
import { ageFrom } from "./utils";

// Modelos via Vercel AI Gateway (autenticação automática na Vercel, sem chave para colar).
const MODELS = [process.env.AI_MODEL, "google/gemini-2.5-flash", "openai/gpt-4o-mini"].filter(Boolean) as string[];

export function aiEnabled() {
  return !!(process.env.VERCEL || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

async function ask(prompt: string, json = true): Promise<string> {
  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      const res = await aiGenerate({
        model,
        prompt: json ? prompt + "\n\nIMPORTANTE: responda somente com JSON válido, sem markdown." : prompt,
        temperature: json ? 0.4 : 0.8,
        maxRetries: 1,
      });
      return res.text;
    } catch (e) {
      lastErr = e;
      const msg = String((e as Error)?.message ?? e);
      if (/authentication|No authentication|OIDC|api key/i.test(msg)) break;
    }
  }
  const msg = String((lastErr as Error)?.message ?? lastErr);
  if (/authentication|OIDC|api key/i.test(msg)) throw new Error("IA indisponível: o AI Gateway da Vercel não está autorizado neste ambiente.");
  throw new Error("Falha na IA: " + msg.slice(0, 300));
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
