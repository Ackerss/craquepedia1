import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Cake,
  ClipboardList,
  FileText,
  History,
  Images,
  Lightbulb,
  MapPin,
  MessageCircle,
  Pencil,
  Ruler,
  Shield,
  Trophy,
  User,
  Wallet,
  Globe,
  IdCard,
  Palette,
  Send,
} from "lucide-react";
import { getAthleteBundle, getCompany, listPackages, listServices, listUsers, markIntakesSeen } from "@/lib/data";
import { STAGES } from "@/lib/catalog";
import { getSport } from "@/lib/sports";
import { ageFrom, brl, fmtDate, fmtPhone, igHandle, isMinor, relTime, waLink } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { AIButton, DeleteAthlete, PublicToggle, ResponsibleSelect, StatusSelect, TextStudio } from "@/components/athlete/HubActions";
import { Gallery, PhotoUpload } from "@/components/athlete/Photos";
import { Materials } from "@/components/athlete/Materials";
import { ContractButton } from "@/components/work/ContractForm";
import { DeliverableCard } from "@/components/work/DeliverableCard";
import { OrderCard } from "@/components/work/OrderCard";
import { AddDeliverable, RequestDataButton } from "./client";
import { SportIcon } from "@/components/ui/SportIcon";
import { SocialArts } from "@/components/athlete/SocialArts";
import { Readiness } from "@/components/athlete/Readiness";
import { ReviewPanel, ReviewStrip } from "@/components/athlete/AIReview";
import { Outreach } from "@/components/athlete/Outreach";
import { baseCategory, readiness } from "@/lib/readiness";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "perfil", label: "Perfil", icon: User },
  { key: "entregas", label: "Entregas", icon: ClipboardList },
  { key: "materiais", label: "Materiais", icon: FileText },
  { key: "artes", label: "Artes", icon: Palette },
  { key: "divulgacao", label: "Divulgação", icon: Send },
  { key: "fotos", label: "Fotos", icon: Images },
  { key: "financeiro", label: "Financeiro", icon: Wallet },
  { key: "historico", label: "Histórico", icon: History },
];

export default async function AthletePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; novo?: string }>;
}) {
  const { id } = await params;
  const { tab = "perfil", novo } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [bundle, users, packages, services, company] = await Promise.all([getAthleteBundle(id), listUsers(), listPackages(true), listServices(true), getCompany()]);
  if (!bundle) notFound();
  await markIntakesSeen(id);
  const { athlete: a, deliverables, orders, payments, activities, gallery } = bundle;
  const sport = getSport(a.sport);
  const age = ageFrom(a.birthDate);
  const openDel = deliverables.filter((d) => d.stage !== "entregue").length;
  const due = orders.filter((o) => o.status === "aberto" || o.status === "parcial").reduce((s, o) => s + o.totalCents - o.paidCents, 0);
  const hasContent = !!(a.bio || a.achievements.length || a.career.length);
  const accent = a.accent ?? sport.color;
  const cat = baseCategory(a.birthDate, a.sport);
  const ready = readiness(a, gallery.length);
  const reviewStale = !!(a.aiReview && a.aiReviewedAt && a.updatedAt.getTime() - a.aiReviewedAt.getTime() > 5000);

  return (
    <div>
      <Link href="/atletas" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Atletas
      </Link>

      {/* Cabeçalho */}
      <div className="card mb-5 overflow-hidden">
        <div className="relative h-36 overflow-hidden bg-ink-950 sm:h-44" style={{ background: `linear-gradient(115deg, ${accent} 0%, #070b14 62%)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sport.image} alt="" className="absolute inset-y-0 right-0 h-full w-3/4 object-cover sm:w-1/2" style={{ maskImage: "linear-gradient(90deg, transparent, black 55%)" }} />
          <div className="absolute left-5 top-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <SportIcon sport={sport.slug} className="size-4" /> {sport.name}
            </span>
            {cat ? (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur" title="Categoria aproximada pelo ano de nascimento">
                {cat.label} em {cat.year}
              </span>
            ) : null}
          </div>
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {[
              { href: `/cv/${a.slug}`, label: "Currículo", icon: FileText },
              { href: `/p/${a.slug}`, label: "Portfólio", icon: Globe },
              { href: `/c/${a.slug}`, label: "Cartão", icon: IdCard },
            ].map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" title={l.label} aria-label={l.label} className="inline-flex items-center gap-1.5 rounded-lg bg-black/35 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/55">
                <l.icon className="size-3.5" /> <span className="hidden sm:inline">{l.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
          <div className="relative z-10 -mt-14 flex items-end gap-4">
            <Avatar name={a.fullName} photoId={a.photoId} size={112} color={sport.color} className="ring-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">{a.nickname ? `${a.nickname}` : a.fullName}</h1>
            <p className="text-slate-500">
              {a.nickname ? `${a.fullName} · ` : ""}
              {a.position || sport.name}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
              {age !== null ? (
                <span className="flex items-center gap-1">
                  <Cake className="size-4 text-slate-400" /> {age} anos
                </span>
              ) : null}
              {a.city ? (
                <span className="flex items-center gap-1">
                  <MapPin className="size-4 shrink-0 text-slate-400" /> <span className="max-w-[16rem] truncate">{a.city}</span>
                  {a.state ? `/${a.state}` : ""}
                </span>
              ) : null}
              {a.currentClub ? (
                <span className="flex items-center gap-1">
                  <Shield className="size-4 shrink-0 text-slate-400" /> <span className="max-w-[16rem] truncate">{a.currentClub}</span>
                </span>
              ) : null}
              {a.heightCm ? (
                <span className="flex items-center gap-1">
                  <Ruler className="size-4 text-slate-400" /> {(a.heightCm / 100).toFixed(2).replace(".", ",")} m{a.weightKg ? ` · ${a.weightKg} kg` : ""}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {a.phone ? (
              <a href={waLink(a.phone)} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            ) : null}
            <Link href={`/atletas/${a.id}/editar`} className="btn-ghost">
              <Pencil className="size-4" /> Editar
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <StatusSelect id={a.id} value={a.status} />
          <ResponsibleSelect id={a.id} value={a.responsibleId} users={users} />
          <PublicToggle id={a.id} value={a.publicEnabled} />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <AIButton id={a.id} hasContent={hasContent} />
          </div>
        </div>
      </div>

      {novo ? (
        <div className="mb-5 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          <b>Atleta cadastrado!</b> Próximos passos: clique em <b>Organizar com IA</b> para montar a biografia e as listas, depois em <b>Contratar serviços</b> para
          gerar as entregas automaticamente.
        </div>
      ) : null}

      {/* Abas */}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = t.key === "entregas" ? openDel : t.key === "fotos" ? gallery.length : t.key === "financeiro" && due ? brl(due) : null;
          return (
            <Link
              key={t.key}
              href={`/atletas/${a.id}?tab=${t.key}`}
              scroll={false}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-medium transition ${
                active ? "border-brand-600 text-ink-900" : "border-transparent text-slate-500 hover:text-ink-900"
              }`}
            >
              <t.icon className={`size-4 ${active ? "text-brand-600" : ""}`} />
              {t.label}
              {count ? <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-600">{count}</span> : null}
            </Link>
          );
        })}
      </div>

      {tab === "perfil" ? (
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="space-y-5 xl:col-span-2">
            <ReviewPanel athleteId={a.id} review={a.aiReview ?? null} reviewedAt={a.aiReviewedAt ? a.aiReviewedAt.toISOString() : null} stale={reviewStale} />
            {a.aiMissing.length || a.aiTips.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {a.aiMissing.length ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <AlertCircle className="size-4" /> Faltando para um material forte
                      {a.aiScore != null ? <span className="ml-auto rounded-full bg-white px-2 text-xs">nota {a.aiScore}</span> : null}
                    </p>
                    <ul className="list-disc space-y-0.5 pl-5 text-sm text-amber-900">
                      {a.aiMissing.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <RequestDataButton athleteId={a.id} name={a.fullName} phone={isMinor(a.birthDate) ? a.guardianPhone || a.phone : a.phone || a.guardianPhone} sport={a.sport} missing={a.aiMissing} />
                    </div>
                  </div>
                ) : null}
                {a.aiTips.length ? (
                  <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-900">
                      <Lightbulb className="size-4" /> Dicas da IA
                    </p>
                    <ul className="list-disc space-y-0.5 pl-5 text-sm text-violet-900">
                      {a.aiTips.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            <section className="card card-pad">
              <h2 className="section-title mb-3">Biografia</h2>
              {a.bioShort ? <p className="mb-3 text-[15px] font-medium italic text-ink-900">&ldquo;{a.bioShort}&rdquo;</p> : null}
              {a.bio ? (
                <p className="whitespace-pre-line break-words leading-relaxed text-slate-700">{a.bio}</p>
              ) : (
                <p className="text-sm text-slate-500">Sem biografia. Use &quot;Organizar com IA&quot; para gerar a partir dos dados.</p>
              )}
              {a.playingStyle ? (
                <>
                  <h3 className="section-title mb-2 mt-5">Estilo de jogo</h3>
                  <p className="leading-relaxed text-slate-700">{a.playingStyle}</p>
                </>
              ) : null}
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <section className="card card-pad">
                <h2 className="section-title mb-3">Carreira</h2>
                {a.career.length ? (
                  <ol className="relative space-y-4 border-l-2 border-slate-100 pl-4">
                    {a.career.map((c, i) => (
                      <li key={i}>
                        <span className="absolute -left-[7px] mt-1.5 size-3 rounded-full border-2 border-white bg-brand-500" />
                        <p className="font-semibold text-ink-900">{c.club}</p>
                        <p className="text-sm text-slate-500">{[c.period, c.role].filter(Boolean).join(" · ")}</p>
                        {c.highlights ? <p className="text-sm text-slate-600">{c.highlights}</p> : null}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-500">Nenhum clube cadastrado.</p>
                )}
              </section>
              <section className="card card-pad">
                <h2 className="section-title mb-3">Conquistas</h2>
                {a.achievements.length ? (
                  <ul className="space-y-2.5">
                    {a.achievements.map((c, i) => (
                      <li key={i} className="flex gap-3">
                        <Trophy className="mt-0.5 size-4 shrink-0 text-gold-500" />
                        <div>
                          <p className="font-medium text-ink-900">
                            {c.year ? <span className="text-slate-500">{c.year} · </span> : null}
                            {c.title}
                          </p>
                          {c.description ? <p className="text-sm text-slate-500">{c.description}</p> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Nenhuma conquista cadastrada.</p>
                )}
              </section>
            </div>

            {a.stats.length ? (
              <section className="card card-pad">
                <h2 className="section-title mb-3">Números</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {a.stats.map((s, i) => (
                    <div key={i} className="rounded-2xl bg-slate-50 p-3 text-center">
                      <p className="text-2xl font-bold text-ink-900">{s.value}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-5">
            <Readiness athleteId={a.id} r={ready} />
            <section className="card card-pad">
              <h2 className="section-title mb-3">Dados</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {[
                  ["Nascimento", a.birthDate ? `${fmtDate(a.birthDate)}${age !== null ? ` (${age})` : ""}` : null],
                  ["Nacionalidade", [a.nationality, a.secondNationality].filter(Boolean).join(" / ")],
                  [sport.sideLabel ?? "Lado dominante", a.dominantSide],
                  ["WhatsApp", fmtPhone(a.phone)],
                  ["E-mail", a.email],
                  ["Instagram", igHandle(a.instagram)],
                  ["Responsável", a.guardianName ? `${a.guardianName}${a.guardianPhone ? ` · ${fmtPhone(a.guardianPhone)}` : ""}` : null],
                  ["Empresário", a.agent],
                  ["Idiomas", a.languages],
                  ["Origem", a.source],
                  ...sport.fields.map((f) => [f.label, a.sportData?.[f.key]] as [string, string | undefined]),
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-slate-500">{k}</dt>
                      <dd className="whitespace-pre-line break-words font-medium text-ink-900">{v}</dd>
                    </div>
                  ))}
              </dl>
              {a.consentAt ? <p className="mt-3 text-xs text-slate-400">Consentimento LGPD em {fmtDate(a.consentAt)}</p> : null}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <RequestDataButton athleteId={a.id} name={a.fullName} phone={isMinor(a.birthDate) ? a.guardianPhone || a.phone : a.phone || a.guardianPhone} sport={a.sport} label="Pedir atualização ao atleta" />
              </div>
            </section>
            {a.notes ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="mb-1 font-semibold">Observações internas</p>
                <p className="whitespace-pre-line break-words">{a.notes}</p>
              </section>
            ) : null}
            <TextStudio id={a.id} phone={a.phone} />
            <DeleteAthlete id={a.id} name={a.fullName} />
          </div>
        </div>
      ) : null}

      {tab === "entregas" ? (
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <ContractButton athleteId={a.id} packages={packages} services={services} users={users} />
            <AddDeliverable athleteId={a.id} services={services.map((s) => ({ key: s.key, name: s.name }))} />
          </div>
          {deliverables.length === 0 ? (
            <div className="card px-6 py-12 text-center text-slate-500">
              Nenhuma entrega ainda. Clique em <b>Contratar serviços</b>: o sistema cria todas as entregas com prazo e checklist.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {STAGES.map((st) => {
                const list = deliverables.filter((d) => d.stage === st.key);
                return (
                  <div key={st.key} className="rounded-2xl bg-slate-100/70 p-3">
                    <p className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                      <span className="size-2.5 rounded-full" style={{ background: st.color }} />
                      {st.label}
                      <span className="text-slate-400">{list.length}</span>
                    </p>
                    <div className="space-y-3">
                      {list.map((d) => (
                        <DeliverableCard
                          key={d.id}
                          d={d}
                          users={users}
                          showAthlete={false}
                          athlete={{ id: a.id, name: a.nickname || a.fullName, fullName: a.guardianPhone && a.guardianName ? a.guardianName : a.fullName, sport: a.sport, slug: a.slug, phone: a.guardianPhone || a.phone }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {tab === "materiais" ? (
        <>
          <ReviewStrip athleteId={a.id} review={a.aiReview ?? null} stale={reviewStale} />
          <Materials a={a} />
        </>
      ) : null}

      {tab === "artes" ? (
        <SocialArts athleteId={a.id} hasStats={a.stats.length > 0 || !!(a.sportData?.melhores_marcas || a.sportData?.melhores_tempos)} hasAchievements={a.achievements.length > 0} version={String(a.updatedAt.getTime())} />
      ) : null}

      {tab === "divulgacao" ? <Outreach athlete={a} /> : null}

      {tab === "fotos" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <PhotoUpload athleteId={a.id} kind="photo" label="Trocar foto principal" className="btn-primary btn-sm" />
            <PhotoUpload athleteId={a.id} kind="gallery" label="Adicionar fotos à galeria" multiple />
            <PhotoUpload athleteId={a.id} kind="cover" label="Enviar foto de capa" />
          </div>
          <p className="text-sm text-slate-500">
            Dica: a foto principal aparece em todos os currículos (de preferência de rosto, fundo limpo). A capa aparece no topo do portfólio. Fotos são otimizadas
            automaticamente.
          </p>
          <Gallery athleteId={a.id} items={gallery} photoId={a.photoId} coverId={a.coverId} />
        </div>
      ) : null}

      {tab === "financeiro" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <ContractButton athleteId={a.id} packages={packages} services={services} users={users} label="Novo contrato" />
            <a href={`/doc/proposta/${a.id}`} target="_blank" rel="noreferrer" className="btn-ghost">
              <FileText className="size-4" /> Proposta comercial (PDF)
            </a>
          </div>
          {orders.length === 0 ? (
            <div className="card px-6 py-12 text-center text-slate-500">Nenhum contrato ainda.</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {orders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  payments={payments.filter((p) => p.orderId === o.id)}
                  athlete={{ name: a.guardianName || a.fullName, phone: a.guardianPhone || a.phone }}
                  pix={company.pix}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === "historico" ? (
        <div className="card card-pad">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500">Sem histórico.</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((x) => (
                <li key={x.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-slate-700">
                      {users.find((u) => u.id === x.userId)?.name ?? "Sistema"} · {x.message}
                    </p>
                    <p className="text-xs text-slate-400">
                      {relTime(x.createdAt)} · {fmtDate(x.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
