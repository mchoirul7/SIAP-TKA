import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getQuestionsForTryout, getSubjects, getTryoutBySlug } from "@/services/content-service";
import { hasServerContentAccess } from "@/lib/server-entitlements";
import { ExamRunner } from "./ExamRunner";

interface PageProps {
  params: Promise<{ tryoutSlug: string }>;
}

export const metadata: Metadata = {
  title: "Sedang mengerjakan simulasi",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AttemptPage({ params }: PageProps) {
  const { tryoutSlug } = await params;
  const tryout = await getTryoutBySlug(tryoutSlug);
  if (!tryout) notFound();
  if (!(await hasServerContentAccess(tryout))) redirect(`/tryout/${tryout.slug}`);

  const [questions, subjects] = await Promise.all([
    getQuestionsForTryout(tryoutSlug),
    getSubjects(),
  ]);
  const subjectName = subjects.find((subject) => subject.id === tryout.subjectId)?.name ?? "";

  return <ExamRunner tryout={tryout} questions={questions} subjectName={subjectName} />;
}
