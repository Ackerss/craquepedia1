import "server-only";
import type { Achievement, Athlete, CareerItem, StatItem } from "@/db/schema";
import { getSport } from "./sports";
import { ageFrom, fileUrl, fmtDate, fmtDateEn, fmtPhone, igHandle } from "./utils";
import { baseUrl, qrSvg } from "./server-utils";
import { getCompany } from "./data";

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
  Atual: "Present",
  atual: "present",
};

export function tr(v: string | null | undefined, lang: "pt" | "en") {
  if (!v) return "";
  if (lang === "pt") return v;
  return v
    .split(/\s*,\s*/)
    .map((p) => EN[p] ?? p)
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
};

export async function buildResumeData(a: Athlete, lang: "pt" | "en"): Promise<ResumeData> {
  const sport = getSport(a.sport);
  const L = LABELS[lang];
  const base = await baseUrl();
  const portfolioUrl = `${base}/p/${a.slug}`;
  const [qr, qrLight, company] = await Promise.all([qrSvg(portfolioUrl), qrSvg(portfolioUrl, "#ffffff", "#00000000"), getCompany()]);
  const age = ageFrom(a.birthDate);
  const en = lang === "en";
  const edu = a.education ?? {};
  const education = [
    { label: L.school, value: edu.school ?? "" },
    { label: L.graduation, value: edu.graduationYear ?? "" },
    { label: en ? "Grade" : "Série", value: edu.grade ?? "" },
    { label: L.gpa, value: edu.gpa ?? "" },
    { label: L.english, value: edu.english ?? "" },
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
    positionLabel: en ? (sport.positionLabel === "Posição" ? "Position" : sport.positionLabel === "Modalidade" ? "Discipline" : "Events") : sport.positionLabel,
    position: tr(a.position, lang),
    age,
    birth: en ? fmtDateEn(a.birthDate) : fmtDate(a.birthDate),
    nationality: [tr(a.nationality, lang), tr(a.secondNationality, lang)].filter(Boolean).join(" / "),
    city: [a.city, a.state].filter(Boolean).join(" - ") + (en && a.city ? ", Brazil" : ""),
    height: a.heightCm ? (en ? `${a.heightCm} cm (${Math.floor(a.heightCm / 30.48)}'${Math.round((a.heightCm / 2.54) % 12)}")` : `${(a.heightCm / 100).toFixed(2).replace(".", ",")} m`) : "",
    weight: a.weightKg ? (en ? `${a.weightKg} kg (${Math.round(a.weightKg * 2.2046)} lbs)` : `${a.weightKg} kg`) : "",
    sideLabel: en ? (sport.sideLabel?.includes("Mão") ? "Dominant hand" : sport.sideLabel?.includes("Perna") ? "Preferred foot" : "Stance") : (sport.sideLabel ?? ""),
    side: tr(a.dominantSide, lang),
    clubLabel: en ? "Current club" : sport.clubLabel,
    club: a.currentClub ?? "",
    bio: (en ? a.bioEn : a.bio) || (en ? "" : "") || "",
    bioShort: en ? "" : (a.bioShort ?? ""),
    style: (en ? a.playingStyleEn : a.playingStyle) ?? "",
    achievements: a.achievements ?? [],
    career: (a.career ?? []).map((c) => ({ ...c, period: tr(c.period, lang) })),
    stats: a.stats ?? [],
    details: sport.fields
      .filter((f) => a.sportData?.[f.key] && f.type !== "textarea")
      .map((f) => [en ? f.labelEn : f.label, a.sportData[f.key]] as [string, string]),
    education,
    languages: a.languages ?? "",
    phone: fmtPhone(a.phone),
    email: a.email ?? "",
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
  };
}
