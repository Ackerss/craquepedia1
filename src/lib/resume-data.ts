import "server-only";
import type { Achievement, Athlete, CareerItem, StatItem } from "@/db/schema";
import { sportOf } from "./sports";
import { ageFrom, fileUrl, fmtDate, fmtDateEn, fmtPhone, igHandle } from "./utils";
import { baseUrl, qrSvg } from "./server-utils";
import { getCompany, listGallery } from "./data";

const EN: Record<string, string> = {
  Goleiro: "Goalkeeper",
  Zagueiro: "Center Back",
  "Lateral Direito": "Right Back",
  "Lateral Esquerdo": "Left Back",
  Volante: "Defensive Midfielder",
  "Meio-campista": "Central Midfielder",
  "Meia Atacante": "Attacking Midfielder",
  "Ponta Direita": "Right Winger",
  "Ponta Esquerda": "Left Winger",
  "Segundo Atacante": "Second Striker",
  Centroavante: "Striker",
  Fixo: "Defender (Fixo)",
  "Ala Direita": "Right Wing",
  "Ala Esquerda": "Left Wing",
  Pivô: "Pivot",
  Universal: "Universal",
  "Levantador(a)": "Setter",
  "Oposto(a)": "Opposite",
  "Ponteiro(a)": "Outside Hitter",
  Central: "Middle Blocker",
  Líbero: "Libero",
  Direita: "Right",
  Esquerda: "Left",
  Ambidestro: "Both",
  Destro: "Right-handed",
  Canhoto: "Left-handed",
  Brasileira: "Brazilian",
  Brasileiro: "Brazilian",
  Italiana: "Italian",
  Portuguesa: "Portuguese",
  Espanhola: "Spanish",
  Alemã: "German",
  Japonesa: "Japanese",
  Masculino: "Male",
  Feminino: "Female",
  "Armador (PG)": "Point Guard (PG)",
  "Ala-Armador (SG)": "Shooting Guard (SG)",
  "Ala (SF)": "Small Forward (SF)",
  "Ala-Pivô (PF)": "Power Forward (PF)",
  "Pivô (C)": "Center (C)",
  "Armador Central": "Centre Back",
  "Armador Esquerdo": "Left Back",
  "Armador Direito": "Right Back",
  "Provas principais": "Main events",
  "Corrida de Rua": "Road Running",
  Ultramaratona: "Ultramarathon",
  "Meia Maratona": "Half Marathon",
  Maratona: "Marathon",
  Livre: "Freestyle",
  Costas: "Backstroke",
  Peito: "Breaststroke",
  Borboleta: "Butterfly",
  Medley: "Individual Medley",
  "Águas abertas": "Open water",
  Judô: "Judo",
  Karatê: "Karate",
  Boxe: "Boxing",
  Ortodoxa: "Orthodox",
  "Canhota (Southpaw)": "Southpaw",
  "Fundo de quadra": "Baseliner",
  "Saque e voleio": "Serve and volley",
  "Contra-atacante": "Counterpuncher",
  "Uma mão": "One-handed",
  "Duas mãos": "Two-handed",
  Artística: "Artistic",
  Rítmica: "Rhythmic",
  Trampolim: "Trampoline",
  Acrobática: "Acrobatic",
  Estrada: "Road",
  Pista: "Track",
  "Maratona MTB": "MTB Marathon",
  "Ondas grandes": "Big wave",
  Quadra: "Indoor",
  Praia: "Beach",
  Ambos: "Both",
  Ambas: "Both",
  "Curta (25m)": "Short course (25m)",
  "Longa (50m)": "Long course (50m)",
  Português: "Portuguese",
  Inglês: "English",
  Espanhol: "Spanish",
  Italiano: "Italian",
  Francês: "French",
  Alemão: "German",
  Básico: "Basic",
  Intermediário: "Intermediate",
  Avançado: "Advanced",
  Fluente: "Fluent",
  Nativo: "Native",
  Americana: "American",
  Argentina: "Argentinian",
  Francesa: "French",
  Jogos: "Matches",
  Gols: "Goals",
  Assistências: "Assists",
  "Assistências por jogo": "Assists per game",
  "Minutos jogados": "Minutes played",
  Títulos: "Titles",
  Defesas: "Saves",
  "Jogos sem sofrer gol": "Clean sheets",
  Finalizações: "Shots",
  Bloqueios: "Blocks",
  Pontos: "Points",
  "Pontos por jogo": "Points per game",
  "Rebotes por jogo": "Rebounds per game",
  "Aproveitamento 3pts (%)": "3PT %",
  "Recepção (%)": "Reception %",
  Medalhas: "Medals",
  "Melhor marca": "Personal best",
  "Melhor nota": "Best score",
  "Melhor resultado": "Best result",
  "Melhor tempo": "Best time",
  "Recorde pessoal": "Personal record",
  "Ranking nacional": "National ranking",
  Vitórias: "Wins",
  "Vitórias na temporada": "Season wins",
  Nocautes: "Knockouts",
  Pódios: "Podiums",
  Índice: "Qualifying standard",
  "Cartel (V-D-E)": "Record (W-L-D)",
  Atual: "Present",
  atual: "present",
};

export function tr(v: string | null | undefined, lang: "pt" | "en") {
  if (!v) return "";
  if (lang === "pt") return v;
  return v
    .split(/\s*,\s*/)
    .map((p) => EN[p] ?? EN[p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()] ?? p)
    .join(", ")
    .replace(/\bAtual\b/g, "Present");
}

export const LABELS = {
  pt: {
    profile: "Perfil",
    about: "Sobre",
    career: "Carreira",
    achievements: "Conquistas",
    stats: "Números",
    personal: "Dados pessoais",
    physical: "Dados físicos",
    contact: "Contato",
    style: "Estilo de jogo",
    born: "Nascimento",
    age: "Idade",
    years: "anos",
    nationality: "Nacionalidade",
    height: "Altura",
    weight: "Peso",
    city: "Cidade",
    club: "Clube atual",
    position: "Posição",
    languages: "Idiomas",
    education: "Formação",
    videos: "Vídeos",
    scan: "Aponte a câmera para ver vídeos e portfólio",
    technical: "Ficha técnica",
    agent: "Empresário",
    school: "Escola",
    graduation: "Formatura",
    gpa: "Média",
    english: "Inglês",
    sat: "SAT/ACT",
    guardian: "Responsável",
    highlights: "Destaques",
    measures: "Medidas",
    records: "Melhores marcas",
    coach: "Treinador(a)",
    competitions: "Competições",
    fightRecord: "Cartel",
    wins: "Vitórias",
    losses: "Derrotas",
    draws: "Empates",
    belt: "Graduação",
    weightClass: "Categoria de peso",
    team: "Equipe",
    timeline: "Trajetória",
    category: "Categoria",
    event: "Prova",
    mark: "Marca",
    gallery: "Galeria",
    dossier: "Dossiê do atleta",
    contactUs: "Fale com a gente",
  },
  en: {
    profile: "Profile",
    about: "About",
    career: "Career",
    achievements: "Honours & Achievements",
    stats: "Statistics",
    personal: "Personal details",
    physical: "Physical",
    contact: "Contact",
    style: "Playing style",
    born: "Date of birth",
    age: "Age",
    years: "years",
    nationality: "Nationality",
    height: "Height",
    weight: "Weight",
    city: "Hometown",
    club: "Current club",
    position: "Position",
    languages: "Languages",
    education: "Education",
    videos: "Videos",
    scan: "Scan to watch highlights and full profile",
    technical: "Player sheet",
    agent: "Agent",
    school: "School",
    graduation: "Graduation year",
    gpa: "GPA",
    english: "English level",
    sat: "SAT/ACT",
    guardian: "Parent/Guardian",
    highlights: "Highlights",
    measures: "Measurements",
    records: "Personal bests",
    coach: "Coach",
    competitions: "Competitions",
    fightRecord: "Record",
    wins: "Wins",
    losses: "Losses",
    draws: "Draws",
    belt: "Rank",
    weightClass: "Weight class",
    team: "Team",
    timeline: "Career path",
    category: "Category",
    event: "Event",
    mark: "Mark",
    gallery: "Gallery",
    dossier: "Athlete dossier",
    contactUs: "Get in touch",
  },
} as const;

export type Labels = { [K in keyof (typeof LABELS)["pt"]]: string };

export type ResumeData = {
  lang: "pt" | "en";
  L: Labels;
  name: string;
  nickname: string;
  displayName: string;
  sportName: string;
  sportEmoji: string;
  sportSlug: string;
  positionLabel: string;
  position: string;
  age: number | null;
  birth: string;
  nationality: string;
  city: string;
  height: string;
  weight: string;
  sideLabel: string;
  side: string;
  clubLabel: string;
  club: string;
  bio: string;
  bioShort: string;
  style: string;
  achievements: Achievement[];
  career: CareerItem[];
  stats: StatItem[];
  details: [string, string][];
  education: { label: string; value: string }[];
  languages: string;
  phone: string;
  email: string;
  instagram: string;
  agent: string;
  guardian: string;
  photo: string | null;
  cover: string | null;
  accent: string;
  qr: string;
  qrLight: string;
  portfolioUrl: string;
  videos: { title: string; url: string }[];
  company: { name: string; whatsapp: string; instagram: string };
  /* Extras para modelos por modalidade */
  sportColor: string;
  sportImage: string;
  positionKeys: string[];
  sportData: Record<string, string>;
  metrics: { label: string; value: string; unit?: string }[];
  records: RecordItem[];
  fightRecord: { w: string; l: string; d: string } | null;
  belt: string;
  weightClass: string;
  coach: string;
  category: string;
  competitions: string;
  gallery: string[];
};

export type RecordItem = { event: string; mark: string; extra?: string };

/** Lê "100m: 10.42s (2024)" / "5K - 17:30 - São Silvestre" em linhas estruturadas. */
export function parseRecords(txt?: string | null): RecordItem[] {
  if (!txt) return [];
  return txt
    .split(/\n|;/)
    .map((l) => l.replace(/^[\s•\-*·]+/, "").trim())
    .filter(Boolean)
    .map((l) => {
      let extra: string | undefined;
      const par = l.match(/\(([^)]+)\)\s*$/);
      if (par) {
        extra = par[1];
        l = l.slice(0, par.index).trim();
      }
      // separadores: "prova: marca", "prova - marca", "prova = marca" ou "prova, marca, ano" (o ":" de um tempo como 33:58 não conta)
      const m = l.match(/^(.+?)\s*(?:(?<!\d):(?!\d)|\s[-–—]\s|=|,\s+)\s*(.+)$/);
      if (!m) return { event: l, mark: "", extra };
      const [mark, ...rest] = m[2].split(/\s[-–—|]\s|,\s+/);
      return { event: m[1].trim(), mark: mark.trim(), extra: [rest.join(" · "), extra].filter(Boolean).join(" · ") || undefined };
    })
    .slice(0, 10);
}

const METRIC_FIELDS: Record<string, { pt: string; en: string; unit?: string }> = {
  alcance_ataque: { pt: "Alcance ataque", en: "Spike reach", unit: "cm" },
  alcance_bloqueio: { pt: "Alcance bloqueio", en: "Block reach", unit: "cm" },
  envergadura: { pt: "Envergadura", en: "Wingspan", unit: "cm" },
  impulsao: { pt: "Impulsão", en: "Vertical jump", unit: "cm" },
  velocidade: { pt: "Velocidade", en: "Sprint" },
  ftp: { pt: "FTP", en: "FTP" },
};

const POSITION_LABEL_EN: Record<string, string> = {
  Posição: "Position",
  Modalidade: "Discipline",
  "Provas principais": "Events",
  "Estilo principal": "Main stroke",
  "Estilo de jogo": "Playing style",
  "Modalidade / Função": "Discipline / Role",
};

/** Altura em pés e polegadas (182 cm → 6'0"). */
function feet(cm: number) {
  const inches = Math.round(cm / 2.54);
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export async function buildResumeData(a: Athlete, lang: "pt" | "en"): Promise<ResumeData> {
  const sport = sportOf(a);
  const L = LABELS[lang];
  const base = await baseUrl();
  const portfolioUrl = `${base}/p/${a.slug}`;
  const [qr, qrLight, company, gallery] = await Promise.all([qrSvg(portfolioUrl), qrSvg(portfolioUrl, "#ffffff", "#00000000"), getCompany(), listGallery(a.id)]);
  const age = ageFrom(a.birthDate);
  const en = lang === "en";
  const edu = a.education ?? {};
  const sd = a.sportData ?? {};
  const education = [
    { label: L.school, value: edu.school ?? "" },
    { label: L.graduation, value: edu.graduationYear ?? "" },
    { label: en ? "Grade" : "Série", value: edu.grade ?? "" },
    { label: L.gpa, value: edu.gpa ?? "" },
    { label: L.english, value: tr(edu.english, lang) },
    { label: L.sat, value: edu.satAct ?? "" },
  ].filter((e) => e.value);

  return {
    lang,
    L,
    name: a.fullName,
    nickname: a.nickname ?? "",
    displayName: a.nickname || a.fullName,
    sportName: en ? sport.nameEn : sport.name,
    sportEmoji: sport.emoji,
    sportSlug: sport.slug,
    positionLabel: en ? (POSITION_LABEL_EN[sport.positionLabel] ?? "Position") : sport.positionLabel,
    position: tr(a.position, lang),
    age,
    birth: en ? fmtDateEn(a.birthDate) : fmtDate(a.birthDate),
    nationality: [tr(a.nationality, lang), tr(a.secondNationality, lang)].filter(Boolean).join(" / "),
    city: [a.city, a.state].filter(Boolean).join(" - ") + (en && a.city ? ", Brazil" : ""),
    height: a.heightCm ? (en ? `${a.heightCm} cm (${feet(a.heightCm)})` : `${(a.heightCm / 100).toFixed(2).replace(".", ",")} m`) : "",
    weight: a.weightKg ? (en ? `${a.weightKg} kg (${Math.round(a.weightKg * 2.2046)} lbs)` : `${a.weightKg} kg`) : "",
    sideLabel: en ? (sport.sideLabel?.includes("Mão") ? "Dominant hand" : sport.sideLabel?.includes("Perna") ? "Preferred foot" : "Stance") : (sport.sideLabel ?? ""),
    side: tr(a.dominantSide, lang),
    clubLabel: en ? "Current club" : sport.clubLabel,
    club: a.currentClub ?? "",
    bio: (en ? a.bioEn : a.bio) || "",
    bioShort: en ? "" : (a.bioShort ?? ""),
    style: (en ? a.playingStyleEn : a.playingStyle) ?? "",
    achievements: a.achievements ?? [],
    career: (a.career ?? []).map((c) => ({ ...c, period: tr(c.period, lang) })),
    stats: (a.stats ?? []).map((x) => ({ ...x, label: tr(x.label, lang) })),
    details: sport.fields
      .filter((f) => a.sportData?.[f.key] && f.type !== "textarea")
      .map((f) => [(en ? f.labelEn : f.label).replace(/\s*\(.*\)\s*$/, ""), tr(a.sportData[f.key], lang)] as [string, string]),
    education,
    languages: tr(a.languages, lang),
    // menor de idade: celular e e-mail do próprio atleta não vão para material público (fica o do responsável)
    phone: age !== null && age < 18 ? "" : fmtPhone(a.phone),
    email: age !== null && age < 18 ? "" : (a.email ?? ""),
    instagram: igHandle(a.instagram),
    agent: a.agent ?? "",
    guardian: a.guardianName ? `${a.guardianName}${a.guardianPhone ? ` · ${fmtPhone(a.guardianPhone)}` : ""}` : "",
    photo: fileUrl(a.photoId),
    cover: fileUrl(a.coverId) ?? fileUrl(a.photoId),
    accent: a.accent || sport.color,
    qr,
    qrLight,
    portfolioUrl,
    videos: a.videos ?? [],
    company: { name: company.name, whatsapp: company.whatsapp, instagram: company.instagram },
    sportColor: sport.color,
    sportImage: sport.image,
    positionKeys: (a.position ?? "")
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean),
    sportData: sd,
    metrics: [
      a.heightCm ? { label: en ? "Height" : "Altura", value: en ? String(a.heightCm) : (a.heightCm / 100).toFixed(2).replace(".", ","), unit: en ? "cm" : "m" } : null,
      a.weightKg ? { label: en ? "Weight" : "Peso", value: String(a.weightKg), unit: "kg" } : null,
      ...Object.entries(METRIC_FIELDS).map(([k, f]) => {
        const v = sd[k]?.trim();
        if (!v) return null;
        const num = v.replace(/\s*cm$/i, "");
        return { label: en ? f.en : f.pt, value: f.unit ? num : v, unit: f.unit && /^\d+([.,]\d+)?$/.test(num) ? f.unit : undefined };
      }),
    ].filter((x) => !!x) as { label: string; value: string; unit?: string }[],
    records: parseRecords(sd.melhores_marcas || sd.melhores_tempos),
    fightRecord: (() => {
      const m = (sd.cartel ?? "").match(/(\d+)\D+(\d+)(?:\D+(\d+))?/);
      return m ? { w: m[1], l: m[2], d: m[3] ?? "0" } : null;
    })(),
    belt: sd.graduacao ?? "",
    weightClass: sd.categoria_peso ?? "",
    coach: sd.treinador ?? "",
    category: sd.categoria ?? sd.nivel ?? "",
    competitions: sd.competicoes ?? "",
    gallery: gallery.filter((g) => g.id !== a.photoId).map((g) => `/api/files/${g.id}`).slice(0, 6),
  };
}
