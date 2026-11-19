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
  if (!birth) return null;
  const d = new Date(birth + "T12:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

export function fmtDate(v?: string | Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!v) return "";
  const d = typeof v === "string" ? new Date(v.length === 10 ? v + "T12:00:00" : v) : v;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", opts ?? { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDateEn(v?: string | null) {
  if (!v) return "";
  const d = new Date(v + "T12:00:00");
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function relTime(v: string | Date) {
  const d = typeof v === "string" ? new Date(v) : v;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `há ${Math.floor(diff / 86400)} d`;
  return fmtDate(d);
}

export function daysUntil(date?: string | null) {
  if (!date) return null;
  const d = new Date(date + "T12:00:00");
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
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
