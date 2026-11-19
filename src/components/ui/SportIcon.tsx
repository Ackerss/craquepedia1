import type { CSSProperties, ReactNode } from "react";
import { getSport } from "@/lib/sports";

/**
 * Ícones de esporte desenhados no mesmo padrão (traço 1.75, cantos arredondados, grade 24px),
 * para substituir os emojis e manter o visual consistente em toda a plataforma.
 */
const PATHS: Record<string, ReactNode> = {
  futebol: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.5 3.4 2.5-1.3 4h-4.2l-1.3-4Z" />
      <path d="M12 7.5V3.2M15.4 10l4.1-1.4M14.1 14l2.6 3.6M9.9 14l-2.6 3.6M8.6 10 4.5 8.6" />
    </>
  ),
  futsal: (
    <>
      <path d="M3 20V6h18v14" />
      <path d="M3 6l3 3h12l3-3M6 9v11M18 9v11" opacity=".55" />
      <circle cx="12" cy="16" r="3.2" />
    </>
  ),
  volei: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M11.2 7.4a15 15 0 0 1 9.9 3.7M12 12a11.5 11.5 0 0 1-7.9 4.5M16.4 13.4a15 15 0 0 1-8.2 6.8M20.3 16.6A11.6 11.6 0 0 0 12 12a12 12 0 0 1 0-9.1M6.8 4.4a15 15 0 0 0 1.7 10.4" />
    </>
  ),
  basquete: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18" />
      <path d="M5.6 5.6a12.5 12.5 0 0 1 0 12.8M18.4 5.6a12.5 12.5 0 0 0 0 12.8" />
    </>
  ),
  handebol: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.2 4.6 3.3-1.8 5.3H9.2l-1.8-5.3Z" />
      <path d="M12 7.2V3M16.6 10.5l4-1.6M14.8 15.8l2.4 3.7M9.2 15.8l-2.4 3.7M7.4 10.5l-4-1.6" opacity=".55" />
    </>
  ),
  atletismo: (
    <>
      <path d="M5 20V8M19 20V8M5 8h14M5 12.5h14" />
      <path d="M3 20h4M17 20h4" />
      <path d="M9 4.5h6" opacity=".55" />
    </>
  ),
  corrida: (
    <>
      <path d="M3.5 15.5 5 9l3.5 1.2 1.6-2.6 2.2 1.1c1.1 2.8 3.4 4.4 7 4.9a1.6 1.6 0 0 1 1.4 1.6V17a1 1 0 0 1-1 1H4.6a1.2 1.2 0 0 1-1.1-1.5Z" />
      <path d="M3.5 15.5h17.7M9.3 11.5l1.6.8M10.6 13.6l1.6.8" />
    </>
  ),
  natacao: (
    <>
      <circle cx="16.5" cy="6" r="2" />
      <path d="m5 11.5 4.5-3.2 3.3 2.2 2.7-1.6" />
      <path d="M2.5 15.5c1.6 0 1.6 1.2 3.2 1.2s1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.5-1.2 3-1.2" />
      <path d="M2.5 19.5c1.6 0 1.6 1.2 3.2 1.2s1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.5-1.2 3-1.2" opacity=".55" />
    </>
  ),
  "artes-marciais": (
    <>
      <path d="M3 8.5h18v3.5H3Z" />
      <path d="M10 8.5h4v3.5h-4Z" />
      <path d="m10.5 12-2.2 8M13.5 12l2.2 8" />
      <path d="M3 10.2h7M14 10.2h7" opacity=".45" />
    </>
  ),
  tenis: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.7c3.4 3.4 3.4 9.2 0 12.6M18.4 5.7c-3.4 3.4-3.4 9.2 0 12.6" />
    </>
  ),
  ginastica: (
    <>
      <path d="M8 3v8.5M16 3v8.5" />
      <circle cx="8" cy="15" r="3.5" />
      <circle cx="16" cy="15" r="3.5" />
      <path d="M4 3h16" opacity=".55" />
    </>
  ),
  ciclismo: (
    <>
      <circle cx="5.5" cy="16.5" r="3.5" />
      <circle cx="18.5" cy="16.5" r="3.5" />
      <path d="M5.5 16.5 9 9h7l2.5 7.5M9 9l3.5 7.5h-7M12.5 16.5 16 9M8 6h3M15 6.5l1 2.5" />
    </>
  ),
  surf: (
    <>
      <path d="M17.5 3.5c2.4 2.4-1.6 9-5.7 13.1S4.7 22.7 3.5 21.5s.9-5.2 5-9.3 6.6-11 9-8.7Z" />
      <path d="M6.2 18.7 15 9.9" opacity=".55" />
    </>
  ),
  outro: (
    <>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M8.5 10.7 5.5 3h4l2.5 6M15.5 10.7 18.5 3h-4L12 9" />
      <path d="m12 12.6.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2Z" />
    </>
  ),
};

export function SportIcon({
  sport,
  className = "size-5",
  style,
  strokeWidth = 1.75,
}: {
  sport?: string | null;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  const slug = getSport(sport).slug;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {PATHS[slug] ?? PATHS.outro}
    </svg>
  );
}

/** Ilustração quadrada do esporte (padrão visual único, cor da modalidade). */
export function SportArt({
  sport,
  className = "",
  rounded = "rounded-2xl",
  style,
}: {
  sport?: string | null;
  className?: string;
  rounded?: string;
  style?: CSSProperties;
}) {
  const s = getSport(sport);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={s.image} alt={s.name} loading="lazy" className={`object-cover ${rounded} ${className}`} style={style} />
  );
}

/** Selo compacto: ícone dentro de um quadrado com a cor do esporte. */
export function SportBadge({ sport, size = 36, className = "" }: { sport?: string | null; size?: number; className?: string }) {
  const s = getSport(sport);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl text-white ${className}`}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, boxShadow: `0 4px 12px ${s.color}40` }}
      title={s.name}
    >
      <SportIcon sport={s.slug} className="" style={{ width: size * 0.56, height: size * 0.56 }} />
    </span>
  );
}
