"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function Submit({
  children,
  className = "btn-primary",
  pendingText,
  pending: pendingProp,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  /** Use quando o form é enviado por onSubmit (keepValues). */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state: { error?: string; ok?: string | boolean } | null | undefined }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  if (typeof state.ok === "string") return <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">{state.ok}</p>;
  return null;
}
