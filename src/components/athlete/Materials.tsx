import Link from "next/link";
import { ExternalLink, FileText, Globe, IdCard, LayoutTemplate, MessageCircle, Printer, Sparkles } from "lucide-react";
import type { Athlete } from "@/db/schema";
import { templatesFor } from "@/lib/templates";
import { getSport } from "@/lib/sports";
import { baseUrl, qrSvg } from "@/lib/server-utils";
import { firstName, waLink } from "@/lib/utils";
import { CopyButton } from "@/components/ui/CopyButton";
import { PortfolioThemePicker } from "@/components/athlete/HubActions";
import { PORTFOLIO_THEMES } from "@/lib/portfolio-themes";

export async function Materials({ a }: { a: Athlete }) {
  const base = await baseUrl();
  const links = {
    cartao: `${base}/c/${a.slug}`,
    portfolio: `${base}/p/${a.slug}`,
    cv: `${base}/cv/${a.slug}`,
  };
  const qr = await qrSvg(links.portfolio);
  const sport = getSport(a.sport);
  const { recommended, general, others } = templatesFor(sport.slug);
  const groups = [
    { title: `Recomendados para ${sport.name}`, list: recommended, rec: true },
    { title: `Modelos para todos os esportes (${general.length})`, list: general, rec: false },
    { title: "Outros modelos", list: others, rec: false },
  ];
  const msg = `Olá ${firstName(a.fullName)}! 🙌 Seus materiais da Craquepedia estão prontos:\n\n📄 Currículo: ${links.cv}\n🌐 Portfólio: ${links.portfolio}\n💳 Cartão digital: ${links.cartao}\n\nQualquer ajuste é só falar!`;
  return (
    <div className="space-y-6">
      {!a.publicEnabled ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Os links públicos deste atleta estão desativados. Ative em &quot;Links públicos ativos&quot; no topo da página para compartilhar.
        </p>
      ) : null}
      {groups.map((g) =>
        g.list.length ? (
          <section key={g.title}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold">
                {g.rec ? <Sparkles className="size-5 text-amber-500" /> : <FileText className="size-5 text-brand-600" />} {g.title}
              </h3>
              {g.rec ? <p className="text-sm text-slate-500">Gerados na hora a partir do perfil. Todos abrem em português ou inglês.</p> : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {g.list.map((t) => (
                <div key={t.id} className="card group overflow-hidden">
                  <Link href={`/doc/curriculo/${a.id}?m=${t.id}`} className="relative block h-56 overflow-hidden bg-slate-100">
                    <iframe
                      src={`/doc/curriculo/${a.id}?m=${t.id}&embed=1`}
                      title={t.name}
                      loading="lazy"
                      className="pointer-events-none absolute left-0 top-0 h-[1123px] w-[794px] origin-top-left scale-[0.33] border-0 sm:scale-[0.36]"
                      tabIndex={-1}
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                    {t.isNew ? <span className="badge absolute left-2 top-2 bg-amber-400 text-amber-950 shadow">Novo</span> : null}
                  </Link>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{t.name}</p>
                      {t.onlyLang === "en" ? <span className="badge bg-blue-50 text-blue-700"><Globe className="size-3" /> EN</span> : null}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500" title={t.description}>{t.bestFor}</p>
                    <div className="mt-2 flex gap-1.5">
                      <Link href={`/doc/curriculo/${a.id}?m=${t.id}`} className="btn-ghost btn-sm flex-1">
                        <Printer className="size-4" /> {t.onlyLang === "en" ? "Abrir" : "PT"}
                      </Link>
                      {!t.onlyLang ? (
                        <Link href={`/doc/curriculo/${a.id}?m=${t.id}&lang=en`} className="btn-ghost btn-sm" title="Abrir em inglês">
                          <Globe className="size-4" /> EN
                        </Link>
                      ) : null}
                      <CopyButton text={`${links.cv}?m=${t.id}`} label="Link" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null,
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card card-pad">
          <h3 className="mb-1 flex items-center gap-2 font-semibold">
            <IdCard className="size-5 text-brand-600" /> Cartão digital
          </h3>
          <p className="mb-3 text-sm text-slate-500">Página-cartão com foto, números, botões de contato e QR Code.</p>
          <div className="flex flex-wrap gap-2">
            <a href={links.cartao} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
              <ExternalLink className="size-4" /> Abrir
            </a>
            <CopyButton text={links.cartao} />
          </div>
        </div>
        <div className="card card-pad">
          <h3 className="mb-1 flex items-center gap-2 font-semibold">
            <LayoutTemplate className="size-5 text-brand-600" /> Portfólio online
          </h3>
          <p className="mb-3 text-sm text-slate-500">Site completo com bio, ficha técnica, números, galeria e vídeos (PT e EN). Escolha o visual:</p>
          <div className="mb-3">
            <PortfolioThemePicker id={a.id} slug={a.slug} value={a.portfolioTheme} themes={PORTFOLIO_THEMES.map(({ id, name, description }) => ({ id, name, description }))} />
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={links.portfolio} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
              <ExternalLink className="size-4" /> Abrir
            </a>
            <CopyButton text={links.portfolio} />
          </div>
        </div>
        <div className="card card-pad flex items-center gap-4">
          <div className="size-24 shrink-0 rounded-xl bg-white p-1.5 ring-1 ring-slate-200" dangerouslySetInnerHTML={{ __html: qr }} />
          <div>
            <p className="font-semibold">QR Code do portfólio</p>
            <p className="mb-2 text-sm text-slate-500">Já aparece impresso nos currículos.</p>
            <a href={waLink(a.phone, msg)} target="_blank" rel="noreferrer" className="btn-primary btn-sm">
              <MessageCircle className="size-4" /> Enviar tudo no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
