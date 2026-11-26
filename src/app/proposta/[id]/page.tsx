import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadProposal, Proposal } from "@/components/docs/Proposal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Proposta", robots: { index: false, follow: false } };

/** Link público da proposta, para mandar pelo WhatsApp. */
export default async function PropostaPublica({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await loadProposal(id);
  if (!a) notFound();
  return <Proposal a={a} />;
}
