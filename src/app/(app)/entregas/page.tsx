import Link from "next/link";
import { SquareKanban } from "lucide-react";
import { listDeliverables, listServices, listUsers } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { STAGES } from "@/lib/catalog";
import { daysUntil, msSince } from "@/lib/utils";
import { DeliverableCard } from "@/components/work/DeliverableCard";
import { Empty, PageHeader } from "@/components/ui/PageHeader";
import { ServiceSelect } from "./ServiceFilter";

export const metadata = { title: "Entregas" };
export const dynamic = "force-dynamic";

export default async function Entregas({ searchParams }: { searchParams: Promise<{ quem?: string; servico?: string; filtro?: string; ocultar?: string }> }) {
  const sp = await searchParams;
  const s = await requireUser();
  const [rows, users, services] = await Promise.all([listDeliverables(), listUsers(), listServices()]);
  let list = rows;
  if (sp.quem === "eu") list = list.filter((r) => r.d.assigneeId === s.uid);
  else if (sp.quem) list = list.filter((r) => r.d.assigneeId === sp.quem);
  if (sp.servico) list = list.filter((r) => r.d.serviceKey === sp.servico);
  if (sp.filtro === "atrasadas") list = list.filter((r) => r.d.stage !== "entregue" && (daysUntil(r.d.dueDate) ?? 99) < 0);
  // por padrão mostra só entregas concluídas nos últimos 30 dias
  const showAllDone = sp.ocultar === "nao";
  list = list.filter((r) => r.d.stage !== "entregue" || showAllDone || (r.d.deliveredAt && msSince(r.d.deliveredAt) < 30 * 86400000));

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    Object.entries({ ...sp, ...patch }).forEach(([k, v]) => v && p.set(k, v));
    const q = p.toString();
    return q ? `/entregas?${q}` : "/entregas";
  };
  const chip = (active: boolean) => `badge border py-1 ${active ? "border-ink-900 bg-ink-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`;

  return (
    <div>
      <PageHeader title="Entregas" subtitle="Tudo o que está sendo produzido para os atletas, do pedido à entrega." />
      <div className="mb-5 flex flex-wrap items-center gap-1.5">
        <Link href={qs({ quem: undefined })} className={chip(!sp.quem)}>Todos</Link>
        <Link href={qs({ quem: "eu" })} className={chip(sp.quem === "eu")}>Minhas</Link>
        {users.filter((u) => u.id !== s.uid).map((u) => (
          <Link key={u.id} href={qs({ quem: u.id })} className={chip(sp.quem === u.id)}>{u.name}</Link>
        ))}
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <Link href={qs({ filtro: sp.filtro === "atrasadas" ? undefined : "atrasadas" })} className={chip(sp.filtro === "atrasadas")}>Só atrasadas</Link>
        <ServiceSelect
          value={sp.servico}
          services={services.map((x) => ({ key: x.key, name: x.name }))}
          baseQuery={new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "servico") as [string, string][]).toString()}
        />
      </div>
      {rows.length === 0 ? (
        <Empty icon={<SquareKanban className="size-6" />} title="Nenhuma entrega ainda" text="Abra um atleta e clique em Contratar serviços: as entregas aparecem aqui automaticamente." />
      ) : (
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
          {STAGES.map((st) => {
            const col = list.filter((r) => r.d.stage === st.key);
            return (
              <div key={st.key} className="w-[300px] shrink-0 rounded-2xl bg-slate-200/50 p-3 xl:w-auto xl:flex-1">
                <p className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                  <span className="size-2.5 rounded-full" style={{ background: st.color }} />
                  {st.label}
                  <span className="ml-auto rounded-full bg-white px-2 text-xs text-slate-500">{col.length}</span>
                </p>
                <div className="space-y-3">
                  {col.map((r) => (
                    <DeliverableCard
                      key={r.d.id}
                      d={r.d}
                      users={users}
                      compact={st.key === "entregue"}
                      athlete={{ id: r.d.athleteId, name: r.athleteNickname || r.athleteName, sport: r.athleteSport, slug: r.athleteSlug, phone: r.athletePhone, fullName: r.athleteName }}
                    />
                  ))}
                  {col.length === 0 ? <p className="px-1 py-6 text-center text-xs text-slate-400">vazio</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!showAllDone ? (
        <p className="mt-2 text-center text-xs text-slate-400">
          Mostrando entregues dos últimos 30 dias. <Link href={qs({ ocultar: "nao" })} className="underline">Ver todas</Link>
        </p>
      ) : null}
    </div>
  );
}
