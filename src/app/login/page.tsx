import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LogoMark } from "@/components/ui/Logo";
import { LoginForm, SetupForm } from "./LoginForm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ready } from "@/lib/data";

export const metadata = { title: "Entrar" };

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/");
  const { next } = await searchParams;
  await ready();
  const firstAccess = (await db.select({ id: users.id }).from(users).limit(1)).length === 0;
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4">
      <div className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-brand-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-[520px] rounded-full bg-gold-500/10 blur-[120px]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={56} />
          <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide text-white">
            Craque<span className="text-brand-400">pedia</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Central de serviços para atletas</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur">
          {firstAccess ? <SetupForm /> : <LoginForm next={next ?? "/"} />}
        </div>
      </div>
    </div>
  );
}
