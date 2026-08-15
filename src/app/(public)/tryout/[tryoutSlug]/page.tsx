import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubjects, getTryoutBySlug, getTryouts } from "@/services/content-service";
import { TryoutIntro } from "./TryoutIntro";

interface PageProps {
  params: Promise<{ tryoutSlug: string }>;
}

export async function generateStaticParams() {
  const tryouts = await getTryouts();
  return tryouts.map((tryout) => ({ tryoutSlug: tryout.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tryoutSlug } = await params;
  const tryout = await getTryoutBySlug(tryoutSlug);
  if (!tryout) return { title: "Tryout tidak ditemukan" };
  return { title: tryout.title, description: tryout.description };
}

export default async function TryoutIntroPage({ params }: PageProps) {
  const { tryoutSlug } = await params;
  const tryout = await getTryoutBySlug(tryoutSlug);
  if (!tryout) notFound();

  const subjects = await getSubjects();
  const subject = subjects.find((item) => item.id === tryout.subjectId);

  return <TryoutIntro tryout={tryout} subjectName={subject?.name ?? ""} />;
}
