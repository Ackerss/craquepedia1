import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateAthlete } from "@/actions/athletes";
import { AthleteForm } from "@/components/athlete/AthleteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAthlete, listUsers } from "@/lib/data";

export default async function EditarAtleta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [a, users] = await Promise.all([getAthlete(id), listUsers()]);
  if (!a) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/atletas/${id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Voltar ao atleta
      </Link>
      <PageHeader title={`Editar ${a.nickname || a.fullName}`} />
      <AthleteForm action={updateAthlete.bind(null, id)} users={users} submitLabel="Salvar alterações" athlete={a} />
    </div>
  );
}
