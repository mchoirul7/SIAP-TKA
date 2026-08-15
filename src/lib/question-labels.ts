import type { Question } from "@/data/types";
import { difficultyLabel, reasoningLabel } from "@/lib/format";
import type { AnalysisCatalog } from "@/lib/scoring";

/**
 * Label penanda soal, disiapkan di server dari katalog konten.
 *
 * Isinya penanda yang memang sudah melekat pada soal — konsep, subtopik,
 * tingkat kesulitan, jenis penalaran, dan kompetensi — bukan hasil perhitungan.
 * Gunanya membantu guru dan siswa membaca kelemahan: bukan sekadar tahu soal
 * mana yang salah, tetapi soal seperti apa yang salah.
 *
 * Baru dipakai untuk soal Matematika, karena penandaan mata pelajaran lain
 * belum lengkap di basis data.
 */
export interface QuestionLabel {
  conceptName: string;
  subtopicName: string;
  topicName: string;
  difficulty: string;
  reasoning: string;
  competency: string;
}

export function buildQuestionLabels(
  questions: Question[],
  catalog: AnalysisCatalog,
): Record<string, QuestionLabel> {
  const conceptById = new Map((catalog.concepts ?? []).map((item) => [item.id, item]));
  const subtopicById = new Map((catalog.subtopics ?? []).map((item) => [item.id, item]));
  const topicById = new Map((catalog.topics ?? []).map((item) => [item.id, item]));

  const labels: Record<string, QuestionLabel> = {};

  for (const question of questions) {
    const concept = conceptById.get(question.conceptId);
    const subtopic = subtopicById.get(concept?.subtopicId ?? question.subtopicId);
    const topic = topicById.get(subtopic?.topicId ?? question.topicId);

    labels[question.id] = {
      conceptName: concept?.name ?? "",
      subtopicName: subtopic?.name ?? "",
      topicName: topic?.name ?? "",
      difficulty: difficultyLabel[question.difficulty] ?? "",
      reasoning: reasoningLabel[question.reasoningType] ?? "",
      competency: question.competency ?? "",
    };
  }

  return labels;
}
