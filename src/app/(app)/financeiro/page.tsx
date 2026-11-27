import Link from "next/link";
import { Download, FileText, MessageCircle, Wallet } from "lucide-react";
import { getCompany, listOrders, listPaymentsSince } from "@/lib/data";
import { chargeMessage } from "@/lib/messages";
import { ORDER_STATUS } from "@/lib/catalog";
import { brl, daysUntil, fmtDate, isoInTZ, todayISO, waLink } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Empty, PageHeader } from "@/components/ui/PageHeader";
import { PaymentButton } from "@/components/work/OrderCard";

export const metadata = { title: "Financeiro" };
export const dynamic = "force-dynamic";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function Financeiro() {
  const today = todayISO();
  const [cy, cm] = today.split("-").map(Number);
  const monthOf = (back: number) => {
    const d = new Date(Date.UTC(cy, cm - 1 - back, 1));
    return { key: d.toISOString().slice(0, 7), month: d.getUTCMonth() };
  };
  const start = monthOf(5).key + "-01";
  const [orders, pays, company] = await Promise.all([listOrders(), listPaymentsSince(start), getCompany()]);
  const monthKey = today.slice(0, 7);
  const months = Array.from({ length: 6 }, (_, i) => {
    const { key, month } = monthOf(5 - i);
    return { key, label: MONTHS[month], total: pays.filter((p) => p.p.paidAt.startsWith(key)).reduce((s, p) => s + p.p.amountCents, 0) };
  });
  const max = Math.max(1, ...months.map((m) => m.total));
  const receivedMonth = months[5].total;
  const open = orders.filter((o) => o.o.status === "aberto" || o.o.status === "parcial");
  const toReceive = open.reduce((s, o) => s + o.o.totalCents - o.o.paidCents, 0);
  const soldMonth = orders.filter((o) => o.o.status !== "cancelado" && isoInTZ(o.o.createdAt).startsWith(monthKey));
  const valid = orders.filter((o) => o.o.status !== "cancelado");
  const ticket = valid.length ? valid.reduce((s, o) => s + o.o.totalCents, 0) / valid.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        subtitle="Contratos, recebimentos e quem ainda falta pagar."
        actions={
          <a href="/api/exportar?tipo=financeiro" className="btn-ghost">
            <Download className="size-4" /> Exportar planilha
          </a>
        }
      />
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
              {open.map(({ o, athleteName, athleteId, athletePhone, guardianName, guardianPhone }) => {
                const n = daysUntil(o.dueDate);
                // quem paga: o responsável (quando tem), senão o próprio atleta
                const payPhone = guardianPhone || athletePhone;
                const payName = guardianPhone && guardianName ? guardianName : athleteName;
                const remaining = o.totalCents - o.paidCents;
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <div className="min-w-[12rem] flex-1">
                      <Link href={`/atletas/${athleteId}?tab=financeiro`} className="font-medium text-ink-900 hover:underline">
                        {athleteName}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {o.title} · falta <b className="text-ink-900">{brl(remaining)}</b>
                        {o.dueDate ? ` · vence ${fmtDate(o.dueDate)}` : ""}
                      </p>
                    </div>
                    {n !== null && n < 0 ? <Badge color="#dc2626">vencido</Badge> : null}
                    {payPhone ? (
                      <a className="btn-ghost btn-sm" target="_blank" rel="noreferrer" href={waLink(payPhone, chargeMessage(payName, remaining, o.title, company.pix))}>
                        <MessageCircle className="size-4" /> Cobrar
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

      {pays.length ? (
        <section className="card">
          <h2 className="border-b border-slate-100 px-5 py-4 font-semibold">Últimos recebimentos</h2>
          <ul className="divide-y divide-slate-100">
            {pays.slice(0, 8).map(({ p, title, athleteName, athleteId }) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-2.5 text-sm">
                <span className="w-20 shrink-0 text-slate-500">{fmtDate(p.paidAt)}</span>
                <Link href={`/atletas/${athleteId}?tab=financeiro`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                  {athleteName} <span className="font-normal text-slate-500">· {title}{p.method ? ` · ${p.method}` : ""}</span>
                </Link>
                <span className="font-semibold text-brand-700">+ {brl(p.amountCents)}</span>
                <a href={`/doc/recibo/${p.id}`} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">
                  <FileText className="size-4" /> Recibo
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
