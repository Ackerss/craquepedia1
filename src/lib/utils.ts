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
  // "1.250,50" → 1250.50 · "1.250" (ponto de milhar) → 1250 · "1250.50" → 1250.50
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : /^-?\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, "") : s;
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

/** Maior valor aceito num campo de dinheiro (R$ 1 milhão). */
export const MAX_CENTS = 100_000_000;

/** Confere um campo de dinheiro digitado. Devolve a mensagem de erro, ou null se estiver certo. */
export function moneyError(v: FormDataEntryValue | null | undefined, label = "valor", allowZero = true) {
  const raw = String(v ?? "").trim();
  if (!raw) return allowZero ? null : `Informe o ${label}.`;
  if (!/\d/.test(raw)) return `O ${label} precisa ser um número (ex.: 1.250,00).`;
  const c = parseBRL(raw);
  if (c < 0 || raw.includes("-")) return `O ${label} não pode ser negativo.`;
  if (!allowZero && c === 0) return `Informe o ${label}.`;
  if (c > MAX_CENTS) return `O ${label} passou do limite (R$ 1.000.000,00). Confira os zeros.`;
  return null;
}

/** Menor de 18 anos (pela data de nascimento). */
export function isMinor(birth?: string | null) {
  const a = ageFrom(birth);
  return a !== null && a < 18;
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

/** Número brasileiro só com DDD + número (tira +55, 0 de operadora/DDD na frente). Estrangeiro fica como está. */
function brDigits(phone?: string | null) {
  let d = onlyDigits(phone);
  if (/^0\d{10,12}$/.test(d)) d = d.replace(/^0+/, "").replace(/^(\d{2})(\d{2})(\d{8,9})$/, (m, op, ddd, n) => (m.length > 11 ? ddd + n : m));
  if (/^55\d{10,11}$/.test(d)) d = d.slice(2);
  return d;
}

/** Link do WhatsApp. `country` (do contato): fora do Brasil o número já vem com o código do país e não recebe o 55. */
export function waLink(phone?: string | null, text?: string, country?: string | null) {
  const abroad = !!country && !/^(bra|brasil|brazil)/i.test(country.trim());
  let d = abroad ? onlyDigits(phone).replace(/^00/, "") : brDigits(phone);
  if (d && d.length <= 11 && !abroad) d = "55" + d;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return d ? `https://wa.me/${d}${q}` : `https://wa.me/${q}`;
}

export function fmtPhone(p?: string | null) {
  const d = brDigits(p);
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

function decimal(v: FormDataEntryValue | null | undefined) {
  const m = (v ?? "").toString().replace(",", ".").match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/** Altura em cm. Aceita "178", "1,78", "1.78 m" ou "178cm". Valores fora de 50–250 cm são descartados. */
export function heightCm(v: FormDataEntryValue | null | undefined) {
  const n = decimal(v);
  if (n === null) return null;
  const cm = Math.round(n < 3 ? n * 100 : n);
  return cm >= 50 && cm <= 250 ? cm : null;
}

/** Peso em kg (arredondado). Aceita "72", "72,5" ou "72 kg". Valores fora de 15–250 kg são descartados. */
export function weightKg(v: FormDataEntryValue | null | undefined) {
  const n = decimal(v);
  if (n === null) return null;
  const kg = Math.round(n);
  return kg >= 15 && kg <= 250 ? kg : null;
}

/**
 * Acha links num texto livre ("Meus gols: youtu.be/x (2024), https://...").
 * Aceita link sem "https://" de sites conhecidos e tira pontuação colada no fim.
 */
export function extractLinks(text: string) {
  const re = /(?:https?:\/\/|www\.|(?:youtu\.be|(?:m\.)?youtube\.com|instagram\.com|vimeo\.com|tiktok\.com|drive\.google\.com|facebook\.com|fb\.watch)\/)[^\s<>"']+/gi;
  const out: string[] = [];
  for (const m of text.match(re) ?? []) {
    // "link1,https://link2" colados: separa
    for (const part of m.split(/,(?=https?:\/\/)/)) {
      let u = part.replace(/[.,;:!?)\]]+$/, "");
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
      if (!out.includes(u)) out.push(u);
    }
  }
  return out;
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

/** Valor em reais por extenso (até 999.999.999,99). Ex.: 1250,50 → "mil duzentos e cinquenta reais e cinquenta centavos". */
export function extenso(cents: number) {
  const reais = Math.floor(cents / 100);
  const cent = cents % 100;
  const mi = Math.floor(reais / 1_000_000);
  const mil = Math.floor((reais % 1_000_000) / 1000);
  const resto = reais % 1000;
  const joint = (n: number) => (n < 100 || n % 100 === 0 ? " e " : " ");
  let low = "";
  if (mil) low = (mil === 1 ? "mil" : ate999(mil) + " mil") + (resto ? joint(resto) + ate999(resto) : "");
  else low = ate999(resto);
  let txt = low;
  if (mi) {
    const below = reais % 1_000_000;
    txt = (mi === 1 ? "um milhão" : ate999(mi) + " milhões") + (below ? (mil && !resto ? " e " : below < 1000 ? joint(below) : " ") + low : "");
  }
  // "um milhão de reais" (valor redondo em milhões leva "de")
  const de = mi && reais % 1_000_000 === 0 ? " de" : "";
  const r = reais ? `${txt}${de} ${reais === 1 ? "real" : "reais"}` : "";
  const c = cent ? `${ate999(cent)} ${cent === 1 ? "centavo" : "centavos"}` : "";
  return [r, c].filter(Boolean).join(" e ") || "zero reais";
}
