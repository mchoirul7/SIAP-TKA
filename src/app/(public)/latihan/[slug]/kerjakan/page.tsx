import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPracticePackageBySlug,
  getPracticePackages,
  getQuestionsForPackage,
} from "@/services/content-service";
import { PracticeRunner } from "./PracticeRunner";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Latihan Online",
  robots: { index: false },
};

export async function generateStaticParams() {
  const packages = await getPracticePackages();
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export default async function PracticeRunnerPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPracticePackageBySlug(slug);
  if (!pkg) notFound();

  return <PracticeRunner pkg={pkg} questions={await getQuestionsForPackage(slug)} />;
}
