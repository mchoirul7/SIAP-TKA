import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getAnalysisCatalog,
  getPracticePackageBySlug,
  getQuestionsForPackage,
} from "@/services/content-service";
import { hasServerContentAccess } from "@/lib/server-entitlements";
import { PracticeResultView } from "./PracticeResultView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Hasil Latihan",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function PracticeResultPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPracticePackageBySlug(slug);
  if (!pkg) notFound();
  if (!(await hasServerContentAccess(pkg))) redirect(`/latihan/${pkg.slug}`);

  const [questions, catalog] = await Promise.all([
    getQuestionsForPackage(slug),
    getAnalysisCatalog(),
  ]);

  return <PracticeResultView pkg={pkg} questions={questions} catalog={catalog} />;
}
