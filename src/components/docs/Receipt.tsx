import { and, eq, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { athletes, orders, payments } from "@/db/schema";
import { getCompany, ready } from "@/lib/data";
import { brl, extenso, fmtDate } from "@/lib/utils";
import { PrintButton } from "@/components/resume/PrintButton";
import { Logo } from "@/components/ui/Logo";

export async function loadReceipt(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  await ready();
  const [row] = await db
    .select({ p: payments, o: orders, a: athletes })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .innerJoin(athletes, eq(orders.athleteId, athletes.id))
    .where(eq(payments.id, id))
    .limit(1);
  return row ?? null;
}

/** Recibo de pagamento (usado na versão interna e no link público /r/[id]). */
export async function Receipt({ row, signer, toolbar }: { row: NonNullable<Awaited<ReturnType<typeof loadReceipt>>>; signer?: string; toolbar?: React.ReactNode }) {
  const company = await getCompany();
  const { p, o, a } = row;
  const payer = a.guardianName ? `${a.guardianName} (responsável por ${a.fullName})` : a.fullName;
  const num = p.id.slice(0, 8).toUpperCase();
  // o recibo mostra o saldo da época deste pagamento (pagamentos posteriores não mudam um recibo já enviado)
  const [{ paidUntil }] = await db
    .select({ paidUntil: sql<number>`coalesce(sum(${payments.amountCents}), 0)::int` })
    .from(payments)
    .where(and(eq(payments.orderId, o.id), or(lt(payments.paidAt, p.paidAt), and(eq(payments.paidAt, p.paidAt), sql`${payments.createdAt} <= ${p.createdAt}`))));
  return (
    <div className="min-h-screen bg-slate-200/70 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[794px] flex-wrap items-center justify-end gap-2 px-4">
        {toolbar}
        <PrintButton label="Baixar / imprimir recibo" />
      </div>
      <div className="overflow-x-auto print:overflow-visible">
      <div className="print-page mx-auto w-full max-w-[794px] bg-white px-6 py-8 text-slate-800 shadow-xl sm:px-14 sm:py-12 print:w-[794px] print:max-w-none" style={{ minHeight: 560 }}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-ink-900 pb-5">
          <div>
            <Logo />
            <p className="mt-2 text-xs text-slate-500">{[company.whatsapp, company.email, company.instagram, company.site].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-semibold uppercase tracking-wide text-ink-900">Recibo</p>
            <p className="text-sm text-slate-500">Nº {num}</p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 px-6 py-4 text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">Valor</p>
          <p className="font-display text-4xl font-semibold text-ink-900">{brl(p.amountCents)}</p>
        </div>
        <p className="mt-8 text-[15px] leading-8">
          Recebemos de <b>{payer}</b> a importância de <b>{brl(p.amountCents)}</b> ({extenso(p.amountCents)}), referente a <b>{o.title}</b>
          {p.method ? (
            <>
              , pago via <b>{p.method}</b>
            </>
          ) : null}
          , em {fmtDate(p.paidAt)}.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Valor total do contrato: {brl(o.totalCents)} · Total pago até esta data: {brl(paidUntil)}
          {o.totalCents > paidUntil ? ` · Saldo: ${brl(o.totalCents - paidUntil)}` : " · Quitado"}
        </p>
        <p className="mt-3 text-sm text-slate-500">Para clareza, firmamos o presente recibo.</p>
        <div className="mt-16 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-slate-600">{fmtDate(p.paidAt, { day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="w-full border-t border-slate-400 pt-2 text-center text-sm sm:w-72">
            <p className="font-semibold">{company.name}</p>
            {signer ? <p className="text-xs text-slate-500">{signer}</p> : null}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
