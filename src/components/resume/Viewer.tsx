import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import type { ResumeData } from "@/lib/resume-data";
import { RESUME_TEMPLATES } from "@/lib/templates";
import { ResumeDocument } from "./Templates";
import { PrintButton } from "./PrintButton";

export function ResumeViewer({
  data,
  template,
  hrefBase,
  backHref,
  embed = false,
  printLabel,
}: {
  data: ResumeData;
  template: string;
  hrefBase: string;
  backHref?: string;
  embed?: boolean;
  printLabel?: string;
}) {
  if (embed) {
    return (
      <div className="bg-white [&_.print-page]:!shadow-none">
        <ResumeDocument data={data} template={template} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-200/70">
      <div className="no-print sticky top-0 z-20 bg-ink-900 text-white shadow-lg">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 py-3">
          {backHref ? (
            <Link href={backHref} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          ) : null}
          <p className="mr-2 truncate text-sm font-semibold">{data.displayName}</p>
          <div className="flex flex-1 gap-1 overflow-x-auto">
            {RESUME_TEMPLATES.map((t) => (
              <Link
                key={t.id}
                href={`${hrefBase}?m=${t.id}`}
                scroll={false}
                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  t.id === template ? "bg-brand-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.lang === "en" ? <Globe className="size-3" /> : null}
                {t.name}
              </Link>
            ))}
          </div>
          <PrintButton label={printLabel} />
        </div>
      </div>
      <div className="flex justify-center overflow-x-auto px-4 py-8 print:block print:p-0">
        <div className="origin-top max-[820px]:scale-[0.46] max-[820px]:-mb-[600px] print:scale-100">
          <ResumeDocument data={data} template={template} />
        </div>
      </div>
      <p className="no-print pb-8 text-center text-xs text-slate-500">
        Dica: na janela de impressão escolha &quot;Salvar como PDF&quot;, papel A4, margens &quot;Nenhuma&quot; e marque &quot;Gráficos de fundo&quot;.
      </p>
    </div>
  );
}
