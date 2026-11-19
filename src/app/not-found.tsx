import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center text-white">
      <LogoMark size={52} />
      <h1 className="font-display text-4xl font-bold uppercase">Página não encontrada</h1>
      <p className="text-slate-400">O link pode estar errado ou o conteúdo não está mais disponível.</p>
      <Link href="/" className="btn-primary">Ir para o início</Link>
    </div>
  );
}
