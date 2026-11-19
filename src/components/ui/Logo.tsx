export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="cqg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#0b1220" />
      <path d="M44.5 21.5A15 15 0 1 0 44.5 42.5" fill="none" stroke="url(#cqg)" strokeWidth="7" strokeLinecap="round" />
      <path d="M41 32l4.2-2.6 4.2 2.6-1.6 4.8h-5.2z" fill="#fbbf24" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-display text-xl font-semibold uppercase tracking-wide ${light ? "text-white" : "text-ink-900"}`}>
        Craque<span className="text-brand-400">pedia</span>
      </span>
    </div>
  );
}
