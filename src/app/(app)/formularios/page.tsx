import Link from "next/link";
import { BellRing, ClipboardList, ExternalLink } from "lucide-react";
import { getCompany, listIntakes, listPackages } from "@/lib/data";
import { baseUrl } from "@/lib/server-utils";
import { getSport } from "@/lib/sports";
import { firstName, fmtDate, msSince, relTime, waLink } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { Empty, PageHeader } from "@/components/ui/PageHeader";
import { DeleteIntake } from "./DeleteIntake";
import { NewIntake } from "./NewIntake";
import { SportBadge } from "@/components/ui/SportIcon";

export const metadata = { title: "Formulários" };
export const dynamic = "force-dynamic";

const ST: Record<string, { label: string; color: string }> = {
  aberto: { label: "Aguardando atleta", color: "#d97706" },
  recebido: { label: "Recebido · IA organizando", color: "#2563eb" },
  processado: { label: "Recebido e organizado", color: "#16a34a" },
};

export default async function Formularios({ searchParams }: { searchParams: Promise<{ novo?: string }> }) {
  const { novo } = await searchParams;
  const [list, packages, base, company] = await Promise.all([listIntakes(), listPackages(true), baseUrl(), getCompany()]);
  const waiting = list.filter((i) => i.status === "aberto").length;
  return (
    <div>
      <PageHeader
        title="Formulários"
        subtitle={
          <>
            Mande um link pelo WhatsApp. O atleta preenche pelo celular e o perfil aparece aqui pronto, organizado pela IA.
            {waiting ? <span className="ml-1 font-medium text-amber-700">{waiting} aguardando resposta.</span> : null}
          </>
        }
        actions={<NewIntake packages={packages} autoOpen={!!novo} />}
      />
      {list.length === 0 ? (
        <Empty icon={<ClipboardList className="size-6" />} title="Nenhum link enviado ainda" text="Crie um link e envie para o atleta preencher os dados e as fotos." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {list.map((i) => {
            const st = ST[i.status] ?? ST.aberto;
            const sport = i.sport ? getSport(i.sport) : null;
            const isNew = !!i.submittedAt && !i.seenAt;
            const days = Math.floor(msSince(i.createdAt) / 86400000);
            const link = `${base}/f/${i.token}`;
            const reminder = `Oi${i.clientName ? ` ${firstName(i.clientName)}` : ""}! Tudo bem? Aqui é da ${company.name} 👋 Ainda falta preencher o seu formulário de atleta, leva uns 5 minutos e já começamos o seu material:\n${link}`;
            return (
              <div key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <SportBadge sport={sport?.slug ?? "outro"} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium text-ink-900">
                    {i.clientName || "Atleta sem nome"}
                    {isNew ? <span className="badge bg-brand-600 text-white">Novo</span> : null}
                  </p>
                  <p className="text-sm text-slate-500">
                    Criado {relTime(i.createdAt)}
                    {i.submittedAt ? ` · enviado em ${fmtDate(i.submittedAt)}` : days >= 2 ? ` · sem resposta há ${days} dias` : ""}
                  </p>
                </div>
                <Badge color={st.color}>{st.label}</Badge>
                <div className="flex items-center gap-1">
                  {i.status === "aberto" ? (
                    <>
                      <CopyButton text={link} label="Copiar link" />
                      {i.clientPhone ? (
                        <a href={waLink(i.clientPhone, reminder)} target="_blank" rel="noreferrer" className="btn-ghost btn-sm" title="Lembrar o atleta pelo WhatsApp">
                          <BellRing className="size-4" /> Lembrar
                        </a>
                      ) : null}
                    </>
                  ) : null}
                  {i.athleteId ? (
                    <Link href={`/atletas/${i.athleteId}`} className="btn-ghost btn-sm">
                      <ExternalLink className="size-4" /> Ver atleta
                    </Link>
                  ) : null}
                  <DeleteIntake id={i.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
