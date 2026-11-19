"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Col = { key: string; label: string; placeholder?: string; width?: string; textarea?: boolean };

export function ListEditor<T extends Record<string, string | undefined>>({
  name,
  initial,
  columns,
  addLabel,
  suggestions,
}: {
  name: string;
  initial: T[];
  columns: Col[];
  addLabel: string;
  suggestions?: string[];
}) {
  const empty = () => Object.fromEntries(columns.map((c) => [c.key, ""])) as T;
  const [rows, setRows] = useState<T[]>(initial?.length ? initial : []);
  const set = (i: number, k: string, v: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const n = [...r];
      const j = i + d;
      if (j < 0 || j >= n.length) return r;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const clean = rows.filter((r) => Object.values(r).some((v) => (v ?? "").toString().trim()));
  const unused = suggestions?.filter((s) => !rows.some((r) => r[columns[0].key] === s)) ?? [];

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(clean)} />
      {rows.map((row, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-12">
            {columns.map((c) => (
              <div key={c.key} className={c.width ?? "sm:col-span-6"}>
                {c.textarea ? (
                  <textarea
                    className="input min-h-[44px] py-2 text-sm"
                    rows={1}
                    placeholder={c.placeholder ?? c.label}
                    value={row[c.key] ?? ""}
                    onChange={(e) => set(i, c.key, e.target.value)}
                    aria-label={c.label}
                  />
                ) : (
                  <input
                    className="input py-2 text-sm"
                    placeholder={c.placeholder ?? c.label}
                    value={row[c.key] ?? ""}
                    onChange={(e) => set(i, c.key, e.target.value)}
                    aria-label={c.label}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex shrink-0 flex-col gap-0.5">
            <button type="button" onClick={() => move(i, -1)} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Subir">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" onClick={() => move(i, 1)} className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700" aria-label="Descer">
              <ArrowDown className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
              className="rounded p-1 text-slate-400 hover:bg-white hover:text-red-600"
              aria-label="Remover"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setRows((r) => [...r, empty()])} className="btn-ghost btn-sm">
          <Plus className="size-4" /> {addLabel}
        </button>
        {unused.slice(0, 6).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRows((r) => [...r, { ...empty(), [columns[0].key]: s }])}
            className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-500 hover:border-brand-400 hover:text-brand-700"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}
