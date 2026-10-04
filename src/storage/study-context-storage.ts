import type { StudyContext } from "@/lib/study-context";
import {
  isValidStudyContext,
  normalizeStudyContext,
  serializeStudyContext,
  STUDY_CONTEXT_COOKIE,
  STUDY_CONTEXT_COOKIE_MAX_AGE,
} from "@/lib/study-context";
import { readValue, writeValue } from "./local-storage";
import { storageKeys } from "./storage-keys";

export function readStudyContext(): StudyContext | null {
  const context = readValue<StudyContext>(storageKeys.studyContext);
  if (!isValidStudyContext(context)) return null;
  return normalizeStudyContext(context);
}

export function writeStudyContext(context: StudyContext): void {
  const normalized = normalizeStudyContext(context);
  writeStudyContextCookie(normalized);
  writeValue(storageKeys.studyContext, normalized);
}

/** Menyamakan cookie dengan localStorage; dipanggil juga untuk data lama yang belum punya cookie. */
export function writeStudyContextCookie(context: StudyContext): void {
  if (typeof document === "undefined") return;
  const value = serializeStudyContext(context);
  if (document.cookie.split("; ").includes(`${STUDY_CONTEXT_COOKIE}=${value}`)) return;
  document.cookie = `${STUDY_CONTEXT_COOKIE}=${value}; path=/; max-age=${STUDY_CONTEXT_COOKIE_MAX_AGE}; samesite=lax`;
}
