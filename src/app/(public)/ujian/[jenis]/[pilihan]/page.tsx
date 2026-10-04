import type { Metadata } from "next";
import { ExamStepPage, examStepMetadata } from "../../ExamStepPage";

interface PageProps {
  params: Promise<{ jenis: string; pilihan: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { jenis, pilihan } = await params;
  return examStepMetadata([jenis, pilihan]);
}

/** Semester (STS/SAS) atau mapel (TKA/UH) — lihat `ExamStepPage`. */
export default async function ExamChoicePage({ params }: PageProps) {
  const { jenis, pilihan } = await params;
  return <ExamStepPage segments={[jenis, pilihan]} />;
}
