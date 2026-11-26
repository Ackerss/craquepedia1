import { eq } from "drizzle-orm";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/db";
import { intakes } from "@/db/schema";
import { getAthlete, getCompany, ready } from "@/lib/data";
import { firstName } from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { IntakeForm } from "./IntakeForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Formulário do atleta", robots: { index: false } };

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await ready();
  const [intake] = await db.select().from(intakes).where(eq(intakes.token, token)).limit(1);
  const company = await getCompany();
  // link de atualização (atleta já cadastrado): o formulário já vem preenchido com o que temos
  const a = intake?.athleteId && intake.status === "aberto" ? await getAthlete(intake.athleteId) : null;
  const prefill: Record<string, string> | undefined = a
    ? Object.fromEntries(
        Object.entries({
          fullName: a.fullName,
          nickname: a.nickname,
          birthDate: a.birthDate,
          gender: a.gender,
          city: a.city,
          state: a.state,
          nationality: a.nationality,
          secondNationality: a.secondNationality,
          phone: a.phone,
          email: a.email,
          instagram: a.instagram,
          guardianName: a.guardianName,
          guardianPhone: a.guardianPhone,
          currentClub: a.currentClub,
          heightCm: a.heightCm ? String(a.heightCm) : null,
          weightKg: a.weightKg ? String(a.weightKg) : null,
          position: a.position,
          dominantSide: a.dominantSide,
          languages: a.languages,
          edu_school: a.education?.school,
          edu_graduationYear: a.education?.graduationYear,
          edu_english: a.education?.english,
          source: a.source,
          ...Object.fromEntries(Object.entries(a.sportData ?? {}).map(([k, v]) => [`sd_${k}`, v])),
        }).filter(([, v]) => v),
      ) as Record<string, string>
    : undefined;
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto min-h-screen max-w-xl bg-white shadow-sm">
        <header className="relative overflow-hidden bg-ink-900 px-5 pb-8 pt-6 text-white">
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="font-display text-lg font-semibold uppercase tracking-wide">
              Craque<span className="text-brand-400">pedia</span>
            </span>
          </div>
          <h1 className="relative mt-5 text-2xl font-bold leading-tight">
            {intake?.clientName ? `Olá, ${firstName(intake.clientName)}! ` : "Olá! "}
            Vamos montar seu material de atleta 🏆
          </h1>
          <p className="relative mt-1.5 text-sm text-slate-300">Leva uns 5 minutos. Quanto mais detalhes, melhor fica o seu currículo.</p>
        </header>
        {!intake ? (
          <p className="px-5 py-16 text-center text-slate-600">Link inválido. Peça um novo link para a equipe {company.name}.</p>
        ) : intake.status !== "aberto" ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <CheckCircle2 className="mb-3 size-12 text-brand-600" />
            <p className="text-lg font-semibold">Este formulário já foi enviado.</p>
            <p className="mt-1 text-slate-500">Obrigado! Se precisar mudar algo, fale com a equipe pelo WhatsApp.</p>
          </div>
        ) : (
          <IntakeForm
            token={token}
            initialSport={a?.sport ?? intake.sport}
            initialName={a?.fullName ?? intake.clientName}
            initialPhone={a?.phone ?? intake.clientPhone}
            company={company.name}
            prefill={prefill}
            hasPhoto={!!a?.photoId}
          />
        )}
      </div>
    </div>
  );
}
