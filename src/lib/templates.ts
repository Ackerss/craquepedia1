export type ResumeTemplate = {
  id: string;
  name: string;
  lang: "pt" | "en";
  description: string;
  bestFor: string;
};

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  { id: "classico", name: "Clássico", lang: "pt", description: "Uma coluna, limpo e direto ao ponto.", bestFor: "Clubes e peneiras no Brasil" },
  { id: "moderno", name: "Moderno", lang: "pt", description: "Barra lateral colorida com foto e dados físicos.", bestFor: "Uso geral, o mais versátil" },
  { id: "premium", name: "Premium Escuro", lang: "pt", description: "Fundo escuro com detalhes dourados e foto grande.", bestFor: "Atletas de destaque e empresários" },
  { id: "scout", name: "Ficha Scout", lang: "pt", description: "Ficha técnica com números em destaque e campo de posição.", bestFor: "Olheiros, análise de desempenho" },
  { id: "revista", name: "Capa de Revista", lang: "pt", description: "Foto em tela cheia e nome em destaque, estilo editorial.", bestFor: "Redes sociais e apresentação" },
  { id: "minimalista", name: "Minimalista", lang: "pt", description: "Tipografia elegante com muito espaço em branco.", bestFor: "Perfis com bastante texto" },
  { id: "international", name: "International (EN)", lang: "en", description: "Formato europeu em inglês para clubes do exterior.", bestFor: "Clubes da Europa, Ásia e EUA" },
  { id: "college", name: "College Recruiting (EN)", lang: "en", description: "Padrão de recrutamento universitário dos EUA, com notas e formatura.", bestFor: "Bolsas em universidades americanas" },
];

export function getTemplate(id?: string | null) {
  return RESUME_TEMPLATES.find((t) => t.id === id) ?? RESUME_TEMPLATES[1];
}
