"use client";

import { useState, useTransition } from "react";
import { Loader2, MessageCircle, Plus, Send } from "lucide-react";
import { addDeliverable } from "@/actions/work";
import { createIntake } from "@/actions/intake";
import { firstName, waLink } from "@/lib/utils";

export function AddDeliverable({ athleteId, services }: { athleteId: string; services: { key: string; name: string }[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-2">
      <select
        className="input w-auto py-2 text-sm"
        defaultValue=""
        disabled={pending}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return;
          start(async () => {
            await addDeliverable(athleteId, v);
            e.target.value = "";
          });
        }}
        aria-label="Adicionar entrega avulsa"
      >
        <option value="">+ Entrega avulsa (sem cobrança)</option>
        {services.map((s) => (
          <option key={s.key} value={s.key}>
            {s.name}
          </option>
        ))}
      </select>
      {pending ? <Loader2 className="size-4 animate-spin text-slate-400" /> : <Plus className="hidden" />}
    </div>
  );
}

/** Gera um link de formulário para o atleta completar os dados que faltam e abre o WhatsApp. */
export function RequestDataButton({
  athleteId,
  name,
  phone,
  sport,
  missing = [],
  label = "Pedir dados ao atleta",
}: {
  athleteId: string;
  name: string;
  phone?: string | null;
  sport: string;
  missing?: string[];
  label?: string;
}) {
  const [pending, start] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className="btn-ghost btn-sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const fd = new FormData();
            fd.set("athleteId", athleteId);
            fd.set("clientName", name);
            fd.set("clientPhone", phone ?? "");
            fd.set("sport", sport);
            const r = await createIntake(null, fd);
            if (r.token) setLink(`${window.location.origin}/f/${r.token}`);
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {label}
      </button>
      {link ? (
        <a
          className="btn-primary btn-sm"
          target="_blank"
          rel="noreferrer"
          href={waLink(
            phone,
            missing.length
              ? `Oi ${firstName(name)}! Para deixar seu material ainda mais forte, preciso de algumas informações:\n${missing
                  .slice(0, 6)
                  .map((m) => `• ${m}`)
                  .join("\n")}\n\nO formulário já vem com os dados que temos, é só completar (leva 5 minutos): ${link}`
              : `Oi ${firstName(name)}! Vamos atualizar o seu material? Confira seus dados, corrija o que mudou e acrescente as novidades (clubes, conquistas, números, fotos). Já vem preenchido, leva poucos minutos: ${link}`,
          )}
        >
          <MessageCircle className="size-4" /> Enviar no WhatsApp
        </a>
      ) : null}
    </div>
  );
}
