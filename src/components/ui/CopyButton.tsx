"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text, label = "Copiar", className = "btn-ghost btn-sm" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const full = text.startsWith("/") ? window.location.origin + text : text;
        await navigator.clipboard.writeText(full);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? <Check className="size-4 text-brand-600" /> : <Copy className="size-4" />}
      {done ? "Copiado!" : label}
    </button>
  );
}
