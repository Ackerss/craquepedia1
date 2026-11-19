"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { CalendarDays, CheckSquare, ChevronRight, ExternalLink, Pencil, Square, Trash2 } from "lucide-react";
import type { Deliverable } from "@/db/schema";
import { deleteDeliverable, moveDeliverable, toggleChecklistItem, updateDeliverable } from "@/actions/work";
import { STAGES } from "@/lib/catalog";
import { daysUntil, fmtDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { FormMessage, Submit } from "@/components/ui/Submit";

type U = { id: string; name: string; color: string };

export function DueBadge({ date, done }: { date?: string | null; done?: boolean }) {
  if (!date) return null;
  const n = daysUntil(date) ?? 0;
  const cls = done
    ? "bg-slate-100 text-slate-500"
    : n < 0
      ? "bg-red-50 text-red-600"
      : n <= 1
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span className={`badge ${cls}`}>
      <CalendarDays className="size-3" />
      {done ? fmtDate(date, { day: "2-digit", month: "2-digit" }) : n < 0 ? `${-n}d atrasada` : n === 0 ? "hoje" : n === 1 ? "amanhã" : fmtDate(date, { day: "2-digit", month: "2-digit" })}
    </span>
  );
}

export function EditDeliverable({ d, users, open, onClose }: { d: Deliverable; users: U[]; open: boolean; onClose: () => void }) {
  const [state, action] = useActionState(updateDeliverable.bind(null, d.id), null);
  const [pending, start] = useTransition();
  return (
    <Modal open={open} onClose={onClose} title="Editar entrega">
      <form
        action={async (fd) => {
          await action(fd);
          onClose();
        }}
        className="space-y-3"
      >
        <div>
          <label className="label">Título</label>
          <input name="title" defaultValue={d.title} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Responsável</label>
            <select name="assigneeId" defaultValue={d.assigneeId ?? ""} className="input">
              <option value="">—</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Prazo</label>
            <input name="dueDate" type="date" defaultValue={d.dueDate ?? ""} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Etapa</label>
          <select name="stage" defaultValue={d.stage} className="input">
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Link do material (Drive, YouTube...)</label>
          <input name="link" defaultValue={d.link ?? ""} className="input" placeholder="https://" />
        </div>
        <div>
          <label className="label">Observações</label>
          <textarea name="notes" defaultValue={d.notes ?? ""} className="input" rows={3} />
        </div>
        <FormMessage state={state as { error?: string } | null} />
        <div className="flex justify-between gap-2 pt-2">
          <button type="button" className="btn-danger btn-sm" disabled={pending} onClick={() => start(async () => { await deleteDeliverable(d.id); onClose(); })}>
            <Trash2 className="size-4" /> Excluir
          </button>
          <Submit>Salvar</Submit>
        </div>
      </form>
    </Modal>
  );
}

export function DeliverableCard({
  d,
  users,
  athlete,
  compact = false,
}: {
  d: Deliverable;
  users: U[];
  athlete?: { name: string; id: string; emoji: string };
  compact?: boolean;
}) {
  const [edit, setEdit] = useState(false);
  const [pending, start] = useTransition();
  const user = users.find((u) => u.id === d.assigneeId);
  const idx = STAGES.findIndex((s) => s.key === d.stage);
  const next = STAGES[idx + 1];
  const done = d.checklist.filter((c) => c.done).length;
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {athlete ? (
            <Link href={`/atletas/${athlete.id}?tab=entregas`} className="mb-0.5 block truncate text-xs font-semibold text-brand-700 hover:underline">
              {athlete.emoji} {athlete.name}
            </Link>
          ) : null}
          <p className="text-[15px] font-semibold leading-snug text-ink-900">{d.title}</p>
        </div>
        <button onClick={() => setEdit(true)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Editar entrega">
          <Pencil className="size-4" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <DueBadge date={d.dueDate} done={d.stage === "entregue"} />
        {user ? (
          <span className="badge text-white" style={{ background: user.color }}>
            {user.name}
          </span>
        ) : null}
        {d.checklist.length ? (
          <span className="badge bg-slate-100 text-slate-600">
            <CheckSquare className="size-3" /> {done}/{d.checklist.length}
          </span>
        ) : null}
        {d.link ? (
          <a href={d.link} target="_blank" rel="noreferrer" className="badge bg-blue-50 text-blue-700">
            <ExternalLink className="size-3" /> link
          </a>
        ) : null}
      </div>
      {!compact && d.checklist.length ? (
        <ul className="mt-3 space-y-1">
          {d.checklist.map((c, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => start(() => toggleChecklistItem(d.id, i))}
                className="flex w-full items-start gap-2 rounded-lg px-1 py-0.5 text-left text-sm hover:bg-slate-50"
              >
                {c.done ? <CheckSquare className="mt-0.5 size-4 shrink-0 text-brand-600" /> : <Square className="mt-0.5 size-4 shrink-0 text-slate-300" />}
                <span className={c.done ? "text-slate-400 line-through" : "text-slate-700"}>{c.text}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {d.notes && !compact ? <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-900">{d.notes}</p> : null}
      {next ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => moveDeliverable(d.id, next.key))}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
        >
          Mover para {next.label} <ChevronRight className="size-3.5" />
        </button>
      ) : null}
      <EditDeliverable d={d} users={users} open={edit} onClose={() => setEdit(false)} />
    </div>
  );
}
