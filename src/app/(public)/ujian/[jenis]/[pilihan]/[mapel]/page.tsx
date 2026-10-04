import type { Metadata } from "next";
import { ExamStepPage, examStepMetadata } from "../../../ExamStepPage";

interface PageProps {
  params: Promise<{ jenis: string; pilihan: string; mapel: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { jenis, pilihan, mapel } = await params;
  return examStepMetadata([jenis, pilihan, mapel]);
}

/** Daftar paket STS/SAS per semester — lihat `ExamStepPage`. */
export default async function ExamSemesterPackagesPage({ params }: PageProps) {
  const { jenis, pilihan, mapel } = await params;
  return <ExamStepPage segments={[jenis, pilihan, mapel]} />;
}
