import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAnalysisCatalog,
  getPracticePackageBySlug,
  getPracticePackages,
  getQuestionsForPackage,
} from "@/services/content-service";
import { PracticeResultView } from "./PracticeResultView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Hasil Latihan",
  robots: { index: false },
};

export async function generateStaticParams() {
  const packages = await getPracticePackages();
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export default async function PracticeResultPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPracticePackageBySlug(slug);
  if (!pkg) notFound();

  const [questions, catalog] = await Promise.all([
    getQuestionsForPackage(slug),
    getAnalysisCatalog(),
  ]);

  return <PracticeResultView pkg={pkg} questions={questions} catalog={catalog} />;
}
