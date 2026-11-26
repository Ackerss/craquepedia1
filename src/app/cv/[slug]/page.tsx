import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAthleteBySlug } from "@/lib/data";
import { buildResumeData } from "@/lib/resume-data";
import { getTemplate, officialTemplate, resolveLang } from "@/lib/templates";
import { ResumeViewer } from "@/components/resume/Viewer";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ m?: string; lang?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { m, lang } = await searchParams;
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) return { title: "Currículo", robots: { index: false } };
  const en = resolveLang(m ? getTemplate(m) : officialTemplate(a), lang) === "en";
  return {
    title: `${en ? "Resume" : "Currículo"} ${a.nickname || a.fullName}`,
    description: (en ? a.bioEn : a.bioShort) ?? undefined,
    robots: { index: false, follow: false },
  };
}

export default async function CurriculoPublico({ params, searchParams }: Props) {
  const { slug } = await params;
  const { m, lang } = await searchParams;
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) notFound();
  // sem ?m= abre o modelo "oficial" escolhido pela equipe
  const t = m ? getTemplate(m) : officialTemplate(a);
  const l = resolveLang(t, lang);
  const data = await buildResumeData(a, l);
  return <ResumeViewer data={data} template={t.id} hrefBase={`/cv/${a.slug}`} sport={a.sport} printLabel={l === "en" ? "Download PDF" : "Baixar PDF"} publicView />;
}
