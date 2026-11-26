// Catálogo padrão de serviços e pacotes (usado no primeiro setup; editável em Configurações)

export const DEFAULT_SERVICES = [
  {
    key: "curriculo",
    name: "Currículo esportivo",
    description: "Currículo profissional em PDF, em vários modelos, gerado automaticamente a partir do perfil.",
    priceCents: 9700,
    defaultDays: 3,
    icon: "FileText",
    automatic: true,
    sort: 1,
  },
  {
    key: "curriculo_en",
    name: "Currículo em inglês",
    description: "Versão internacional (clubes do exterior e universidades dos EUA).",
    priceCents: 6700,
    defaultDays: 3,
    icon: "Globe",
    automatic: true,
    sort: 2,
  },
  {
    key: "cartao",
    name: "Cartão digital",
    description: "Página-cartão com foto, números e botões de contato, com QR Code.",
    priceCents: 4700,
    defaultDays: 2,
    icon: "IdCard",
    automatic: true,
    sort: 3,
  },
  {
    key: "portfolio",
    name: "Portfólio online",
    description: "Site do atleta com bio, carreira, estatísticas, galeria de fotos e vídeos.",
    priceCents: 19700,
    defaultDays: 5,
    icon: "LayoutTemplate",
    automatic: true,
    sort: 4,
  },
  {
    key: "video",
    name: "Vídeo de melhores momentos",
    description: "Edição de vídeo highlight com os melhores lances.",
    priceCents: 29700,
    defaultDays: 10,
    icon: "Clapperboard",
    automatic: false,
    sort: 5,
  },
  {
    key: "youtube",
    name: "Publicação no YouTube",
    description: "Upload do vídeo com título, descrição e tags otimizados.",
    priceCents: 4700,
    defaultDays: 2,
    icon: "MonitorPlay",
    automatic: false,
    sort: 6,
  },
  {
    key: "redes",
    name: "Kit redes sociais",
    description: "Artes e legendas para Instagram anunciando o atleta.",
    priceCents: 9700,
    defaultDays: 5,
    icon: "Megaphone",
    automatic: false,
    sort: 7,
  },
  {
    key: "divulgacao",
    name: "Envio para clubes e olheiros",
    description: "Divulgação do material para a rede de contatos da Craquepedia.",
    priceCents: 14700,
    defaultDays: 15,
    icon: "Send",
    automatic: false,
    sort: 8,
  },
];

export const DEFAULT_PACKAGES = [
  {
    name: "Essencial",
    description: "Currículo profissional + cartão digital.",
    priceCents: 12700,
    serviceKeys: ["curriculo", "cartao"],
    highlight: false,
    sort: 1,
  },
  {
    name: "Profissional",
    description: "Currículo PT e EN, cartão digital e portfólio online.",
    priceCents: 29700,
    serviceKeys: ["curriculo", "curriculo_en", "cartao", "portfolio"],
    highlight: true,
    sort: 2,
  },
  {
    name: "Craque Completo",
    description: "Tudo do Profissional + vídeo highlight, YouTube, kit redes sociais e divulgação.",
    priceCents: 69700,
    serviceKeys: ["curriculo", "curriculo_en", "cartao", "portfolio", "video", "youtube", "redes", "divulgacao"],
    highlight: false,
    sort: 3,
  },
];

export const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  curriculo: ["Conferir dados e foto", "Gerar bio com IA e revisar", "Escolher modelo", "Enviar PDF ao atleta"],
  curriculo_en: ["Traduzir bio com IA", "Revisar inglês", "Enviar PDF ao atleta"],
  cartao: ["Conferir foto e números", "Enviar link e QR Code"],
  portfolio: ["Subir fotos da galeria", "Adicionar vídeos", "Revisar textos", "Enviar link"],
  video: ["Receber vídeos brutos", "Selecionar lances", "Editar", "Aprovação do atleta", "Exportar final"],
  youtube: ["Título e descrição", "Thumbnail", "Publicar", "Enviar link"],
  redes: ["Criar artes", "Escrever legendas", "Enviar ao atleta"],
  divulgacao: ["Montar lista de clubes", "Enviar material", "Registrar retornos"],
};

export const STAGES = [
  { key: "a_fazer", label: "A fazer", color: "#64748b" },
  { key: "producao", label: "Em produção", color: "#2563eb" },
  { key: "revisao", label: "Revisão", color: "#d97706" },
  { key: "entregue", label: "Entregue", color: "#16a34a" },
] as const;

export type StageKey = (typeof STAGES)[number]["key"];

export const ATHLETE_STATUS = [
  { key: "lead", label: "Negociando", color: "#8b5cf6" },
  { key: "ativo", label: "Ativo", color: "#16a34a" },
  { key: "pausado", label: "Pausado", color: "#d97706" },
  { key: "encerrado", label: "Concluído", color: "#64748b" },
] as const;

export const ORDER_STATUS = [
  { key: "aberto", label: "A receber", color: "#d97706" },
  { key: "parcial", label: "Parcial", color: "#2563eb" },
  { key: "pago", label: "Pago", color: "#16a34a" },
  { key: "cancelado", label: "Cancelado", color: "#64748b" },
] as const;

/** Página pública gerada automaticamente para cada serviço (para abrir e enviar ao atleta). */
export function materialPath(serviceKey: string, slug?: string | null) {
  if (!slug) return null;
  const map: Record<string, string> = {
    curriculo: `/cv/${slug}`,
    curriculo_en: `/cv/${slug}?lang=en`,
    cartao: `/c/${slug}`,
    portfolio: `/p/${slug}`,
  };
  return map[serviceKey] ?? null;
}
