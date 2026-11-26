import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { baseUrl } from "@/lib/server-utils";
import { brl, firstName, waLink } from "@/lib/utils";
import { CopyButton } from "@/components/ui/CopyButton";
import { loadReceipt, Receipt } from "@/components/docs/Receipt";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recibo", robots: { index: false } };

export default async function Recibo({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireUser();
  const { id } = await params;
  const row = await loadReceipt(id);
  if (!row) notFound();
  const link = `${await baseUrl()}/r/${row.p.id}`;
  const phone = row.a.guardianPhone || row.a.phone;
  const msg = `Oi ${firstName(row.a.guardianName || row.a.fullName)}! Confirmamos o recebimento de ${brl(row.p.amountCents)} referente a ${row.o.title}. Obrigado! 🙏\nSeu recibo: ${link}`;
  return (
    <Receipt
      row={row}
      signer={s.name}
      toolbar={
        <>
          <Link href={`/atletas/${row.a.id}?tab=financeiro`} className="mr-auto inline-flex items-center gap-1 text-sm text-slate-600 hover:text-ink-900">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <CopyButton text={link} label="Copiar link do recibo" className="btn-ghost btn-sm bg-white" />
          <a href={waLink(phone, msg)} target="_blank" rel="noreferrer" className="btn btn-sm bg-[#25D366] text-white hover:bg-[#1ebe5a]">
            <MessageCircle className="size-4" /> Enviar no WhatsApp
          </a>
        </>
      }
    />
  );
}
