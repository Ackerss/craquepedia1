"use client";

import { useActionState, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { createIntake } from "@/actions/intake";
import { SPORTS } from "@/lib/sports";
import { brl, firstName, waLink } from "@/lib/utils";
import { CopyButton } from "@/components/ui/CopyButton";
import { Modal } from "@/components/ui/Modal";
import { Submit } from "@/components/ui/Submit";

export function NewIntake({ packages, autoOpen }: { packages: { id: string; name: string; priceCents: number }[]; autoOpen?: boolean }) {
  const [open, setOpen] = useState(!!autoOpen);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, action] = useActionState(createIntake, null);
  const [hidden, setHidden] = useState<string | null>(null);
  const link = state?.token && state.token !== hidden && typeof window !== "undefined" ? `${window.location.origin}/f/${state.token}` : null;
  const msg = link
    ? `Olá${name ? ` ${firstName(name)}` : ""}! 👋 Aqui é da Craquepedia. Para montarmos seu currículo e materiais de atleta, preencha este formulário (leva uns 5 minutos):\n${link}`
    : "";
  return (
    <>
      <button className="btn-primary" onClick={() => { setOpen(true); setHidden(state?.token ?? null); }}>
        <Send className="size-4" /> Novo link de formulário
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Enviar formulário para atleta">
        {link ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Link criado! Envie para o atleta. Quando ele preencher, o perfil é criado automaticamente e a IA organiza tudo.</p>
            <div className="break-all rounded-xl bg-slate-50 px-3 py-2 font-mono text-sm">{link}</div>
            <div className="flex flex-wrap gap-2">
              <a href={waLink(phone, msg)} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                <MessageCircle className="size-4" /> Enviar no WhatsApp
              </a>
              <CopyButton text={link} label="Copiar link" className="btn-ghost" />
              <CopyButton text={msg} label="Copiar mensagem" className="btn-ghost" />
            </div>
          </div>
        ) : (
          <form action={action} className="space-y-3">
            <div>
              <label className="label">Nome do atleta (opcional)</label>
              <input name="clientName" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">WhatsApp (para abrir a conversa)</label>
              <input name="clientPhone" className="input" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="label">Esporte (opcional)</label>
              <select name="sport" className="input" defaultValue="">
                <option value="">Atleta escolhe</option>
                {SPORTS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Pacote já fechado? (cria entregas automaticamente)</label>
              <select name="packageId" className="input" defaultValue="">
                <option value="">Ainda não</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {brl(p.priceCents)}
                  </option>
                ))}
              </select>
            </div>
            <Submit className="btn-primary w-full">Gerar link</Submit>
          </form>
        )}
      </Modal>
    </>
  );
}
