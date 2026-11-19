"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, CheckCircle2, Circle, Maximize2, X } from "lucide-react";

const KEY = "cq-manual-ok";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function useDone() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  const set = new Set(raw ? raw.split(",") : []);
  const toggle = (k: string) => {
    if (set.has(k)) set.delete(k);
    else set.add(k);
    try {
      localStorage.setItem(KEY, [...set].join(","));
    } catch {}
    listeners.forEach((l) => l());
  };
  return { done: set, toggle };
}

/** Marca da etapa na trilha (✓ quando a pessoa marcou como entendida). */
export function RailMark({ k, n, active }: { k: string; n: number; active: boolean }) {
  const { done } = useDone();
  const ok = done.has(k);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);
  return (
    <span
      ref={ref}
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
        active ? "bg-brand-600 text-white ring-4 ring-brand-100" : ok ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {ok && !active ? <Check className="size-4" /> : n}
    </span>
  );
}

export function Progress({ keys }: { keys: string[] }) {
  const { done } = useDone();
  const n = keys.filter((k) => done.has(k)).length;
  const pct = Math.round((n / keys.length) * 100);
  return (
    <div className="w-full max-w-xs">
      <div className="mb-1 flex justify-between text-xs font-semibold text-white/80">
        <span>Seu progresso</span>
        <span>
          {n} de {keys.length} etapas
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-brand-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function UnderstoodButton({ k }: { k: string }) {
  const { done, toggle } = useDone();
  const ok = done.has(k);
  return (
    <button type="button" onClick={() => toggle(k)} className={ok ? "btn-ghost" : "btn-dark"}>
      {ok ? <CheckCircle2 className="size-4 text-brand-600" /> : <Circle className="size-4" />}
      {ok ? "Etapa entendida" : "Marcar como entendida"}
    </button>
  );
}

export function ZoomImage({ src, caption }: { src: string; caption: string }) {
  const [open, setOpen] = useState(false);
  return (
    <figure>
      <button type="button" onClick={() => setOpen(true)} className="group relative block w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption} loading="lazy" className="w-full transition group-hover:scale-[1.01]" />
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-ink-900/70 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
          <Maximize2 className="size-3.5" /> Ampliar
        </span>
      </button>
      <figcaption className="mt-1.5 text-sm text-slate-500">{caption}</figcaption>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/85 p-3 sm:p-8" onClick={() => setOpen(false)}>
          <button type="button" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Fechar">
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={caption} className="max-h-full max-w-full rounded-xl shadow-2xl" />
        </div>
      ) : null}
    </figure>
  );
}
