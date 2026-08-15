import { concepts } from "@/data/concepts";
import { misconceptions } from "@/data/misconceptions";
import { practicePackages } from "@/data/practicePackages";
import { subtopicPrerequisites } from "@/data/prerequisites";
import { subtopics, topics } from "@/data/subjects";
import type {
  AnswerMap,
  AnswerValue,
  Concept,
  ConceptPrerequisite,
  Misconception,
  PracticePackage,
  Question,
  Subtopic,
  SubtopicPrerequisite,
  Topic,
} from "@/data/types";
import { isAnswered, isCorrectAnswer, misconceptionIdsFor } from "@/lib/answers";

/**
 * Seluruh perhitungan hasil dikumpulkan di file ini sebagai fungsi murni
 * (masukan: soal + jawaban, keluaran: analisis). Ketika backend ditambahkan,
 * fungsi yang sama dapat dijalankan di server tanpa perubahan.
 */

export type MasteryStatus = "perlu-diperkuat" | "cukup" | "dikuasai";

export type { AnswerMap };

export interface MasteryBucket {
  id: string;
  name: string;
  total: number;
  answered: number;
  correct: number;
  /** 0–100, dibulatkan. Soal kosong dihitung sebagai belum tepat. */
  accuracy: number;
  status: MasteryStatus;
}

export interface PriorityItem extends MasteryBucket {
  topicName: string;
  description: string;
}

export interface PrerequisiteAdvice {
  subtopicId: string;
  name: string;
  accuracy: number;
  /** Nama subtopik prioritas yang bertumpu pada materi ini. */
  supports: string[];
  reason: string;
}

export interface MisconceptionSignal {
  id: string;
  label: string;
  insight: string;
  count: number;
}

export interface AnalysisCatalog {
  topics?: Topic[];
  subtopics?: Subtopic[];
  concepts?: Concept[];
  misconceptions?: Misconception[];
  subtopicPrerequisites?: SubtopicPrerequisite[];
  conceptPrerequisites?: ConceptPrerequisite[];
  practicePackages?: PracticePackage[];
}

export interface TryoutAnalysis {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  /** 0–100 */
  score: number;
  status: MasteryStatus;
  byTopic: MasteryBucket[];
  bySubtopic: MasteryBucket[];
  byConcept: MasteryBucket[];
  byDifficulty: MasteryBucket[];
  priorities: PriorityItem[];
  prerequisiteAdvice: PrerequisiteAdvice | null;
  misconceptionSignals: MisconceptionSignal[];
  recommendedPackageSlugs: string[];
}

export const MASTERY_THRESHOLD = 80;
export const SUFFICIENT_THRESHOLD = 60;

export function statusFromAccuracy(accuracy: number): MasteryStatus {
  if (accuracy >= MASTERY_THRESHOLD) return "dikuasai";
  if (accuracy >= SUFFICIENT_THRESHOLD) return "cukup";
  return "perlu-diperkuat";
}

export function isCorrect(question: Question, answer: AnswerValue | undefined): boolean {
  return isCorrectAnswer(question, answer);
}

const difficultyLabel: Record<string, string> = {
  dasar: "Dasar",
  menengah: "Menengah",
  lanjut: "Lanjut",
};

function resolveCatalog(catalog: AnalysisCatalog = {}) {
  const topicList = catalog.topics ?? topics;
  const subtopicList = catalog.subtopics ?? subtopics;
  const conceptList = catalog.concepts ?? concepts;
  const misconceptionList = catalog.misconceptions ?? misconceptions;

  return {
    topics: topicList,
    subtopics: subtopicList,
    concepts: conceptList,
    misconceptions: misconceptionList,
    subtopicPrerequisites: catalog.subtopicPrerequisites ?? subtopicPrerequisites,
    conceptPrerequisites: catalog.conceptPrerequisites ?? [],
    practicePackages: catalog.practicePackages ?? practicePackages,
    topicById: new Map(topicList.map((topic) => [topic.id, topic])),
    subtopicById: new Map(subtopicList.map((subtopic) => [subtopic.id, subtopic])),
    conceptById: new Map(conceptList.map((concept) => [concept.id, concept])),
    misconceptionById: new Map(
      misconceptionList.map((misconception) => [misconception.id, misconception]),
    ),
  };
}

interface Tally {
  total: number;
  answered: number;
  correct: number;
}

function tallyBy(
  questions: Question[],
  answers: AnswerMap,
  keyOf: (question: Question) => string,
): Map<string, Tally> {
  const result = new Map<string, Tally>();
  for (const question of questions) {
    const key = keyOf(question);
    const entry = result.get(key) ?? { total: 0, answered: 0, correct: 0 };
    entry.total += 1;
    if (isAnswered(question, answers[question.id])) entry.answered += 1;
    if (isCorrect(question, answers[question.id])) entry.correct += 1;
    result.set(key, entry);
  }
  return result;
}

function toBuckets(
  tallies: Map<string, Tally>,
  nameOf: (id: string) => string,
  order?: string[],
): MasteryBucket[] {
  const buckets: MasteryBucket[] = [];
  for (const [id, tally] of tallies) {
    const accuracy = tally.total === 0 ? 0 : Math.round((tally.correct / tally.total) * 100);
    buckets.push({
      id,
      name: nameOf(id),
      total: tally.total,
      answered: tally.answered,
      correct: tally.correct,
      accuracy,
      status: statusFromAccuracy(accuracy),
    });
  }
  if (order) {
    buckets.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }
  return buckets;
}

function buildPrerequisiteAdvice(
  priorities: PriorityItem[],
  bySubtopicId: Map<string, MasteryBucket>,
  prerequisites: SubtopicPrerequisite[],
): PrerequisiteAdvice | null {
  const priorityIds = new Set(priorities.map((p) => p.id));
  const candidates = new Map<string, { supports: string[]; reason: string }>();

  for (const priority of priorities) {
    const rules = prerequisites.filter((rule) => rule.subtopicId === priority.id);
    for (const rule of rules) {
      const prerequisiteBucket = bySubtopicId.get(rule.requiresSubtopicId);
      // Hanya disarankan bila prasyaratnya ikut diujikan dan hasilnya belum kuat.
      if (!prerequisiteBucket || prerequisiteBucket.accuracy >= MASTERY_THRESHOLD) continue;
      if (priorityIds.has(rule.requiresSubtopicId) === false && prerequisiteBucket.status === "cukup") {
        continue;
      }
      const entry = candidates.get(rule.requiresSubtopicId) ?? { supports: [], reason: rule.reason };
      entry.supports.push(priority.name);
      candidates.set(rule.requiresSubtopicId, entry);
    }
  }

  if (candidates.size === 0) return null;

  const ranked = [...candidates.entries()].sort((a, b) => {
    const supportDiff = b[1].supports.length - a[1].supports.length;
    if (supportDiff !== 0) return supportDiff;
    return (bySubtopicId.get(a[0])?.accuracy ?? 0) - (bySubtopicId.get(b[0])?.accuracy ?? 0);
  });

  const [subtopicId, entry] = ranked[0];
  const bucket = bySubtopicId.get(subtopicId);
  if (!bucket) return null;

  return {
    subtopicId,
    name: bucket.name,
    accuracy: bucket.accuracy,
    supports: entry.supports,
    reason: entry.reason,
  };
}

function buildMisconceptionSignals(
  questions: Question[],
  answers: AnswerMap,
  misconceptionById: Map<string, Misconception>,
  minimumOccurrence = 2,
): MisconceptionSignal[] {
  const counts = new Map<string, number>();
  for (const question of questions) {
    for (const id of misconceptionIdsFor(question, answers[question.id])) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= minimumOccurrence)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .flatMap(([id, count]) => {
      const misconception = misconceptionById.get(id);
      if (!misconception) return [];
      return [{ id, label: misconception.label, insight: misconception.insight, count }];
    });
}

export function analyzeTryout(
  questions: Question[],
  answers: AnswerMap,
  catalog?: AnalysisCatalog,
): TryoutAnalysis {
  return analyzeTryoutWithCatalog(questions, answers, catalog);
}

export function analyzeTryoutWithCatalog(
  questions: Question[],
  answers: AnswerMap,
  catalog?: AnalysisCatalog,
): TryoutAnalysis {
  const resolved = resolveCatalog(catalog);
  const totalQuestions = questions.length;
  const answeredCount = questions.filter((q) => isAnswered(q, answers[q.id])).length;
  const correctCount = questions.filter((q) => isCorrect(q, answers[q.id])).length;
  const unansweredCount = totalQuestions - answeredCount;
  const wrongCount = totalQuestions - correctCount - unansweredCount;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  const byTopic = toBuckets(
    tallyBy(questions, answers, (q) => q.topicId),
    (id) => resolved.topicById.get(id)?.name ?? id,
    resolved.topics.map((t) => t.id),
  );
  const bySubtopic = toBuckets(
    tallyBy(questions, answers, (q) => q.subtopicId),
    (id) => resolved.subtopicById.get(id)?.name ?? id,
    resolved.subtopics.map((s) => s.id),
  );
  const byConcept = toBuckets(
    tallyBy(questions, answers, (q) => q.conceptId),
    (id) => resolved.conceptById.get(id)?.name ?? id,
  );
  const byDifficulty = toBuckets(
    tallyBy(questions, answers, (q) => q.difficulty),
    (id) => difficultyLabel[id] ?? id,
    ["dasar", "menengah", "lanjut"],
  );

  const bySubtopicId = new Map(bySubtopic.map((bucket) => [bucket.id, bucket]));

  const priorities: PriorityItem[] = bySubtopic
    .filter((bucket) => bucket.accuracy < MASTERY_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, 3)
    .map((bucket) => {
      const subtopic = resolved.subtopicById.get(bucket.id);
      const topic = subtopic ? resolved.topicById.get(subtopic.topicId) : undefined;
      return {
        ...bucket,
        topicName: topic?.name ?? "",
        description: subtopic?.description ?? "",
      };
    });

  const prerequisiteAdvice = buildPrerequisiteAdvice(
    priorities,
    bySubtopicId,
    resolved.subtopicPrerequisites,
  );

  // Paket yang disarankan mengikuti urutan prioritas; prasyarat didahulukan bila ada.
  const orderedSubtopicIds = [
    ...(prerequisiteAdvice ? [prerequisiteAdvice.subtopicId] : []),
    ...priorities.map((p) => p.id),
  ];
  const recommendedPackageSlugs: string[] = [];
  for (const subtopicId of orderedSubtopicIds) {
    const pkg = resolved.practicePackages.find((p) => p.subtopicId === subtopicId);
    if (pkg && !recommendedPackageSlugs.includes(pkg.slug)) {
      recommendedPackageSlugs.push(pkg.slug);
    }
  }

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    wrongCount,
    unansweredCount,
    score,
    status: statusFromAccuracy(score),
    byTopic,
    bySubtopic,
    byConcept,
    byDifficulty,
    priorities,
    prerequisiteAdvice,
    misconceptionSignals: buildMisconceptionSignals(
      questions,
      answers,
      resolved.misconceptionById,
    ),
    recommendedPackageSlugs,
  };
}

export interface PracticeAnalysis {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  status: MasteryStatus;
  conceptsToReview: MasteryBucket[];
  strongConcepts: MasteryBucket[];
  misconceptionSignals: MisconceptionSignal[];
}

export function analyzePractice(
  questions: Question[],
  answers: AnswerMap,
  catalog?: AnalysisCatalog,
): PracticeAnalysis {
  return analyzePracticeWithCatalog(questions, answers, catalog);
}

export function analyzePracticeWithCatalog(
  questions: Question[],
  answers: AnswerMap,
  catalog?: AnalysisCatalog,
): PracticeAnalysis {
  const resolved = resolveCatalog(catalog);
  const totalQuestions = questions.length;
  const correctCount = questions.filter((q) => isCorrect(q, answers[q.id])).length;
  const answeredCount = questions.filter((q) => isAnswered(q, answers[q.id])).length;
  const unansweredCount = totalQuestions - answeredCount;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  const byConcept = toBuckets(
    tallyBy(questions, answers, (q) => q.conceptId),
    (id) => resolved.conceptById.get(id)?.name ?? id,
  );

  return {
    totalQuestions,
    correctCount,
    wrongCount: totalQuestions - correctCount - unansweredCount,
    unansweredCount,
    score,
    status: statusFromAccuracy(score),
    conceptsToReview: byConcept
      .filter((bucket) => bucket.accuracy < MASTERY_THRESHOLD)
      .sort((a, b) => a.accuracy - b.accuracy),
    strongConcepts: byConcept.filter((bucket) => bucket.accuracy >= MASTERY_THRESHOLD),
    misconceptionSignals: buildMisconceptionSignals(
      questions,
      answers,
      resolved.misconceptionById,
      1,
    ),
  };
}
