import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { subtopics, topics } from "@/data/subjects";
import {
  getPracticePackageBySlug,
  getPracticePackages,
} from "@/services/practice-service";
import { PackageDetail } from "./PackageDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPracticePackages().map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPracticePackageBySlug(slug);
  if (!pkg) return { title: "Paket tidak ditemukan" };
  return { title: pkg.title, description: pkg.summary };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = getPracticePackageBySlug(slug);
  if (!pkg) notFound();

  return (
    <PackageDetail
      pkg={pkg}
      topicName={topics.find((topic) => topic.id === pkg.topicId)?.name ?? ""}
      subtopicName={subtopics.find((subtopic) => subtopic.id === pkg.subtopicId)?.name ?? ""}
      subjectName=""
    />
  );
}
