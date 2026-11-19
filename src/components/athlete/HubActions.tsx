"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, Loader2, MessageCircle, Sparkles, Trash2, Wand2 } from "lucide-react";
import { deleteAthlete, generateAthleteText, runAthleteAI, setAthleteField, setAthleteStatus } from "@/actions/athletes";
import { ATHLETE_STATUS } from "@/lib/catalog";
import { waLink } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

export function AIButton({ id, hasContent }: { id: string; hasContent: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const run = (mode: "fill" | "overwrite") =>
    start(async () => {
      setOpen(false);
      setMsg(null);
      const r = await runAthleteAI(id, mode);
      if (r?.error) setMsg(r.error);
      else {
        setMsg("Perfil organizado pela IA ✔");
        router.refresh();
      }
    });
  return (
    <>
      <button
        type="button"
        onClick={() => (hasContent ? setOpen(true) : run("fill"))}
        disabled={pending}
        className="btn bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-sm hover:opacity-95"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {pending ? "IA trabalhando..." : "Organizar com IA"}
      </button>
      {msg ? <span className={`text-sm ${msg.includes("✔") ? "text-brand-700" : "text-red-600"}`}>{msg}</span> : null}
      <Modal open={open} onClose={() => setOpen(false)} title="Organizar perfil com IA">
        <p className="mb-4 text-sm text-slate-600">
          A IA lê tudo o que já existe, corrige o português, escreve a biografia (PT e EN), organiza carreira, conquistas e números e aponta o que está faltando.
          Ela nunca inventa dados.
        </p>
        <div className="grid gap-2">
          <button className="btn-primary" onClick={() => run("fill")}>
            <Wand2 className="size-4" /> Completar só o que está vazio (recomendado)
          </button>
          <button className="btn-ghost" onClick={() => run("overwrite")}>
            Reescrever tudo (substitui textos e listas atuais)
          </button>
        </div>
      </Modal>
    </>
  );
}

const KINDS = [
  { key: "whatsapp_entrega", label: "WhatsApp de entrega" },
  { key: "instagram", label: "Legenda Instagram" },
  { key: "clubes", label: "E-mail para clubes" },
  { key: "ingles", label: "Apresentação em inglês" },
  { key: "youtube", label: "Título e descrição YouTube" },
  { key: "roteiro_video", label: "Roteiro do vídeo highlight" },
] as const;

export function TextStudio({ id, phone }: { id: string; phone?: string | null }) {
  const [kind, setKind] = useState<(typeof KINDS)[number]["key"]>("whatsapp_entrega");
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-5 text-violet-600" />
        <h3 className="font-semibold">Textos prontos com IA</h3>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => setKind(k.key)}
            className={`badge border py-1 ${kind === k.key ? "border-violet-500 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-600"}`}
          >
            {k.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn-dark w-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setErr(null);
            const r = await generateAthleteText(id, kind);
            if (r.error) setErr(r.error);
            else setText(r.text ?? "");
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
        {pending ? "Escrevendo..." : "Gerar texto"}
      </button>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
      {text ? (
        <div className="mt-3">
          <textarea className="input min-h-[180px] text-sm" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={async () => {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copiado" : "Copiar"}
            </button>
            {phone ? (
              <a className="btn-ghost btn-sm" href={waLink(phone, text)} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" /> Enviar no WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function StatusSelect({ id, value }: { id: string; value: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      className="input w-auto py-2 text-sm"
      defaultValue={value}
      disabled={pending}
      onChange={(e) => start(() => setAthleteStatus(id, e.target.value))}
      aria-label="Status do atleta"
    >
      {ATHLETE_STATUS.map((s) => (
        <option key={s.key} value={s.key}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

export function ResponsibleSelect({ id, value, users }: { id: string; value?: string | null; users: { id: string; name: string }[] }) {
  const [pending, start] = useTransition();
  return (
    <select
      className="input w-auto py-2 text-sm"
      defaultValue={value ?? ""}
      disabled={pending}
      onChange={(e) => start(() => setAthleteField(id, "responsibleId", e.target.value))}
      aria-label="Responsável"
    >
      <option value="">Sem responsável</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  );
}

export function PublicToggle({ id, value }: { id: string; value: boolean }) {
  const [on, setOn] = useState(value);
  const [pending, start] = useTransition();
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={on}
        disabled={pending}
        onChange={(e) => {
          setOn(e.target.checked);
          start(() => setAthleteField(id, "publicEnabled", e.target.checked));
        }}
        className="size-4 accent-emerald-600"
      />
      Links públicos ativos
    </label>
  );
}

export function DeleteAthlete({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, start] = useTransition();
  const first = name.split(" ")[0];
  return (
    <>
      <button type="button" className="btn-danger btn-sm" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" /> Excluir atleta
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Excluir atleta">
        <p className="mb-3 text-sm text-slate-600">
          Isso apaga o perfil, fotos, entregas e o financeiro de <b>{name}</b>. Não dá para desfazer. Para confirmar, digite <b>{first}</b>.
        </p>
        <input className="input mb-3" value={typed} onChange={(e) => setTyped(e.target.value)} />
        <button className="btn w-full bg-red-600 text-white hover:bg-red-700" disabled={typed.trim().toLowerCase() !== first.toLowerCase() || pending} onClick={() => start(() => deleteAthlete(id))}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Excluir definitivamente
        </button>
      </Modal>
    </>
  );
}

export function PortfolioThemePicker({ id, slug, value, themes }: { id: string; slug: string; value: string; themes: { id: string; name: string; description: string }[] }) {
  const [cur, setCur] = useState(value);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-1.5">
      {themes.map((t) => (
        <label key={t.id} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2 text-sm transition ${cur === t.id ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
          <input
            type="radio"
            name={`tema-${id}`}
            className="mt-1 accent-emerald-600"
            checked={cur === t.id}
            disabled={pending}
            onChange={() => {
              setCur(t.id);
              start(() => setAthleteField(id, "portfolioTheme", t.id));
            }}
          />
          <span className="min-w-0 flex-1">
            <span className="font-semibold text-ink-900">{t.name}</span>
            <span className="block text-xs text-slate-500">{t.description}</span>
          </span>
          <a href={`/p/${slug}?tema=${t.id}`} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-brand-700 hover:underline" onClick={(e) => e.stopPropagation()}>
            ver
          </a>
        </label>
      ))}
    </div>
  );
}
