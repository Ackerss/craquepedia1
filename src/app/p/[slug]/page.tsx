import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, MapPin, MessageCircle, PlayCircle, Shield, Trophy } from "lucide-react";
import { getAthleteBySlug, getCompany, listGallery } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { tr } from "@/lib/resume-data";
import { ageFrom, fileUrl, igHandle, initials, waLink, youtubeId } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getAthleteBySlug((await params).slug);
  if (!a) return { title: "Atleta" };
  const sport = getSport(a.sport);
  return {
    title: `${a.nickname || a.fullName} · ${sport.name}`,
    description: a.bioShort ?? a.bio?.slice(0, 160) ?? undefined,
    openGraph: { images: a.coverId || a.photoId ? [`/api/files/${a.coverId ?? a.photoId}`] : [] },
  };
}

const T = {
  pt: { about: "Sobre", stats: "Números", career: "Carreira", honours: "Conquistas", videos: "Vídeos", gallery: "Galeria", style: "Estilo de jogo", contact: "Fale com a gente", cv: "Ver currículo", age: "anos", height: "altura", weight: "peso", club: "Clube atual", nat: "Nacionalidade", wa: "Falar no WhatsApp" },
  en: { about: "About", stats: "Statistics", career: "Career", honours: "Honours", videos: "Videos", gallery: "Gallery", style: "Playing style", contact: "Get in touch", cv: "View CV", age: "years", height: "height", weight: "weight", club: "Current club", nat: "Nationality", wa: "Contact on WhatsApp" },
};

export default async function Portfolio({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params;
  const lang = (await searchParams).lang === "en" ? "en" : "pt";
  const t = T[lang];
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) notFound();
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
  const facts = [
    age !== null ? [String(age), t.age] : null,
    a.heightCm ? [`${(a.heightCm / 100).toFixed(2)} m`, t.height] : null,
    a.weightKg ? [`${a.weightKg} kg`, t.weight] : null,
    a.dominantSide ? [tr(a.dominantSide, lang), lang === "en" ? "dominant" : (sport.sideLabel ?? "").toLowerCase()] : null,
  ].filter(Boolean) as [string, string][];

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      {/* Hero */}
      <header className="relative min-h-[88vh] overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 size-full object-cover object-top opacity-60" />
        ) : (
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 30%, ${accent}66, transparent 60%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/10" />
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <span className="font-display text-sm font-semibold uppercase tracking-[0.25em] text-white/80">{company.name}</span>
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 text-xs font-semibold backdrop-blur">
            <Link href={`/p/${a.slug}`} className={`rounded-full px-3 py-1 ${lang === "pt" ? "bg-white text-ink-900" : "text-white"}`}>PT</Link>
            <Link href={`/p/${a.slug}?lang=en`} className={`rounded-full px-3 py-1 ${lang === "en" ? "bg-white text-ink-900" : "text-white"}`}>EN</Link>
          </div>
        </nav>
        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-5 pb-14">
          <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold" style={{ background: accent }}>
            {sport.emoji} {lang === "en" ? sport.nameEn : sport.name}
            {a.position ? ` · ${tr(a.position, lang)}` : ""}
          </p>
          <h1 className="font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight sm:text-8xl lg:text-9xl">
            {a.nickname || a.fullName.split(" ")[0]}
          </h1>
          <p className="mt-3 text-lg text-white/70">{a.fullName}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-white/80">
            {a.currentClub ? (
              <span className="flex items-center gap-2"><Shield className="size-4" /> {a.currentClub}</span>
            ) : null}
            {a.city ? (
              <span className="flex items-center gap-2"><MapPin className="size-4" /> {[a.city, a.state].filter(Boolean).join("/")}</span>
            ) : null}
          </div>
          {facts.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {facts.map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
                  <p className="font-display text-2xl font-semibold">{v}</p>
                  <p className="text-xs uppercase tracking-wider text-white/60">{l}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-5 py-20">
        {/* Sobre */}
        {bio || a.bioShort ? (
          <section className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <div>
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={a.fullName} className="aspect-[4/5] w-full rounded-3xl object-cover" />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center rounded-3xl text-6xl font-bold" style={{ background: accent }}>
                  {initials(a.fullName)}
                </div>
              )}
            </div>
            <div>
              <h2 className="mb-6 font-display text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{t.about}</h2>
              {a.bioShort && lang === "pt" ? <p className="mb-6 font-display text-3xl font-medium leading-tight sm:text-4xl">{a.bioShort}</p> : null}
              {bio ? <p className="whitespace-pre-line text-lg leading-relaxed text-white/75">{bio}</p> : null}
              {style ? (
                <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-white/50">{t.style}</p>
                  <p className="text-white/85">{style}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Números */}
        {a.stats.length ? (
          <section>
            <h2 className="mb-8 font-display text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{t.stats}</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {a.stats.map((s, i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-6">
                  <p className="font-display text-5xl font-bold" style={{ color: i === 0 ? accent : undefined }}>{s.value}</p>
                  <p className="mt-1 text-sm uppercase tracking-wider text-white/60">{s.label}</p>
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
                <h2 className="mb-8 font-display text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{t.career}</h2>
                <ol className="relative space-y-8 border-l border-white/15 pl-8">
                  {a.career.map((c, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[37px] top-1.5 size-3 rounded-full ring-4 ring-ink-950" style={{ background: i === 0 ? accent : "#64748b" }} />
                      <p className="text-sm text-white/50">{tr(c.period, lang)}</p>
                      <p className="font-display text-2xl font-semibold uppercase">{c.club}</p>
                      {c.role ? <p className="text-white/70">{c.role}</p> : null}
                      {c.highlights ? <p className="mt-1 text-sm text-white/55">{c.highlights}</p> : null}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {a.achievements.length ? (
              <div>
                <h2 className="mb-8 font-display text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{t.honours}</h2>
                <ul className="space-y-3">
                  {a.achievements.map((c, i) => (
                    <li key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <Trophy className="mt-0.5 size-5 shrink-0 text-gold-400" />
                      <div>
                        <p className="font-semibold">{c.title}</p>
                        <p className="text-sm text-white/55">{[c.year, c.description].filter(Boolean).join(" · ")}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Vídeos */}
        {videos.length ? (
          <section>
            <h2 className="mb-8 font-display text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{t.videos}</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {videos.map((v, i) => {
                const yt = youtubeId(v.url);
                return yt ? (
                  <div key={i} className="overflow-hidden rounded-3xl border border-white/10">
                    <iframe
                      className="aspect-video w-full"
                      src={`https://www.youtube-nocookie.com/embed/${yt}`}
                      title={v.title}
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                    <p className="bg-white/5 px-4 py-3 text-sm font-medium">{v.title}</p>
                  </div>
                ) : (
                  <a key={i} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
                    <PlayCircle className="size-10 shrink-0" style={{ color: accent }} />
                    <div>
                      <p className="font-semibold">{v.title}</p>
                      <p className="truncate text-sm text-white/50">{v.url}</p>
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
            <h2 className="mb-8 font-display text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>{t.gallery}</h2>
            <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
              {photos.map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={g.id} src={`/api/files/${g.id}`} alt="" loading="lazy" className="w-full break-inside-avoid rounded-2xl" />
              ))}
            </div>
          </section>
        ) : null}

        {/* Contato */}
        <section className="overflow-hidden rounded-[32px] p-10 text-center sm:p-14" style={{ background: `linear-gradient(135deg, ${accent}, #0b1220)` }}>
          <h2 className="font-display text-4xl font-bold uppercase sm:text-5xl">{t.contact}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/80">
            {lang === "en"
              ? `Clubs, scouts and universities interested in ${a.nickname || a.fullName.split(" ")[0]} can contact us.`
              : `Clubes, olheiros e universidades interessados em ${a.nickname || a.fullName.split(" ")[0]} podem falar com a gente.`}
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
            <a href={`/cv/${a.slug}${lang === "en" ? "?m=international" : ""}`} className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
              <FileText className="size-5" /> {t.cv}
            </a>
          </div>
          {igHandle(a.instagram) ? <p className="mt-6 text-sm text-white/70">Instagram: {igHandle(a.instagram)}</p> : null}
        </section>
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        {company.name} {company.instagram ? `· ${company.instagram}` : ""}
      </footer>
    </div>
  );
}
