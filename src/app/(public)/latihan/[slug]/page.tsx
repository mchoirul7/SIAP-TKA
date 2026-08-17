import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, courseSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";
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
  if (!pkg) return { title: "Paket tidak ditemukan", robots: { index: false } };

  const subject = (await getSubjects()).find((item) => item.id === pkg.subjectId);
  const subjectName = subject?.shortName ?? "";

  return pageMetadata({
    title: `${pkg.title} — Latihan Soal TKA`,
    description:
      pkg.summary ||
      pkg.description ||
      `Paket latihan soal TKA ${subjectName} jenjang ${pkg.level}, dikerjakan online beserta pembahasannya.`,
    path: `/latihan/${pkg.slug}`,
    keywords: [
      `latihan soal TKA ${subjectName}`,
      `soal TKA ${pkg.level}`,
      pkg.title,
      ...pkg.skills,
    ],
  });
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

  const subject = subjects.find((item) => item.id === pkg.subjectId);

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            ...(subject ? [{ name: subject.name, path: `/mapel/${subject.slug}` }] : []),
            { name: pkg.title, path: `/latihan/${pkg.slug}` },
          ]),
          courseSchema({
            name: pkg.title,
            description: pkg.summary || pkg.description,
            path: `/latihan/${pkg.slug}`,
            minutes: pkg.estimatedMinutes,
          }),
        )}
      />

      <PackageDetail
        pkg={pkg}
        topicName={topics.find((topic) => topic.id === pkg.topicId)?.name ?? ""}
        subtopicName={subtopics.find((subtopic) => subtopic.id === pkg.subtopicId)?.name ?? ""}
        subjectName={subject?.name ?? ""}
      />
    </>
  );
}
