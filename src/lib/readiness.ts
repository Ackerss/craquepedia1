import type { Athlete } from "@/db/schema";
import { getSport } from "./sports";

export type ReadinessItem = { label: string; ok: boolean; tab: "editar" | "fotos" | "ia" };

/** Checklist do que o perfil precisa para gerar materiais fortes. */
export function readiness(a: Athlete, galleryCount: number) {
  const sport = getSport(a.sport);
  const filled = sport.fields.filter((f) => a.sportData?.[f.key]).length;
  const items: ReadinessItem[] = [
    { label: "Foto principal", ok: !!a.photoId, tab: "fotos" },
    { label: "Capa ou fotos na galeria", ok: !!a.coverId || galleryCount >= 2, tab: "fotos" },
    { label: "Data de nascimento", ok: !!a.birthDate, tab: "editar" },
    { label: "Altura e peso", ok: !!(a.heightCm && a.weightKg), tab: "editar" },
    { label: `Dados de ${sport.name.toLowerCase()}`, ok: filled >= Math.ceil(sport.fields.length / 2), tab: "editar" },
    { label: "Contato (WhatsApp ou e-mail)", ok: !!(a.phone || a.email), tab: "editar" },
    { label: "Biografia", ok: !!a.bio, tab: "ia" },
    { label: "Biografia em inglês", ok: !!a.bioEn, tab: "ia" },
    { label: "Carreira (clubes)", ok: a.career.length > 0, tab: "editar" },
    { label: "Conquistas", ok: a.achievements.length > 0, tab: "editar" },
    { label: "Números / estatísticas", ok: a.stats.length > 0 || !!(a.sportData?.melhores_marcas || a.sportData?.melhores_tempos), tab: "editar" },
    { label: "Vídeo de lances", ok: a.videos.some((v) => v.url), tab: "editar" },
  ];
  const done = items.filter((i) => i.ok).length;
  return { items, done, total: items.length, pct: Math.round((done / items.length) * 100) };
}

const TEAM = ["futebol", "futsal", "volei", "basquete", "handebol"];
const CATS = [9, 11, 13, 15, 17, 20, 23];

/** Categoria de base aproximada pelo ano de nascimento (padrão CBF: Sub-N = completa até N anos no ano). */
export function baseCategory(birth?: string | null, sport?: string | null) {
  if (!birth || !sport || !TEAM.includes(sport)) return null;
  const year = new Date().getFullYear();
  const diff = year - Number(birth.slice(0, 4));
  if (!Number.isFinite(diff) || diff <= 0) return null;
  const cat = CATS.find((c) => diff <= c);
  return { year, label: cat ? `Sub-${cat}` : "Profissional" };
}
