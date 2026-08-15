import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPracticePackageBySlug,
  getPracticePackages,
  getSubjects,
  getSubtopics,
  getTopics,
} from "@/services/content-service";
import { PackageDetail } from "./PackageDetail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const packages = await getPracticePackages();
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPracticePackageBySlug(slug);
  if (!pkg) return { title: "Paket tidak ditemukan" };
  return { title: pkg.title, description: pkg.summary };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [pkg, topics, subtopics, subjects] = await Promise.all([
    getPracticePackageBySlug(slug),
    getTopics(),
    getSubtopics(),
    getSubjects(),
  ]);
  if (!pkg) notFound();

  return (
    <PackageDetail
      pkg={pkg}
      topicName={topics.find((topic) => topic.id === pkg.topicId)?.name ?? ""}
      subtopicName={subtopics.find((subtopic) => subtopic.id === pkg.subtopicId)?.name ?? ""}
      subjectName={subjects.find((subject) => subject.id === pkg.subjectId)?.name ?? ""}
    />
  );
}
