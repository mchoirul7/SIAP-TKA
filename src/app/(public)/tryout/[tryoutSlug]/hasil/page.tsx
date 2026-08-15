import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAnalysisCatalog,
  getQuestionsForTryout,
  getSubjects,
  getTryoutBySlug,
  getTryouts,
} from "@/services/content-service";
import { buildQuestionLabels } from "@/lib/question-labels";
import { isMathSubject } from "@/lib/subject-theme";
import { TryoutResultView } from "./TryoutResultView";

interface PageProps {
  params: Promise<{ tryoutSlug: string }>;
}

export const metadata: Metadata = {
  title: "Hasil Simulasi",
  robots: { index: false },
};

export async function generateStaticParams() {
  const tryouts = await getTryouts();
  return tryouts.map((tryout) => ({ tryoutSlug: tryout.slug }));
}

export default async function TryoutResultPage({ params }: PageProps) {
  const { tryoutSlug } = await params;
  const tryout = await getTryoutBySlug(tryoutSlug);
  if (!tryout) notFound();

  // Soal diambil di server; perhitungan hasilnya tetap di perangkat pengguna.
  const [questions, catalog, subjects] = await Promise.all([
    getQuestionsForTryout(tryoutSlug),
    getAnalysisCatalog(),
    getSubjects(),
  ]);

  // Label diagnostik baru disiapkan untuk Matematika; mata pelajaran lain
  // penandaannya belum lengkap sehingga kepingnya akan setengah kosong.
  const subject = subjects.find((item) => item.id === tryout.subjectId);
  const questionLabels = isMathSubject(subject)
    ? buildQuestionLabels(questions, catalog)
    : undefined;

  return (
    <TryoutResultView
      tryout={tryout}
      questions={questions}
      catalog={catalog}
      questionLabels={questionLabels}
    />
  );
}
