"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { saveContact } from "@/actions/contacts";
import type { Contact } from "@/db/schema";
import { CONTACT_KINDS } from "@/lib/outreach";
import { SPORTS } from "@/lib/sports";
import { keepValues } from "@/lib/form-submit";
import { Modal } from "@/components/ui/Modal";
import { FormMessage, Submit } from "@/components/ui/Submit";

export function ContactButton({ contact, label, className = "btn-primary", defaultSport }: { contact?: Contact; label?: string; className?: string; defaultSport?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {contact ? <Pencil className="size-4" /> : <Plus className="size-4" />} {label ?? (contact ? "Editar" : "Novo contato")}
      </button>
      {open ? <ContactModal contact={contact} onClose={() => setOpen(false)} defaultSport={defaultSport} /> : null}
    </>
  );
}

function ContactModal({ contact, onClose, defaultSport }: { contact?: Contact; onClose: () => void; defaultSport?: string }) {
  const [state, dispatch, pending] = useActionState(saveContact, null);
  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);
  const sports = contact?.sports ?? (defaultSport ? [defaultSport] : []);
  return (
    <Modal open onClose={onClose} title={contact ? "Editar contato" : "Novo contato de divulgação"} wide>
      <form onSubmit={keepValues(dispatch)} className="space-y-4">
        {contact ? <input type="hidden" name="id" value={contact.id} /> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Nome da pessoa *</label>
            <input name="name" className="input" defaultValue={contact?.name} placeholder="Ex.: Carlos (coordenador da base)" />
          </div>
          <div>
            <label className="label">Clube / empresa / universidade</label>
            <input name="organization" className="input" defaultValue={contact?.organization ?? ""} placeholder="Ex.: EC Juventude" />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select name="kind" className="input" defaultValue={contact?.kind ?? "clube"}>
              {CONTACT_KINDS.map((k) => (
                <option key={k.key} value={k.key}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">País</label>
              <input name="country" className="input" defaultValue={contact?.country ?? "Brasil"} />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input name="city" className="input" defaultValue={contact?.city ?? ""} />
            </div>
          </div>
          <div>
            <label className="label">WhatsApp (com DDD; exterior com código do país)</label>
            <input name="phone" className="input" defaultValue={contact?.phone ?? ""} inputMode="tel" placeholder="54 99999-8888" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input name="email" type="email" className="input" defaultValue={contact?.email ?? ""} />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input name="instagram" className="input" defaultValue={contact?.instagram ?? ""} placeholder="@clube" />
          </div>
        </div>
        <div>
          <label className="label">Esportes de interesse</label>
          <div className="flex flex-wrap gap-1.5">
            {SPORTS.filter((s) => s.slug !== "outro").map((s) => (
              <label key={s.slug} className="badge cursor-pointer border border-slate-200 bg-white py-1 text-slate-600 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-800">
                <input type="checkbox" name="sports" value={s.slug} defaultChecked={sports.includes(s.slug)} className="sr-only" />
                {s.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Observações</label>
          <textarea name="notes" className="input" rows={2} defaultValue={contact?.notes ?? ""} placeholder="Ex.: procura laterais Sub-20; prefere receber por e-mail" />
        </div>
        <FormMessage state={state} />
        <Submit pending={pending} className="btn-primary w-full">
          Salvar contato
        </Submit>
      </form>
    </Modal>
  );
}
