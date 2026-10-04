import type { Metadata } from "next";
import { ExamStepPage, examStepMetadata } from "../ExamStepPage";

interface PageProps {
  params: Promise<{ jenis: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { jenis } = await params;
  return examStepMetadata([jenis]);
}

export default async function ExamTypePage({ params }: PageProps) {
  const { jenis } = await params;
  return <ExamStepPage segments={[jenis]} />;
}
