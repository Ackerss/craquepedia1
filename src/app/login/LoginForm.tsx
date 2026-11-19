"use client";

import { useActionState } from "react";
import { login, setupFirstUser } from "@/actions/auth";
import { Submit } from "@/components/ui/Submit";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-slate-300" htmlFor="username">Usuário</label>
        <input id="username" name="username" autoComplete="username" required className="input border-white/10 bg-white/5 text-white placeholder:text-slate-500" placeholder="ex.: jacson" />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-slate-300" htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input border-white/10 bg-white/5 text-white" />
      </div>
      {state?.error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p> : null}
      <Submit className="btn-primary w-full py-3" pendingText="Entrando...">Entrar</Submit>
    </form>
  );
}

export function SetupForm() {
  const [state, action] = useActionState(setupFirstUser, null);
  const cls = "input border-white/10 bg-white/5 text-white placeholder:text-slate-500";
  return (
    <form action={action} className="space-y-4">
      <div className="rounded-xl bg-brand-500/10 px-3 py-2 text-sm text-brand-200">
        Primeiro acesso: crie o seu login de administrador. Depois você cria o acesso do sócio em Configurações.
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-slate-300">Seu nome</label>
        <input name="name" required className={cls} placeholder="Jacson" />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-slate-300">Usuário (para entrar)</label>
        <input name="username" required className={cls} placeholder="jacson" autoComplete="username" />
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-slate-300">Senha (mín. 8 caracteres)</label>
        <input name="password" type="password" required minLength={8} className={cls} autoComplete="new-password" />
      </div>
      {state?.error ? <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{state.error}</p> : null}
      <Submit className="btn-primary w-full py-3" pendingText="Criando...">Criar acesso e entrar</Submit>
    </form>
  );
}
