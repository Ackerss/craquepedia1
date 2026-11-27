"use client";

import { useTransition } from "react";
import { AlarmClockOff, Loader2, MessageCircle } from "lucide-react";
import { setOutreachStatus, snoozeOutreach } from "@/actions/contacts";
import { waLink } from "@/lib/utils";

/** Ações rápidas de "cobrar retorno": mensagem pronta, adiar ou marcar sem retorno. */
export function FollowUpActions({ id, athleteId, phone, email, country, message }: { id: string; athleteId: string; phone?: string | null; email?: string | null; country?: string | null; message: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex shrink-0 items-center gap-1">
      {phone ? (
        <a
          href={waLink(phone, message, country)}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg p-1.5 text-[#128C7E] hover:bg-[#25D366]/15"
          title="Cobrar retorno no WhatsApp"
          aria-label="Cobrar retorno no WhatsApp"
        >
          <MessageCircle className="size-4" />
        </a>
      ) : email ? (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent("Retorno sobre o atleta")}&body=${encodeURIComponent(message)}`}
          className="rounded-lg p-1.5 text-[#128C7E] hover:bg-[#25D366]/15"
          title="Cobrar retorno por e-mail"
          aria-label="Cobrar retorno por e-mail"
        >
          <MessageCircle className="size-4" />
        </a>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => snoozeOutreach(id, 7))}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        title="Lembrar de novo em 7 dias"
        aria-label="Adiar 7 dias"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <AlarmClockOff className="size-4" />}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => setOutreachStatus(id, "sem_retorno", athleteId))}
        className="rounded-lg px-1.5 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        title="Marcar como sem retorno"
      >
        sem retorno
      </button>
    </div>
  );
}
