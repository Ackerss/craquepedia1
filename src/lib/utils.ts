import clsx, { type ClassValue } from "clsx";

export function cn(...c: ClassValue[]) {
  return clsx(c);
}

export function brl(cents: number | null | undefined) {
  return ((cents ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseBRL(v: FormDataEntryValue | null | undefined): number {
  if (!v) return 0;
  const s = String(v).replace(/[^\d,.-]/g, "");
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function ageFrom(birth?: string | null): number | null {
  if (!birth || !/^\d{4}-\d{2}-\d{2}/.test(birth)) return null;
  const [by, bm, bd] = birth.slice(0, 10).split("-").map(Number);
  const [ty, tm, td] = todayISO().split("-").map(Number);
  let a = ty - by;
  if (tm < bm || (tm === bm && td < bd)) a--;
  return a >= 0 && a < 120 ? a : null;
}

/** Dias até o próximo aniversário (0 = hoje). */
export function daysToBirthday(birth?: string | null): number | null {
  if (!birth || !/^\d{4}-\d{2}-\d{2}/.test(birth)) return null;
  const today = todayISO();
  const year = Number(today.slice(0, 4));
  const md = birth.slice(5, 10) === "02-29" ? "02-28" : birth.slice(5, 10);
  let next = `${year}-${md}`;
  if (next < today) next = `${year + 1}-${md}`;
  return daysUntil(next);
}

/** Fuso da equipe (o servidor roda em UTC; sem isso, depois das 21h o "hoje" virava amanhã). */
export const TZ = "America/Sao_Paulo";

export function fmtDate(v?: string | Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!v) return "";
  const dateOnly = typeof v === "string" && v.length === 10;
  const d = typeof v === "string" ? new Date(dateOnly ? v + "T12:00:00Z" : v) : v;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { ...(opts ?? { day: "2-digit", month: "2-digit", year: "numeric" }), timeZone: dateOnly ? "UTC" : TZ });
}

/** Data e hora no fuso da equipe. Ex.: 26/11/2026 às 14:05 */
export function fmtDateTime(v?: string | Date | null) {
  if (!v) return "";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString("pt-BR", { timeZone: TZ })} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ })}`;
}

export function fmtDateEn(v?: string | null) {
  if (!v) return "";
  const d = new Date(v + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function relTime(v: string | Date) {
  const d = typeof v === "string" ? new Date(v) : v;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 2) return "ontem";
  if (diff < 86400 * 7) return `há ${Math.floor(diff / 86400)} dias`;
  return fmtDate(d);
}

export function daysUntil(date?: string | null) {
  if (!date) return null;
  const d = Date.parse(date.slice(0, 10) + "T12:00:00Z");
  const now = Date.parse(todayISO() + "T12:00:00Z");
  if (Number.isNaN(d)) return null;
  return Math.round((d - now) / 86400000);
}

/** Data de hoje (AAAA-MM-DD) no fuso de Brasília, com deslocamento opcional em dias. */
export function todayISO(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (!offsetDays) return parts;
  const d = new Date(parts + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Soma dias a uma data AAAA-MM-DD. */
export function addDaysISO(iso: string, days: number) {
  const d = new Date(iso.slice(0, 10) + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Data (AAAA-MM-DD) de um instante, no fuso de Brasília. */
export function isoInTZ(v: Date | string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(typeof v === "string" ? new Date(v) : v);
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function onlyDigits(s?: string | null) {
  return (s ?? "").replace(/\D/g, "");
}

export function waLink(phone?: string | null, text?: string) {
  let d = onlyDigits(phone);
  if (d && d.length <= 11) d = "55" + d;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return d ? `https://wa.me/${d}${q}` : `https://wa.me/${q}`;
}

export function fmtPhone(p?: string | null) {
  const d = onlyDigits(p);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return p ?? "";
}

export function igHandle(v?: string | null) {
  if (!v) return "";
  const s = v.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "").replace(/^@/, "");
  return s ? "@" + s : "";
}

export function firstName(full?: string | null) {
  return (full ?? "").trim().split(/\s+/)[0] ?? "";
}

export function initials(full?: string | null) {
  const p = (full ?? "").trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

export function fileUrl(id?: string | null) {
  return id ? `/api/files/${id}` : null;
}

export function str(v: FormDataEntryValue | null | undefined) {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
}

export function int(v: FormDataEntryValue | null | undefined) {
  const s = (v ?? "").toString().replace(/[^\d]/g, "");
  return s ? Number(s) : null;
}

/** Milissegundos desde a data (helper fora do render para evitar Date.now em componentes). */
export function msSince(v: string | Date) {
  return Date.now() - new Date(v).getTime();
}

const UN = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DZ = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CT = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function ate999(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (c) parts.push(CT[c]);
  if (r) parts.push(r < 20 ? UN[r] : DZ[Math.floor(r / 10)] + (r % 10 ? " e " + UN[r % 10] : ""));
  return parts.join(" e ");
}

/** Valor em reais por extenso (até 999.999,99). Ex.: 1250,50 → "mil duzentos e cinquenta reais e cinquenta centavos". */
export function extenso(cents: number) {
  const reais = Math.floor(cents / 100);
  const cent = cents % 100;
  const mil = Math.floor(reais / 1000);
  const resto = reais % 1000;
  let txt = "";
  if (mil) txt = (mil === 1 ? "mil" : ate999(mil) + " mil") + (resto ? (resto < 100 || resto % 100 === 0 ? " e " : " ") + ate999(resto) : "");
  else txt = ate999(resto);
  const r = reais ? `${txt} ${reais === 1 ? "real" : "reais"}` : "";
  const c = cent ? `${ate999(cent)} ${cent === 1 ? "centavo" : "centavos"}` : "";
  return [r, c].filter(Boolean).join(" e ") || "zero reais";
}
