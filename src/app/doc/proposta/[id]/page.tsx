import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getCompany } from "@/lib/data";
import { baseUrl } from "@/lib/server-utils";
import { firstName, waLink } from "@/lib/utils";
import { CopyButton } from "@/components/ui/CopyButton";
import { loadProposal, Proposal } from "@/components/docs/Proposal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Proposta comercial", robots: { index: false } };

export default async function Proposta({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const a = await loadProposal(id);
  if (!a) notFound();
  const [base, company] = await Promise.all([baseUrl(), getCompany()]);
  const link = `${base}/proposta/${a.id}`;
  const msg = `Oi ${firstName(a.guardianName || a.fullName)}! 👋 Aqui é da ${company.name}. Preparei a proposta com os pacotes para ${a.nickname || firstName(a.fullName)}:\n${link}\n\nQualquer dúvida é só me chamar!`;
  return (
    <Proposal
      a={a}
      toolbar={
        <>
          <Link href={`/atletas/${a.id}?tab=financeiro`} className="mr-auto inline-flex items-center gap-1 text-sm text-slate-600 hover:text-ink-900">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <CopyButton text={link} label="Copiar link" className="btn-ghost btn-sm bg-white" />
          <a href={waLink(a.guardianPhone || a.phone, msg)} target="_blank" rel="noreferrer" className="btn btn-sm bg-[#25D366] text-white hover:bg-[#1ebe5a]">
            <MessageCircle className="size-4" /> Enviar link no WhatsApp
          </a>
        </>
      }
    />
  );
}
