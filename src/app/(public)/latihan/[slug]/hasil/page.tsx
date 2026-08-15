import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPracticePackageBySlug, getPracticePackages } from "@/services/practice-service";
import { PracticeResultView } from "./PracticeResultView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Hasil Latihan",
  robots: { index: false },
};

export function generateStaticParams() {
  return getPracticePackages().map((pkg) => ({ slug: pkg.slug }));
}

export default async function PracticeResultPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = getPracticePackageBySlug(slug);
  if (!pkg) notFound();

  return <PracticeResultView pkg={pkg} />;
}
