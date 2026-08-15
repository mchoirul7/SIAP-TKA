import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestionsForTryout, getTryoutBySlug, getTryouts } from "@/services/content-service";
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
  const questions = await getQuestionsForTryout(tryoutSlug);
  return <TryoutResultView tryout={tryout} questions={questions} />;
}
