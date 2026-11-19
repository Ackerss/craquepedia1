import Link from "next/link";
import { Check, Gauge } from "lucide-react";
import type { ReadinessItem } from "@/lib/readiness";

export function Readiness({ athleteId, r }: { athleteId: string; r: { items: ReadinessItem[]; done: number; total: number; pct: number } }) {
  const color = r.pct >= 85 ? "#16a34a" : r.pct >= 55 ? "#d97706" : "#dc2626";
  const C = 2 * Math.PI * 26;
  const missing = r.items.filter((i) => !i.ok);
  const href = (t: ReadinessItem["tab"]) => (t === "editar" ? `/atletas/${athleteId}/editar` : t === "fotos" ? `/atletas/${athleteId}?tab=fotos` : `/atletas/${athleteId}?tab=perfil`);
  return (
    <section className="card card-pad">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="7" />
            <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - r.pct / 100)} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-900">{r.pct}%</span>
        </div>
        <div>
          <h2 className="flex items-center gap-1.5 font-semibold text-ink-900">
            <Gauge className="size-4 text-slate-400" /> Perfil pronto para materiais
          </h2>
          <p className="text-sm text-slate-500">
            {r.done} de {r.total} itens.{" "}
            {missing.length ? "Quanto mais completo, melhores ficam currículo, portfólio e artes." : "Tudo certo para gerar materiais fortes!"}
          </p>
        </div>
      </div>
      {missing.length ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {missing.map((m) => (
            <li key={m.label}>
              <Link href={href(m.tab)} className="badge border border-slate-200 bg-white py-1 text-slate-600 hover:border-brand-400 hover:text-brand-700" title={m.tab === "ia" ? "Use o botão Organizar com IA" : undefined}>
                + {m.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand-700">
          <Check className="size-4" /> Perfil completo
        </p>
      )}
    </section>
  );
}
