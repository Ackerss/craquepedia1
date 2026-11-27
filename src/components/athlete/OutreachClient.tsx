"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Loader2, Mail, MessageCircle, Trash2 } from "lucide-react";
import type { Contact, Outreach } from "@/db/schema";
import { deleteOutreach, logOutreach, setOutreachStatus } from "@/actions/contacts";
import { kindLabel, OUTREACH_STATUS } from "@/lib/outreach";
import { firstName, fmtDate, waLink } from "@/lib/utils";

type Info = { name: string; short: string; position: string; sport: string; sportEn: string; age: number | null; club: string; company: string; portfolio: string; cv: string };
type C = Contact & { already: boolean; match: boolean };

function isEn(c: Contact) {
  // países de língua portuguesa recebem a mensagem em português
  const pt = /^(bra|portugal|angola|mo[cç]ambique|cabo verde|guin[eé]-bissau|s[aã]o tom[eé]|timor)/i;
  return (c.kind === "universidade" && !(c.country && pt.test(c.country.trim()))) || !!(c.country && !pt.test(c.country.trim()));
}

function message(c: Contact, i: Info) {
  const who = firstName(c.name);
  if (isEn(c))
    return `Hello ${who}! I'm reaching out from ${i.company} to introduce ${i.name}${i.age ? `, ${i.age} years old` : ""}${i.position ? `, ${i.position}` : ""} (${i.sportEn})${i.club ? `, currently at ${i.club}` : ""}.\n\nFull profile with highlights and stats: ${i.portfolio}?lang=en\nCV: ${i.cv}?lang=en\n\nI'd be glad to send more information or game footage. Thank you!`;
  return `Olá ${who}, tudo bem? Aqui é da ${i.company}. Quero apresentar o(a) atleta ${i.name}${i.position ? `, ${i.position}` : ""}${i.age ? `, ${i.age} anos` : ""}${i.club ? `, atualmente no ${i.club}` : ""}.\n\nPortfólio com vídeos e números: ${i.portfolio}\nCurrículo: ${i.cv}\n\nFico à disposição para enviar mais informações ou jogos completos. Obrigado!`;
}

export function SendMaterial({ athleteId, contacts, info }: { athleteId: string; contacts: C[]; info: Info }) {
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [onlyMatch, setOnlyMatch] = useState(contacts.some((c) => c.match));
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const list = useMemo(
    () =>
      contacts.filter(
        (c) => (!onlyMatch || c.match || !c.sports.length) && (!q || `${c.name} ${c.organization ?? ""} ${c.city ?? ""} ${c.country ?? ""}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [contacts, q, onlyMatch],
  );
  const chosen = contacts.filter((c) => sel.includes(c.id));
  return (
    <div className="card">
      <div className="border-b border-slate-100 px-4 py-3.5">
        <h3 className="font-semibold">Enviar material</h3>
        <p className="text-xs text-slate-500">Escolha os contatos. A mensagem já vai pronta com portfólio e currículo (em inglês para exterior e universidades).</p>
      </div>
      <div className="space-y-2 p-4">
        <input className="input py-2 text-sm" placeholder="Buscar contato, clube, cidade..." value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={onlyMatch} onChange={(e) => setOnlyMatch(e.target.checked)} className="accent-emerald-600" /> Só contatos deste esporte
        </label>
        <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {list.map((c) => (
            <li key={c.id}>
              <label className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm ${sel.includes(c.id) ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}>
                <input
                  type="checkbox"
                  className="accent-emerald-600"
                  checked={sel.includes(c.id)}
                  onChange={(e) => setSel((s) => (e.target.checked ? [...s, c.id] : s.filter((x) => x !== c.id)))}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink-900">{c.organization || c.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {[c.organization ? c.name : null, kindLabel(c.kind), c.country].filter(Boolean).join(" · ")}
                  </span>
                </span>
                {c.already ? <span className="badge bg-slate-100 text-slate-500">já enviado</span> : null}
              </label>
            </li>
          ))}
          {!list.length ? <li className="py-4 text-center text-sm text-slate-400">Nenhum contato encontrado.</li> : null}
        </ul>
      </div>
      {chosen.length ? (
        <div className="space-y-2 border-t border-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">1. Envie para cada um</p>
          {chosen.map((c) => {
            const msg = message(c, info);
            return (
              <div key={c.id} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate font-medium">{c.organization || c.name}</span>
                {c.phone ? (
                  <a href={waLink(c.phone, msg)} target="_blank" rel="noreferrer" className="btn btn-sm bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                ) : null}
                {c.email ? (
                  <a
                    href={`mailto:${c.email}?subject=${encodeURIComponent(isEn(c) ? `Athlete profile: ${info.name}` : `Apresentação de atleta: ${info.name}`)}&body=${encodeURIComponent(msg)}`}
                    className="btn-ghost btn-sm"
                  >
                    <Mail className="size-4" /> E-mail
                  </a>
                ) : null}
              </div>
            );
          })}
          <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">2. Registre o envio</p>
          <button
            type="button"
            className="btn-primary w-full"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await logOutreach(athleteId, sel, "whatsapp");
                setSel([]);
                setDone(true);
                setTimeout(() => setDone(false), 2500);
              })
            }
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Marcar {chosen.length} como enviado(s)
          </button>
        </div>
      ) : done ? (
        <p className="border-t border-slate-100 px-4 py-3 text-sm font-medium text-brand-700">Envio registrado! Lembrete de retorno em 7 dias.</p>
      ) : null}
    </div>
  );
}

export function OutreachRow({ o, c, athleteId, followMsg, due }: { o: Outreach; c: Contact; athleteId: string; followMsg?: string; due?: boolean }) {
  const [pending, start] = useTransition();
  const st = OUTREACH_STATUS.find((s) => s.key === o.status);
  return (
    <li className={`flex flex-wrap items-center gap-3 px-5 py-3 ${pending ? "opacity-60" : ""}`}>
      <span className="size-2.5 shrink-0 rounded-full" style={{ background: st?.color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-900">{c.organization || c.name}</p>
        <p className="truncate text-xs text-slate-500">
          {[c.organization ? c.name : null, kindLabel(c.kind), `enviado ${fmtDate(o.sentAt)}`, o.status === "enviado" && o.followUpAt ? `cobrar em ${fmtDate(o.followUpAt)}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {o.status === "enviado" && due && c.phone && followMsg ? (
        <a href={waLink(c.phone, followMsg)} target="_blank" rel="noreferrer" className="btn btn-sm bg-amber-100 text-amber-900 hover:bg-amber-200" title="Já passou o prazo: cobrar retorno pelo WhatsApp">
          <MessageCircle className="size-4" /> Cobrar retorno
        </a>
      ) : null}
      <select
        className="input w-auto py-1.5 text-sm"
        defaultValue={o.status}
        onChange={(e) => start(() => setOutreachStatus(o.id, e.target.value, athleteId))}
        aria-label="Retorno"
      >
        {OUTREACH_STATUS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remover envio" onClick={() => {
          if (confirm("Remover este envio do histórico?")) start(() => deleteOutreach(o.id, athleteId));
        }}>
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
