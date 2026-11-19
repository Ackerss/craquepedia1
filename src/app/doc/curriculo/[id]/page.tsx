import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAthlete } from "@/lib/data";
import { buildResumeData } from "@/lib/resume-data";
import { getTemplate } from "@/lib/templates";
import { ResumeViewer } from "@/components/resume/Viewer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ m?: string; embed?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = await getAthlete(id);
  return { title: a ? `Currículo ${a.nickname || a.fullName}` : "Currículo", robots: { index: false } };
}

export default async function CurriculoInterno({ params, searchParams }: Props) {
  await requireUser();
  const { id } = await params;
  const { m, embed } = await searchParams;
  const a = await getAthlete(id);
  if (!a) notFound();
  const t = getTemplate(m);
  const data = await buildResumeData(a, t.lang);
  return <ResumeViewer data={data} template={t.id} hrefBase={`/doc/curriculo/${a.id}`} backHref={`/atletas/${a.id}?tab=materiais`} embed={embed === "1"} />;
}
