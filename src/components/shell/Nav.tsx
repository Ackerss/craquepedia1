"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  SquareKanban,
  ClipboardList,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Building2,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/atletas", label: "Atletas", icon: Users },
  { href: "/entregas", label: "Entregas", icon: SquareKanban },
  { href: "/formularios", label: "Formulários", icon: ClipboardList },
  { href: "/contatos", label: "Contatos", icon: Building2 },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function Links({ onClick, counts }: { onClick?: () => void; counts: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav className="space-y-1">
      {ITEMS.map((i) => {
        const active = i.href === "/" ? path === "/" : path.startsWith(i.href);
        const n = counts[i.href];
        return (
          <Link
            key={i.href}
            href={i.href}
            onClick={onClick}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition",
              active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            <i.icon className={cn("size-[18px]", active ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300")} />
            <span className="flex-1">{i.label}</span>
            {n ? <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white">{n}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBox({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
      <div className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{name[0]}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="text-xs text-slate-500">Equipe Craquepedia</p>
      </div>
      <form action={logout}>
        <button className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" title="Sair" aria-label="Sair">
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function Sidebar({ name, counts }: { name: string; counts: Record<string, number> }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink-900 px-4 py-5 lg:flex">
      <Link href="/" className="mb-7 px-2">
        <Logo light />
      </Link>
      <Link href="/atletas/novo" className="btn-primary mb-5 w-full">
        <Plus className="size-4" /> Novo atleta
      </Link>
      <Links counts={counts} />
      <div className="mt-auto">
        <UserBox name={name} />
      </div>
    </aside>
  );
}

export function MobileBar({ name, counts }: { name: string; counts: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className="no-print sticky top-0 z-30 flex items-center justify-between bg-ink-900 px-4 py-3 lg:hidden">
        <Link href="/">
          <Logo light />
        </Link>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-white" aria-label="Abrir menu">
          <Menu className="size-6" />
        </button>
      </header>
      {open ? (
        <div className="fixed inset-0 z-50 bg-ink-950/60 lg:hidden" onClick={() => setOpen(false)}>
          <div className="flex h-full w-72 flex-col bg-ink-900 px-4 py-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between px-2">
              <Logo light />
              <button onClick={() => setOpen(false)} className="text-slate-400" aria-label="Fechar menu">
                <X className="size-6" />
              </button>
            </div>
            <Link href="/atletas/novo" onClick={() => setOpen(false)} className="btn-primary mb-5 w-full">
              <Plus className="size-4" /> Novo atleta
            </Link>
            <Links onClick={() => setOpen(false)} counts={counts} />
            <div className="mt-auto">
              <UserBox name={name} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
