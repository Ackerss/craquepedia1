/* eslint-disable react-hooks/static-components -- documento estático renderizado no servidor; os títulos locais usam a cor do atleta */
/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import type { ResumeData } from "@/lib/resume-data";
import { initials } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const PAGE: CSSProperties = {
  width: 794,
  minHeight: 1123,
  overflow: "hidden",
  position: "relative",
  boxShadow: "0 10px 40px rgba(15,23,42,.18)",
};

const clamp = (lines: number): CSSProperties => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

function lim<T>(arr: T[] | undefined, n: number): T[] {
  return (arr ?? []).slice(0, n);
}

function Photo({
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

function QR({ svg, size = 84, className = "", style }: { svg: string; size?: number; className?: string; style?: CSSProperties }) {
  return <div className={`[&>svg]:h-full [&>svg]:w-full ${className}`} style={{ width: size, height: size, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

function Footer({ d, dark = false, className = "" }: { d: ResumeData; dark?: boolean; className?: string }) {
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

type KV = [string, string];

function personal(d: ResumeData): KV[] {
  return (
    [
      [d.L.born, d.birth ? `${d.birth}${d.age !== null ? ` (${d.age} ${d.L.years})` : ""}` : ""],
      [d.L.nationality, d.nationality],
      [d.L.city, d.city],
      [d.L.languages, d.languages],
    ] as KV[]
  ).filter(([, v]) => v);
}

function physical(d: ResumeData): KV[] {
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

function contact(d: ResumeData): KV[] {
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

function bioText(d: ResumeData) {
  return d.bio || d.bioShort;
}

/* ------------------------------------------------------------------ */
/* 1. Clássico                                                         */
/* ------------------------------------------------------------------ */

function Classico({ d }: { d: ResumeData }) {
  const H = ({ children }: { children: ReactNode }) => (
    <div className="mb-3 mt-6 flex items-center gap-3">
      <h2 className="text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: d.accent }}>
        {children}
      </h2>
      <div className="h-px flex-1" style={{ background: d.accent, opacity: 0.35 }} />
    </div>
  );
  const kv = [...physical(d), ...personal(d)];
  return (
    <div className="print-page bg-white font-sans text-slate-800" style={PAGE}>
      <div className="h-2" style={{ background: d.accent }} />
      <div className="px-14 pb-10 pt-10">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-slate-400">
              {d.sportName}
              {d.position ? ` · ${d.position}` : ""}
            </p>
            <h1 className="mt-2 text-[40px] font-extrabold leading-[1.05] tracking-tight text-slate-900">{d.name}</h1>
            {d.nickname ? <p className="mt-1 text-lg font-medium" style={{ color: d.accent }}>&ldquo;{d.nickname}&rdquo;</p> : null}
            {d.bioShort ? <p className="mt-4 max-w-[430px] text-[13.5px] leading-relaxed text-slate-600">{d.bioShort}</p> : null}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-slate-600">
              {contact(d)
                .slice(0, 3)
                .map(([k, v]) => (
                  <span key={k}>
                    <b className="text-slate-800">{k}:</b> {v}
                  </span>
                ))}
            </div>
          </div>
          <Photo d={d} size={150} radius={18} style={{ border: `4px solid ${d.accent}` }} />
        </div>

        {kv.length ? (
          <>
            <H>{d.L.profile}</H>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2.5">
              {kv.slice(0, 12).map(([k, v]) => (
                <div key={k} className="border-l-2 pl-3" style={{ borderColor: d.accent }}>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">{k}</p>
                  <p className="text-[13px] font-semibold text-slate-800">{v}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {bioText(d) ? (
          <>
            <H>{d.L.about}</H>
            <p className="text-[13px] leading-[1.7] text-slate-700" style={clamp(8)}>
              {bioText(d)}
            </p>
          </>
        ) : null}

        {d.style ? (
          <>
            <H>{d.L.style}</H>
            <p className="text-[13px] leading-[1.7] text-slate-700" style={clamp(4)}>
              {d.style}
            </p>
          </>
        ) : null}

        <div className="grid grid-cols-2 gap-10">
          {d.career.length ? (
            <div>
              <H>{d.L.career}</H>
              <ul className="space-y-2.5">
                {lim(d.career, 6).map((c, i) => (
                  <li key={i} className="text-[12.5px]">
                    <p className="font-bold text-slate-900">{c.club}</p>
                    <p className="text-slate-500">{[c.period, c.role].filter(Boolean).join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {d.achievements.length ? (
            <div>
              <H>{d.L.achievements}</H>
              <ul className="space-y-2">
                {lim(d.achievements, 8).map((a, i) => (
                  <li key={i} className="flex gap-2 text-[12.5px]">
                    <span className="w-10 shrink-0 font-bold" style={{ color: d.accent }}>
                      {a.year}
                    </span>
                    <span className="text-slate-800">{a.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {d.stats.length ? (
          <>
            <H>{d.L.stats}</H>
            <div className="grid grid-cols-4 gap-3">
              {lim(d.stats, 8).map((s, i) => (
                <div key={i} className="rounded-xl border border-slate-200 px-3 py-2.5 text-center">
                  <p className="text-[22px] font-extrabold" style={{ color: d.accent }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <div className="mt-8 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
          <QR svg={d.qr} size={74} />
          <div>
            <p className="text-[12px] font-semibold text-slate-800">{d.L.scan}</p>
            <p className="text-[11px] text-slate-500">{d.portfolioUrl.replace(/^https?:\/\//, "")}</p>
          </div>
        </div>
        <Footer d={d} className="mt-6" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Moderno                                                          */
/* ------------------------------------------------------------------ */

function Moderno({ d }: { d: ResumeData }) {
  const SideH = ({ children }: { children: ReactNode }) => (
    <h3 className="mb-2.5 mt-6 border-b border-white/25 pb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">{children}</h3>
  );
  const MainH = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-3 mt-7 flex items-center gap-2 text-[15px] font-bold uppercase tracking-[0.12em] text-slate-900">
      <span className="h-5 w-1.5 rounded-full" style={{ background: d.accent }} />
      {children}
    </h2>
  );
  return (
    <div className="print-page flex bg-white font-sans" style={PAGE}>
      <aside className="flex w-[34%] shrink-0 flex-col px-7 pb-8 pt-10 text-white" style={{ background: `linear-gradient(180deg, ${d.accent} 0%, #0b1220 100%)`, minHeight: 1123 }}>
        <div className="flex justify-center">
          <Photo d={d} size={168} style={{ border: "5px solid rgba(255,255,255,.9)", boxShadow: "0 10px 30px rgba(0,0,0,.25)" }} />
        </div>
        {physical(d).length ? (
          <>
            <SideH>{d.L.physical}</SideH>
            <dl className="space-y-2">
              {physical(d)
                .slice(0, 9)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[9.5px] uppercase tracking-wider text-white/60">{k}</dt>
                    <dd className="text-[12.5px] font-semibold leading-snug">{v}</dd>
                  </div>
                ))}
            </dl>
          </>
        ) : null}
        {personal(d).length ? (
          <>
            <SideH>{d.L.personal}</SideH>
            <dl className="space-y-2">
              {personal(d).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[9.5px] uppercase tracking-wider text-white/60">{k}</dt>
                  <dd className="text-[12.5px] font-semibold leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}
        {contact(d).length ? (
          <>
            <SideH>{d.L.contact}</SideH>
            <dl className="space-y-2">
              {contact(d).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[9.5px] uppercase tracking-wider text-white/60">{k}</dt>
                  <dd className="break-words text-[12px] font-medium leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}
        <div className="mt-auto pt-6">
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
            <QR svg={d.qrLight} size={64} />
            <p className="text-[10px] leading-snug text-white/80">{d.L.scan}</p>
          </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col px-10 pb-8 pt-12">
        <p className="text-[12px] font-bold uppercase tracking-[0.3em]" style={{ color: d.accent }}>
          {d.sportName}
        </p>
        <h1 className="mt-1.5 font-display text-[46px] font-semibold uppercase leading-[0.95] text-slate-900">{d.displayName}</h1>
        {d.nickname ? <p className="mt-1.5 text-[14px] text-slate-500">{d.name}</p> : null}
        {d.position ? (
          <p className="mt-3 inline-flex w-fit rounded-full px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-white" style={{ background: d.accent }}>
            {d.position}
          </p>
        ) : null}

        {bioText(d) ? (
          <>
            <MainH>{d.L.about}</MainH>
            <p className="text-[12.8px] leading-[1.7] text-slate-700" style={clamp(9)}>
              {bioText(d)}
            </p>
          </>
        ) : null}

        {d.stats.length ? (
          <div className="mt-6 grid grid-cols-4 gap-2.5">
            {lim(d.stats, 8).map((s, i) => (
              <div key={i} className="rounded-xl px-2 py-3 text-center" style={{ background: `${d.accent}14` }}>
                <p className="font-display text-[24px] font-semibold leading-none" style={{ color: d.accent }}>
                  {s.value}
                </p>
                <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wide text-slate-600">{s.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        {d.career.length ? (
          <>
            <MainH>{d.L.career}</MainH>
            <ol className="relative space-y-3.5 border-l-2 pl-5" style={{ borderColor: `${d.accent}40` }}>
              {lim(d.career, 6).map((c, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 size-3 rounded-full border-2 border-white" style={{ background: d.accent }} />
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13.5px] font-bold text-slate-900">{c.club}</p>
                    <p className="shrink-0 text-[11px] font-semibold text-slate-500">{c.period}</p>
                  </div>
                  {c.role ? <p className="text-[12px] text-slate-600">{c.role}</p> : null}
                  {c.highlights ? (
                    <p className="text-[11.5px] text-slate-500" style={clamp(2)}>
                      {c.highlights}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {d.achievements.length ? (
          <>
            <MainH>{d.L.achievements}</MainH>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-2">
              {lim(d.achievements, 8).map((a, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-snug">
                  <span className="mt-0.5 text-[13px]">🏆</span>
                  <span>
                    {a.year ? <b style={{ color: d.accent }}>{a.year} </b> : null}
                    <span className="text-slate-800">{a.title}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {d.style && !d.career.length ? (
          <>
            <MainH>{d.L.style}</MainH>
            <p className="text-[12.8px] leading-[1.7] text-slate-700">{d.style}</p>
          </>
        ) : null}

        <Footer d={d} className="mt-auto pt-8" />
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Premium escuro                                                   */
/* ------------------------------------------------------------------ */

const GOLD = "#d4a24c";

function Premium({ d }: { d: ResumeData }) {
  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-3 flex items-center gap-3 font-display text-[15px] font-medium uppercase tracking-[0.25em]" style={{ color: GOLD }}>
      {children}
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
    </h2>
  );
  return (
    <div className="print-page font-sans text-white" style={{ ...PAGE, background: "#0b1220" }}>
      <div className="relative h-[430px] overflow-hidden">
        {d.cover || d.photo ? (
          <img src={(d.cover ?? d.photo)!} alt={d.name} className="absolute right-0 top-0 h-full w-[62%] object-cover" />
        ) : (
          <div className="absolute right-0 top-0 flex h-full w-[62%] items-center justify-center font-display text-[160px] font-semibold text-white/10">
            {initials(d.name)}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0b1220 38%, rgba(11,18,32,.75) 58%, rgba(11,18,32,0) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(0deg, #0b1220, transparent)" }} />
        <div className="relative flex h-full flex-col justify-end px-12 pb-10">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.4em]" style={{ color: GOLD }}>
            {d.sportName}
            {d.position ? ` · ${d.position}` : ""}
          </p>
          <h1 className="max-w-[460px] font-display text-[58px] font-semibold uppercase leading-[0.92]">{d.displayName}</h1>
          {d.nickname ? <p className="mt-2 text-[14px] text-white/60">{d.name}</p> : null}
          {d.bioShort ? (
            <p className="mt-4 max-w-[420px] text-[13px] italic leading-relaxed text-white/75" style={clamp(3)}>
              {d.bioShort}
            </p>
          ) : null}
        </div>
      </div>

      <div className="px-12">
        {physical(d).length ? (
          <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl" style={{ background: `${GOLD}40` }}>
            {[...physical(d), ...personal(d)].slice(0, 8).map(([k, v]) => (
              <div key={k} className="bg-[#0f182b] px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-[0.18em]" style={{ color: GOLD }}>
                  {k}
                </p>
                <p className="mt-0.5 text-[12px] font-semibold leading-tight text-white/95">{v}</p>
              </div>
            ))}
          </div>
        ) : null}

        {d.stats.length ? (
          <div className="mt-6 grid grid-cols-4 gap-3">
            {lim(d.stats, 4).map((s, i) => (
              <div key={i} className="rounded-xl border px-3 py-3 text-center" style={{ borderColor: GOLD, background: "rgba(212,162,76,.07)" }}>
                <p className="font-display text-[30px] font-semibold leading-none" style={{ color: GOLD }}>
                  {s.value}
                </p>
                <p className="mt-1.5 text-[9.5px] uppercase tracking-[0.16em] text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-7 grid grid-cols-[1.25fr_1fr] gap-9">
          <div>
            {bioText(d) ? (
              <>
                <H>{d.L.about}</H>
                <p className="text-[12.3px] leading-[1.75] text-white/80" style={clamp(9)}>
                  {bioText(d)}
                </p>
              </>
            ) : null}
            {d.career.length ? (
              <div className="mt-6">
                <H>{d.L.career}</H>
                <ul className="space-y-2.5">
                  {lim(d.career, 5).map((c, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2 text-[12.5px]">
                      <span>
                        <b className="text-white">{c.club}</b>
                        {c.role ? <span className="text-white/55"> · {c.role}</span> : null}
                      </span>
                      <span className="shrink-0 text-[11px]" style={{ color: GOLD }}>
                        {c.period}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div>
            {d.achievements.length ? (
              <>
                <H>{d.L.achievements}</H>
                <ul className="space-y-2.5">
                  {lim(d.achievements, 7).map((a, i) => (
                    <li key={i} className="flex gap-3 text-[12px] leading-snug">
                      <span className="font-display text-[13px] font-semibold" style={{ color: GOLD }}>
                        {a.year || "★"}
                      </span>
                      <span className="text-white/85">{a.title}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: `${GOLD}60` }}>
              <QR svg={d.qrLight} size={64} />
              <div className="text-[10.5px] leading-snug text-white/70">
                <p>{d.L.scan}</p>
                {contact(d)
                  .slice(0, 2)
                  .map(([k, v]) => (
                    <p key={k} className="mt-1 text-white/90">
                      {k}: {v}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <Footer d={d} dark className="mb-8 mt-8" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Ficha Scout                                                      */
/* ------------------------------------------------------------------ */

const PITCH: Record<string, [number, number]> = {
  goleiro: [60, 166],
  goalkeeper: [60, 166],
  zagueiro: [60, 142],
  "center back": [60, 142],
  fixo: [60, 140],
  "defender (fixo)": [60, 140],
  "lateral direito": [102, 128],
  "right back": [102, 128],
  "lateral esquerdo": [18, 128],
  "left back": [18, 128],
  volante: [60, 116],
  "defensive midfielder": [60, 116],
  "meio-campista": [60, 96],
  "central midfielder": [60, 96],
  universal: [60, 92],
  "meia atacante": [60, 70],
  "attacking midfielder": [60, 70],
  "ponta direita": [102, 52],
  "right winger": [102, 52],
  "ala direita": [102, 70],
  "right wing": [102, 70],
  "ponta esquerda": [18, 52],
  "left winger": [18, 52],
  "ala esquerda": [18, 70],
  "left wing": [18, 70],
  "segundo atacante": [60, 46],
  "second striker": [60, 46],
  centroavante: [60, 26],
  striker: [60, 26],
  pivô: [60, 30],
  pivot: [60, 30],
};

function Pitch({ d }: { d: ResumeData }) {
  const parts = d.position
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  const dots = parts.map((p) => PITCH[p]).filter((x): x is [number, number] => !!x);
  return (
    <svg viewBox="0 0 120 180" className="h-full w-full">
      <rect x="0" y="0" width="120" height="180" rx="6" fill="#15803d" />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x="0" y={i * 20} width="120" height="10" fill="#16a34a" opacity=".55" />
      ))}
      <g fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1.2">
        <rect x="5" y="5" width="110" height="170" />
        <line x1="5" y1="90" x2="115" y2="90" />
        <circle cx="60" cy="90" r="14" />
        <rect x="30" y="5" width="60" height="24" />
        <rect x="45" y="5" width="30" height="9" />
        <rect x="30" y="151" width="60" height="24" />
        <rect x="45" y="166" width="30" height="9" />
      </g>
      {dots.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === 0 ? 11 : 8} fill={d.accent} opacity=".35" />
          <circle cx={x} cy={y} r={i === 0 ? 6 : 4.5} fill={i === 0 ? "#fbbf24" : "#ffffff"} stroke="#0b1220" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

function Scout({ d }: { d: ResumeData }) {
  const showPitch = d.sportSlug === "futebol" || d.sportSlug === "futsal";
  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-2 bg-slate-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">{children}</h2>
  );
  const rows = [...physical(d), ...personal(d)];
  return (
    <div className="print-page bg-white font-sans text-slate-900" style={PAGE}>
      <div className="flex items-stretch" style={{ background: "#0b1220" }}>
        <div className="flex items-center px-8 py-6">
          <Photo d={d} size={118} radius={10} style={{ border: `3px solid ${d.accent}` }} />
        </div>
        <div className="flex flex-1 flex-col justify-center py-6 pr-6 text-white">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.35em]" style={{ color: d.accent }}>
            {d.L.technical} · {d.sportName}
          </p>
          <h1 className="mt-1 font-display text-[40px] font-semibold uppercase leading-none">{d.displayName}</h1>
          <p className="mt-1.5 text-[13px] text-white/70">{[d.nickname ? d.name : "", d.position, d.club].filter(Boolean).join("  ·  ")}</p>
        </div>
        <div className="flex w-[140px] flex-col items-center justify-center gap-1 px-4 text-center" style={{ background: d.accent }}>
          <p className="font-display text-[44px] font-semibold leading-none text-white">{d.age ?? "—"}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/85">{d.L.age}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_210px] gap-7 px-8 pt-7">
        <div>
          <H>{d.L.profile}</H>
          <table className="w-full border-collapse text-[12px]">
            <tbody>
              {rows.slice(0, 13).map(([k, v], i) => (
                <tr key={k} className={i % 2 ? "bg-slate-50" : ""}>
                  <td className="w-[42%] border-b border-slate-200 px-3 py-1.5 font-semibold uppercase tracking-wide text-slate-500" style={{ fontSize: 10 }}>
                    {k}
                  </td>
                  <td className="border-b border-slate-200 px-3 py-1.5 font-semibold">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4">
          {showPitch && d.position ? (
            <div>
              <H>{d.positionLabel}</H>
              <div className="mx-auto h-[250px] w-[167px]">
                <Pitch d={d} />
              </div>
            </div>
          ) : null}
          <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-300 p-3 text-center">
            <QR svg={d.qr} size={92} />
            <p className="mt-2 text-[9.5px] font-semibold uppercase leading-snug tracking-wide text-slate-500">{d.L.scan}</p>
          </div>
        </div>
      </div>

      {d.stats.length ? (
        <div className="px-8 pt-6">
          <H>{d.L.stats}</H>
          <div className="grid grid-cols-4 gap-2">
            {lim(d.stats, 8).map((s, i) => (
              <div key={i} className="border-l-4 bg-slate-50 px-3 py-2.5" style={{ borderColor: d.accent }}>
                <p className="font-display text-[28px] font-semibold leading-none">{s.value}</p>
                <p className="mt-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-7 px-8 pt-6">
        {d.style || bioText(d) ? (
          <div>
            <H>{d.style ? d.L.style : d.L.about}</H>
            <p className="text-[12px] leading-[1.65] text-slate-700" style={clamp(9)}>
              {d.style || bioText(d)}
            </p>
          </div>
        ) : null}
        {d.career.length ? (
          <div>
            <H>{d.L.career}</H>
            <table className="w-full text-[11.5px]">
              <tbody>
                {lim(d.career, 6).map((c, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-1.5 pr-2 font-semibold text-slate-500">{c.period}</td>
                    <td className="py-1.5 font-bold">{c.club}</td>
                    <td className="py-1.5 pl-2 text-right text-slate-500">{c.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {d.achievements.length ? (
        <div className="px-8 pt-6">
          <H>{d.L.achievements}</H>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5px]">
            {lim(d.achievements, 8).map((a, i) => (
              <li key={i} className="flex gap-2">
                <b className="w-9 shrink-0" style={{ color: d.accent }}>
                  {a.year}
                </b>
                <span>{a.title}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 border-t border-slate-200 px-8 py-4">
        <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-600">
          {contact(d).map(([k, v]) => (
            <span key={k}>
              <b>{k}:</b> {v}
            </span>
          ))}
        </div>
        <Footer d={d} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Capa de revista                                                  */
/* ------------------------------------------------------------------ */

function Revista({ d }: { d: ResumeData }) {
  const img = d.cover ?? d.photo;
  const parts = d.displayName.split(" ");
  const first = parts.slice(0, -1).join(" ") || parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return (
    <div className="print-page bg-white font-sans text-slate-900" style={PAGE}>
      <div className="relative h-[560px] overflow-hidden" style={{ background: "#0b1220" }}>
        {img ? (
          <img src={img} alt={d.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-display text-[220px] font-bold text-white/10" style={{ background: `linear-gradient(135deg, ${d.accent}, #0b1220)` }}>
            {initials(d.name)}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.15) 55%, rgba(0,0,0,.85) 100%)" }} />
        <div className="absolute left-10 right-10 top-8 flex items-center justify-between text-white">
          <p className="font-display text-[22px] font-semibold uppercase tracking-[0.2em]">{d.company.name || "Craquepedia"}</p>
          <p className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest" style={{ background: d.accent }}>
            {d.sportName}
          </p>
        </div>
        <div className="absolute bottom-8 left-10 right-10 text-white">
          {d.position ? <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.35em] text-white/85">{d.position}</p> : null}
          <h1 className="font-display font-bold uppercase leading-[0.85]" style={{ fontSize: 84 }}>
            {first}
            {last ? (
              <>
                <br />
                <span style={{ color: d.accent }}>{last}</span>
              </>
            ) : null}
          </h1>
          {d.bioShort ? (
            <p className="mt-4 max-w-[560px] text-[14px] font-medium leading-snug text-white/90" style={clamp(2)}>
              {d.bioShort}
            </p>
          ) : null}
        </div>
      </div>

      {d.stats.length || physical(d).length ? (
        <div className="grid grid-cols-5 border-b border-slate-200">
          {(d.stats.length ? lim(d.stats, 5).map((s) => [s.label, s.value] as KV) : physical(d).slice(0, 5)).map(([k, v], i) => (
            <div key={i} className="border-r border-slate-200 px-3 py-4 text-center last:border-r-0">
              <p className="font-display text-[26px] font-bold leading-none" style={{ color: d.accent }}>
                {v}
              </p>
              <p className="mt-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-500">{k}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-[1.3fr_1fr] gap-8 px-10 pt-6">
        <div>
          {bioText(d) ? (
            <>
              <h2 className="mb-2 font-display text-[18px] font-semibold uppercase tracking-wide">{d.L.about}</h2>
              <p className="text-[12.2px] leading-[1.7] text-slate-700 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[44px] first-letter:font-bold first-letter:leading-[0.9]" style={clamp(9)}>
                {bioText(d)}
              </p>
            </>
          ) : null}
          {d.career.length ? (
            <>
              <h2 className="mb-2 mt-5 font-display text-[18px] font-semibold uppercase tracking-wide">{d.L.career}</h2>
              <p className="text-[12px] leading-relaxed text-slate-700">
                {lim(d.career, 6).map((c, i) => (
                  <span key={i}>
                    <b>{c.club}</b>
                    {c.period ? <span className="text-slate-500"> ({c.period})</span> : null}
                    {i < Math.min(d.career.length, 6) - 1 ? <span style={{ color: d.accent }}> • </span> : null}
                  </span>
                ))}
              </p>
            </>
          ) : null}
        </div>
        <div>
          {d.achievements.length ? (
            <div className="rounded-2xl p-4" style={{ background: `${d.accent}12` }}>
              <h2 className="mb-2 font-display text-[16px] font-semibold uppercase tracking-wide" style={{ color: d.accent }}>
                {d.L.achievements}
              </h2>
              <ul className="space-y-1.5 text-[11.5px]">
                {lim(d.achievements, 6).map((a, i) => (
                  <li key={i}>
                    <b>{a.year}</b> {a.title}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4 flex items-center gap-3">
            <QR svg={d.qr} size={70} />
            <div className="text-[10.5px] leading-snug text-slate-600">
              <p className="font-semibold text-slate-800">{d.L.scan}</p>
              {contact(d)
                .slice(0, 3)
                .map(([k, v]) => (
                  <p key={k}>
                    {k}: {v}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer d={d} className="mx-10 mb-6 mt-6" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Minimalista                                                      */
/* ------------------------------------------------------------------ */

function Minimalista({ d }: { d: ResumeData }) {
  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.35em] text-slate-400">{children}</h2>
  );
  const facts = [...physical(d), ...personal(d)];
  return (
    <div className="print-page bg-[#fdfcfa] text-slate-800" style={PAGE}>
      <div className="px-20 pb-12 pt-20">
        <div className="flex items-center gap-8">
          <Photo d={d} size={96} style={{ filter: "grayscale(15%)" }} />
          <div>
            <h1 className="font-serif text-[44px] font-medium leading-none tracking-tight text-slate-900">{d.name}</h1>
            <p className="mt-3 text-[13px] tracking-[0.12em] text-slate-500">
              {[d.sportName, d.position, d.club].filter(Boolean).join("   /   ")}
            </p>
          </div>
        </div>
        <div className="mt-10 h-px bg-slate-300" />
        <div className="mt-1 h-[3px] w-16" style={{ background: d.accent }} />

        {bioText(d) ? (
          <div className="mt-10 grid grid-cols-[140px_1fr] gap-8">
            <H>{d.L.about}</H>
            <p className="font-serif text-[15px] leading-[1.75] text-slate-700" style={clamp(8)}>
              {bioText(d)}
            </p>
          </div>
        ) : null}

        {facts.length ? (
          <div className="mt-9 grid grid-cols-[140px_1fr] gap-8">
            <H>{d.L.profile}</H>
            <dl className="grid grid-cols-3 gap-x-6 gap-y-3">
              {facts.slice(0, 9).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] uppercase tracking-[0.15em] text-slate-400">{k}</dt>
                  <dd className="mt-0.5 text-[13px] text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {d.career.length ? (
          <div className="mt-9 grid grid-cols-[140px_1fr] gap-8">
            <H>{d.L.career}</H>
            <ul className="space-y-2.5">
              {lim(d.career, 6).map((c, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4 text-[13px]">
                  <span>
                    <span className="font-serif text-[15px] text-slate-900">{c.club}</span>
                    {c.role ? <span className="text-slate-500"> — {c.role}</span> : null}
                  </span>
                  <span className="shrink-0 text-[12px] text-slate-400">{c.period}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {d.achievements.length ? (
          <div className="mt-9 grid grid-cols-[140px_1fr] gap-8">
            <H>{d.L.achievements}</H>
            <ul className="space-y-2">
              {lim(d.achievements, 7).map((a, i) => (
                <li key={i} className="text-[13px]">
                  <span className="mr-3 text-slate-400">{a.year}</span>
                  <span className="text-slate-900">{a.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {d.stats.length ? (
          <div className="mt-9 grid grid-cols-[140px_1fr] gap-8">
            <H>{d.L.stats}</H>
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {lim(d.stats, 6).map((s, i) => (
                <div key={i}>
                  <p className="font-serif text-[30px] leading-none" style={{ color: d.accent }}>
                    {s.value}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 flex items-end justify-between gap-8 border-t border-slate-200 pt-6">
          <div className="space-y-1 text-[12px] text-slate-600">
            {contact(d).map(([k, v]) => (
              <p key={k}>
                <span className="mr-2 text-[10px] uppercase tracking-[0.15em] text-slate-400">{k}</span>
                {v}
              </p>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <p className="max-w-[120px] text-right text-[10px] leading-snug text-slate-400">{d.L.scan}</p>
            <QR svg={d.qr} size={64} />
          </div>
        </div>
        <Footer d={d} className="mt-8" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 7. International (EN)                                               */
/* ------------------------------------------------------------------ */

function International({ d }: { d: ResumeData }) {
  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-2.5 border-b-2 pb-1 text-[12.5px] font-bold uppercase tracking-[0.14em] text-slate-900" style={{ borderColor: d.accent }}>
      {children}
    </h2>
  );
  return (
    <div className="print-page bg-white font-sans text-slate-800" style={PAGE}>
      <header className="flex items-center gap-7 border-b border-slate-200 px-12 py-9" style={{ background: "linear-gradient(90deg,#f8fafc,#ffffff)" }}>
        <Photo d={d} size={128} radius={14} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[36px] font-extrabold uppercase leading-none tracking-tight text-slate-900">{d.name}</h1>
          <p className="mt-2 text-[15px] font-semibold" style={{ color: d.accent }}>
            {[d.position, d.sportName].filter(Boolean).join(" | ")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[d.age !== null ? `${d.age} ${d.L.years}` : "", d.height, d.side ? `${d.sideLabel}: ${d.side}` : "", d.nationality].filter(Boolean).map((t) => (
              <span key={t} className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <QR svg={d.qr} size={78} />
          <p className="mt-1.5 max-w-[100px] text-center text-[8.5px] leading-tight text-slate-500">{d.L.scan}</p>
        </div>
      </header>

      <div className="grid grid-cols-[230px_1fr] gap-9 px-12 pt-8">
        <div className="space-y-6">
          {personal(d).length ? (
            <section>
              <H>{d.L.personal}</H>
              <dl className="space-y-1.5 text-[11.5px]">
                {personal(d).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
          {physical(d).length ? (
            <section>
              <H>{d.L.physical}</H>
              <dl className="space-y-1.5 text-[11.5px]">
                {physical(d)
                  .slice(0, 8)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          ) : null}
          {contact(d).length ? (
            <section>
              <H>{d.L.contact}</H>
              <dl className="space-y-1.5 text-[11.5px]">
                {contact(d).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                    <dd className="break-words font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          {bioText(d) ? (
            <section>
              <H>{d.L.profile}</H>
              <p className="text-[12.3px] leading-[1.7] text-slate-700" style={clamp(9)}>
                {bioText(d)}
              </p>
            </section>
          ) : null}
          {d.style ? (
            <section>
              <H>{d.L.style}</H>
              <p className="text-[12.3px] leading-[1.7] text-slate-700" style={clamp(4)}>
                {d.style}
              </p>
            </section>
          ) : null}
          {d.career.length ? (
            <section>
              <H>{d.L.career}</H>
              <table className="w-full text-[11.8px]">
                <tbody>
                  {lim(d.career, 6).map((c, i) => (
                    <tr key={i} className="border-b border-slate-100 align-top">
                      <td className="w-[110px] py-1.5 pr-3 font-semibold text-slate-500">{c.period}</td>
                      <td className="py-1.5">
                        <b className="text-slate-900">{c.club}</b>
                        {c.role ? <span className="text-slate-500"> — {c.role}</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
          {d.stats.length ? (
            <section>
              <H>{d.L.stats}</H>
              <div className="grid grid-cols-4 gap-2">
                {lim(d.stats, 8).map((s, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 px-2 py-2 text-center">
                    <p className="text-[19px] font-extrabold" style={{ color: d.accent }}>
                      {s.value}
                    </p>
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {d.achievements.length ? (
            <section>
              <H>{d.L.achievements}</H>
              <ul className="space-y-1 text-[11.8px]">
                {lim(d.achievements, 7).map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <b className="w-10 shrink-0" style={{ color: d.accent }}>
                      {a.year}
                    </b>
                    <span>{a.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
      <Footer d={d} className="mx-12 mb-6 mt-8" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 8. College recruiting (EN)                                          */
/* ------------------------------------------------------------------ */

function College({ d }: { d: ResumeData }) {
  const grad = d.education.find((e) => e.label === d.L.graduation)?.value;
  const gpa = d.education.find((e) => e.label === d.L.gpa)?.value;
  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-2 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.16em]" style={{ color: d.accent }}>
      <span className="inline-block size-2 rotate-45" style={{ background: d.accent }} />
      {children}
    </h2>
  );
  const top = [
    ["Class of", grad ?? ""],
    [d.L.position, d.position],
    [d.L.height, d.height],
    [d.L.weight, d.weight],
    [d.L.gpa, gpa ?? ""],
  ].filter(([, v]) => v) as KV[];
  return (
    <div className="print-page bg-white font-sans text-slate-800" style={PAGE}>
      <header className="relative px-10 pb-6 pt-8 text-white" style={{ background: "#0b1220" }}>
        <div className="absolute inset-y-0 right-0 w-2" style={{ background: d.accent }} />
        <div className="flex items-center gap-6">
          <Photo d={d} size={120} radius={12} style={{ border: "3px solid #fff" }} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">Student-Athlete Profile · {d.sportName}</p>
            <h1 className="mt-1 font-display text-[42px] font-semibold uppercase leading-none">{d.name}</h1>
            <p className="mt-2 text-[13px] text-white/75">{[d.city, d.nationality].filter(Boolean).join("  ·  ")}</p>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white p-2">
            <QR svg={d.qr} size={72} />
            <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-700">Highlights</p>
          </div>
        </div>
      </header>
      {top.length ? (
        <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: `repeat(${top.length}, minmax(0,1fr))` }}>
          {top.map(([k, v]) => (
            <div key={k} className="border-r border-slate-200 px-3 py-3 text-center last:border-r-0">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400">{k}</p>
              <p className="mt-0.5 text-[16px] font-extrabold text-slate-900">{v}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-8 px-10 pt-6">
        <div className="space-y-5">
          <section>
            <H>Athletic profile</H>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
              {[...physical(d).filter(([k]) => k !== d.L.position && k !== d.L.height && k !== d.L.weight), [d.L.born, d.birth] as KV]
                .filter(([, v]) => v)
                .slice(0, 10)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
          {d.education.length ? (
            <section>
              <H>{d.L.education}</H>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11.5px]">
                {d.education.map((e) => (
                  <div key={e.label}>
                    <dt className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{e.label}</dt>
                    <dd className="font-semibold">{e.value}</dd>
                  </div>
                ))}
                {d.languages ? (
                  <div className="col-span-2">
                    <dt className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{d.L.languages}</dt>
                    <dd className="font-semibold">{d.languages}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}
          {d.stats.length ? (
            <section>
              <H>{d.L.stats}</H>
              <div className="grid grid-cols-3 gap-2">
                {lim(d.stats, 6).map((s, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 px-2 py-2 text-center">
                    <p className="text-[18px] font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-[8.5px] font-bold uppercase tracking-wide text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          {contact(d).length ? (
            <section>
              <H>{d.L.contact}</H>
              <dl className="space-y-1 text-[11.5px]">
                {contact(d).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="w-[96px] shrink-0 text-[9.5px] font-bold uppercase tracking-wide text-slate-400">{k}</dt>
                    <dd className="break-words font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
        <div className="space-y-5">
          {bioText(d) ? (
            <section>
              <H>{d.L.about}</H>
              <p className="text-[11.8px] leading-[1.65] text-slate-700" style={clamp(10)}>
                {bioText(d)}
              </p>
            </section>
          ) : null}
          {d.achievements.length ? (
            <section>
              <H>Honors &amp; Awards</H>
              <ul className="space-y-1 text-[11.5px]">
                {lim(d.achievements, 7).map((a, i) => (
                  <li key={i} className="flex gap-2">
                    <b className="w-9 shrink-0 text-slate-500">{a.year}</b>
                    <span>{a.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {d.career.length ? (
            <section>
              <H>Club history</H>
              <ul className="space-y-1.5 text-[11.5px]">
                {lim(d.career, 6).map((c, i) => (
                  <li key={i} className="flex justify-between gap-3 border-b border-slate-100 pb-1">
                    <span>
                      <b>{c.club}</b>
                      {c.role ? <span className="text-slate-500"> · {c.role}</span> : null}
                    </span>
                    <span className="shrink-0 text-slate-500">{c.period}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {d.videos.length ? (
            <section>
              <H>{d.L.videos}</H>
              <ul className="space-y-1 text-[10.5px]">
                {lim(d.videos, 3).map((v, i) => (
                  <li key={i} className="truncate">
                    <b>{v.title}:</b> <span className="text-slate-500">{v.url.replace(/^https?:\/\//, "")}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
      <div className="mx-10 mt-6 rounded-xl px-4 py-2.5 text-[10.5px] text-slate-600" style={{ background: `${d.accent}10` }}>
        {d.L.scan}: <b className="text-slate-800">{d.portfolioUrl.replace(/^https?:\/\//, "")}</b>
      </div>
      <Footer d={d} className="mx-10 mb-6 mt-5" />
    </div>
  );
}

/* ------------------------------------------------------------------ */

const MAP: Record<string, (p: { d: ResumeData }) => React.JSX.Element> = {
  classico: Classico,
  moderno: Moderno,
  premium: Premium,
  scout: Scout,
  revista: Revista,
  minimalista: Minimalista,
  international: International,
  college: College,
};

export function ResumeDocument({ data, template }: { data: ResumeData; template: string }) {
  const T = MAP[template] ?? Moderno;
  return <T d={data} />;
}
