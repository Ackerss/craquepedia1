import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAthleteBySlug } from "@/lib/data";
import { buildResumeData } from "@/lib/resume-data";
import { getTemplate } from "@/lib/templates";
import { ResumeViewer } from "@/components/resume/Viewer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ m?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { m } = await searchParams;
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) return { title: "Currículo", robots: { index: false } };
  const en = getTemplate(m ?? "moderno").lang === "en";
  return {
    title: `${en ? "Resume" : "Currículo"} ${a.nickname || a.fullName}`,
    description: (en ? a.bioEn : a.bioShort) ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function CurriculoPublico({ params, searchParams }: Props) {
  const { slug } = await params;
  const { m } = await searchParams;
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) notFound();
  const t = getTemplate(m ?? "moderno");
  const data = await buildResumeData(a, t.lang);
  return <ResumeViewer data={data} template={t.id} hrefBase={`/cv/${a.slug}`} printLabel={t.lang === "en" ? "Download PDF" : "Baixar PDF"} />;
}
