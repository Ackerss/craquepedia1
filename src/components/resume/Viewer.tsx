import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ResumeData } from "@/lib/resume-data";
import { getTemplate, templatesFor } from "@/lib/templates";
import { ResumeDocument } from "./Templates";
import { PrintButton } from "./PrintButton";

export function ResumeViewer({
  data,
  template,
  hrefBase,
  backHref,
  embed = false,
  printLabel,
  sport,
  publicView = false,
}: {
  data: ResumeData;
  template: string;
  hrefBase: string;
  backHref?: string;
  embed?: boolean;
  printLabel?: string;
  sport?: string;
  /** link público (clubes/olheiros): sem a lista de modelos, só idioma e download */
  publicView?: boolean;
}) {
  if (embed) {
    return (
      <div className="bg-white [&_.print-page]:!shadow-none">
        <ResumeDocument data={data} template={template} />
      </div>
    );
  }
  const t = getTemplate(template);
  const { recommended, general, others } = templatesFor(sport ?? data.sportSlug);
  const list = [...recommended, ...general, ...others];
  const href = (id: string, lang: string) => `${hrefBase}?m=${id}${lang !== getTemplate(id).lang ? `&lang=${lang}` : ""}`;
  const en = data.lang === "en";
  return (
    <div className="min-h-screen bg-slate-200/70">
      <div className="no-print sticky top-0 z-20 bg-ink-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center gap-3 px-4 py-3">
          {backHref ? (
            <Link href={backHref} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          ) : null}
          <p className="mr-2 truncate text-sm font-semibold">{data.displayName}</p>
          <div className="flex flex-1 gap-1 overflow-x-auto">
            {(publicView ? [] : list).map((m) => (
              <Link
                key={m.id}
                href={href(m.id, m.onlyLang ?? data.lang)}
                scroll={false}
                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  m.id === template ? "bg-brand-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                title={m.description}
              >
                {recommended.includes(m) ? <Sparkles className="size-3 text-amber-300" /> : null}
                {m.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-0.5 rounded-lg bg-white/10 p-0.5 text-xs font-bold">
            {(["pt", "en"] as const).map((l) => (
              <Link
                key={l}
                href={href(template, l)}
                scroll={false}
                aria-disabled={!!t.onlyLang && t.onlyLang !== l}
                className={`rounded-md px-2.5 py-1 uppercase ${data.lang === l ? "bg-white text-ink-900" : "text-slate-300 hover:text-white"} ${t.onlyLang && t.onlyLang !== l ? "pointer-events-none opacity-40" : ""}`}
              >
                {l}
              </Link>
            ))}
          </div>
          <PrintButton label={printLabel ?? (en ? "Download PDF" : "Baixar PDF")} />
        </div>
      </div>
      <div className="flex justify-center overflow-x-auto px-4 py-8 print:block print:p-0">
        <div className={`origin-top max-[820px]:scale-[0.46] print:scale-100 ${t.pages && t.pages > 1 ? "max-[820px]:-mb-[1250px]" : "max-[820px]:-mb-[600px]"}`}>
          <ResumeDocument data={data} template={template} />
        </div>
      </div>
      <p className="no-print pb-8 text-center text-xs text-slate-500">
        {en
          ? 'Tip: in the print window choose "Save as PDF", A4 paper, margins "None" and enable "Background graphics".'
          : 'Dica: na janela de impressão escolha "Salvar como PDF", papel A4, margens "Nenhuma" e marque "Gráficos de fundo".'}
      </p>
    </div>
  );
}
