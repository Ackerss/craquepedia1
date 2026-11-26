import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadReceipt, Receipt } from "@/components/docs/Receipt";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recibo", robots: { index: false, follow: false } };

/** Link público do recibo (o id do pagamento é aleatório e impossível de adivinhar). */
export default async function ReciboPublico({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await loadReceipt(id);
  if (!row) notFound();
  return <Receipt row={row} />;
}
