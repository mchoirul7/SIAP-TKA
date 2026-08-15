import type { AnswerMap, AnswerValue } from "@/data/types";
import { readValue, removeValue, writeValue } from "./local-storage";
import { storageKeys } from "./storage-keys";

/**
 * Versi awal prototype menyimpan jawaban sebagai `questionId -> "A"`. Sejak soal
 * jawaban ganda dan kategori didukung, bentuknya menjadi objek berlabel tipe.
 * Data lama di perangkat pengguna tetap dibaca dan diterjemahkan di sini.
 */
function normalizeAnswers(raw: unknown): AnswerMap {
  if (!raw || typeof raw !== "object") return {};
  const result: AnswerMap = {};
  for (const [questionId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") {
      if (value) result[questionId] = { type: "single", key: value };
      continue;
    }
    if (value && typeof value === "object" && "type" in value) {
      result[questionId] = value as AnswerValue;
    }
  }
  return result;
}

export interface IntegrityCounters {
  tabSwitchCount: number;
  blurCount: number;
  fullscreenExitCount: number;
}

export interface TryoutAttempt {
  tryoutId: string;
  tryoutSlug: string;
  startedAt: number;
  submittedAt: number | null;
  /** questionId -> jawaban, bentuknya mengikuti tipe soal */
  answers: AnswerMap;
  markedQuestionIds: string[];
  integrity: IntegrityCounters;
  /** Ditandai bila attempt dibuat dari tombol contoh hasil. */
  isDemo?: boolean;
}

export interface PracticeAttempt {
  packageSlug: string;
  startedAt: number;
  finishedAt: number | null;
  answers: AnswerMap;
}

export const emptyIntegrity: IntegrityCounters = {
  tabSwitchCount: 0,
  blurCount: 0,
  fullscreenExitCount: 0,
};

// ---------------------------------------------------------------- tryout

export function readTryoutAttempt(tryoutSlug: string): TryoutAttempt | null {
  const attempt = readValue<TryoutAttempt>(storageKeys.tryoutAttempt(tryoutSlug));
  if (!attempt || typeof attempt.startedAt !== "number") return null;
  return {
    ...attempt,
    answers: normalizeAnswers(attempt.answers),
    markedQuestionIds: attempt.markedQuestionIds ?? [],
    integrity: { ...emptyIntegrity, ...attempt.integrity },
  };
}

export function writeTryoutAttempt(attempt: TryoutAttempt): void {
  writeValue(storageKeys.tryoutAttempt(attempt.tryoutSlug), attempt);
}

export function clearTryoutAttempt(tryoutSlug: string): void {
  removeValue(storageKeys.tryoutAttempt(tryoutSlug));
}

// -------------------------------------------------------------- practice

export function readPracticeAttempt(packageSlug: string): PracticeAttempt | null {
  const attempt = readValue<PracticeAttempt>(storageKeys.practiceAttempt(packageSlug));
  if (!attempt || typeof attempt.startedAt !== "number") return null;
  return { ...attempt, answers: normalizeAnswers(attempt.answers) };
}

export function writePracticeAttempt(attempt: PracticeAttempt): void {
  writeValue(storageKeys.practiceAttempt(attempt.packageSlug), attempt);
}

export function clearPracticeAttempt(packageSlug: string): void {
  removeValue(storageKeys.practiceAttempt(packageSlug));
}
