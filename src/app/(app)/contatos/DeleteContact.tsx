"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteContact } from "@/actions/contacts";
import { Modal } from "@/components/ui/Modal";

export function DeleteContact({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Excluir contato" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Excluir contato">
        <p className="mb-4 text-sm text-slate-600">
          Excluir <b>{name}</b>? O histórico de envios para esse contato também será apagado.
        </p>
        <button className="btn w-full bg-red-600 text-white hover:bg-red-700" disabled={pending} onClick={() => start(() => deleteContact(id))}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Excluir
        </button>
      </Modal>
    </>
  );
}
