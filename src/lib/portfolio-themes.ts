export type PortfolioTheme = {
  id: string;
  name: string;
  description: string;
  dark: boolean;
  page: string;
  muted: string;
  soft: string;
  card: string;
  line: string;
  heading: string;
};

export const PORTFOLIO_THEMES: PortfolioTheme[] = [
  {
    id: "arena",
    name: "Arena (escuro)",
    description: "Foto de capa em tela cheia, fundo escuro e números grandes.",
    dark: true,
    page: "bg-ink-950 text-white",
    muted: "text-white/55",
    soft: "text-white/75",
    card: "border border-white/10 bg-white/[0.04]",
    line: "border-white/15",
    heading: "font-display uppercase",
  },
  {
    id: "impacto",
    name: "Impacto (cor do esporte)",
    description: "Ilustração do esporte, cor forte da modalidade e foto em destaque.",
    dark: true,
    page: "bg-[#06080f] text-white",
    muted: "text-white/55",
    soft: "text-white/80",
    card: "border border-white/10 bg-white/[0.05]",
    line: "border-white/15",
    heading: "font-display uppercase",
  },
  {
    id: "editorial",
    name: "Editorial (claro)",
    description: "Visual de revista, fundo claro e tipografia elegante.",
    dark: false,
    page: "bg-[#f6f4ef] text-slate-900",
    muted: "text-slate-500",
    soft: "text-slate-600",
    card: "border border-slate-200 bg-white shadow-sm",
    line: "border-slate-300",
    heading: "font-serif",
  },
];

export function getPortfolioTheme(id?: string | null) {
  return PORTFOLIO_THEMES.find((t) => t.id === id) ?? PORTFOLIO_THEMES[0];
}
