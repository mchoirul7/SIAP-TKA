import type { AnswerValue, PracticePackage, Question } from "@/data/types";
import { analyzePractice, type AnalysisCatalog, type PracticeAnalysis } from "@/lib/scoring";
import {
  clearPracticeAttempt,
  readPracticeAttempt,
  writePracticeAttempt,
  type PracticeAttempt,
} from "@/storage/attempt-storage";

export function getPracticeAttempt(slug: string): PracticeAttempt | null {
  return readPracticeAttempt(slug);
}

export function startPracticeAttempt(slug: string): PracticeAttempt | null {
  const attempt: PracticeAttempt = {
    packageSlug: slug,
    startedAt: Date.now(),
    finishedAt: null,
    answers: {},
  };
  writePracticeAttempt(attempt);
  return attempt;
}

export function savePracticeAnswer(
  slug: string,
  questionId: string,
  answer: AnswerValue,
): PracticeAttempt | null {
  const attempt = readPracticeAttempt(slug);
  if (!attempt) return null;
  const next: PracticeAttempt = {
    ...attempt,
    answers: { ...attempt.answers, [questionId]: answer },
  };
  writePracticeAttempt(next);
  return next;
}

export function finishPractice(slug: string): PracticeAttempt | null {
  const attempt = readPracticeAttempt(slug);
  if (!attempt) return null;
  const next: PracticeAttempt = { ...attempt, finishedAt: attempt.finishedAt ?? Date.now() };
  writePracticeAttempt(next);
  return next;
}

export function resetPractice(slug: string): void {
  clearPracticeAttempt(slug);
}

export interface PracticeResult {
  pkg: PracticePackage;
  attempt: PracticeAttempt;
  analysis: PracticeAnalysis;
  elapsedSeconds: number;
}

export function getPracticeResult(
  pkg: PracticePackage,
  questions: Question[],
  catalog?: AnalysisCatalog,
): PracticeResult | null {
  const attempt = readPracticeAttempt(pkg.slug);
  if (!pkg || !attempt || !attempt.finishedAt) return null;
  return {
    pkg,
    attempt,
    analysis: analyzePractice(questions, attempt.answers, catalog),
    elapsedSeconds: Math.max(0, Math.round((attempt.finishedAt - attempt.startedAt) / 1000)),
  };
}
