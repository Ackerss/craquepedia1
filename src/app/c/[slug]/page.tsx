import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileText, Globe, MessageCircle, UserPlus } from "lucide-react";
import { getAthleteBySlug, getCompany } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { baseUrl, qrSvg } from "@/lib/server-utils";
import { ageFrom, fileUrl, igHandle, initials, waLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = await getAthleteBySlug((await params).slug);
  if (!a) return { title: "Atleta" };
  return {
    title: `${a.nickname || a.fullName} · Cartão`,
    description: a.bioShort ?? `${getSport(a.sport).name}${a.position ? ` · ${a.position}` : ""}`,
    openGraph: { images: a.photoId ? [`/api/files/${a.photoId}`] : [] },
  };
}

export default async function Cartao({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) notFound();
  const sport = getSport(a.sport);
  const company = await getCompany();
  const base = await baseUrl();
  const qr = await qrSvg(`${base}/c/${a.slug}`, "#0b1220");
  const accent = a.accent || sport.color;
  const age = ageFrom(a.birthDate);
  const photo = fileUrl(a.photoId);
  const contactPhone = company.whatsapp || a.phone;
  const facts = [
    age !== null ? [String(age), "anos"] : null,
    a.heightCm ? [(a.heightCm / 100).toFixed(2).replace(".", ","), "altura (m)"] : null,
    a.weightKg ? [String(a.weightKg), "peso (kg)"] : null,
    a.dominantSide ? [a.dominantSide, (sport.sideLabel ?? "").toLowerCase()] : null,
  ].filter(Boolean) as [string, string][];
  const ig = igHandle(a.instagram);

  return (
    <div className="flex min-h-screen items-start justify-center bg-ink-950 sm:items-center sm:py-10">
      <div className="relative w-full max-w-md overflow-hidden bg-white sm:rounded-[32px] sm:shadow-2xl">
        <div className="relative h-44" style={{ background: `linear-gradient(135deg, ${accent}, #0b1220 90%)` }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <span className="absolute right-5 top-4 text-5xl opacity-40">{sport.emoji}</span>
          <span className="absolute left-5 top-5 font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{company.name}</span>
        </div>
        <div className="relative z-10 -mt-20 flex flex-col items-center px-6 text-center">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={a.fullName} className="size-36 rounded-full object-cover shadow-xl ring-[6px] ring-white" />
          ) : (
            <div className="flex size-36 items-center justify-center rounded-full text-4xl font-bold text-white shadow-xl ring-[6px] ring-white" style={{ background: accent }}>
              {initials(a.fullName)}
            </div>
          )}
          <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-none tracking-wide text-ink-900">{a.nickname || a.fullName.split(" ")[0]}</h1>
          {a.nickname ? <p className="mt-1 text-sm text-slate-500">{a.fullName}</p> : null}
          <p className="mt-2 font-semibold" style={{ color: accent }}>
            {sport.emoji} {[a.position, sport.name].filter(Boolean).join(" · ")}
          </p>
          {a.currentClub ? <p className="text-sm text-slate-600">{a.currentClub}</p> : null}
          {a.bioShort ? <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{a.bioShort}</p> : null}
        </div>

        {facts.length ? (
          <div className="mx-6 mt-5 grid grid-cols-4 divide-x divide-slate-100 rounded-2xl bg-slate-50 py-3">
            {facts.map(([v, l]) => (
              <div key={l} className="px-1 text-center">
                <p className="text-lg font-bold text-ink-900">{v}</p>
                <p className="text-[11px] text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        ) : null}

        {a.stats.length ? (
          <div className="mx-6 mt-3 grid grid-cols-3 gap-2">
            {a.stats.slice(0, 3).map((s, i) => (
              <div key={i} className="rounded-2xl px-2 py-3 text-center text-white" style={{ background: i === 0 ? accent : "#0b1220" }}>
                <p className="font-display text-2xl font-bold">{s.value}</p>
                <p className="text-[11px] opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-2 px-6">
          {contactPhone ? (
            <a href={waLink(contactPhone, `Olá! Vi o cartão de ${a.nickname || a.fullName} e gostaria de mais informações.`)} className="btn w-full bg-[#25D366] py-3 text-base text-white hover:bg-[#1ebe5a]">
              <MessageCircle className="size-5" /> Falar no WhatsApp
            </a>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <a href={`/p/${a.slug}`} className="btn-dark py-3">
              <Globe className="size-4" /> Portfólio
            </a>
            <a href={`/cv/${a.slug}`} className="btn-ghost py-3">
              <FileText className="size-4" /> Currículo
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ig ? (
              <a href={`https://instagram.com/${ig.slice(1)}`} target="_blank" rel="noreferrer" className="btn-ghost">
                {ig}
              </a>
            ) : null}
            <a href={`/c/${a.slug}/vcard`} className={`btn-ghost ${ig ? "" : "col-span-2"}`}>
              <UserPlus className="size-4" /> Salvar contato
            </a>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-slate-100 bg-slate-50 px-6 py-5">
          <div className="size-20 shrink-0 rounded-xl bg-white p-1.5 ring-1 ring-slate-200" dangerouslySetInnerHTML={{ __html: qr }} />
          <div className="text-sm text-slate-500">
            <p className="font-semibold text-ink-900">Compartilhe este cartão</p>
            Aponte a câmera para o QR Code.
            <p className="mt-1 flex items-center gap-1 text-xs">
              <Download className="size-3" /> {company.name} {company.instagram}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
