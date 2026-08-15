import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionsForTryout, getTryoutBySlug, getTryouts } from "@/services/content-service";
import { ExamRunner } from "./ExamRunner";

interface PageProps {
  params: Promise<{ tryoutSlug: string }>;
}

export const metadata: Metadata = {
  title: "Sedang mengerjakan simulasi",
  robots: { index: false },
};

export async function generateStaticParams() {
  const tryouts = await getTryouts();
  return tryouts.map((tryout) => ({ tryoutSlug: tryout.slug }));
}

export default async function AttemptPage({ params }: PageProps) {
  const { tryoutSlug } = await params;
  const tryout = await getTryoutBySlug(tryoutSlug);
  if (!tryout) notFound();

  const questions = await getQuestionsForTryout(tryoutSlug);
  return <ExamRunner tryout={tryout} questions={questions} />;
}
