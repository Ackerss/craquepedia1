import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CalendarCheck,
  CircleHelp,
  ClipboardList,
  FileSignature,
  Handshake,
  Lightbulb,
  Megaphone,
  PackageCheck,
  Palette,
  ScanSearch,
  Sparkles,
  Target,
  UserRoundCheck,
  Wand2,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { MANUAL, MANUAL_FAQ, type ManualPhase } from "@/lib/manual";
import { Progress, RailMark, UnderstoodButton, ZoomImage } from "./client";

export const metadata = { title: "Manual" };

const ICONS: Record<ManualPhase["icon"], typeof BookOpen> = {
  orcamento: FileSignature,
  fechamento: Handshake,
  dados: ClipboardList,
  perfil: UserRoundCheck,
  revisao: ScanSearch,
  producao: Palette,
  entrega: PackageCheck,
  divulgacao: Megaphone,
};

/** Converte **negrito** em <b>. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <b key={i} className="font-semibold text-ink-900">
            {p}
          </b>
        ) : (
          p
        ),
      )}
    </>
  );
}

export default async function Manual({ searchParams }: { searchParams: Promise<{ etapa?: string }> }) {
  await requireUser();
  const { etapa } = await searchParams;
  const idx = Math.max(0, MANUAL.findIndex((p) => p.key === etapa));
  const phase = MANUAL[idx];
  const prev = MANUAL[idx - 1];
  const next = MANUAL[idx + 1];
  const Icon = ICONS[phase.icon];
  const tips = phase.steps.filter((s) => s.tip);

  return (
    <div className="space-y-6">
      {/* Topo */}
      <section className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200">
              <BookOpen className="size-3.5" /> Manual da equipe
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Do orçamento à entrega, passo a passo</h1>
            <p className="mt-2 text-[15px] text-slate-300">
              As 8 etapas de cada atleta na Craquepedia. Clique numa etapa, veja onde clicar (os números nas imagens batem com os passos) e marque como entendida.
            </p>
          </div>
          <Progress keys={MANUAL.map((p) => p.key)} />
        </div>
      </section>

      {/* Trilha */}
      <nav className="-mx-1 overflow-x-auto pb-1" aria-label="Etapas">
        <ol className="flex min-w-max gap-1 px-1">
          {MANUAL.map((p, i) => {
            const active = i === idx;
            const PIcon = ICONS[p.icon];
            return (
              <li key={p.key} className="flex items-center">
                <Link
                  href={`/manual?etapa=${p.key}`}
                  scroll={false}
                  className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition ${
                    active ? "border-brand-300 bg-white shadow-sm" : "border-transparent hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <RailMark k={p.key} n={i + 1} active={active} />
                  <span className="text-left">
                    <span className={`flex items-center gap-1 text-sm font-semibold ${active ? "text-ink-900" : "text-slate-600"}`}>
                      <PIcon className="size-3.5" /> {p.title}
                    </span>
                    <span className="block text-xs text-slate-400">{p.short}</span>
                  </span>
                </Link>
                {i < MANUAL.length - 1 ? <ArrowRight className="mx-0.5 size-4 shrink-0 text-slate-300" /> : null}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Etapa atual */}
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-white p-5 sm:flex-row sm:items-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
            <Icon className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Etapa {idx + 1} de {MANUAL.length}
            </p>
            <h2 className="text-xl font-bold text-ink-900">{phase.title}</h2>
            <p className="flex items-start gap-1.5 text-sm text-slate-600">
              <Target className="mt-0.5 size-4 shrink-0 text-brand-600" /> {phase.goal}
            </p>
          </div>
          <Link href={phase.link.href} className="btn-primary shrink-0">
            {phase.link.label} <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className="space-y-4">
            <h3 className="section-title">O que fazer</h3>
            <ol className="space-y-3">
              {phase.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow-sm">{i + 1}</span>
                  <p className="pt-0.5 text-[15px] leading-relaxed text-slate-700">
                    <Rich text={s.text} />
                  </p>
                </li>
              ))}
            </ol>
            {tips.map((s, i) => (
              <p key={i} className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <Lightbulb className="mt-0.5 size-4 shrink-0" /> {s.tip}
              </p>
            ))}
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-900">
              <p className="font-semibold">✓ Etapa concluída quando:</p>
              <p>{phase.done}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <UnderstoodButton k={phase.key} />
              {next ? (
                <Link href={`/manual?etapa=${next.key}`} scroll={false} className="btn-ghost">
                  Próxima: {next.title} <ArrowRight className="size-4" />
                </Link>
              ) : null}
              {prev ? (
                <Link href={`/manual?etapa=${prev.key}`} scroll={false} className="btn-ghost">
                  <ArrowLeft className="size-4" /> Voltar
                </Link>
              ) : null}
            </div>
          </div>
          <div className="space-y-5">
            {phase.images.map((img) => (
              <ZoomImage key={img.src} src={img.src} caption={img.caption} />
            ))}
          </div>
        </div>
      </section>

      {/* IA */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink-900">
          <Bot className="size-5 text-violet-600" /> Onde a IA ajuda
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: Wand2, title: "Organizar com IA", text: "Lê o formulário (ou o que vocês digitaram), corrige o português, escreve a bio em PT e EN e monta carreira, conquistas e números. Roda sozinha quando o formulário chega." },
            { icon: ScanSearch, title: "Revisão final", text: "Um revisor exigente: confere textos, tradução, datas, exageros e o que falta para a modalidade. Dá nota, veredito e correções com um clique." },
            { icon: Sparkles, title: "Textos prontos", text: "Mensagem de entrega no WhatsApp, legenda de Instagram, e-mail para clubes, apresentação em inglês e roteiro do vídeo." },
          ].map((c) => (
            <div key={c.title} className="card card-pad">
              <c.icon className="mb-2 size-6 text-violet-600" />
              <p className="font-semibold text-ink-900">{c.title}</p>
              <p className="mt-1 text-sm text-slate-600">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rotina */}
        <section className="card card-pad">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink-900">
            <CalendarCheck className="size-5 text-brand-600" /> Rotina rápida
          </h2>
          <ul className="space-y-2.5 text-[15px] text-slate-700">
            {[
              ["Todo dia", "Abra o Painel: prioridades atrasadas, formulários recebidos e clubes para cobrar retorno."],
              ["Ao receber formulário", "Confira o perfil, rode a revisão e mova as entregas para Em produção."],
              ["Antes de entregar", "Revisão com IA sem pontos vermelhos e todas as entregas em Revisão."],
              ["Toda semana", "Financeiro: quem ainda falta pagar. Contatos: novos clubes para a divulgação."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 w-32 shrink-0 text-sm font-semibold text-brand-700">{t}</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Dúvidas */}
        <section className="card card-pad">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-ink-900">
            <CircleHelp className="size-5 text-brand-600" /> Dúvidas comuns
          </h2>
          <div className="divide-y divide-slate-100">
            {MANUAL_FAQ.map((f) => (
              <details key={f.q} className="group py-2.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-ink-900">
                  {f.q}
                  <ArrowRight className="size-4 shrink-0 text-slate-400 transition group-open:rotate-90" />
                </summary>
                <p className="mt-1.5 text-sm text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
