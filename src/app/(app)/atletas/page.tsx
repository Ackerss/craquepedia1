import Link from "next/link";
import { Download, Plus, Search, Users } from "lucide-react";
import { listAthletes } from "@/lib/data";
import { ATHLETE_STATUS } from "@/lib/catalog";
import { getSport, SPORTS } from "@/lib/sports";
import { ageFrom } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Empty, PageHeader } from "@/components/ui/PageHeader";
import { SportIcon } from "@/components/ui/SportIcon";

export const metadata = { title: "Atletas" };
export const dynamic = "force-dynamic";

export default async function Atletas({ searchParams }: { searchParams: Promise<{ q?: string; esporte?: string; status?: string }> }) {
  const sp = await searchParams;
  const list = await listAthletes({ q: sp.q, sport: sp.esporte, status: sp.status });
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: sp.q, esporte: sp.esporte, status: sp.status, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/atletas?${s}` : "/atletas";
  };
  return (
    <div>
      <PageHeader
        title="Atletas"
        subtitle={`${list.length} ${list.length === 1 ? "atleta" : "atletas"}`}
        actions={
          <>
            <a href="/api/exportar?tipo=atletas" className="btn-ghost" title="Baixar planilha com todos os atletas">
              <Download className="size-4" /> Planilha
            </a>
            <Link href="/atletas/novo" className="btn-primary">
              <Plus className="size-4" /> Novo atleta
            </Link>
          </>
        }
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <form className="relative flex-1" action="/atletas">
          {sp.esporte ? <input type="hidden" name="esporte" value={sp.esporte} /> : null}
          {sp.status ? <input type="hidden" name="status" value={sp.status} /> : null}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={sp.q} placeholder="Buscar por nome, clube ou cidade" className="input pl-10" />
        </form>
        <div className="flex flex-wrap gap-1.5">
          <Link href={qs({ status: undefined })} className={`badge border ${!sp.status ? "border-ink-900 bg-ink-900 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
            Todos
          </Link>
          {ATHLETE_STATUS.map((s) => (
            <Link key={s.key} href={qs({ status: s.key })} className={`badge border ${sp.status === s.key ? "border-ink-900 bg-ink-900 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        <Link href={qs({ esporte: undefined })} className={`badge shrink-0 border py-1 ${!sp.esporte ? "border-brand-500 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"}`}>
          Todos os esportes
        </Link>
        {SPORTS.map((s) => (
          <Link key={s.slug} href={qs({ esporte: s.slug })} className={`badge shrink-0 border py-1 ${sp.esporte === s.slug ? "border-brand-500 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"}`}>
            <SportIcon sport={s.slug} className="size-3.5" style={{ color: s.color }} /> {s.name}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty
          icon={<Users className="size-6" />}
          title={sp.q || sp.esporte || sp.status ? "Nenhum atleta encontrado" : "Nenhum atleta cadastrado ainda"}
          text="Cadastre manualmente ou envie o formulário para o atleta preencher pelo celular."
          action={
            <div className="flex gap-2">
              <Link href="/formularios?novo=1" className="btn-ghost">Enviar formulário</Link>
              <Link href="/atletas/novo" className="btn-primary">Cadastrar</Link>
            </div>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {list.map((a) => {
            const sport = getSport(a.sport);
            const st = ATHLETE_STATUS.find((s) => s.key === a.status);
            const age = ageFrom(a.birthDate);
            const pct = a.deliveriesTotal ? Math.round((a.deliveriesDone / a.deliveriesTotal) * 100) : 0;
            return (
              <Link key={a.id} href={`/atletas/${a.id}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative h-20 overflow-hidden bg-ink-950" style={{ background: `linear-gradient(120deg, ${sport.color}, #070b14 70%)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sport.image} alt="" className="absolute right-0 top-1/2 h-[180%] w-auto -translate-y-1/2 object-cover opacity-90 transition duration-500 [mask-image:linear-gradient(90deg,transparent,black_45%)] group-hover:scale-105" />
                  <span className="absolute left-3 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
                    <SportIcon sport={sport.slug} className="size-3.5" /> {sport.name}
                  </span>
                </div>
                <div className="relative -mt-8 px-4 pb-4">
                  <Avatar name={a.fullName} photoId={a.photoId} size={64} color={sport.color} className="ring-4" />
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-ink-900">{a.nickname || a.fullName}</p>
                      <p className="truncate text-sm text-slate-500">
                        {[a.position, age ? `${age} anos` : null].filter(Boolean).join(" · ") || sport.name}
                      </p>
                    </div>
                    {st ? <Badge color={st.color}>{st.label}</Badge> : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">{[a.currentClub, [a.city, a.state].filter(Boolean).join("/")].filter(Boolean).join(" · ") || " "}</p>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>Entregas</span>
                      <span>{a.deliveriesTotal ? `${a.deliveriesDone}/${a.deliveriesTotal}` : "nenhuma"}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
