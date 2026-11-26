export type ResumeTemplate = {
  id: string;
  name: string;
  /** idioma padrão do modelo (qualquer modelo pode ser aberto em PT ou EN, exceto os marcados com onlyLang) */
  lang: "pt" | "en";
  onlyLang?: "pt" | "en";
  description: string;
  bestFor: string;
  /** modalidades para as quais o modelo é recomendado (vazio = todas) */
  sports?: string[];
  pages?: number;
  isNew?: boolean;
};

const COLETIVOS = ["futebol", "futsal", "volei", "basquete", "handebol"];
const INDIVIDUAIS = ["atletismo", "corrida", "natacao", "ciclismo", "tenis", "ginastica", "surf", "outro"];

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  { id: "moderno", name: "Moderno", lang: "pt", description: "Barra lateral colorida com foto e dados físicos.", bestFor: "Uso geral, o mais versátil" },
  { id: "quadra", name: "Campo & Quadra", lang: "pt", description: "Medidas em destaque e diagrama do campo/quadra com a posição marcada.", bestFor: "Futebol, futsal, vôlei, basquete e handebol", sports: COLETIVOS, isNew: true },
  { id: "marcas", name: "Marcas & Tempos", lang: "pt", description: "Melhores marcas e tempos em destaque, com medalhas.", bestFor: "Atletismo, corrida, natação, ciclismo", sports: INDIVIDUAIS, isNew: true },
  { id: "luta", name: "Fight Card", lang: "pt", description: "Pôster escuro com cartel (V-D-E), graduação e categoria de peso.", bestFor: "Jiu-jitsu, MMA, judô, boxe e lutas", sports: ["artes-marciais"], isNew: true },
  { id: "card", name: "Card Colecionável", lang: "pt", description: "Card de atleta com foto e números, estilo figurinha.", bestFor: "Atletas jovens, redes sociais e peneiras", isNew: true },
  { id: "trajetoria", name: "Trajetória", lang: "pt", description: "Linha do tempo única com clubes e conquistas.", bestFor: "Atletas com carreira longa", isNew: true },
  { id: "dossie", name: "Dossiê (2 páginas)", lang: "pt", description: "Capa com foto grande + ficha completa com galeria.", bestFor: "Enviar a clubes, empresários e patrocinadores", pages: 2, isNew: true },
  { id: "classico", name: "Clássico", lang: "pt", description: "Uma coluna, limpo e direto ao ponto.", bestFor: "Clubes e peneiras no Brasil" },
  { id: "premium", name: "Premium Escuro", lang: "pt", description: "Fundo escuro com detalhes dourados e foto grande.", bestFor: "Atletas de destaque e empresários" },
  { id: "scout", name: "Ficha Scout", lang: "pt", description: "Ficha técnica com números em destaque e campo de posição.", bestFor: "Olheiros, análise de desempenho", sports: COLETIVOS },
  { id: "revista", name: "Capa de Revista", lang: "pt", description: "Foto em tela cheia e nome em destaque, estilo editorial.", bestFor: "Redes sociais e apresentação" },
  { id: "minimalista", name: "Minimalista", lang: "pt", description: "Tipografia elegante com muito espaço em branco.", bestFor: "Perfis com bastante texto" },
  { id: "international", name: "International", lang: "en", description: "Formato europeu, pensado para clubes do exterior.", bestFor: "Clubes da Europa, Ásia e EUA" },
  { id: "college", name: "College Recruiting", lang: "en", onlyLang: "en", description: "Padrão de recrutamento universitário dos EUA, com notas e formatura.", bestFor: "Bolsas em universidades americanas" },
];

export function getTemplate(id?: string | null) {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[0];
}

export function resolveLang(t: ResumeTemplate, requested?: string | null): "pt" | "en" {
  if (t.onlyLang) return t.onlyLang;
  if (requested === "en" || requested === "pt") return requested;
  return t.lang;
}

/** Modelos recomendados primeiro para a modalidade do atleta. */
export function templatesFor(sport: string) {
  const rec = RESUME_TEMPLATES.filter((t) => t.sports?.includes(sport));
  const rest = RESUME_TEMPLATES.filter((t) => !t.sports?.includes(sport) && !t.sports);
  const others = RESUME_TEMPLATES.filter((t) => t.sports && !t.sports.includes(sport));
  return { recommended: rec, general: rest, others };
}

/** Modelo "oficial" do atleta: o escolhido pela equipe ou, se nenhum, o primeiro recomendado para a modalidade. */
export function officialTemplate(a: { resumeTemplate?: string | null; sport: string }) {
  if (a.resumeTemplate && RESUME_TEMPLATES.some((t) => t.id === a.resumeTemplate)) return getTemplate(a.resumeTemplate);
  return templatesFor(a.sport).recommended[0] ?? RESUME_TEMPLATES[0];
}
