export type SportField = {
  key: string;
  label: string;
  labelEn: string;
  type: "text" | "textarea" | "number" | "select" | "multi";
  options?: string[];
  placeholder?: string;
};

export type Sport = {
  slug: string;
  name: string;
  nameEn: string;
  emoji: string;
  color: string;
  image: string;
  positionLabel: string;
  positions?: string[];
  sideLabel?: string;
  sideOptions?: string[];
  clubLabel: string;
  statsSuggestions: string[];
  fields: SportField[];
};

const competitions: SportField = {
  key: "competicoes",
  label: "Principais competições disputadas",
  labelEn: "Main competitions",
  type: "textarea",
};

export const SPORTS: Sport[] = [
  {
    slug: "futebol",
    name: "Futebol",
    nameEn: "Soccer",
    emoji: "⚽",
    color: "#16a34a",
    image: "/sports/futebol.jpg",
    positionLabel: "Posição",
    positions: [
      "Goleiro",
      "Zagueiro",
      "Lateral Direito",
      "Lateral Esquerdo",
      "Volante",
      "Meio-campista",
      "Meia Atacante",
      "Ponta Direita",
      "Ponta Esquerda",
      "Segundo Atacante",
      "Centroavante",
    ],
    sideLabel: "Perna dominante",
    sideOptions: ["Direita", "Esquerda", "Ambidestro"],
    clubLabel: "Clube atual",
    statsSuggestions: ["Jogos", "Gols", "Assistências", "Minutos jogados", "Jogos sem sofrer gol", "Títulos"],
    fields: [
      { key: "posicao_secundaria", label: "Posição secundária", labelEn: "Secondary position", type: "text" },
      { key: "numero_camisa", label: "Número da camisa", labelEn: "Jersey number", type: "text" },
      { key: "categoria", label: "Categoria atual (Sub-15, Sub-17, Profissional...)", labelEn: "Category", type: "text" },
      { key: "velocidade", label: "Tempo nos 30m / 40m", labelEn: "30m / 40m sprint", type: "text" },
      { key: "caracteristicas", label: "Principais características técnicas", labelEn: "Key attributes", type: "textarea" },
      competitions,
    ],
  },
  {
    slug: "futsal",
    name: "Futsal",
    nameEn: "Futsal",
    emoji: "🥅",
    color: "#2563eb",
    image: "/sports/futsal.jpg",
    positionLabel: "Posição",
    positions: ["Goleiro", "Fixo", "Ala Direita", "Ala Esquerda", "Pivô", "Universal"],
    sideLabel: "Perna dominante",
    sideOptions: ["Direita", "Esquerda", "Ambidestro"],
    clubLabel: "Equipe atual",
    statsSuggestions: ["Jogos", "Gols", "Assistências", "Títulos"],
    fields: [
      { key: "numero_camisa", label: "Número da camisa", labelEn: "Jersey number", type: "text" },
      { key: "categoria", label: "Categoria atual", labelEn: "Category", type: "text" },
      { key: "caracteristicas", label: "Principais características técnicas", labelEn: "Key attributes", type: "textarea" },
      competitions,
    ],
  },
  {
    slug: "volei",
    name: "Vôlei",
    nameEn: "Volleyball",
    emoji: "🏐",
    color: "#f59e0b",
    image: "/sports/volei.jpg",
    positionLabel: "Posição",
    positions: ["Levantador(a)", "Oposto(a)", "Ponteiro(a)", "Central", "Líbero"],
    sideLabel: "Mão dominante",
    sideOptions: ["Direita", "Esquerda", "Ambidestro"],
    clubLabel: "Time atual",
    statsSuggestions: ["Pontos", "Aces", "Bloqueios", "Recepção (%)", "Títulos"],
    fields: [
      { key: "alcance_ataque", label: "Alcance de ataque (cm)", labelEn: "Spike reach (cm)", type: "text" },
      { key: "alcance_bloqueio", label: "Alcance de bloqueio (cm)", labelEn: "Block reach (cm)", type: "text" },
      { key: "modalidade", label: "Quadra ou praia", labelEn: "Indoor or beach", type: "select", options: ["Quadra", "Praia", "Ambos"] },
      competitions,
    ],
  },
  {
    slug: "basquete",
    name: "Basquete",
    nameEn: "Basketball",
    emoji: "🏀",
    color: "#ea580c",
    image: "/sports/basquete.jpg",
    positionLabel: "Posição",
    positions: ["Armador (PG)", "Ala-Armador (SG)", "Ala (SF)", "Ala-Pivô (PF)", "Pivô (C)"],
    sideLabel: "Mão dominante",
    sideOptions: ["Direita", "Esquerda", "Ambidestro"],
    clubLabel: "Time atual",
    statsSuggestions: ["Pontos por jogo", "Rebotes por jogo", "Assistências por jogo", "Aproveitamento 3pts (%)", "Títulos"],
    fields: [
      { key: "envergadura", label: "Envergadura (cm)", labelEn: "Wingspan (cm)", type: "text" },
      { key: "impulsao", label: "Impulsão vertical (cm)", labelEn: "Vertical jump (cm)", type: "text" },
      { key: "numero_camisa", label: "Número da camisa", labelEn: "Jersey number", type: "text" },
      competitions,
    ],
  },
  {
    slug: "handebol",
    name: "Handebol",
    nameEn: "Handball",
    emoji: "🤾",
    color: "#7c3aed",
    image: "/sports/handebol.jpg",
    positionLabel: "Posição",
    positions: ["Goleiro", "Armador Central", "Armador Esquerdo", "Armador Direito", "Ponta Esquerda", "Ponta Direita", "Pivô"],
    sideLabel: "Mão dominante",
    sideOptions: ["Direita", "Esquerda", "Ambidestro"],
    clubLabel: "Equipe atual",
    statsSuggestions: ["Jogos", "Gols", "Assistências", "Defesas", "Títulos"],
    fields: [competitions],
  },
  {
    slug: "atletismo",
    name: "Atletismo",
    nameEn: "Track & Field",
    emoji: "🏃",
    color: "#8b5cf6",
    image: "/sports/atletismo.jpg",
    positionLabel: "Provas principais",
    clubLabel: "Clube / Equipe",
    statsSuggestions: ["Melhor marca", "Recorde pessoal", "Ranking nacional", "Medalhas"],
    fields: [
      { key: "melhores_marcas", label: "Melhores marcas (prova, marca, ano)", labelEn: "Personal bests", type: "textarea" },
      { key: "treinador", label: "Treinador(a)", labelEn: "Coach", type: "text" },
      competitions,
    ],
  },
  {
    slug: "corrida",
    name: "Corrida",
    nameEn: "Running",
    emoji: "👟",
    color: "#0d9488",
    image: "/sports/corrida.jpg",
    positionLabel: "Modalidade",
    positions: ["Corrida de Rua", "Trail Running", "Ultramaratona", "Meia Maratona", "Maratona"],
    clubLabel: "Assessoria / Equipe",
    statsSuggestions: ["Melhor tempo 5K", "Melhor tempo 10K", "Melhor tempo 21K", "Melhor tempo 42K", "Pódios"],
    fields: [
      { key: "melhores_tempos", label: "Melhores tempos", labelEn: "Best times", type: "textarea" },
      competitions,
    ],
  },
  {
    slug: "natacao",
    name: "Natação",
    nameEn: "Swimming",
    emoji: "🏊",
    color: "#0891b2",
    image: "/sports/natacao.jpg",
    positionLabel: "Estilo principal",
    positions: ["Livre", "Costas", "Peito", "Borboleta", "Medley", "Águas abertas"],
    clubLabel: "Clube atual",
    statsSuggestions: ["Melhor tempo", "Índice", "Ranking", "Medalhas"],
    fields: [
      { key: "provas", label: "Provas principais", labelEn: "Main events", type: "text" },
      { key: "melhores_tempos", label: "Melhores tempos (prova, tempo, piscina)", labelEn: "Best times", type: "textarea" },
      { key: "piscina", label: "Piscina", labelEn: "Pool", type: "select", options: ["Curta (25m)", "Longa (50m)", "Ambas"] },
      competitions,
    ],
  },
  {
    slug: "artes-marciais",
    name: "Artes Marciais / Lutas",
    nameEn: "Martial Arts",
    emoji: "🥋",
    color: "#dc2626",
    image: "/sports/artes-marciais.jpg",
    positionLabel: "Modalidade",
    positions: ["Jiu-Jitsu", "Judô", "MMA", "Karatê", "Taekwondo", "Boxe", "Muay Thai", "Kickboxing", "Wrestling", "Capoeira"],
    sideLabel: "Base / Guarda",
    sideOptions: ["Ortodoxa", "Canhota (Southpaw)", "Switch"],
    clubLabel: "Academia / Equipe",
    statsSuggestions: ["Cartel (V-D-E)", "Finalizações", "Nocautes", "Títulos"],
    fields: [
      { key: "graduacao", label: "Graduação / Faixa", labelEn: "Belt / Rank", type: "text" },
      { key: "categoria_peso", label: "Categoria de peso", labelEn: "Weight class", type: "text" },
      { key: "cartel", label: "Cartel (vitórias-derrotas-empates)", labelEn: "Record (W-L-D)", type: "text" },
      competitions,
    ],
  },
  {
    slug: "tenis",
    name: "Tênis",
    nameEn: "Tennis",
    emoji: "🎾",
    color: "#65a30d",
    image: "/sports/tenis.jpg",
    positionLabel: "Estilo de jogo",
    positions: ["Fundo de quadra", "Saque e voleio", "All-court", "Contra-atacante"],
    sideLabel: "Mão dominante",
    sideOptions: ["Destro", "Canhoto"],
    clubLabel: "Clube / Academia",
    statsSuggestions: ["Ranking ITF", "Ranking CBT", "Títulos", "Vitórias na temporada"],
    fields: [
      { key: "backhand", label: "Backhand", labelEn: "Backhand", type: "select", options: ["Uma mão", "Duas mãos"] },
      { key: "ranking", label: "Rankings (CBT, ITF, UTR)", labelEn: "Rankings (ITF, UTR)", type: "text" },
      competitions,
    ],
  },
  {
    slug: "ginastica",
    name: "Ginástica",
    nameEn: "Gymnastics",
    emoji: "🤸",
    color: "#db2777",
    image: "/sports/ginastica.jpg",
    positionLabel: "Modalidade",
    positions: ["Artística", "Rítmica", "Trampolim", "Acrobática"],
    clubLabel: "Clube / Equipe",
    statsSuggestions: ["Melhor nota", "Medalhas", "Ranking"],
    fields: [
      { key: "aparelhos", label: "Aparelhos principais", labelEn: "Main apparatus", type: "text" },
      { key: "nivel", label: "Nível / Categoria", labelEn: "Level", type: "text" },
      competitions,
    ],
  },
  {
    slug: "ciclismo",
    name: "Ciclismo",
    nameEn: "Cycling",
    emoji: "🚴",
    color: "#ca8a04",
    image: "/sports/ciclismo.jpg",
    positionLabel: "Modalidade",
    positions: ["Estrada", "Mountain Bike (XCO)", "Maratona MTB", "Pista", "BMX", "Gravel"],
    clubLabel: "Equipe atual",
    statsSuggestions: ["FTP (W/kg)", "Pódios", "Vitórias", "Ranking"],
    fields: [
      { key: "ftp", label: "FTP / W por kg", labelEn: "FTP / W per kg", type: "text" },
      competitions,
    ],
  },
  {
    slug: "surf",
    name: "Surf",
    nameEn: "Surfing",
    emoji: "🏄",
    color: "#0284c7",
    image: "/sports/surf.jpg",
    positionLabel: "Modalidade",
    positions: ["Shortboard", "Longboard", "Bodyboard", "Ondas grandes", "Stand Up Paddle"],
    sideLabel: "Base",
    sideOptions: ["Regular", "Goofy"],
    clubLabel: "Equipe / Patrocinador",
    statsSuggestions: ["Ranking", "Títulos", "Melhor resultado"],
    fields: [
      { key: "ranking", label: "Ranking (WSL, CBSurf, estadual)", labelEn: "Ranking", type: "text" },
      competitions,
    ],
  },
  {
    slug: "outro",
    name: "Outro esporte",
    nameEn: "Other sport",
    emoji: "🏅",
    color: "#475569",
    image: "/sports/outro.jpg",
    positionLabel: "Modalidade / Função",
    clubLabel: "Clube / Equipe",
    statsSuggestions: ["Títulos", "Ranking", "Melhor resultado"],
    fields: [{ key: "esporte_nome", label: "Qual esporte?", labelEn: "Sport", type: "text" }, competitions],
  },
];

export function getSport(slug?: string | null): Sport {
  return SPORTS.find((s) => s.slug === slug) ?? SPORTS[SPORTS.length - 1];
}
