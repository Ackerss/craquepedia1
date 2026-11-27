import Link from "next/link";
import { AlertTriangle, BookOpen, Bot, ArrowRight, CalendarClock, Cake, CheckCircle2, ClipboardList, Handshake, Inbox, MessageCircle, Plus, Send, TrendingUp, Users, Wallet } from "lucide-react";
import { getCompany, listAthletes, listDeliverables, listIntakes, listOrders, listPaymentsSince, listPendingFollowUps, listUsers, recentActivities } from "@/lib/data";
import { baseUrl } from "@/lib/server-utils";
import { FollowUpActions } from "@/components/dashboard/FollowUpActions";
import { requireUser } from "@/lib/auth";
import { aiStatus } from "@/lib/ai";
import { STAGES } from "@/lib/catalog";
import { getSport } from "@/lib/sports";
import { ageFrom, brl, daysToBirthday, daysUntil, firstName, fmtDate, isoInTZ, msSince, relTime, todayISO, waLink } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { SportBadge } from "@/components/ui/SportIcon";

export const dynamic = "force-dynamic";

function greeting() {
  const h = Number(new Date().toLocaleString("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }));
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default async function Dashboard() {
  const s = await requireUser();
  const monthStart = todayISO().slice(0, 8) + "01";
  const [ath, dels, intakes, ords, pays, acts, users] = await Promise.all([
    listAthletes(),
    listDeliverables(),
    listIntakes(),
    listOrders(),
    listPaymentsSince(monthStart),
    recentActivities(12),
    listUsers(),
  ]);
  const [follow, ai, company, base] = await Promise.all([listPendingFollowUps(), aiStatus(), getCompany(), baseUrl()]);
  const birthdays = ath
    .filter((a) => a.status !== "encerrado")
    .map((a) => ({ a, n: daysToBirthday(a.birthDate) }))
    .filter((x): x is { a: (typeof ath)[number]; n: number } => x.n !== null && x.n <= 7)
    .sort((x, y) => x.n - y.n);
  const leads = ath.filter((a) => a.status === "lead");
  const open = dels.filter((d) => d.d.stage !== "entregue");
  const late = open.filter((d) => (daysUntil(d.d.dueDate) ?? 99) < 0);
  const soon = open
    .filter((d) => (daysUntil(d.d.dueDate) ?? 99) <= 3)
    .sort((a, b) => (a.d.dueDate ?? "").localeCompare(b.d.dueDate ?? ""));
  const mine = open.filter((d) => d.d.assigneeId === s.uid);
  const toReceive = ords.filter((o) => o.o.status === "aberto" || o.o.status === "parcial").reduce((sum, o) => sum + (o.o.totalCents - o.o.paidCents), 0);
  const received = pays.reduce((sum, p) => sum + p.p.amountCents, 0);
  const newForms = intakes.filter((i) => i.submittedAt && (!i.seenAt || msSince(i.submittedAt) < 7 * 86400000));
  const deliveredMonth = dels.filter((d) => d.d.deliveredAt && isoInTZ(d.d.deliveredAt) >= monthStart).length;
  const userName = (id?: string | null) => users.find((u) => u.id === id)?.name ?? "—";

  const kpis = [
    { label: "Atletas ativos", value: ath.filter((a) => a.status === "ativo").length, icon: Users, href: "/atletas?status=ativo", tone: "text-brand-600 bg-brand-50" },
    { label: "Entregas abertas", value: open.length, icon: ClipboardList, href: "/entregas", tone: "text-blue-600 bg-blue-50", sub: `${mine.length} com você` },
    { label: "Atrasadas", value: late.length, icon: AlertTriangle, href: "/entregas?filtro=atrasadas", tone: late.length ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-100" },
    { label: "A receber", value: brl(toReceive), icon: Wallet, href: "/financeiro", tone: "text-amber-600 bg-amber-50" },
    { label: "Recebido no mês", value: brl(received), icon: TrendingUp, href: "/financeiro", tone: "text-emerald-700 bg-emerald-50", sub: `${deliveredMonth} entregas no mês` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 first-letter:uppercase">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">
            {greeting()}, {s.name} 👋
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/manual" className="btn-ghost">
            <BookOpen className="size-4" /> Manual
          </Link>
          <Link href="/formularios?novo=1" className="btn-ghost">
            <Send className="size-4" /> Enviar formulário
          </Link>
          <Link href="/atletas/novo" className="btn-primary">
            <Plus className="size-4" /> Novo atleta
          </Link>
        </div>
      </div>

      {!ai.gemini ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4 sm:flex-row sm:items-center">
          <Bot className="size-5 shrink-0 text-violet-700" />
          <p className="flex-1 text-sm text-violet-900">
            <b>Economize na IA:</b> cole a chave grátis do Gemini em Configurações. {ath.length === 0 ? "Primeira vez aqui? O Manual mostra o passo a passo do orçamento à entrega." : ""}
          </p>
          <div className="flex gap-2">
            <Link href="/configuracoes#ia" className="btn-primary btn-sm">
              Configurar IA
            </Link>
            <Link href="/manual" className="btn-ghost btn-sm">
              Ver manual
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="card card-pad group transition hover:-translate-y-0.5 hover:shadow-md">
            <div className={`mb-3 inline-flex rounded-xl p-2 ${k.tone}`}>
              <k.icon className="size-5" />
            </div>
            <p className="text-2xl font-bold tracking-tight text-ink-900">{k.value}</p>
            <p className="text-sm text-slate-500">{k.label}</p>
            {k.sub ? <p className="mt-1 text-xs text-slate-400">{k.sub}</p> : null}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="card min-w-0 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <CalendarClock className="size-5 text-brand-600" /> Prioridades (atrasadas e próximos 3 dias)
            </h2>
            <Link href="/entregas" className="text-sm font-medium text-brand-700 hover:underline">
              Ver quadro
            </Link>
          </div>
          {soon.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-12 text-center text-slate-500">
              <CheckCircle2 className="mb-2 size-8 text-brand-500" />
              Nada urgente. Tudo em dia!
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {soon.slice(0, 10).map(({ d, athleteName, athletePhoto, athleteSport }) => {
                const n = daysUntil(d.dueDate) ?? 0;
                const stage = STAGES.find((x) => x.key === d.stage);
                return (
                  <li key={d.id}>
                    <Link href={`/atletas/${d.athleteId}?tab=entregas`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                      <Avatar name={athleteName} photoId={athletePhoto} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-ink-900">{d.title}</p>
                        <p className="truncate text-sm text-slate-500">
                          {getSport(athleteSport).name} · {athleteName} · {userName(d.assigneeId)}
                        </p>
                      </div>
                      <span className="hidden text-xs font-medium sm:inline" style={{ color: stage?.color }}>
                        {stage?.label}
                      </span>
                      <span className={`badge ${n < 0 ? "bg-red-50 text-red-600" : n === 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                        {n < 0 ? `${-n}d atrasada` : n === 0 ? "Hoje" : `em ${n}d`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="min-w-0 space-y-6">
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <Inbox className="size-5 text-brand-600" /> Formulários recebidos
            </h2>
            <Link href="/formularios" className="text-sm font-medium text-brand-700 hover:underline">
              Todos
            </Link>
          </div>
          {newForms.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">Nenhum formulário novo nos últimos 7 dias.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {newForms.slice(0, 6).map((i) => (
                <li key={i.id}>
                  <Link href={i.athleteId ? `/atletas/${i.athleteId}` : "/formularios"} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <SportBadge sport={i.sport} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{i.clientName}</p>
                      <p className="text-xs text-slate-500">{i.submittedAt ? relTime(i.submittedAt) : ""}</p>
                    </div>
                    {!i.seenAt ? <span className="badge bg-brand-600 text-white">Novo</span> : null}
                    <ArrowRight className="size-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        {follow.length ? (
          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Send className="size-5 text-violet-600" /> Cobrar retorno de clubes
              </h2>
              <Link href="/contatos" className="text-sm font-medium text-brand-700 hover:underline">
                Contatos
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {follow.map((f) => {
                const msg = `Olá ${firstName(f.c.name)}, tudo bem? Aqui é da ${company.name}. Passando para saber se conseguiu ver o material do(a) atleta ${f.athleteName} que enviei em ${fmtDate(f.o.sentAt)}.\n\nPortfólio: ${base}/p/${f.athleteSlug}\n\nFico à disposição para mandar mais vídeos ou informações!`;
                return (
                  <li key={f.o.id} className="flex items-center gap-2 px-5 py-3 hover:bg-slate-50">
                    <Link href={`/atletas/${f.o.athleteId}?tab=divulgacao`} className="flex min-w-0 flex-1 items-center gap-3">
                      <SportBadge sport={f.athleteSport} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{f.c.organization || f.c.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {f.athleteNickname || f.athleteName} · enviado {fmtDate(f.o.sentAt)}
                        </p>
                      </div>
                    </Link>
                    <FollowUpActions id={f.o.id} athleteId={f.o.athleteId} phone={f.c.phone} email={f.c.email} country={f.c.country} message={msg} />
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
        {birthdays.length ? (
          <section className="card">
            <h2 className="flex items-center gap-2 border-b border-slate-100 px-5 py-4 font-semibold">
              <Cake className="size-5 text-pink-500" /> Aniversários da semana
            </h2>
            <ul className="divide-y divide-slate-100">
              {birthdays.map(({ a, n }) => {
                const age = (ageFrom(a.birthDate) ?? 0) + (n === 0 ? 0 : 1);
                const msg = `Parabéns, ${firstName(a.nickname || a.fullName)}! 🎉🎂 Toda a equipe da ${company.name} deseja um feliz aniversário, muita saúde e muitas conquistas dentro e fora ${a.sport === "futebol" ? "de campo" : "do esporte"}! 🏆`;
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={a.fullName} photoId={a.photoId} size={32} />
                    <Link href={`/atletas/${a.id}`} className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.nickname || a.fullName}</p>
                      <p className="text-xs text-slate-500">
                        {n === 0 ? "Hoje!" : n === 1 ? "Amanhã" : `em ${n} dias`} · faz {age} anos
                      </p>
                    </Link>
                    {a.phone ? (
                      <a href={waLink(a.phone, msg)} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-[#128C7E] hover:bg-[#25D366]/15" title="Mandar parabéns no WhatsApp" aria-label="Mandar parabéns no WhatsApp">
                        <MessageCircle className="size-4" />
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
        {leads.length ? (
          <section className="card">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <Handshake className="size-5 text-violet-600" /> Em negociação
              </h2>
              <Link href="/atletas?status=lead" className="text-sm font-medium text-brand-700 hover:underline">
                Ver todos
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {leads.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <SportBadge sport={a.sport} size={32} />
                  <Link href={`/atletas/${a.id}?tab=financeiro`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.nickname || a.fullName}</p>
                    <p className="text-xs text-slate-500">cadastrado {relTime(a.createdAt)}</p>
                  </Link>
                  <a href={`/doc/proposta/${a.id}`} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                    Proposta
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card card-pad xl:col-span-2">
          <h2 className="mb-4 font-semibold">Fluxo de produção</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAGES.map((st) => {
              const n = dels.filter((d) => d.d.stage === st.key).length;
              return (
                <Link key={st.key} href="/entregas" className="rounded-2xl border border-slate-100 p-4 hover:bg-slate-50">
                  <div className="mb-2 h-1.5 w-10 rounded-full" style={{ background: st.color }} />
                  <p className="text-2xl font-bold">{n}</p>
                  <p className="text-sm text-slate-500">{st.label}</p>
                </Link>
              );
            })}
          </div>
          <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-600">Atletas recentes</h3>
          {ath.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhum atleta ainda. <Link className="font-medium text-brand-700 underline" href="/atletas/novo">Cadastre o primeiro</Link> ou{" "}
              <Link className="font-medium text-brand-700 underline" href="/formularios?novo=1">envie um formulário</Link>.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ath.slice(0, 12).map((a) => (
                <Link key={a.id} href={`/atletas/${a.id}`} className="flex max-w-full items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm hover:bg-slate-50">
                  <Avatar name={a.fullName} photoId={a.photoId} size={28} />
                  <span className="max-w-[12rem] truncate">{a.nickname || a.fullName.split(" ")[0]}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="card">
          <h2 className="border-b border-slate-100 px-5 py-4 font-semibold">Atividade recente</h2>
          {acts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">Sem atividade ainda.</p>
          ) : (
            <ul className="space-y-3 px-5 py-4">
              {acts.map(({ a, athleteName, userName: un }) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />
                  <div className="min-w-0">
                    <p className="text-slate-700">
                      <span className="font-medium text-ink-900">{un ?? "Sistema"}</span> · {a.message}
                      {athleteName && !a.message.includes(athleteName) ? <span className="text-slate-500"> — {athleteName}</span> : null}
                    </p>
                    <p className="text-xs text-slate-400">{relTime(a.createdAt)} · {fmtDate(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
