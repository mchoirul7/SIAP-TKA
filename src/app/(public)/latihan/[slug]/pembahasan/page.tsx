import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getAnalysisCatalog,
  getPracticePackageBySlug,
  getQuestionsForPackage,
  getSubjects,
} from "@/services/content-service";
import { buildQuestionLabels } from "@/lib/question-labels";
import { hasServerContentAccess } from "@/lib/server-entitlements";
import { isMathSubject } from "@/lib/subject-theme";
import { ExplanationView } from "./ExplanationView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Pembahasan",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ExplanationPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPracticePackageBySlug(slug);
  if (!pkg) notFound();
  if (!(await hasServerContentAccess(pkg))) redirect(`/latihan/${pkg.slug}`);

  const [questions, subjects] = await Promise.all([getQuestionsForPackage(slug), getSubjects()]);
  const subject = subjects.find((item) => item.id === pkg.subjectId);

  // Katalog dipakai dua kali: penanda soal dan penjelasan pola keliru. Label
  // diagnostik baru disiapkan untuk Matematika; mata pelajaran lain penandaannya
  // belum lengkap sehingga kepingnya akan setengah kosong.
  const catalog = await getAnalysisCatalog();
  const labels = isMathSubject(subject) ? buildQuestionLabels(questions, catalog) : undefined;

  return (
    <ExplanationView
      pkg={pkg}
      questions={questions}
      questionLabels={labels}
      misconceptions={catalog.misconceptions}
    />
  );
}
