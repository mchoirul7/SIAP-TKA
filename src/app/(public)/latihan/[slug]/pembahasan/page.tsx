import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAnalysisCatalog,
  getPracticePackageBySlug,
  getPracticePackages,
  getQuestionsForPackage,
  getSubjects,
} from "@/services/content-service";
import { buildQuestionLabels } from "@/lib/question-labels";
import { isMathSubject } from "@/lib/subject-theme";
import { ExplanationView } from "./ExplanationView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Pembahasan",
  robots: { index: false },
};

export async function generateStaticParams() {
  const packages = await getPracticePackages();
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export default async function ExplanationPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPracticePackageBySlug(slug);
  if (!pkg) notFound();

  const [questions, subjects] = await Promise.all([getQuestionsForPackage(slug), getSubjects()]);
  const subject = subjects.find((item) => item.id === pkg.subjectId);

  // Label diagnostik baru disiapkan untuk Matematika; mata pelajaran lain
  // penandaannya belum lengkap sehingga kepingnya akan setengah kosong.
  const labels = isMathSubject(subject)
    ? buildQuestionLabels(questions, await getAnalysisCatalog())
    : undefined;

  return <ExplanationView pkg={pkg} questions={questions} questionLabels={labels} />;
}
