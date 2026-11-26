"use client";

import { useActionState, useState, useTransition } from "react";
import { Ban, HandCoins, MessageCircle, Pencil, Trash2 } from "lucide-react";
import type { Order, Payment } from "@/db/schema";
import { addPayment, cancelOrder, deletePayment, updateOrderTotal } from "@/actions/work";
import { ORDER_STATUS } from "@/lib/catalog";
import { brl, fmtDate, todayISO, waLink } from "@/lib/utils";
import { chargeMessage } from "@/lib/messages";
import { keepValues } from "@/lib/form-submit";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FormMessage, Submit } from "@/components/ui/Submit";

export function PaymentButton({ order, small = false }: { order: Order; small?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(async (p: unknown, fd: FormData) => {
    const r = await addPayment(order.id, p, fd);
    if (r?.ok) setOpen(false);
    return r;
  }, null);
  const remaining = Math.max(0, order.totalCents - order.paidCents);
  return (
    <>
      <button type="button" className={small ? "btn-ghost btn-sm" : "btn-primary btn-sm"} onClick={() => setOpen(true)}>
        <HandCoins className="size-4" /> Registrar pagamento
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Pagamento — ${order.title}`}>
        <form onSubmit={keepValues(action)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor (R$)</label>
              <input name="amount" className="input" inputMode="decimal" defaultValue={(remaining / 100).toFixed(2).replace(".", ",")} />
            </div>
            <div>
              <label className="label">Data</label>
              <input name="paidAt" type="date" className="input" defaultValue={todayISO()} />
            </div>
          </div>
          <div>
            <label className="label">Forma</label>
            <select name="method" className="input" defaultValue={order.paymentMethod ?? "Pix"}>
              <option>Pix</option>
              <option>Cartão</option>
              <option>Dinheiro</option>
              <option>Boleto</option>
              <option>Transferência</option>
            </select>
          </div>
          <FormMessage state={state as { error?: string } | null} />
          <Submit pending={isPending} pendingText="Registrando..." className="btn-primary w-full">Registrar</Submit>
        </form>
      </Modal>
    </>
  );
}

function EditOrder({ order, open, onClose }: { order: Order; open: boolean; onClose: () => void }) {
  const [state, action, isPending] = useActionState(async (p: unknown, fd: FormData) => {
    const r = await updateOrderTotal(order.id, p, fd);
    if (r?.ok) onClose();
    return r;
  }, null);
  return (
    <Modal open={open} onClose={onClose} title={`Ajustar contrato — ${order.title}`}>
      <form onSubmit={keepValues(action)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Valor total (R$)</label>
            <input name="total" className="input" inputMode="decimal" defaultValue={(order.totalCents / 100).toFixed(2).replace(".", ",")} />
          </div>
          <div>
            <label className="label">Vencimento</label>
            <input name="dueDate" type="date" className="input" defaultValue={order.dueDate ?? ""} />
          </div>
        </div>
        <div>
          <label className="label">Observação</label>
          <input name="notes" className="input" defaultValue={order.notes ?? ""} />
        </div>
        <FormMessage state={state as { error?: string } | null} />
        <Submit pending={isPending} className="btn-primary w-full">Salvar</Submit>
      </form>
    </Modal>
  );
}

export function OrderCard({ order, payments, athlete, pix }: { order: Order; payments: Payment[]; athlete?: { name: string; phone?: string | null }; pix?: string }) {
  const st = ORDER_STATUS.find((s) => s.key === order.status);
  const [pending, start] = useTransition();
  const [edit, setEdit] = useState(false);
  const remaining = Math.max(0, order.totalCents - order.paidCents);
  const pct = order.totalCents ? Math.min(100, Math.round((order.paidCents / order.totalCents) * 100)) : 100;
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{order.title}</p>
          <p className="text-sm text-slate-500">
            Criado em {fmtDate(order.createdAt)}
            {order.dueDate ? ` · vence ${fmtDate(order.dueDate)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {st ? <Badge color={st.color}>{st.label}</Badge> : null}
          {order.status !== "cancelado" ? (
            <button type="button" onClick={() => setEdit(true)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Ajustar contrato" title="Ajustar valor / vencimento">
              <Pencil className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      {order.notes ? <p className="mt-1 text-sm text-slate-500">{order.notes}</p> : null}
      <div className="mt-3 flex items-end justify-between text-sm">
        <span className="text-slate-500">
          Recebido <b className="text-ink-900">{brl(order.paidCents)}</b> de {brl(order.totalCents)}
        </span>
        <span className="font-semibold text-slate-600">{pct}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
      {payments.length ? (
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {payments.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span>
                {fmtDate(p.paidAt)} · {p.method}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-medium text-brand-700">+ {brl(p.amountCents)}</span>
                <a href={`/doc/recibo/${p.id}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-ink-900 hover:underline">
                  recibo
                </a>
                <button
                  type="button"
                  disabled={pending}
                  className="rounded p-0.5 text-slate-300 hover:text-red-600"
                  aria-label="Apagar pagamento"
                  title="Apagar pagamento lançado errado"
                  onClick={() => {
                    if (confirm(`Apagar o pagamento de ${brl(p.amountCents)} de ${fmtDate(p.paidAt)}? O contrato é recalculado.`)) start(() => deletePayment(p.id));
                  }}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {order.status !== "pago" && order.status !== "cancelado" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <PaymentButton order={order} />
          {athlete?.phone && remaining > 0 ? (
            <a className="btn-ghost btn-sm" target="_blank" rel="noreferrer" href={waLink(athlete.phone, chargeMessage(athlete.name, remaining, order.title, pix))}>
              <MessageCircle className="size-4" /> Cobrar
            </a>
          ) : null}
          <button
            type="button"
            className="btn-ghost btn-sm ml-auto text-slate-500"
            disabled={pending}
            onClick={() => {
              if (confirm(`Cancelar "${order.title}"? As entregas desse contrato que ainda não começaram saem do quadro.`)) start(() => cancelOrder(order.id));
            }}
          >
            <Ban className="size-4" /> Cancelar
          </button>
        </div>
      ) : null}
      <EditOrder order={order} open={edit} onClose={() => setEdit(false)} />
    </div>
  );
}
