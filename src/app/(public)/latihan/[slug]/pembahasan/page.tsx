import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPracticePackageBySlug,
  getPracticePackages,
  getQuestionsForPackage,
} from "@/services/practice-service";
import { ExplanationView } from "./ExplanationView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Pembahasan",
  robots: { index: false },
};

export function generateStaticParams() {
  return getPracticePackages().map((pkg) => ({ slug: pkg.slug }));
}

export default async function ExplanationPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = getPracticePackageBySlug(slug);
  if (!pkg) notFound();

  return <ExplanationView pkg={pkg} questions={getQuestionsForPackage(slug)} />;
}
