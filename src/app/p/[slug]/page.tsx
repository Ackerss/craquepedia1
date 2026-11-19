/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { FileText, MapPin, MessageCircle, PlayCircle, Shield, Trophy } from "lucide-react";
import { getAthleteBySlug, getCompany, listGallery } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { parseRecords, tr } from "@/lib/resume-data";
import { getPortfolioTheme, PORTFOLIO_THEMES } from "@/lib/portfolio-themes";
import { ageFrom, fileUrl, igHandle, initials, waLink, youtubeId } from "@/lib/utils";
import { CourtDiagram, hasDiagram } from "@/components/resume/diagrams";
import { SportIcon } from "@/components/ui/SportIcon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getAthleteBySlug((await params).slug);
  if (!a) return { title: "Atleta" };
  const sport = getSport(a.sport);
  return {
    title: `${a.nickname || a.fullName} · ${sport.name}`,
    description: a.bioShort ?? a.bio?.slice(0, 160) ?? undefined,
    openGraph: { images: a.coverId || a.photoId ? [`/api/files/${a.coverId ?? a.photoId}`] : [sport.image] },
  };
}

const T = {
  pt: {
    about: "Sobre",
    stats: "Números",
    career: "Carreira",
    honours: "Conquistas",
    videos: "Vídeos",
    gallery: "Galeria",
    style: "Estilo de jogo",
    contact: "Fale com a gente",
    cv: "Ver currículo",
    age: "anos",
    height: "altura",
    weight: "peso",
    wa: "Falar no WhatsApp",
    sheet: "Ficha técnica",
    records: "Melhores marcas",
    record: "Cartel",
    wins: "Vitórias",
    losses: "Derrotas",
    draws: "Empates",
    competitions: "Competições disputadas",
    position: "Posição em campo",
  },
  en: {
    about: "About",
    stats: "Statistics",
    career: "Career",
    honours: "Honours",
    videos: "Videos",
    gallery: "Gallery",
    style: "Playing style",
    contact: "Get in touch",
    cv: "View CV",
    age: "years",
    height: "height",
    weight: "weight",
    wa: "Contact on WhatsApp",
    sheet: "Player sheet",
    records: "Personal bests",
    record: "Record",
    wins: "Wins",
    losses: "Losses",
    draws: "Draws",
    competitions: "Competitions",
    position: "Position",
  },
};

function H({ children, accent }: { children: ReactNode; accent: string }) {
  return (
    <h2 className="mb-8 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>
      <span className="h-px w-8" style={{ background: accent }} />
      {children}
    </h2>
  );
}

export default async function Portfolio({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; tema?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = sp.lang === "en" ? "en" : "pt";
  const t = T[lang];
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) notFound();
  const th = getPortfolioTheme(PORTFOLIO_THEMES.some((x) => x.id === sp.tema) ? sp.tema : a.portfolioTheme);
  const [company, gallery] = await Promise.all([getCompany(), listGallery(a.id)]);
  const sport = getSport(a.sport);
  const accent = a.accent || sport.color;
  const age = ageFrom(a.birthDate);
  const cover = fileUrl(a.coverId) ?? fileUrl(a.photoId);
  const photo = fileUrl(a.photoId);
  const bio = lang === "en" ? a.bioEn || a.bio : a.bio;
  const style = lang === "en" ? a.playingStyleEn || a.playingStyle : a.playingStyle;
  const photos = gallery.filter((g) => g.id !== a.coverId && g.id !== a.photoId);
  const videos = a.videos.filter((v) => v.url);
  const contactPhone = company.whatsapp || a.phone;
  const name = a.nickname || a.fullName.split(" ").slice(0, 2).join(" ");
  const sd = a.sportData ?? {};
  const posKeys = (a.position ?? "")
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  const diagram = hasDiagram(sport.slug, posKeys);
  const records = parseRecords(sd.melhores_marcas || sd.melhores_tempos);
  const cartel = (sd.cartel ?? "").match(/(\d+)\D+(\d+)(?:\D+(\d+))?/);
  const facts = [
    age !== null ? [String(age), t.age] : null,
    a.heightCm ? [`${(a.heightCm / 100).toFixed(2)} m`, t.height] : null,
    a.weightKg ? [`${a.weightKg} kg`, t.weight] : null,
    a.dominantSide ? [tr(a.dominantSide, lang), lang === "en" ? "dominant" : (sport.sideLabel ?? "").toLowerCase()] : null,
  ].filter(Boolean) as [string, string][];
  const sheet = [
    [lang === "en" ? "Sport" : "Esporte", lang === "en" ? sport.nameEn : sport.name],
    [lang === "en" ? "Position" : sport.positionLabel, tr(a.position, lang)],
    [lang === "en" ? "Current club" : sport.clubLabel, a.currentClub],
    [lang === "en" ? "Nationality" : "Nacionalidade", [tr(a.nationality, lang), tr(a.secondNationality, lang)].filter(Boolean).join(" / ")],
    [lang === "en" ? "Hometown" : "Cidade", [a.city, a.state].filter(Boolean).join("/")],
    [lang === "en" ? "Languages" : "Idiomas", a.languages],
    ...sport.fields
      .filter((f) => f.type !== "textarea" && sd[f.key])
      .map((f) => [(lang === "en" ? f.labelEn : f.label).replace(/\s*\(.*\)\s*$/, ""), sd[f.key]]),
  ].filter(([, v]) => v) as [string, string][];


  const langSwitch = (
    <div className={`flex items-center gap-1 rounded-full p-1 text-xs font-semibold backdrop-blur ${th.dark ? "bg-white/10" : "bg-slate-900/5"}`}>
      {(["pt", "en"] as const).map((l) => (
        <Link
          key={l}
          href={`/p/${a.slug}?${new URLSearchParams({ ...(l === "en" ? { lang: "en" } : {}), ...(sp.tema ? { tema: sp.tema } : {}) }).toString()}`}
          className={`rounded-full px-3 py-1 uppercase ${lang === l ? (th.dark ? "bg-white text-ink-900" : "bg-ink-900 text-white") : th.dark ? "text-white" : "text-slate-700"}`}
        >
          {l}
        </Link>
      ))}
    </div>
  );

  const chip = (
    <p className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-white" style={{ background: accent }}>
      <SportIcon sport={sport.slug} className="size-4" /> {lang === "en" ? sport.nameEn : sport.name}
      {a.position ? ` · ${tr(a.position, lang)}` : ""}
    </p>
  );

  const meta = (
    <div className={`mt-4 flex flex-wrap gap-x-6 gap-y-2 ${th.soft}`}>
      {a.currentClub ? (
        <span className="flex items-center gap-2">
          <Shield className="size-4" /> {a.currentClub}
        </span>
      ) : null}
      {a.city ? (
        <span className="flex items-center gap-2">
          <MapPin className="size-4" /> {[a.city, a.state].filter(Boolean).join("/")}
        </span>
      ) : null}
    </div>
  );

  const factTiles = facts.length ? (
    <div className="mt-8 flex flex-wrap gap-3">
      {facts.map(([v, l]) => (
        <div key={l} className={`rounded-2xl px-5 py-3 backdrop-blur ${th.dark ? "border border-white/10 bg-white/5" : "border border-slate-200 bg-white"}`}>
          <p className="font-display text-2xl font-semibold">{v}</p>
          <p className={`text-xs uppercase tracking-wider ${th.muted}`}>{l}</p>
        </div>
      ))}
    </div>
  ) : null;

  /* ---------------- Hero por tema ---------------- */
  let hero: ReactNode;
  if (th.id === "editorial") {
    hero = (
      <header className="mx-auto max-w-6xl px-5 pb-10">
        <nav className="flex items-center justify-between py-6">
          <span className="font-serif text-lg font-semibold">{company.name}</span>
          {langSwitch}
        </nav>
        <div className="grid items-center gap-10 pt-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {chip}
            <h1 className="mt-5 font-serif text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">{name}</h1>
            <p className="mt-3 text-lg text-slate-500">{a.fullName}</p>
            {a.bioShort && lang === "pt" ? <p className="mt-6 max-w-xl text-xl italic leading-relaxed text-slate-700">&ldquo;{a.bioShort}&rdquo;</p> : null}
            {meta}
            {factTiles}
          </div>
          <div className="relative">
            <div className="absolute -inset-3 -z-0 rotate-2 rounded-[36px]" style={{ background: `${accent}22` }} />
            <img src={cover ?? sport.image} alt={a.fullName} className="relative aspect-[4/5] w-full rounded-[32px] object-cover object-top shadow-2xl" />
          </div>
        </div>
      </header>
    );
  } else if (th.id === "impacto") {
    hero = (
      <header className="relative overflow-hidden" style={{ background: `radial-gradient(120% 90% at 85% 10%, ${accent}, #06080f 62%)` }}>
        <img src={sport.image} alt="" className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-35 mix-blend-screen sm:w-2/3" style={{ maskImage: "linear-gradient(90deg, transparent, black 40%)" }} />
        <p className="pointer-events-none absolute -bottom-6 left-0 select-none whitespace-nowrap font-display text-[22vw] font-bold uppercase leading-none text-white/[0.05]">{name}</p>
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-white/80">{company.name}</span>
          {langSwitch}
        </nav>
        <div className="relative z-10 mx-auto grid max-w-6xl items-end gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1fr_420px]">
          <div className="pb-4">
            {chip}
            <h1 className="mt-5 font-display text-6xl font-bold uppercase leading-[0.88] tracking-tight sm:text-8xl">{name}</h1>
            <p className="mt-3 text-lg text-white/70">{a.fullName}</p>
            {meta}
            {factTiles}
          </div>
          <div className="relative mx-auto w-full max-w-[420px]">
            <div className="rotate-[-3deg] rounded-[34px] p-[3px] shadow-2xl" style={{ background: `linear-gradient(140deg, #fff8, ${accent}, #0000)` }}>
              {photo ? (
                <img src={photo} alt={a.fullName} className="aspect-[4/5] w-full rounded-[31px] object-cover object-top" />
              ) : (
                <img src={sport.image} alt="" className="aspect-[4/5] w-full rounded-[31px] object-cover" />
              )}
            </div>
          </div>
        </div>
      </header>
    );
  } else {
    hero = (
      <header className="relative min-h-[88vh] overflow-hidden">
        <img src={cover ?? sport.image} alt="" className={`absolute inset-0 size-full object-cover object-top ${cover ? "opacity-60" : "opacity-70"}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/10" />
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-white/80">{company.name}</span>
          {langSwitch}
        </nav>
        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-5 pb-14">
          {chip}
          <h1 className="mt-3 font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight sm:text-8xl lg:text-9xl">{name}</h1>
          <p className="mt-3 text-lg text-white/70">{a.fullName}</p>
          {meta}
          {factTiles}
        </div>
      </header>
    );
  }

  return (
    <div className={`min-h-screen ${th.page}`}>
      {hero}

      <main className="mx-auto max-w-6xl space-y-24 px-5 py-20">
        {/* Sobre */}
        {bio || a.bioShort ? (
          <section className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <div>
              {photo ? (
                <img src={photo} alt={a.fullName} className="aspect-[4/5] w-full rounded-3xl object-cover" />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center rounded-3xl text-6xl font-bold text-white" style={{ background: accent }}>
                  {initials(a.fullName)}
                </div>
              )}
            </div>
            <div>
              <H accent={accent}>{t.about}</H>
              {a.bioShort && lang === "pt" && th.id !== "editorial" ? <p className={`mb-6 text-3xl font-medium leading-tight sm:text-4xl ${th.heading}`}>{a.bioShort}</p> : null}
              {bio ? <p className={`whitespace-pre-line text-lg leading-relaxed ${th.soft}`}>{bio}</p> : null}
              {style ? (
                <div className={`mt-8 rounded-3xl p-6 ${th.card}`}>
                  <p className={`mb-2 text-sm font-semibold uppercase tracking-wider ${th.muted}`}>{t.style}</p>
                  <p className={th.soft}>{style}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Ficha técnica */}
        {sheet.length > 2 || diagram ? (
          <section>
            <H accent={accent}>{t.sheet}</H>
            <div className={`grid gap-8 ${diagram ? "lg:grid-cols-[1fr_260px]" : ""}`}>
              <dl className={`grid gap-px overflow-hidden rounded-3xl sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2 ${th.dark ? "bg-white/10" : "bg-slate-200"}`}>
                {sheet.map(([k, v]) => (
                  <div key={k} className={`px-5 py-4 ${th.dark ? "bg-ink-950" : "bg-white"}`}>
                    <dt className={`text-xs font-semibold uppercase tracking-wider ${th.muted}`}>{k}</dt>
                    <dd className="mt-1 text-lg font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              {diagram ? (
                <div className={`flex flex-col items-center justify-center rounded-3xl p-5 ${th.card}`}>
                  <div className="h-[300px] w-[200px]">
                    <CourtDiagram sport={sport.slug} keys={posKeys} accent={accent} />
                  </div>
                  <p className={`mt-3 text-center text-sm font-semibold ${th.soft}`}>{t.position}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Cartel (lutas) */}
        {cartel ? (
          <section>
            <H accent={accent}>{t.record}</H>
            <div className="grid max-w-2xl grid-cols-3 gap-4">
              {[
                [cartel[1], t.wins],
                [cartel[2], t.losses],
                [cartel[3] ?? "0", t.draws],
              ].map(([v, l], i) => (
                <div key={l} className={`rounded-3xl p-6 text-center ${i === 0 ? "text-white" : th.card}`} style={i === 0 ? { background: accent } : undefined}>
                  <p className="font-display text-6xl font-bold">{v}</p>
                  <p className={`mt-1 text-sm uppercase tracking-wider ${i === 0 ? "text-white/80" : th.muted}`}>{l}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Melhores marcas */}
        {records.length ? (
          <section>
            <H accent={accent}>{t.records}</H>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {records.map((r, i) => (
                <div key={i} className={`rounded-3xl p-6 ${th.card}`}>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${th.muted}`}>{r.event}</p>
                  <p className="mt-1 font-display text-5xl font-bold" style={{ color: i === 0 ? accent : undefined }}>
                    {r.mark || "—"}
                  </p>
                  {r.extra ? <p className={`mt-1 text-sm ${th.muted}`}>{r.extra}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Números */}
        {a.stats.length ? (
          <section>
            <H accent={accent}>{t.stats}</H>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {a.stats.map((s, i) => (
                <div key={i} className={`rounded-3xl p-6 ${th.card}`}>
                  <p className={`text-5xl font-bold ${th.id === "editorial" ? "font-serif" : "font-display"}`} style={{ color: i === 0 ? accent : undefined }}>
                    {s.value}
                  </p>
                  <p className={`mt-1 text-sm uppercase tracking-wider ${th.muted}`}>{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Carreira + Conquistas */}
        {a.career.length || a.achievements.length ? (
          <section className="grid gap-12 lg:grid-cols-2">
            {a.career.length ? (
              <div>
                <H accent={accent}>{t.career}</H>
                <ol className={`relative space-y-8 border-l pl-8 ${th.line}`}>
                  {a.career.map((c, i) => (
                    <li key={i} className="relative">
                      <span className={`absolute -left-[37px] top-1.5 size-3 rounded-full ring-4 ${th.dark ? "ring-ink-950" : "ring-[#f6f4ef]"}`} style={{ background: i === 0 ? accent : "#64748b" }} />
                      <p className={`text-sm ${th.muted}`}>{tr(c.period, lang)}</p>
                      <p className={`text-2xl font-semibold ${th.heading}`}>{c.club}</p>
                      {c.role ? <p className={th.soft}>{c.role}</p> : null}
                      {c.highlights ? <p className={`mt-1 text-sm ${th.muted}`}>{c.highlights}</p> : null}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {a.achievements.length ? (
              <div>
                <H accent={accent}>{t.honours}</H>
                <ul className="space-y-3">
                  {a.achievements.map((c, i) => (
                    <li key={i} className={`flex gap-4 rounded-2xl p-4 ${th.card}`}>
                      <Trophy className="mt-0.5 size-5 shrink-0 text-gold-400" />
                      <div>
                        <p className="font-semibold">{c.title}</p>
                        <p className={`text-sm ${th.muted}`}>{[c.year, c.description].filter(Boolean).join(" · ")}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {sd.competicoes ? (
          <section>
            <H accent={accent}>{t.competitions}</H>
            <p className={`max-w-3xl whitespace-pre-line text-lg leading-relaxed ${th.soft}`}>{sd.competicoes}</p>
          </section>
        ) : null}

        {/* Vídeos */}
        {videos.length ? (
          <section>
            <H accent={accent}>{t.videos}</H>
            <div className="grid gap-5 md:grid-cols-2">
              {videos.map((v, i) => {
                const yt = youtubeId(v.url);
                return yt ? (
                  <div key={i} className={`overflow-hidden rounded-3xl ${th.card}`}>
                    <iframe
                      className="aspect-video w-full"
                      src={`https://www.youtube-nocookie.com/embed/${yt}`}
                      title={v.title}
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                    <p className="px-4 py-3 text-sm font-medium">{v.title}</p>
                  </div>
                ) : (
                  <a key={i} href={v.url} target="_blank" rel="noreferrer" className={`flex items-center gap-4 rounded-3xl p-6 transition hover:opacity-90 ${th.card}`}>
                    <PlayCircle className="size-10 shrink-0" style={{ color: accent }} />
                    <div className="min-w-0">
                      <p className="font-semibold">{v.title}</p>
                      <p className={`truncate text-sm ${th.muted}`}>{v.url}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* Galeria */}
        {photos.length ? (
          <section>
            <H accent={accent}>{t.gallery}</H>
            <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
              {photos.map((g) => (
                <a key={g.id} href={`/api/files/${g.id}`} target="_blank" rel="noreferrer" className="block break-inside-avoid overflow-hidden rounded-2xl">
                  <img src={`/api/files/${g.id}`} alt="" loading="lazy" className="w-full transition duration-500 hover:scale-105" />
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {/* Contato */}
        <section className="relative overflow-hidden rounded-[32px] p-10 text-center text-white sm:p-14" style={{ background: `linear-gradient(135deg, ${accent}, #0b1220)` }}>
          <img src={sport.image} alt="" className="absolute inset-y-0 right-0 h-full w-1/2 object-cover opacity-25 mix-blend-screen" style={{ maskImage: "linear-gradient(90deg, transparent, black)" }} />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold uppercase sm:text-5xl">{t.contact}</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/80">
              {lang === "en"
                ? `Clubs, scouts and universities interested in ${name} can contact us.`
                : `Clubes, olheiros e universidades interessados em ${name} podem falar com a gente.`}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {contactPhone ? (
                <a
                  href={waLink(contactPhone, lang === "en" ? `Hello! I'm interested in ${a.fullName}.` : `Olá! Tenho interesse no(a) atleta ${a.fullName}.`)}
                  className="btn bg-white px-6 py-3 text-base text-ink-900 hover:bg-white/90"
                >
                  <MessageCircle className="size-5" /> {t.wa}
                </a>
              ) : null}
              <a href={`/cv/${a.slug}${lang === "en" ? "?lang=en" : ""}`} className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
                <FileText className="size-5" /> {t.cv}
              </a>
            </div>
            {igHandle(a.instagram) ? <p className="mt-6 text-sm text-white/70">Instagram: {igHandle(a.instagram)}</p> : null}
          </div>
        </section>
      </main>
      <footer className={`border-t py-8 text-center text-sm ${th.line} ${th.muted}`}>
        {company.name} {company.instagram ? `· ${company.instagram}` : ""}
      </footer>
    </div>
  );
}
