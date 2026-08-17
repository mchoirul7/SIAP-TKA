import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, courseSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";
import { getSubjects, getTryoutBySlug, getTryouts } from "@/services/content-service";
import { TryoutIntro } from "./TryoutIntro";

interface PageProps {
  params: Promise<{ tryoutSlug: string }>;
}

export async function generateStaticParams() {
  const tryouts = await getTryouts();
  return tryouts.map((tryout) => ({ tryoutSlug: tryout.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tryoutSlug } = await params;
  const tryout = await getTryoutBySlug(tryoutSlug);
  if (!tryout) return { title: "Tryout tidak ditemukan", robots: { index: false } };

  const subject = (await getSubjects()).find((item) => item.id === tryout.subjectId);
  const subjectName = subject?.shortName ?? "";

  return pageMetadata({
    // Sufiks sengaja pendek: judul paket dari basis data sudah panjang, dan
    // Google memotong tampilannya di sekitar 60 aksara.
    title: `${tryout.title} — Tryout TKA`,
    description:
      tryout.description ||
      `Tryout TKA ${subjectName} jenjang ${tryout.level}: ${tryout.questionIds.length} soal dalam ${tryout.durationMinutes} menit, dikerjakan online seperti ujian sebenarnya.`,
    path: `/tryout/${tryout.slug}`,
    keywords: [
      `tryout TKA ${subjectName}`,
      `simulasi TKA ${tryout.level}`,
      `soal TKA ${subjectName}`,
      tryout.title,
    ],
  });
}

export default async function TryoutIntroPage({ params }: PageProps) {
  const { tryoutSlug } = await params;
  const tryout = await getTryoutBySlug(tryoutSlug);
  if (!tryout) notFound();

  const subjects = await getSubjects();
  const subject = subjects.find((item) => item.id === tryout.subjectId);

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            ...(subject ? [{ name: subject.name, path: `/mapel/${subject.slug}` }] : []),
            { name: tryout.title, path: `/tryout/${tryout.slug}` },
          ]),
          courseSchema({
            name: tryout.title,
            description: tryout.description,
            path: `/tryout/${tryout.slug}`,
            minutes: tryout.durationMinutes,
          }),
        )}
      />

      <TryoutIntro tryout={tryout} subjectName={subject?.name ?? ""} />
    </>
  );
}
