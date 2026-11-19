/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { ResumeData } from "@/lib/resume-data";
import { initials } from "@/lib/utils";

export const PAGE: CSSProperties = {
  width: 794,
  minHeight: 1123,
  overflow: "hidden",
  position: "relative",
  boxShadow: "0 10px 40px rgba(15,23,42,.18)",
};

export const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

export function lim<T>(arr: T[] | undefined, n: number): T[] {
  return (arr ?? []).slice(0, n);
}

export function Photo({
  d,
  size,
  radius = 9999,
  className = "",
  style,
  src,
}: {
  d: ResumeData;
  size: number | string;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
  src?: string | null;
}) {
  const url = src === undefined ? d.photo : src;
  const box: CSSProperties = { width: size, height: size, borderRadius: radius, ...style };
  if (url) return <img src={url} alt={d.name} className={`object-cover ${className}`} style={box} />;
  return (
    <div
      className={`flex items-center justify-center font-display font-semibold text-white ${className}`}
      style={{ ...box, background: d.accent, fontSize: typeof size === "number" ? size * 0.36 : 48 }}
    >
      {initials(d.name)}
    </div>
  );
}

export function QR({ svg, size = 84, className = "", style }: { svg: string; size?: number; className?: string; style?: CSSProperties }) {
  return <div className={`[&>svg]:h-full [&>svg]:w-full ${className}`} style={{ width: size, height: size, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Footer({ d, dark = false, className = "" }: { d: ResumeData; dark?: boolean; className?: string }) {
  return (
    <div className={`flex items-center justify-between text-[9px] uppercase tracking-[0.18em] ${dark ? "text-white/40" : "text-slate-400"} ${className}`}>
      <span>
        {d.company.name || "Craquepedia"}
        {d.company.instagram ? ` · ${d.company.instagram}` : ""}
      </span>
      <span>{d.sportName}</span>
    </div>
  );
}

export type KV = [string, string];

export function personal(d: ResumeData): KV[] {
  return (
    [
      [d.L.born, d.birth ? `${d.birth}${d.age !== null ? ` (${d.age} ${d.L.years})` : ""}` : ""],
      [d.L.nationality, d.nationality],
      [d.L.city, d.city],
      [d.L.languages, d.languages],
    ] as KV[]
  ).filter(([, v]) => v);
}

export function physical(d: ResumeData): KV[] {
  return (
    [
      [d.positionLabel, d.position],
      [d.L.height, d.height],
      [d.L.weight, d.weight],
      [d.sideLabel, d.side],
      [d.clubLabel, d.club],
      ...d.details,
    ] as KV[]
  ).filter(([k, v]) => k && v);
}

export function contact(d: ResumeData): KV[] {
  return (
    [
      ["WhatsApp", d.phone],
      ["E-mail", d.email],
      ["Instagram", d.instagram],
      [d.L.agent, d.agent],
      [d.L.guardian, d.guardian],
    ] as KV[]
  ).filter(([, v]) => v);
}

export function bioText(d: ResumeData) {
  return d.bio || d.bioShort;
}

