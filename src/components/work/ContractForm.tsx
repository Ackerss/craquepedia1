"use client";

import { useActionState, useMemo, useState } from "react";
import { BadgeCheck, Plus } from "lucide-react";
import type { Package, Service } from "@/db/schema";
import { contractServices } from "@/actions/work";
import { brl } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { FormMessage, Submit } from "@/components/ui/Submit";
import { keepValues } from "@/lib/form-submit";

export function ContractButton({
  athleteId,
  packages,
  services,
  users,
  label = "Contratar serviços",
  className = "btn-primary",
}: {
  athleteId: string;
  packages: Package[];
  services: Service[];
  users: { id: string; name: string }[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pkg, setPkg] = useState<string>(packages.find((p) => p.highlight)?.id ?? packages[0]?.id ?? "");
  const [extra, setExtra] = useState<string[]>([]);
  const [state, action, isPending] = useActionState(
    async (prev: unknown, fd: FormData) => {
      const r = await contractServices(athleteId, prev, fd);
      if (r?.ok) setOpen(false);
      return r;
    },
    null,
  );
  const selected = packages.find((p) => p.id === pkg);
  const included = useMemo(() => new Set(selected?.serviceKeys ?? []), [selected]);
  const suggested = (selected?.priceCents ?? 0) + services.filter((s) => extra.includes(s.key) && !included.has(s.key)).reduce((s, x) => s + x.priceCents, 0);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <Plus className="size-4" /> {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Contratar serviços" wide>
        <form onSubmit={keepValues(action)} className="space-y-5">
          <input type="hidden" name="packageId" value={pkg} />
          <div>
            <p className="section-title mb-2">1. Pacote</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPkg("")}
                className={`rounded-2xl border p-3 text-left transition ${pkg === "" ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10" : "border-slate-200 hover:border-slate-300"}`}
              >
                <p className="font-semibold">Avulso</p>
                <p className="text-sm text-slate-500">Escolher serviços um a um</p>
              </button>
              {packages.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPkg(p.id)}
                  className={`rounded-2xl border p-3 text-left transition ${pkg === p.id ? "border-brand-500 bg-brand-50 ring-4 ring-brand-500/10" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{p.name}</p>
                    <p className="font-bold text-brand-700">{brl(p.priceCents)}</p>
                  </div>
                  <p className="text-sm text-slate-500">{p.description}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-title mb-2">2. Serviços {pkg ? "(inclusos + extras)" : ""}</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {services.filter((s) => s.active).map((s) => {
                const inc = included.has(s.key);
                return (
                  <label key={s.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm ${inc ? "border-brand-200 bg-brand-50/60" : "border-slate-200"}`}>
                    {inc ? (
                      <BadgeCheck className="size-4 text-brand-600" />
                    ) : (
                      <input
                        type="checkbox"
                        name="services"
                        value={s.key}
                        checked={extra.includes(s.key)}
                        onChange={(e) => setExtra((x) => (e.target.checked ? [...x, s.key] : x.filter((k) => k !== s.key)))}
                        className="size-4 accent-emerald-600"
                      />
                    )}
                    <span className="flex-1">{s.name}</span>
                    <span className="text-slate-500">{inc ? "incluso" : brl(s.priceCents)}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <p className="section-title mb-2">3. Valores e prazos</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Valor total (R$)</label>
                <input name="total" key={suggested} defaultValue={(suggested / 100).toFixed(2).replace(".", ",")} className="input" inputMode="decimal" />
              </div>
              <div>
                <label className="label">Já recebido agora (R$)</label>
                <input name="paidNow" className="input" inputMode="decimal" placeholder="0,00" />
              </div>
              <div>
                <label className="label">Forma de pagamento</label>
                <select name="paymentMethod" className="input">
                  <option>Pix</option>
                  <option>Cartão</option>
                  <option>Dinheiro</option>
                  <option>Boleto</option>
                  <option>Transferência</option>
                </select>
              </div>
              <div>
                <label className="label">Vencimento</label>
                <input name="dueDate" type="date" className="input" />
              </div>
              <div>
                <label className="label">Responsável pelas entregas</label>
                <select name="assigneeId" className="input">
                  <option value="">Responsável do atleta</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Observação</label>
                <input name="notes" className="input" />
              </div>
            </div>
          </div>
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Ao confirmar, o sistema cria automaticamente uma entrega para cada serviço, com prazo, responsável e checklist, e registra o valor no financeiro.
          </p>
          <FormMessage state={state as { error?: string } | null} />
          <div className="flex justify-end">
            <Submit pending={isPending} pendingText="Criando entregas...">Confirmar contratação</Submit>
          </div>
        </form>
      </Modal>
    </>
  );
}
