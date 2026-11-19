import Link from "next/link";
import { Send } from "lucide-react";
import { createAthlete } from "@/actions/athletes";
import { AthleteForm } from "@/components/athlete/AthleteForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/auth";
import { listUsers } from "@/lib/data";

export const metadata = { title: "Novo atleta" };

export default async function NovoAtleta() {
  const s = await requireUser();
  const users = await listUsers();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Novo atleta"
        subtitle="Preencha o que tiver. O resto você completa depois, ou deixa o próprio atleta preencher."
        actions={
          <Link href="/formularios?novo=1" className="btn-ghost">
            <Send className="size-4" /> Prefiro enviar formulário ao atleta
          </Link>
        }
      />
      <AthleteForm action={createAthlete} users={users} submitLabel="Cadastrar atleta" athlete={{ responsibleId: s.uid }} />
    </div>
  );
}
