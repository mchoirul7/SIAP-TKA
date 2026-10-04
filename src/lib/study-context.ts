import type { EducationLevel } from "@/data/types";

export interface StudyContext {
  level: EducationLevel;
  grade: number;
}

export const DEFAULT_STUDY_CONTEXT: StudyContext = {
  level: "SD",
  grade: 3,
};

export const LEVEL_OPTIONS: {
  level: EducationLevel;
  label: string;
  shortLabel: string;
  description: string;
  grades: number[];
}[] = [
  {
    level: "SD",
    label: "SD / MI",
    shortLabel: "SD",
    description: "Kelas 1-6",
    grades: [1, 2, 3, 4, 5, 6],
  },
  {
    level: "SMP",
    label: "SMP / MTs",
    shortLabel: "SMP",
    description: "Kelas 7-9",
    grades: [7, 8, 9],
  },
  {
    level: "SMA",
    label: "SMA / MA / SMK",
    shortLabel: "SMA",
    description: "Kelas 10-12",
    grades: [10, 11, 12],
  },
];

export function levelOptionFor(level: EducationLevel) {
  return LEVEL_OPTIONS.find((option) => option.level === level) ?? LEVEL_OPTIONS[0];
}

export function gradesForLevel(level: EducationLevel): number[] {
  return levelOptionFor(level).grades;
}

export function isValidStudyContext(value: unknown): value is StudyContext {
  if (!value || typeof value !== "object") return false;
  const context = value as Partial<StudyContext>;
  if (!context.level || typeof context.grade !== "number") return false;
  return gradesForLevel(context.level).includes(context.grade);
}

export function normalizeStudyContext(context: StudyContext): StudyContext {
  const option = levelOptionFor(context.level);
  return {
    level: option.level,
    grade: option.grades.includes(context.grade) ? context.grade : option.grades[0],
  };
}

export function studyContextLabel(context: StudyContext, separator = " • "): string {
  const option = levelOptionFor(context.level);
  return `${option.label}${separator}Kelas ${context.grade}`;
}

export function studyContextShortLabel(context: StudyContext): string {
  return `${levelOptionFor(context.level).shortLabel} Kelas ${context.grade}`;
}

/**
 * Kelas aktif juga dicerminkan ke cookie supaya halaman /ujian dapat menyaring
 * paket di server. localStorage tetap sumber utamanya; cookie hanya salinan.
 */
export const STUDY_CONTEXT_COOKIE = "siaptka-kelas";
export const STUDY_CONTEXT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** `{ level: "SD", grade: 3 }` → `SD-3` */
export function serializeStudyContext(context: StudyContext): string {
  return `${context.level}-${context.grade}`;
}

export function parseStudyContext(value: string | undefined | null): StudyContext | null {
  const match = value ? /^(SD|SMP|SMA)-(\d{1,2})$/.exec(value) : null;
  if (!match) return null;
  const context = { level: match[1] as EducationLevel, grade: Number(match[2]) };
  return isValidStudyContext(context) ? context : null;
}
