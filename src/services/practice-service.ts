import { questionById } from "@/data/questionBank";
import { practicePackages } from "@/data/practicePackages";
import { subtopics, topics } from "@/data/subjects";
import type { AnswerValue, PracticePackage, Question, Topic } from "@/data/types";
import { analyzePractice, type PracticeAnalysis } from "@/lib/scoring";
import {
  clearPracticeAttempt,
  readPracticeAttempt,
  writePracticeAttempt,
  type PracticeAttempt,
} from "@/storage/attempt-storage";

export function getPracticePackages(): PracticePackage[] {
  return practicePackages;
}

export function getPracticePackageBySlug(slug: string): PracticePackage | null {
  return practicePackages.find((pkg) => pkg.slug === slug) ?? null;
}

export function getPracticePackagesBySlugs(slugs: string[]): PracticePackage[] {
  return slugs.flatMap((slug) => {
    const pkg = getPracticePackageBySlug(slug);
    return pkg ? [pkg] : [];
  });
}

export interface PracticeTopicGroup {
  topic: Topic;
  packages: PracticePackage[];
}

export function getPracticePackagesGroupedByTopic(): PracticeTopicGroup[] {
  return topics
    .map((topic) => ({
      topic,
      packages: practicePackages.filter((pkg) => pkg.topicId === topic.id),
    }))
    .filter((group) => group.packages.length > 0);
}

export function getSubtopicName(subtopicId: string): string {
  return subtopics.find((subtopic) => subtopic.id === subtopicId)?.name ?? "";
}

export function getQuestionsForPackage(slug: string): Question[] {
  const pkg = getPracticePackageBySlug(slug);
  if (!pkg) return [];
  return pkg.questionIds.flatMap((id) => {
    const question = questionById.get(id);
    return question ? [question] : [];
  });
}

export function getPracticeAttempt(slug: string): PracticeAttempt | null {
  return readPracticeAttempt(slug);
}

export function startPracticeAttempt(slug: string): PracticeAttempt | null {
  const pkg = getPracticePackageBySlug(slug);
  if (!pkg) return null;
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

export function getPracticeResult(slug: string): PracticeResult | null {
  const pkg = getPracticePackageBySlug(slug);
  const attempt = readPracticeAttempt(slug);
  if (!pkg || !attempt || !attempt.finishedAt) return null;
  return {
    pkg,
    attempt,
    analysis: analyzePractice(getQuestionsForPackage(slug), attempt.answers),
    elapsedSeconds: Math.max(0, Math.round((attempt.finishedAt - attempt.startedAt) / 1000)),
  };
}
