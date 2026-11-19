/* eslint-disable react-hooks/static-components -- documento estático renderizado no servidor */
/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import type { ResumeData } from "@/lib/resume-data";
import { PAGE, clamp, lim, Photo, QR, Footer, personal, physical, contact, bioText } from "./parts";
import { CourtDiagram, hasDiagram } from "./diagrams";
import { SportIcon } from "@/components/ui/SportIcon";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function medal(title: string): string | null {
  const t = title.toLowerCase();
  if (/ouro|campe[ãa]o|campeã|1[ºo°]\s|1º lugar|gold|champion|winner/.test(t)) return "#f5b400";
  if (/prata|vice|2[ºo°]\s|silver|runner/.test(t)) return "#b8c2cc";
  if (/bronze|3[ºo°]\s|third/.test(t)) return "#cd7f32";
  return null;
}

function MedalDot({ title, accent }: { title: string; accent: string }) {
  const c = medal(title);
  return (
    <span className="mt-[3px] inline-flex size-[14px] shrink-0 items-center justify-center rounded-full" style={{ background: c ?? `${accent}30`, boxShadow: c ? `0 0 0 2px ${c}40` : undefined }}>
      <span className="size-[5px] rounded-full bg-white/90" />
    </span>
  );
}

function initialsOf(s: string) {
  return s
    .split(/[\s,()]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

/** Itens de carreira + conquistas numa linha do tempo única, do mais recente ao mais antigo. */
function timeline(d: ResumeData) {
  const yearOf = (s?: string) => {
    const m = (s ?? "").match(/(19|20)\d{2}/g);
    return m ? Number(m[m.length - 1]) : 0;
  };
  const items = [
    ...d.career.map((c) => ({ kind: "club" as const, year: /atual|present/i.test(c.period) ? 9999 : yearOf(c.period), label: c.period, title: c.club, sub: [c.role, c.highlights].filter(Boolean).join(" · ") })),
    ...d.achievements.map((a) => ({ kind: "award" as const, year: yearOf(a.year), label: a.year, title: a.title, sub: a.description ?? "" })),
  ];
  return items.sort((a, b) => b.year - a.year);
}

/* ------------------------------------------------------------------ */
/* 9. Quadra & Campo — esportes coletivos                              */
/* ------------------------------------------------------------------ */

export function Quadra({ d }: { d: ResumeData }) {
  const diagram = hasDiagram(d.sportSlug, d.positionKeys);
  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-2.5 flex items-center gap-2 font-display text-[14px] font-semibold uppercase tracking-[0.18em] text-slate-900">
      <span className="h-[3px] w-5 rounded-full" style={{ background: d.accent }} />
      {children}
    </h2>
  );
  const info = [...personal(d), ...physical(d).filter(([k]) => k !== d.positionLabel)].filter(([k]) => !d.metrics.some((m) => m.label === k));
  return (
    <div className="print-page bg-white font-sans text-slate-800" style={PAGE}>
      <div className="relative h-[300px] overflow-hidden bg-[#070b14] text-white">
        <img src={d.sportImage} alt="" className="absolute -right-10 top-0 h-full w-[60%] object-cover opacity-55" style={{ maskImage: "linear-gradient(90deg, transparent, black 55%)" }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 15% 120%, ${d.accent}66, transparent 55%)` }} />
        <div className="relative flex h-full items-end gap-7 px-11 pb-9">
          <Photo d={d} size={196} radius={24} style={{ border: "5px solid rgba(255,255,255,.95)", boxShadow: "0 18px 40px rgba(0,0,0,.45)" }} />
          <div className="min-w-0 flex-1 pb-1">
            <p className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ background: d.accent }}>
              <SportIcon sport={d.sportSlug} className="size-3.5" /> {d.sportName}
            </p>
            <h1 className="mt-3 font-display text-[50px] font-bold uppercase leading-[0.92]">{d.displayName}</h1>
            {d.nickname ? <p className="mt-1 text-[13px] text-white/60">{d.name}</p> : null}
            <p className="mt-2.5 text-[14px] font-semibold text-white/85">{[d.position, d.club].filter(Boolean).join("  ·  ")}</p>
          </div>
        </div>
      </div>

      {d.metrics.length || d.age !== null ? (
        <div className="mx-11 -mt-0 grid gap-px overflow-hidden rounded-b-2xl" style={{ gridTemplateColumns: `repeat(${Math.min(5, d.metrics.length + (d.age !== null ? 1 : 0))}, 1fr)`, background: `${d.accent}30` }}>
          {d.age !== null ? (
            <div className="bg-white px-3 py-3.5 text-center">
              <p className="font-display text-[30px] font-bold leading-none" style={{ color: d.accent }}>
                {d.age}
              </p>
              <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-slate-500">{d.L.age}</p>
            </div>
          ) : null}
          {lim(d.metrics, d.age !== null ? 4 : 5).map((m) => (
            <div key={m.label} className="flex flex-col justify-center bg-white px-3 py-3.5 text-center">
              <p className={`font-display font-bold leading-none text-slate-900 ${m.value.length > 6 ? "text-[20px]" : "text-[30px]"}`}>
                {m.value}
                {m.unit ? <span className="ml-0.5 text-[13px] font-semibold text-slate-400">{m.unit}</span> : null}
              </p>
              <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-[218px_1fr] gap-8 px-11 pt-7">
        <aside className="space-y-6">
          {diagram ? (
            <div>
              <H>{d.positionLabel}</H>
              <div className="h-[262px] w-[175px]">
                <CourtDiagram sport={d.sportSlug} keys={d.positionKeys} accent={d.accent} />
              </div>
              <p className="mt-2 text-[11.5px] font-semibold text-slate-700">{d.position}</p>
            </div>
          ) : null}
          {info.length ? (
            <div>
              <H>{d.L.profile}</H>
              <dl className="space-y-1.5">
                {lim(info, diagram ? 5 : 11).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{k}</dt>
                    <dd className="text-[12px] font-semibold leading-snug text-slate-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </aside>
        <main className="min-w-0 space-y-6">
          {bioText(d) ? (
            <section>
              <H>{d.L.about}</H>
              <p className="text-[12.5px] leading-[1.7] text-slate-700" style={clamp(7)}>
                {bioText(d)}
              </p>
            </section>
          ) : null}
          {d.stats.length ? (
            <section className="grid grid-cols-4 gap-2">
              {lim(d.stats, 4).map((s, i) => (
                <div key={i} className="rounded-xl px-2 py-3 text-center text-white" style={{ background: i === 0 ? d.accent : "#0b1220" }}>
                  <p className="font-display text-[24px] font-bold leading-none">{s.value}</p>
                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-white/75">{s.label}</p>
                </div>
              ))}
            </section>
          ) : null}
          {d.career.length ? (
            <section>
              <H>{d.L.career}</H>
              <ul className="space-y-2">
                {lim(d.career, 5).map((c, i) => (
                  <li key={i} className="flex items-baseline gap-3 border-b border-slate-100 pb-1.5 text-[12.5px]">
                    <span className="w-[92px] shrink-0 text-[11px] font-bold" style={{ color: d.accent }}>
                      {c.period}
                    </span>
                    <span className="flex-1 font-bold text-slate-900">{c.club}</span>
                    {c.role ? <span className="text-[11px] text-slate-500">{c.role}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {d.achievements.length ? (
            <section>
              <H>{d.L.achievements}</H>
              <ul className="grid grid-cols-2 gap-x-5 gap-y-1.5">
                {lim(d.achievements, 8).map((a, i) => (
                  <li key={i} className="flex gap-2 text-[11.8px] leading-snug">
                    <MedalDot title={a.title} accent={d.accent} />
                    <span>
                      {a.year ? <b className="text-slate-500">{a.year} </b> : null}
                      {a.title}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
      </div>

      <div className="absolute inset-x-11 bottom-8">
        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3.5">
          <QR svg={d.qr} size={66} />
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-semibold text-slate-800">{d.L.scan}</p>
            <p className="mt-0.5 flex flex-wrap gap-x-4 text-[11px] text-slate-500">
              {lim(contact(d), 3).map(([k, v]) => (
                <span key={k}>
                  <b className="text-slate-700">{k}:</b> {v}
                </span>
              ))}
            </p>
          </div>
        </div>
        <Footer d={d} className="mt-3" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Marcas & Tempos — esportes individuais                          */
/* ------------------------------------------------------------------ */

export function Marcas({ d }: { d: ResumeData }) {
  const rows = d.records.length ? d.records : d.stats.map((s) => ({ event: s.label, mark: s.value, extra: undefined as string | undefined }));
  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-3 font-display text-[13px] font-semibold uppercase tracking-[0.25em]" style={{ color: d.accent }}>
      {children}
    </h2>
  );
  return (
    <div className="print-page bg-[#f6f7f9] font-sans text-slate-800" style={PAGE}>
      <div className="relative overflow-hidden bg-[#070b14] px-11 pb-10 pt-10 text-white">
        <img src={d.sportImage} alt="" className="absolute right-0 top-0 h-full w-[58%] object-cover opacity-70" style={{ maskImage: "linear-gradient(90deg, transparent, black 50%)" }} />
        <div className="relative flex items-center gap-6">
          <Photo d={d} size={112} style={{ border: `4px solid ${d.accent}` }} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">
              {d.sportName}
              {d.position ? ` · ${d.position}` : ""}
            </p>
            <h1 className="font-display text-[46px] font-bold uppercase leading-none">{d.displayName}</h1>
            <p className="mt-1.5 text-[13px] text-white/70">{[d.club, d.city].filter(Boolean).join("  ·  ")}</p>
          </div>
        </div>
        {rows.length ? (
          <div className="relative mt-8">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">{d.records.length ? d.L.records : d.L.stats}</p>
            <div className="grid grid-cols-3 gap-2.5">
              {lim(rows, 3).map((r, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 backdrop-blur">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/60">{r.event}</p>
                  <p className="mt-1 font-display text-[34px] font-bold leading-none" style={{ color: i === 0 ? d.accent : "#fff" }}>
                    {r.mark || "—"}
                  </p>
                  {r.extra ? <p className="mt-1 text-[10.5px] text-white/50">{r.extra}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-[1fr_230px] gap-7 px-11 pt-8">
        <main className="min-w-0 space-y-7">
          {rows.length > 3 ? (
            <section>
              <H>{d.L.records}</H>
              <table className="w-full overflow-hidden rounded-xl bg-white text-[12px] shadow-sm">
                <thead>
                  <tr className="text-left text-[9.5px] uppercase tracking-wider text-white" style={{ background: "#0b1220" }}>
                    <th className="px-3 py-2 font-bold">{d.L.event}</th>
                    <th className="px-3 py-2 font-bold">{d.L.mark}</th>
                    <th className="px-3 py-2 font-bold" />
                  </tr>
                </thead>
                <tbody>
                  {lim(rows, 8).map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2 font-semibold">{r.event}</td>
                      <td className="px-3 py-2 font-display text-[15px] font-bold" style={{ color: d.accent }}>
                        {r.mark}
                      </td>
                      <td className="px-3 py-2 text-slate-500">{r.extra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
          {bioText(d) ? (
            <section>
              <H>{d.L.about}</H>
              <p className="text-[12.5px] leading-[1.7] text-slate-700" style={clamp(rows.length > 3 ? 6 : 9)}>
                {bioText(d)}
              </p>
            </section>
          ) : null}
          {d.competitions ? (
            <section>
              <H>{d.L.competitions}</H>
              <p className="text-[12px] leading-[1.6] text-slate-700" style={clamp(4)}>
                {d.competitions}
              </p>
            </section>
          ) : null}
          {d.achievements.length ? (
            <section>
              <H>{d.L.achievements}</H>
              <ul className="space-y-2">
                {lim(d.achievements, 7).map((a, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl bg-white px-3 py-2 text-[12px] shadow-sm">
                    <MedalDot title={a.title} accent={d.accent} />
                    <span className="flex-1 font-semibold text-slate-800">{a.title}</span>
                    <span className="text-[11px] font-bold text-slate-400">{a.year}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <H>{d.L.profile}</H>
            <dl className="space-y-1.5">
              {lim([...physical(d), ...personal(d)], 10).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{k}</dt>
                  <dd className="text-[12px] font-semibold leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          {d.career.length ? (
            <section>
              <H>{d.L.career}</H>
              <ul className="space-y-2 text-[11.5px]">
                {lim(d.career, 4).map((c, i) => (
                  <li key={i}>
                    <p className="font-bold">{c.club}</p>
                    <p className="text-slate-500">{[c.period, c.role].filter(Boolean).join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <div className="flex flex-col items-center rounded-2xl bg-[#0b1220] p-4 text-center text-white">
            <QR svg={d.qrLight} size={88} />
            <p className="mt-2 text-[9.5px] font-semibold uppercase leading-snug tracking-wide text-white/70">{d.L.scan}</p>
          </div>
        </aside>
      </div>
      <div className="absolute inset-x-11 bottom-7">
        <div className="mb-2 flex flex-wrap gap-x-5 text-[11px] text-slate-600">
          {lim(contact(d), 4).map(([k, v]) => (
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
/* 11. Fight Card — lutas                                              */
/* ------------------------------------------------------------------ */

export function Luta({ d }: { d: ResumeData }) {
  const img = d.cover ?? d.photo;
  const facts: [string, string][] = (
    [
      [d.L.belt, d.belt],
      [d.L.weightClass, d.weightClass],
      [d.L.team, d.club],
      [d.sideLabel, d.side],
      [d.L.age, d.age !== null ? `${d.age} ${d.L.years}` : ""],
      [d.L.height, d.height],
      [d.L.weight, d.weight],
      [d.L.nationality, d.nationality],
    ] as [string, string][]
  ).filter(([k, v]) => k && v);
  const parts = d.displayName.split(" ");
  return (
    <div className="print-page font-sans text-white" style={{ ...PAGE, background: "#0a0a0c" }}>
      <div className="relative h-[560px] overflow-hidden">
        {img ? (
          <img src={img} alt={d.name} className="absolute right-0 top-0 h-full w-[64%] object-cover object-top" style={{ maskImage: "linear-gradient(90deg, transparent, black 30%)" }} />
        ) : (
          <img src={d.sportImage} alt="" className="absolute right-0 top-0 h-full w-[64%] object-cover" style={{ maskImage: "linear-gradient(90deg, transparent, black 30%)" }} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
        <div className="absolute -left-16 top-16 h-[3px] w-[480px] rotate-[-8deg]" style={{ background: d.accent }} />
        <div className="relative flex h-full flex-col justify-end px-11 pb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em]" style={{ color: d.accent }}>
            {d.position || d.sportName}
          </p>
          <h1 className="mt-2 font-display text-[78px] font-bold uppercase leading-[0.85]">
            {parts.slice(0, -1).join(" ") || parts[0]}
            {parts.length > 1 ? (
              <>
                <br />
                <span style={{ color: d.accent }}>{parts[parts.length - 1]}</span>
              </>
            ) : null}
          </h1>
          {d.nickname ? <p className="mt-2 text-[13px] text-white/60">{d.name}</p> : null}
          {d.fightRecord ? (
            <div className="mt-6 flex w-fit overflow-hidden rounded-xl border border-white/15">
              {(
                [
                  [d.fightRecord.w, d.L.wins, d.accent],
                  [d.fightRecord.l, d.L.losses, "#1f2937"],
                  [d.fightRecord.d, d.L.draws, "#111827"],
                ] as const
              ).map(([v, l, bg]) => (
                <div key={l} className="w-[104px] py-3 text-center" style={{ background: bg }}>
                  <p className="font-display text-[44px] font-bold leading-none">{v}</p>
                  <p className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/80">{l}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-[250px_1fr] gap-8 px-11 pt-2">
        <aside>
          <dl className="divide-y divide-white/10 border-y border-white/10">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-2">
                <dt className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/45">{k}</dt>
                <dd className="text-right text-[12px] font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex items-center gap-3">
            <QR svg={d.qrLight} size={70} />
            <p className="text-[9.5px] uppercase leading-snug tracking-wider text-white/50">{d.L.scan}</p>
          </div>
        </aside>
        <main className="min-w-0 space-y-6">
          {d.achievements.length ? (
            <section>
              <h2 className="mb-2.5 font-display text-[15px] font-semibold uppercase tracking-[0.25em]" style={{ color: d.accent }}>
                {d.L.achievements}
              </h2>
              <ul className="space-y-1.5">
                {lim(d.achievements, 7).map((a, i) => (
                  <li key={i} className="flex gap-3 text-[12.5px]">
                    <span className="w-10 shrink-0 font-display font-bold text-white/50">{a.year}</span>
                    <span className="font-semibold">{a.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {bioText(d) ? (
            <section>
              <h2 className="mb-2.5 font-display text-[15px] font-semibold uppercase tracking-[0.25em]" style={{ color: d.accent }}>
                {d.L.about}
              </h2>
              <p className="text-[12.3px] leading-[1.7] text-white/75" style={clamp(d.achievements.length ? 6 : 10)}>
                {bioText(d)}
              </p>
            </section>
          ) : null}
        </main>
      </div>
      <div className="absolute inset-x-11 bottom-7">
        <div className="mb-2 flex flex-wrap gap-x-5 text-[11px] text-white/70">
          {lim(contact(d), 4).map(([k, v]) => (
            <span key={k}>
              <b className="text-white">{k}:</b> {v}
            </span>
          ))}
        </div>
        <Footer d={d} dark />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Card Colecionável                                               */
/* ------------------------------------------------------------------ */

export function Card({ d }: { d: ResumeData }) {
  const attrs = d.stats.length ? lim(d.stats, 6) : d.metrics.map((m) => ({ label: m.label, value: m.value + (m.unit ? ` ${m.unit}` : "") })).slice(0, 6);
  const pos = d.position.split(",")[0]?.trim() ?? "";
  return (
    <div className="print-page font-sans text-slate-800" style={{ ...PAGE, background: "linear-gradient(180deg,#eef1f5,#ffffff 45%)" }}>
      <div className="grid grid-cols-[318px_1fr] gap-9 px-11 pt-11">
        {/* Card */}
        <div className="rounded-[26px] p-[5px] shadow-2xl" style={{ background: `linear-gradient(150deg, #f8e7a8, ${d.accent} 45%, #0b1220)` }}>
          <div className="relative h-[452px] overflow-hidden rounded-[22px] bg-[#0b1220] text-white">
            <img src={d.sportImage} alt="" className="absolute inset-0 size-full object-cover opacity-50" />
            {d.photo ? <img src={d.photo} alt={d.name} className="absolute inset-x-0 top-0 h-[290px] w-full object-cover object-top" style={{ maskImage: "linear-gradient(180deg, black 70%, transparent)" }} /> : null}
            <div className="absolute left-4 top-4 flex flex-col items-center rounded-xl bg-black/45 px-2.5 py-2 backdrop-blur">
              <SportIcon sport={d.sportSlug} className="size-6" />
              {pos ? <p className="mt-1 text-[10px] font-bold uppercase tracking-wider">{initialsOf(pos)}</p> : null}
            </div>
            {d.age !== null ? (
              <div className="absolute right-4 top-4 rounded-xl px-2.5 py-1.5 text-center" style={{ background: d.accent }}>
                <p className="font-display text-[22px] font-bold leading-none">{d.age}</p>
                <p className="text-[8px] font-bold uppercase tracking-wider">{d.L.age}</p>
              </div>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
              <p className="text-center font-display text-[30px] font-bold uppercase leading-none tracking-wide">{d.displayName}</p>
              <p className="mt-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/70">{[pos, d.club].filter(Boolean).join(" · ")}</p>
              {attrs.length ? (
                <div className={`mt-3 grid gap-1.5 border-t border-white/15 pt-3 ${attrs.length === 4 ? "grid-cols-4" : attrs.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {attrs.map((s, i) => (
                    <div key={i} className="text-center">
                      <p className="font-display text-[20px] font-bold leading-none" style={{ color: i === 0 ? "#fde68a" : "#fff" }}>
                        {s.value}
                      </p>
                      <p className="mt-0.5 truncate text-[8.5px] font-semibold uppercase tracking-wide text-white/60">{s.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {/* Info */}
        <div className="min-w-0 pt-2">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: d.accent }}>
            <SportIcon sport={d.sportSlug} className="size-4" /> {d.sportName}
          </p>
          <h1 className="mt-1.5 font-display text-[40px] font-bold uppercase leading-[0.95] text-slate-900">{d.name}</h1>
          {d.bioShort ? <p className="mt-3 text-[13.5px] font-medium italic leading-relaxed text-slate-600">&ldquo;{d.bioShort}&rdquo;</p> : null}
          <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2.5">
            {lim([...physical(d), ...personal(d)], 10).map(([k, v]) => (
              <div key={k} className="border-l-2 pl-2.5" style={{ borderColor: d.accent }}>
                <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{k}</dt>
                <dd className="text-[12px] font-semibold leading-snug text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-11 pt-9">
        <div className="space-y-6">
          {bioText(d) ? (
            <section>
              <h2 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-900">{d.L.about}</h2>
              <p className="text-[12px] leading-[1.7] text-slate-600" style={clamp(8)}>
                {bioText(d)}
              </p>
            </section>
          ) : null}
          {d.career.length ? (
            <section>
              <h2 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-900">{d.L.career}</h2>
              <ul className="space-y-1.5 text-[11.8px]">
                {lim(d.career, 5).map((c, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <b>{c.club}</b>
                    <span className="shrink-0 text-slate-500">{c.period}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <div className="space-y-6">
          {d.achievements.length ? (
            <section>
              <h2 className="mb-2 text-[12px] font-extrabold uppercase tracking-[0.2em] text-slate-900">{d.L.achievements}</h2>
              <ul className="space-y-1.5">
                {lim(d.achievements, 8).map((a, i) => (
                  <li key={i} className="flex gap-2 text-[11.8px] leading-snug">
                    <MedalDot title={a.title} accent={d.accent} />
                    <span>
                      <b className="text-slate-500">{a.year} </b>
                      {a.title}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
            <QR svg={d.qr} size={70} />
            <div className="text-[11px] text-slate-600">
              <p className="font-semibold text-slate-800">{d.L.scan}</p>
              {lim(contact(d), 2).map(([k, v]) => (
                <p key={k}>
                  <b>{k}:</b> {v}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer d={d} className="absolute inset-x-11 bottom-7" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 13. Trajetória — linha do tempo                                     */
/* ------------------------------------------------------------------ */

export function Trajetoria({ d }: { d: ResumeData }) {
  const items = lim(timeline(d), 12);
  return (
    <div className="print-page bg-white font-sans text-slate-800" style={PAGE}>
      <div className="flex items-center gap-6 px-12 pb-7 pt-11">
        <Photo d={d} size={104} style={{ boxShadow: `0 0 0 4px #fff, 0 0 0 7px ${d.accent}` }} />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-[40px] font-bold leading-[1.02] text-slate-900">{d.displayName}</h1>
          <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color: d.accent }}>
            {[d.sportName, d.position].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-1 text-[12px] text-slate-500">{[d.age !== null ? `${d.age} ${d.L.years}` : "", d.height, d.club, d.city].filter(Boolean).join("  ·  ")}</p>
        </div>
        <QR svg={d.qr} size={78} />
      </div>
      {d.bioShort || bioText(d) ? (
        <p className="mx-12 rounded-2xl px-5 py-4 text-[12.5px] leading-[1.7] text-slate-700" style={{ background: `${d.accent}0f`, ...clamp(4) }}>
          {d.bioShort || bioText(d)}
        </p>
      ) : null}

      <h2 className="mx-12 mb-4 mt-7 text-center font-serif text-[20px] font-bold text-slate-900">{d.L.timeline}</h2>
      <div className="relative mx-12">
        <div className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2" style={{ background: `linear-gradient(${d.accent}, ${d.accent}20)` }} />
        <ul className="space-y-3">
          {items.map((it, i) => {
            const left = i % 2 === 0;
            return (
              <li key={i} className="relative grid grid-cols-[1fr_44px_1fr] items-center">
                <div className={left ? "pr-3 text-right" : ""}>
                  {left ? <TimelineCard it={it} accent={d.accent} align="right" /> : null}
                </div>
                <div className="flex justify-center">
                  <span
                    className="z-10 flex size-[26px] items-center justify-center rounded-full border-[3px] border-white text-[9px] font-bold text-white shadow"
                    style={{ background: it.kind === "award" ? (medal(it.title) ?? d.accent) : "#0b1220" }}
                  >
                    {it.kind === "award" ? "★" : "●"}
                  </span>
                </div>
                <div className={left ? "" : "pl-3"}>{!left ? <TimelineCard it={it} accent={d.accent} align="left" /> : null}</div>
              </li>
            );
          })}
        </ul>
      </div>

      {items.length < 9 ? (
        <div className="mx-12 mt-7 grid grid-cols-[1fr_220px] gap-7">
          {bioText(d) && d.bioShort ? (
            <div>
              <h3 className="mb-1.5 font-serif text-[15px] font-bold text-slate-900">{d.L.about}</h3>
              <p className="text-[11.8px] leading-[1.65] text-slate-600" style={clamp(items.length < 6 ? 8 : 5)}>
                {bioText(d)}
              </p>
            </div>
          ) : (
            <div />
          )}
          <dl className="space-y-1">
            {lim([...physical(d), ...personal(d)], items.length < 6 ? 9 : 6).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-slate-100 pb-1 text-[11px]">
                <dt className="text-slate-400">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {d.stats.length ? (
        <div className="mx-12 mt-7 grid grid-cols-4 gap-2">
          {lim(d.stats, 4).map((s, i) => (
            <div key={i} className="rounded-xl border border-slate-200 px-2 py-2.5 text-center">
              <p className="font-serif text-[22px] font-bold" style={{ color: d.accent }}>
                {s.value}
              </p>
              <p className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="absolute inset-x-12 bottom-7">
        <div className="mb-2 flex flex-wrap justify-center gap-x-5 text-[11px] text-slate-600">
          {lim(contact(d), 4).map(([k, v]) => (
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

function TimelineCard({ it, accent, align }: { it: { label: string; title: string; sub: string; kind: string }; accent: string; align: "left" | "right" }) {
  return (
    <div className={`inline-block max-w-full rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm ${align === "right" ? "text-right" : "text-left"}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
        {it.label}
      </p>
      <p className="text-[12.5px] font-bold leading-snug text-slate-900">{it.title}</p>
      {it.sub ? (
        <p className="text-[10.5px] leading-snug text-slate-500" style={clamp(2)}>
          {it.sub}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Dossiê (2 páginas) — capa + ficha completa com fotos            */
/* ------------------------------------------------------------------ */

export function Dossie({ d }: { d: ResumeData }) {
  const img = d.cover ?? d.photo ?? d.sportImage;
  const diagram = hasDiagram(d.sportSlug, d.positionKeys);
  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mb-2.5 border-b-2 pb-1 font-display text-[14px] font-semibold uppercase tracking-[0.2em] text-slate-900" style={{ borderColor: d.accent }}>
      {children}
    </h2>
  );
  return (
    <div className="flex flex-col gap-8 print:gap-0">
      {/* Capa */}
      <div className="print-page font-sans text-white" style={{ ...PAGE, background: "#070b14" }}>
        <img src={img} alt="" className="absolute inset-0 size-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(7,11,20,.15) 0%, rgba(7,11,20,.2) 45%, #070b14 82%)` }} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-12 py-9 text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">
          <span>{d.company.name}</span>
          <span>{d.L.dossier}</span>
        </div>
        <div className="absolute inset-x-12 bottom-14">
          <p className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.2em]" style={{ background: d.accent }}>
            <SportIcon sport={d.sportSlug} className="size-4" /> {d.sportName}
          </p>
          <h1 className="mt-4 font-display text-[92px] font-bold uppercase leading-[0.86]">{d.displayName}</h1>
          <p className="mt-3 text-[18px] text-white/75">{[d.position, d.club].filter(Boolean).join("  ·  ")}</p>
          <div className="mt-8 flex gap-3">
            {[d.age !== null ? [String(d.age), d.L.age] : null, ...d.metrics.slice(0, 3).map((m) => [m.value + (m.unit ? ` ${m.unit}` : ""), m.label])]
              .filter((x): x is string[] => !!x)
              .map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur">
                  <p className="font-display text-[26px] font-bold leading-none">{v}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{l}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Ficha */}
      <div className="print-page bg-white font-sans text-slate-800" style={PAGE}>
        <div className="h-2" style={{ background: d.accent }} />
        <div className="grid grid-cols-[1fr_240px] gap-8 px-12 pt-9">
          <main className="min-w-0 space-y-6">
            {bioText(d) ? (
              <section>
                <H>{d.L.about}</H>
                <p className="text-[12.3px] leading-[1.7] text-slate-700" style={clamp(8)}>
                  {bioText(d)}
                </p>
                {d.style ? (
                  <p className="mt-2 text-[11.8px] leading-[1.6] text-slate-600" style={clamp(3)}>
                    <b className="text-slate-800">{d.L.style}:</b> {d.style}
                  </p>
                ) : null}
              </section>
            ) : null}
            {d.stats.length || d.records.length ? (
              <section>
                <H>{d.records.length ? d.L.records : d.L.stats}</H>
                <div className="grid grid-cols-4 gap-2">
                  {(d.records.length ? d.records.map((r) => ({ label: r.event, value: r.mark })) : d.stats).slice(0, 8).map((s, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
                      <p className="font-display text-[22px] font-bold leading-none" style={{ color: d.accent }}>
                        {s.value}
                      </p>
                      <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            <div className="grid grid-cols-2 gap-6">
              {d.career.length ? (
                <section>
                  <H>{d.L.career}</H>
                  <ul className="space-y-2 text-[11.5px]">
                    {lim(d.career, 6).map((c, i) => (
                      <li key={i}>
                        <p className="font-bold">{c.club}</p>
                        <p className="text-slate-500">{[c.period, c.role].filter(Boolean).join(" · ")}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {d.achievements.length ? (
                <section>
                  <H>{d.L.achievements}</H>
                  <ul className="space-y-1.5 text-[11.5px]">
                    {lim(d.achievements, 8).map((a, i) => (
                      <li key={i} className="flex gap-2">
                        <MedalDot title={a.title} accent={d.accent} />
                        <span>
                          <b className="text-slate-500">{a.year}</b> {a.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
            {d.gallery.length ? (
              <section>
                <H>{d.L.gallery}</H>
                <div className="grid grid-cols-3 gap-2">
                  {d.gallery.slice(0, 3).map((g) => (
                    <img key={g} src={g} alt="" className="h-[150px] w-full rounded-xl object-cover" />
                  ))}
                </div>
              </section>
            ) : null}
          </main>
          <aside className="space-y-5">
            <Photo d={d} size={240} radius={20} />
            {diagram ? (
              <div className="flex justify-center">
                <div className="h-[200px] w-[134px]">
                  <CourtDiagram sport={d.sportSlug} keys={d.positionKeys} accent={d.accent} />
                </div>
              </div>
            ) : null}
            <section>
              <H>{d.L.profile}</H>
              <dl className="space-y-1">
                {lim([...physical(d), ...personal(d)], 10).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 text-[11px]">
                    <dt className="text-slate-400">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </aside>
        </div>
        <div className="absolute inset-x-12 bottom-8 flex items-center gap-5 rounded-2xl bg-[#0b1220] p-4 text-white">
          <QR svg={d.qrLight} size={72} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[18px] font-semibold uppercase tracking-wide">{d.L.contactUs}</p>
            <p className="mt-1 flex flex-wrap gap-x-4 text-[11px] text-white/75">
              {lim(contact(d), 4).map(([k, v]) => (
                <span key={k}>
                  <b className="text-white">{k}:</b> {v}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
