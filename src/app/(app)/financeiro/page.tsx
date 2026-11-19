import Link from "next/link";
import { Wallet } from "lucide-react";
import { listOrders, listPaymentsSince } from "@/lib/data";
import { ORDER_STATUS } from "@/lib/catalog";
import { brl, daysUntil, fmtDate, todayISO, waLink, firstName } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Empty, PageHeader } from "@/components/ui/PageHeader";
import { PaymentButton } from "@/components/work/OrderCard";

export const metadata = { title: "Financeiro" };
export const dynamic = "force-dynamic";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function Financeiro() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);
  const [orders, pays] = await Promise.all([listOrders(), listPaymentsSince(start)]);
  const monthKey = todayISO().slice(0, 7);
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: MONTHS[d.getMonth()], total: pays.filter((p) => p.p.paidAt.startsWith(key)).reduce((s, p) => s + p.p.amountCents, 0) };
  });
  const max = Math.max(1, ...months.map((m) => m.total));
  const receivedMonth = months[5].total;
  const open = orders.filter((o) => o.o.status === "aberto" || o.o.status === "parcial");
  const toReceive = open.reduce((s, o) => s + o.o.totalCents - o.o.paidCents, 0);
  const soldMonth = orders.filter((o) => o.o.status !== "cancelado" && o.o.createdAt.toISOString().startsWith(monthKey));
  const valid = orders.filter((o) => o.o.status !== "cancelado");
  const ticket = valid.length ? valid.reduce((s, o) => s + o.o.totalCents, 0) / valid.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" subtitle="Contratos, recebimentos e quem ainda falta pagar." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Recebido no mês", brl(receivedMonth), "text-brand-700"],
          ["A receber", brl(toReceive), "text-amber-600"],
          ["Vendido no mês", `${brl(soldMonth.reduce((s, o) => s + o.o.totalCents, 0))}`, "text-ink-900"],
          ["Ticket médio", brl(ticket), "text-ink-900"],
        ].map(([l, v, c]) => (
          <div key={l} className="card card-pad">
            <p className={`text-2xl font-bold tracking-tight ${c}`}>{v}</p>
            <p className="text-sm text-slate-500">{l}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card card-pad">
          <h2 className="mb-4 font-semibold">Recebimentos — últimos 6 meses</h2>
          <div className="flex h-48 items-end gap-3">
            {months.map((m) => (
              <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[11px] font-medium text-slate-500">{m.total ? brl(m.total).replace(",00", "") : ""}</span>
                <div className="w-full rounded-t-lg bg-brand-500" style={{ height: `${Math.max(2, (m.total / max) * 150)}px`, opacity: m.key === monthKey ? 1 : 0.55 }} />
                <span className="text-xs text-slate-500">{m.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card xl:col-span-2">
          <h2 className="border-b border-slate-100 px-5 py-4 font-semibold">A receber ({open.length})</h2>
          {open.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">Nada pendente. 🎉</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {open.map(({ o, athleteName, athleteId, athletePhone }) => {
                const n = daysUntil(o.dueDate);
                const remaining = o.totalCents - o.paidCents;
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/atletas/${athleteId}?tab=financeiro`} className="font-medium text-ink-900 hover:underline">
                        {athleteName}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {o.title} · falta <b className="text-ink-900">{brl(remaining)}</b>
                        {o.dueDate ? ` · vence ${fmtDate(o.dueDate)}` : ""}
                      </p>
                    </div>
                    {n !== null && n < 0 ? <Badge color="#dc2626">vencido</Badge> : null}
                    {athletePhone ? (
                      <a
                        className="btn-ghost btn-sm"
                        target="_blank"
                        rel="noreferrer"
                        href={waLink(athletePhone, `Oi ${firstName(athleteName)}! Tudo bem? Passando para lembrar do pagamento de ${brl(remaining)} referente a ${o.title}. Qualquer dúvida estou à disposição! 🙏`)}
                      >
                        Cobrar no WhatsApp
                      </a>
                    ) : null}
                    <PaymentButton order={o} small />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="border-b border-slate-100 px-5 py-4 font-semibold">Todos os contratos</h2>
        {orders.length === 0 ? (
          <Empty icon={<Wallet className="size-6" />} title="Nenhum contrato ainda" text="Contratos são criados na página do atleta, em Contratar serviços." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Data</th>
                  <th className="px-5 py-2.5 font-semibold">Atleta</th>
                  <th className="px-5 py-2.5 font-semibold">Contrato</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Recebido</th>
                  <th className="px-5 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(({ o, athleteName, athleteId }) => {
                  const st = ORDER_STATUS.find((s) => s.key === o.status);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-2.5 text-slate-500">{fmtDate(o.createdAt)}</td>
                      <td className="px-5 py-2.5">
                        <Link href={`/atletas/${athleteId}?tab=financeiro`} className="font-medium hover:underline">
                          {athleteName}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-slate-600">{o.title}</td>
                      <td className="px-5 py-2.5 text-right font-medium">{brl(o.totalCents)}</td>
                      <td className="px-5 py-2.5 text-right text-brand-700">{brl(o.paidCents)}</td>
                      <td className="px-5 py-2.5">{st ? <Badge color={st.color}>{st.label}</Badge> : null}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
