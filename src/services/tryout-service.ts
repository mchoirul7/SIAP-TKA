import type { AnswerValue, Question, Tryout } from "@/data/types";
import { analyzeTryout, type TryoutAnalysis } from "@/lib/scoring";
import {
  clearTryoutAttempt,
  emptyIntegrity,
  readTryoutAttempt,
  writeTryoutAttempt,
  type TryoutAttempt,
} from "@/storage/attempt-storage";

/**
 * Pengerjaan tryout di perangkat pengguna.
 *
 * AMAN DIPAKAI KOMPONEN CLIENT. Berkas ini hanya menyentuh localStorage dan
 * fungsi penilaian murni — tidak ada satu pun pembacaan konten dari Supabase.
 * Soal dan keterangan tryout dioper sebagai argumen oleh halaman yang
 * mengambilnya di server (lihat `content-service.ts`).
 */

export function getAttempt(tryoutSlug: string): TryoutAttempt | null {
  return readTryoutAttempt(tryoutSlug);
}

export function startAttempt(tryout: Tryout): TryoutAttempt {
  const attempt: TryoutAttempt = {
    tryoutId: tryout.id,
    tryoutSlug: tryout.slug,
    startedAt: Date.now(),
    submittedAt: null,
    answers: {},
    markedQuestionIds: [],
    integrity: { ...emptyIntegrity },
  };
  writeTryoutAttempt(attempt);
  return attempt;
}

export function saveAnswer(
  tryoutSlug: string,
  questionId: string,
  answer: AnswerValue,
): TryoutAttempt | null {
  const attempt = readTryoutAttempt(tryoutSlug);
  if (!attempt || attempt.submittedAt) return attempt;
  const next: TryoutAttempt = {
    ...attempt,
    answers: { ...attempt.answers, [questionId]: answer },
  };
  writeTryoutAttempt(next);
  return next;
}

export function toggleMark(tryoutSlug: string, questionId: string): TryoutAttempt | null {
  const attempt = readTryoutAttempt(tryoutSlug);
  if (!attempt || attempt.submittedAt) return attempt;
  const marked = new Set(attempt.markedQuestionIds);
  if (marked.has(questionId)) marked.delete(questionId);
  else marked.add(questionId);
  const next: TryoutAttempt = { ...attempt, markedQuestionIds: [...marked] };
  writeTryoutAttempt(next);
  return next;
}

export type IntegrityEvent = "tabSwitch" | "blur" | "fullscreenExit";

export function recordIntegrityEvent(
  tryoutSlug: string,
  event: IntegrityEvent,
): TryoutAttempt | null {
  const attempt = readTryoutAttempt(tryoutSlug);
  if (!attempt || attempt.submittedAt) return attempt;
  const integrity = { ...attempt.integrity };
  if (event === "tabSwitch") integrity.tabSwitchCount += 1;
  if (event === "blur") integrity.blurCount += 1;
  if (event === "fullscreenExit") integrity.fullscreenExitCount += 1;
  const next: TryoutAttempt = { ...attempt, integrity };
  writeTryoutAttempt(next);
  return next;
}

export function submitTryout(tryoutSlug: string): TryoutAttempt | null {
  const attempt = readTryoutAttempt(tryoutSlug);
  if (!attempt) return null;
  if (attempt.submittedAt) return attempt;
  const next: TryoutAttempt = { ...attempt, submittedAt: Date.now() };
  writeTryoutAttempt(next);
  return next;
}

export function resetTryout(tryoutSlug: string): void {
  clearTryoutAttempt(tryoutSlug);
}

export interface TryoutResult {
  tryout: Tryout;
  attempt: TryoutAttempt;
  analysis: TryoutAnalysis;
  elapsedSeconds: number;
}

/** Menghitung hasil dari attempt di perangkat, memakai soal yang dioper halaman. */
export function getTryoutResult(tryout: Tryout, questions: Question[]): TryoutResult | null {
  const attempt = readTryoutAttempt(tryout.slug);
  if (!attempt || !attempt.submittedAt) return null;

  const cappedElapsed = Math.min(
    Math.round((attempt.submittedAt - attempt.startedAt) / 1000),
    tryout.durationMinutes * 60,
  );

  return {
    tryout,
    attempt,
    analysis: analyzeTryout(questions, attempt.answers),
    elapsedSeconds: Math.max(0, cappedElapsed),
  };
}
