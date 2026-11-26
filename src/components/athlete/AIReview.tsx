"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Check, CircleAlert, Lightbulb, Loader2, RefreshCw, ScanSearch, ThumbsUp, X } from "lucide-react";
import type { AIReview, ReviewIssue } from "@/db/schema";
import { resolveReviewIssue, reviewAthleteAI } from "@/actions/athletes";
import { fmtDateTime } from "@/lib/utils";

const LEVEL = {
  erro: { label: "Corrigir", icon: CircleAlert, cls: "border-red-200 bg-red-50 text-red-800", dot: "bg-red-500" },
  atencao: { label: "Ajustar", icon: AlertTriangle, cls: "border-amber-200 bg-amber-50 text-amber-900", dot: "bg-amber-500" },
  dica: { label: "Dica", icon: Lightbulb, cls: "border-violet-200 bg-violet-50 text-violet-900", dot: "bg-violet-500" },
} as const;

const VERDICT = {
  pronto: { label: "Pronto para enviar", cls: "bg-brand-600 text-white" },
  ajustar: { label: "Enviar após ajustes", cls: "bg-amber-500 text-white" },
  incompleto: { label: "Faltam dados essenciais", cls: "bg-red-600 text-white" },
} as const;

const FIELD_LABEL: Record<string, string> = {
  bio: "Bio",
  bioShort: "Resumo curto",
  bioEn: "Bio em inglês",
  playingStyle: "Estilo de jogo",
  playingStyleEn: "Estilo de jogo (EN)",
};

function ReviewButton({ id, label, className }: { id: string; label: string; className: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={() =>
          start(async () => {
            setErr(null);
            const r = await reviewAthleteAI(id);
            if (r?.error) setErr(r.error);
            else router.refresh();
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : label.startsWith("Revisar de novo") ? <RefreshCw className="size-4" /> : <ScanSearch className="size-4" />}
        {pending ? "Revisando... (até 30 s)" : label}
      </button>
      {err ? <span className="text-sm text-red-600">{err}</span> : null}
    </div>
  );
}

function IssueCard({ athleteId, issue, index }: { athleteId: string; issue: ReviewIssue; index: number }) {
  const [pending, start] = useTransition();
  const [show, setShow] = useState(false);
  const router = useRouter();
  const L = LEVEL[issue.level] ?? LEVEL.atencao;
  const done = issue.status === "aplicado" || issue.status === "ignorado";
  const act = (action: "aplicar" | "ignorar") =>
    start(async () => {
      await resolveReviewIssue(athleteId, index, action);
      router.refresh();
    });
  return (
    <li className={`rounded-xl border p-3 ${done ? "border-slate-200 bg-white opacity-60" : L.cls}`}>
      <div className="flex items-start gap-2">
        <L.icon className="mt-0.5 size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            <span className="mr-1.5 rounded bg-white/70 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">{issue.area}</span>
            {issue.title}
          </p>
          {issue.detail ? <p className="mt-1 text-sm opacity-90">{issue.detail}</p> : null}
          {issue.suggestion && !done ? (
            <div className="mt-2">
              <button type="button" className="text-xs font-semibold underline" onClick={() => setShow((v) => !v)}>
                {show ? "Esconder texto sugerido" : `Ver texto sugerido para “${FIELD_LABEL[issue.field ?? ""] ?? issue.field}”`}
              </button>
              {show ? <p className="mt-1.5 whitespace-pre-line rounded-lg bg-white p-2.5 text-sm text-slate-700 shadow-sm">{issue.suggestion}</p> : null}
            </div>
          ) : null}
          {done ? (
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Check className="size-3.5" /> {issue.status === "aplicado" ? "Correção aplicada" : "Ignorado"}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {issue.suggestion ? (
                <button type="button" disabled={pending} onClick={() => act("aplicar")} className="btn-primary btn-sm">
                  {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Aplicar correção
                </button>
              ) : (
                <Link href={`/atletas/${athleteId}/editar`} className="btn-ghost btn-sm">
                  Editar perfil
                </Link>
              )}
              <button type="button" disabled={pending} onClick={() => act("ignorar")} className="btn-ghost btn-sm">
                <X className="size-3.5" /> Ignorar
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/** Painel completo da revisão (aba Perfil). */
export function ReviewPanel({ athleteId, review, reviewedAt, stale }: { athleteId: string; review: AIReview | null; reviewedAt: string | null; stale: boolean }) {
  if (!review) {
    return (
      <section className="card card-pad flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <ScanSearch className="size-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-ink-900">Revisão final com IA</h2>
          <p className="text-sm text-slate-500">Antes de entregar, a IA confere português, inglês, datas, exageros e o que os clubes mais pedem nesta modalidade.</p>
        </div>
        <ReviewButton id={athleteId} label="Revisar agora" className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm hover:opacity-95" />
      </section>
    );
  }
  const V = VERDICT[review.verdict] ?? VERDICT.ajustar;
  const open = review.issues.filter((i) => !i.status);
  const color = review.score >= 85 ? "#16a34a" : review.score >= 60 ? "#d97706" : "#dc2626";
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white" style={{ background: color }}>
          <span className="text-2xl font-bold leading-none">{review.score}</span>
          <span className="text-[10px] font-semibold uppercase opacity-90">nota</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-ink-900">Revisão final com IA</h2>
            <span className={`badge ${V.cls}`}>{V.label}</span>
            {open.length ? <span className="badge bg-slate-100 text-slate-600">{open.length} pendente(s)</span> : <span className="badge bg-brand-50 text-brand-700">tudo resolvido</span>}
          </div>
          {review.summary ? <p className="mt-1 text-sm text-slate-600">{review.summary}</p> : null}
          <p className="mt-1 text-xs text-slate-400">
            {reviewedAt ? `Revisado em ${fmtDateTime(reviewedAt)}` : ""} · {review.provider}
          </p>
        </div>
        <ReviewButton id={athleteId} label={stale ? "Revisar de novo (perfil mudou)" : "Revisar de novo"} className={stale ? "btn-primary btn-sm" : "btn-ghost btn-sm"} />
      </div>
      <div className="space-y-3 p-5">
        {review.strengths.length ? (
          <div className="flex flex-wrap gap-1.5">
            {review.strengths.map((s, i) => (
              <span key={i} className="badge border border-brand-200 bg-brand-50 py-1 text-brand-800">
                <ThumbsUp className="size-3" /> {s}
              </span>
            ))}
          </div>
        ) : null}
        {review.issues.length ? (
          <ul className="space-y-2">
            {review.issues.map((iss, i) => (
              <IssueCard key={i} athleteId={athleteId} issue={iss} index={i} />
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-1.5 text-sm font-medium text-brand-700">
            <Check className="size-4" /> Nenhum problema encontrado.
          </p>
        )}
      </div>
    </section>
  );
}

/** Faixa curta mostrada na aba Materiais (lembra de revisar antes de gerar/enviar). */
export function ReviewStrip({ athleteId, review, stale }: { athleteId: string; review: AIReview | null; stale: boolean }) {
  const open = review?.issues.filter((i) => !i.status && i.level !== "dica").length ?? 0;
  const good = review && !stale && open === 0;
  return (
    <div className={`mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${good ? "border-brand-200 bg-brand-50" : "border-violet-200 bg-violet-50"}`}>
      <ScanSearch className={`size-5 shrink-0 ${good ? "text-brand-700" : "text-violet-700"}`} />
      <p className={`flex-1 text-sm ${good ? "text-brand-900" : "text-violet-900"}`}>
        {!review ? (
          <>
            <b>Antes de gerar e enviar:</b> rode a revisão com IA. Ela pega erros de português/inglês, datas incoerentes e o que falta para a modalidade.
          </>
        ) : stale ? (
          <>
            <b>O perfil mudou depois da última revisão</b> (nota {review.score}). Revise de novo antes de enviar.
          </>
        ) : open ? (
          <>
            <b>Revisão com IA: nota {review.score}.</b> Ainda há {open} ponto(s) para corrigir na aba Perfil.
          </>
        ) : (
          <>
            <b>Revisado pela IA: nota {review.score}.</b> Material liberado para enviar.
          </>
        )}
      </p>
      {review && !stale && open ? (
        <Link href={`/atletas/${athleteId}?tab=perfil`} className="btn-ghost btn-sm">
          Ver pontos
        </Link>
      ) : !good ? (
        <ReviewButton id={athleteId} label={review ? "Revisar de novo" : "Revisar agora"} className="btn-primary btn-sm" />
      ) : null}
    </div>
  );
}
