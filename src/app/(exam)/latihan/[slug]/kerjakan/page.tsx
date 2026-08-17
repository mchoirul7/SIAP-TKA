import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getPracticePackageBySlug,
  getQuestionsForPackage,
} from "@/services/content-service";
import { hasServerContentAccess } from "@/lib/server-entitlements";
import { PracticeRunner } from "./PracticeRunner";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: "Latihan Online",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function PracticeRunnerPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPracticePackageBySlug(slug);
  if (!pkg) notFound();
  if (!(await hasServerContentAccess(pkg))) redirect(`/latihan/${pkg.slug}`);

  return <PracticeRunner pkg={pkg} questions={await getQuestionsForPackage(slug)} />;
}
