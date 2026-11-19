"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { Package, Service } from "@/db/schema";
import { changePassword, createUser } from "@/actions/auth";
import { deletePackage, saveAISettings, saveCompany, savePackage, saveService, testAI } from "@/actions/settings";
import type { CompanySettings } from "@/lib/data";
import { brl } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { FormMessage, Submit } from "@/components/ui/Submit";

type S = { error?: string; ok?: string } | null;
const money = (c: number) => (c / 100).toFixed(2).replace(".", ",");

export function CompanyForm({ c }: { c: CompanySettings }) {
  const [state, action] = useActionState(saveCompany, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label">Nome da empresa</label>
        <input name="name" defaultValue={c.name} className="input" />
      </div>
      <div>
        <label className="label">WhatsApp comercial</label>
        <input name="whatsapp" defaultValue={c.whatsapp} className="input" />
      </div>
      <div>
        <label className="label">Instagram</label>
        <input name="instagram" defaultValue={c.instagram} className="input" />
      </div>
      <div>
        <label className="label">E-mail</label>
        <input name="email" defaultValue={c.email} className="input" />
      </div>
      <div>
        <label className="label">Site</label>
        <input name="site" defaultValue={c.site} className="input" />
      </div>
      <div>
        <label className="label">Chave Pix (para cobranças)</label>
        <input name="pix" defaultValue={c.pix} className="input" />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Submit>Salvar</Submit>
        <FormMessage state={state as S} />
      </div>
    </form>
  );
}

export function ServiceEditor({ s }: { s?: Service }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(async (p: unknown, fd: FormData) => {
    const r = await saveService(s?.id ?? null, p, fd);
    if (r?.ok) setOpen(false);
    return r;
  }, null);
  return (
    <>
      {s ? (
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Editar serviço">
          <Pencil className="size-4" />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-ghost btn-sm">
          <Plus className="size-4" /> Novo serviço
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={s ? "Editar serviço" : "Novo serviço"}>
        <form action={action} className="space-y-3">
          <div>
            <label className="label">Nome</label>
            <input name="name" defaultValue={s?.name} className="input" required />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea name="description" defaultValue={s?.description ?? ""} className="input" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Preço (R$)</label>
              <input name="price" defaultValue={s ? money(s.priceCents) : ""} className="input" inputMode="decimal" />
            </div>
            <div>
              <label className="label">Prazo padrão (dias)</label>
              <input name="defaultDays" type="number" min={0} defaultValue={s?.defaultDays ?? 7} className="input" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={s?.active ?? true} className="size-4 accent-emerald-600" /> Ativo
          </label>
          <FormMessage state={state as S} />
          <Submit className="btn-primary w-full">Salvar</Submit>
        </form>
      </Modal>
    </>
  );
}

export function PackageEditor({ p, services }: { p?: Package; services: Service[] }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [state, action] = useActionState(async (prev: unknown, fd: FormData) => {
    const r = await savePackage(p?.id ?? null, prev, fd);
    if (r?.ok) setOpen(false);
    return r;
  }, null);
  return (
    <>
      {p ? (
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Editar pacote">
          <Pencil className="size-4" />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-ghost btn-sm">
          <Plus className="size-4" /> Novo pacote
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={p ? "Editar pacote" : "Novo pacote"}>
        <form action={action} className="space-y-3">
          <div>
            <label className="label">Nome</label>
            <input name="name" defaultValue={p?.name} className="input" required />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea name="description" defaultValue={p?.description ?? ""} className="input" rows={2} />
          </div>
          <div>
            <label className="label">Preço do pacote (R$)</label>
            <input name="price" defaultValue={p ? money(p.priceCents) : ""} className="input" inputMode="decimal" />
          </div>
          <div>
            <p className="label">Serviços incluídos</p>
            <div className="grid gap-1.5">
              {services.map((s) => (
                <label key={s.key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <input type="checkbox" name="services" value={s.key} defaultChecked={p?.serviceKeys.includes(s.key)} className="size-4 accent-emerald-600" />
                  <span className="flex-1">{s.name}</span>
                  <span className="text-slate-400">{brl(s.priceCents)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="highlight" defaultChecked={p?.highlight} className="size-4 accent-emerald-600" /> Destaque
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="active" defaultChecked={p?.active ?? true} className="size-4 accent-emerald-600" /> Ativo
            </label>
          </div>
          <FormMessage state={state as S} />
          <div className="flex gap-2">
            {p ? (
              <button type="button" className="btn-danger" disabled={pending} onClick={() => start(async () => { await deletePackage(p.id); setOpen(false); })}>
                <Trash2 className="size-4" />
              </button>
            ) : null}
            <Submit className="btn-primary flex-1">Salvar</Submit>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function PackageBadge({ highlight }: { highlight: boolean }) {
  return highlight ? (
    <span className="badge bg-gold-400/20 text-amber-700">
      <Star className="size-3" /> destaque
    </span>
  ) : null;
}

export function NewUserForm() {
  const [state, action] = useActionState(createUser, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-4">
      <input name="name" placeholder="Nome (ex.: Diego)" className="input" required />
      <input name="username" placeholder="Usuário (ex.: diego)" className="input" required />
      <input name="password" type="password" placeholder="Senha (mín. 8)" className="input" required minLength={8} autoComplete="new-password" />
      <Submit>Criar acesso</Submit>
      <div className="sm:col-span-4">
        <FormMessage state={state as S} />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, null);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-3">
      <input name="current" type="password" placeholder="Senha atual" className="input" required autoComplete="current-password" />
      <input name="next" type="password" placeholder="Nova senha (mín. 8)" className="input" required minLength={8} autoComplete="new-password" />
      <Submit>Trocar senha</Submit>
      <div className="sm:col-span-3">
        <FormMessage state={state as S} />
      </div>
    </form>
  );
}

export function AIForm({ status, models }: { status: { gemini: boolean; geminiFromSettings: boolean; keyHint: string; model: string; gateway: boolean }; models: { id: string; label: string }[] }) {
  const [state, action] = useActionState(saveAISettings, null);
  const [test, setTest] = useState<S>(null);
  const [testing, startTest] = useTransition();
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className={`rounded-xl border p-3 text-sm ${status.gemini ? "border-brand-200 bg-brand-50 text-brand-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          <p className="font-semibold">1ª opção: Gemini (sua chave grátis)</p>
          <p>{status.gemini ? `Ativo — chave ${status.keyHint}` : "Sem chave ainda. Siga os passos abaixo."}</p>
        </div>
        <div className={`rounded-xl border p-3 text-sm ${status.gateway ? "border-slate-200 bg-slate-50 text-slate-700" : "border-slate-200 bg-white text-slate-500"}`}>
          <p className="font-semibold">Reserva: IA da Vercel</p>
          <p>{status.gateway ? "Ativa — usada se o Gemini falhar ou acabar a cota do dia." : "Só funciona no site publicado."}</p>
        </div>
      </div>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
        <li>
          Abra{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="font-medium text-brand-700 underline">
            aistudio.google.com/apikey
          </a>{" "}
          com a sua conta Google.
        </li>
        <li>Clique em “Create API key” (Criar chave) e copie o código que começa com “AIza”.</li>
        <li>Cole aqui embaixo e salve. Depois clique em “Testar IA”.</li>
      </ol>
      <form action={action} className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Chave do Gemini {status.geminiFromSettings ? `(salva: ${status.keyHint})` : ""}</label>
          <input name="geminiKey" type="password" autoComplete="off" className="input" placeholder={status.geminiFromSettings ? "Deixe vazio para manter a atual" : "AIza..."} />
        </div>
        <div>
          <label className="label">Modelo</label>
          <select name="model" defaultValue={status.model} className="input">
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        {status.geminiFromSettings ? (
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
            <input type="checkbox" name="removeKey" /> Remover a chave salva
          </label>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Submit>Salvar</Submit>
          <button type="button" className="btn-ghost" disabled={testing} onClick={() => startTest(async () => setTest(await testAI()))}>
            {testing ? "Testando..." : "Testar IA"}
          </button>
          <FormMessage state={(test ?? state) as S} />
        </div>
      </form>
    </div>
  );
}
