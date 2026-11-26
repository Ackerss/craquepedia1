import { eq } from "drizzle-orm";
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
  return (
    <div className="min-h-screen bg-slate-200/70 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[794px] flex-wrap items-center justify-end gap-2 px-4">
        {toolbar}
        <PrintButton label="Baixar / imprimir recibo" />
      </div>
      <div className="overflow-x-auto print:overflow-visible">
      <div className="print-page mx-auto bg-white px-14 py-12 text-slate-800 shadow-xl" style={{ width: 794, minHeight: 560 }}>
        <div className="flex items-start justify-between border-b-2 border-ink-900 pb-5">
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
          Valor total do contrato: {brl(o.totalCents)} · Total pago até agora: {brl(o.paidCents)}
          {o.totalCents > o.paidCents ? ` · Saldo: ${brl(o.totalCents - o.paidCents)}` : " · Quitado"}
        </p>
        <p className="mt-3 text-sm text-slate-500">Para clareza, firmamos o presente recibo.</p>
        <div className="mt-16 flex items-end justify-between gap-10">
          <p className="text-sm text-slate-600">{fmtDate(p.paidAt, { day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="w-72 border-t border-slate-400 pt-2 text-center text-sm">
            <p className="font-semibold">{company.name}</p>
            {signer ? <p className="text-xs text-slate-500">{signer}</p> : null}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
