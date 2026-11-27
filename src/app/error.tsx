"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

/** Tela de erro em português (em vez do "Application error" do Next). */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center text-white">
      <LogoMark size={52} />
      <h1 className="font-display text-3xl font-bold uppercase">Algo deu errado</h1>
      <p className="max-w-sm text-slate-400">Não conseguimos concluir esta ação. Confira os dados digitados e tente de novo. Se continuar, avise a equipe.</p>
      <div className="flex gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          Tentar de novo
        </button>
        <Link href="/" className="btn-ghost text-white">
          Ir para o início
        </Link>
      </div>
      {error.digest ? <p className="text-xs text-slate-600">Código: {error.digest}</p> : null}
    </div>
  );
}
