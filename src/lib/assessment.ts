import type { AssessmentType, EducationLevel, PackageKind } from "@/data/types";
import type { IconName } from "@/components/ui/Icon";

export const ASSESSMENT_TYPES = [
  "tka",
  "ulangan_harian",
  "sumatif_tengah_semester",
  "sumatif_akhir_semester",
] as const satisfies AssessmentType[];

export const ASSESSMENT_LABEL: Record<AssessmentType, string> = {
  tka: "TKA",
  ulangan_harian: "Ulangan Harian",
  sumatif_tengah_semester: "Sumatif Tengah Semester",
  sumatif_akhir_semester: "Sumatif Akhir Semester",
};

export const ASSESSMENT_SLUG: Record<AssessmentType, string> = {
  tka: "tka",
  ulangan_harian: "ulangan-harian",
  sumatif_tengah_semester: "sumatif-tengah-semester",
  sumatif_akhir_semester: "sumatif-akhir-semester",
};

export interface PackageFilter {
  assessmentType?: AssessmentType;
  level?: EducationLevel;
  gradeLevel?: number;
  semester?: number | null;
  subjectId?: string;
  kind?: PackageKind;
}

const gradesByLevel: Record<EducationLevel, number[]> = {
  SD: [1, 2, 3, 4, 5, 6],
  SMP: [7, 8, 9],
  SMA: [10, 11, 12],
};

const tkaGradeByLevel: Record<EducationLevel, number> = {
  SD: 6,
  SMP: 9,
  SMA: 12,
};

export function isAssessmentType(value: unknown): value is AssessmentType {
  return typeof value === "string" && ASSESSMENT_TYPES.includes(value as AssessmentType);
}

export function gradesForLevel(level: EducationLevel): number[] {
  return gradesByLevel[level];
}

export function tkaGradeForLevel(level: EducationLevel): number {
  return tkaGradeByLevel[level];
}

export function assessmentNeedsSemester(assessmentType: AssessmentType): boolean {
  return assessmentType === "sumatif_tengah_semester" || assessmentType === "sumatif_akhir_semester";
}

export function isValidGradeForLevel(level: EducationLevel, gradeLevel: number): boolean {
  return gradesForLevel(level).includes(gradeLevel);
}

export function effectiveGradeForAssessment(
  assessmentType: AssessmentType,
  level: EducationLevel,
  gradeLevel: number,
): number {
  return assessmentType === "tka" ? tkaGradeForLevel(level) : gradeLevel;
}

export function normalizeSemester(assessmentType: AssessmentType, semester: number | null | undefined): number | null {
  if (!assessmentNeedsSemester(assessmentType)) return null;
  return semester === 2 ? 2 : 1;
}

export function validatePackageFilter(filter: PackageFilter): boolean {
  if (filter.assessmentType && !isAssessmentType(filter.assessmentType)) return false;
  if (filter.level && filter.gradeLevel && !isValidGradeForLevel(filter.level, filter.gradeLevel)) return false;
  if (filter.assessmentType === "tka" && filter.level && filter.gradeLevel) {
    return filter.gradeLevel === tkaGradeForLevel(filter.level);
  }
  if (
    (filter.assessmentType === "sumatif_tengah_semester" ||
      filter.assessmentType === "sumatif_akhir_semester") &&
    filter.semester !== undefined &&
    filter.semester !== 1 &&
    filter.semester !== 2
  ) {
    return false;
  }
  return true;
}

export function packageMatchesFilter(
  pkg: {
    assessmentType: AssessmentType;
    level: EducationLevel;
    gradeLevel: number;
    semester: number | null;
    subjectId: string;
    kind: PackageKind;
  },
  filter: PackageFilter,
): boolean {
  if (filter.assessmentType && pkg.assessmentType !== filter.assessmentType) return false;
  if (filter.level && pkg.level !== filter.level) return false;
  if (filter.gradeLevel && pkg.gradeLevel !== filter.gradeLevel) return false;
  if (filter.semester !== undefined && pkg.semester !== filter.semester) return false;
  if (filter.subjectId && pkg.subjectId !== filter.subjectId) return false;
  if (filter.kind && pkg.kind !== filter.kind) return false;
  return true;
}

// ------------------------------------------------------- alur halaman ujian
//
// Satu konfigurasi untuk empat jenis ujian. Halaman /ujian, halaman mapel, dan
// halaman daftar paket membaca dari sini, jadi tidak ada templat per jenis.

export interface AssessmentConfig {
  key: AssessmentType;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  asset: string;
  icon: IconName;
}

export const ASSESSMENT_CONFIGS: AssessmentConfig[] = [
  {
    key: "tka",
    slug: ASSESSMENT_SLUG.tka,
    title: ASSESSMENT_LABEL.tka,
    shortTitle: "TKA",
    description: "Persiapan dan latihan Tes Kemampuan Akademik.",
    asset: "/dashboard/tka-clipboard.svg",
    icon: "trophy",
  },
  {
    key: "ulangan_harian",
    slug: ASSESSMENT_SLUG.ulangan_harian,
    title: ASSESSMENT_LABEL.ulangan_harian,
    shortTitle: "UH",
    description: "Latihan untuk mengukur pemahaman materi pembelajaran sehari-hari.",
    asset: "/dashboard/ulangan-notes.svg",
    icon: "note",
  },
  {
    key: "sumatif_tengah_semester",
    slug: ASSESSMENT_SLUG.sumatif_tengah_semester,
    title: ASSESSMENT_LABEL.sumatif_tengah_semester,
    shortTitle: "STS",
    description: "Persiapan penilaian tengah semester.",
    asset: "/dashboard/sts-calendar.svg",
    icon: "data",
  },
  {
    key: "sumatif_akhir_semester",
    slug: ASSESSMENT_SLUG.sumatif_akhir_semester,
    title: ASSESSMENT_LABEL.sumatif_akhir_semester,
    shortTitle: "SAS",
    description: "Persiapan penilaian akhir semester.",
    asset: "/dashboard/sas-checklist.svg",
    icon: "shield-check",
  },
];

export const SEMESTERS = [1, 2] as const;

export function assessmentConfigBySlug(slug: string): AssessmentConfig | null {
  return ASSESSMENT_CONFIGS.find((config) => config.slug === slug) ?? null;
}

export function assessmentConfigFor(type: AssessmentType): AssessmentConfig {
  return ASSESSMENT_CONFIGS.find((config) => config.key === type) ?? ASSESSMENT_CONFIGS[0];
}

export function semesterSegment(semester: number): string {
  return `semester-${semester}`;
}

/** `semester-1` → 1. Segmen lain → null. */
export function semesterFromSegment(segment: string): number | null {
  const match = /^semester-([12])$/.exec(segment);
  return match ? Number(match[1]) : null;
}

/**
 * Slug mapel di basis data membawa jenjang (`seni-rupa-sd`). Di URL ujian
 * jenjangnya dibuang (`seni-rupa`) karena jenjang sudah datang dari kelas aktif,
 * sehingga tautan yang sama tetap berlaku bila kelasnya diganti.
 */
export function subjectSegment(subject: { slug: string; level: EducationLevel }): string {
  const suffix = `-${subject.level.toLowerCase()}`;
  return subject.slug.endsWith(suffix) ? subject.slug.slice(0, -suffix.length) : subject.slug;
}

export function subjectSlugCandidates(segment: string, level: EducationLevel): string[] {
  return [`${segment}-${level.toLowerCase()}`, segment];
}

/** Lingkup daftar paket: jenis ujian di jenjang dan kelas tertentu. */
export interface ExamScope {
  assessmentType: AssessmentType;
  level: EducationLevel;
  gradeLevel: number;
  semester: number | null;
}

export function examScopeFor(
  assessmentType: AssessmentType,
  context: { level: EducationLevel; grade: number },
  semester: number | null = null,
): ExamScope {
  return {
    assessmentType,
    level: context.level,
    gradeLevel: effectiveGradeForAssessment(assessmentType, context.level, context.grade),
    semester: assessmentNeedsSemester(assessmentType) ? semester : null,
  };
}

export function examTypeHref(type: AssessmentType): string {
  return `/ujian/${ASSESSMENT_SLUG[type]}`;
}

export function examSubjectsHref(type: AssessmentType, semester: number | null): string {
  const base = examTypeHref(type);
  return assessmentNeedsSemester(type) && semester ? `${base}/${semesterSegment(semester)}` : base;
}

export function examPackagesHref(
  type: AssessmentType,
  semester: number | null,
  subject: { slug: string; level: EducationLevel },
): string {
  return `${examSubjectsHref(type, semester)}/${subjectSegment(subject)}`;
}

export function semesterLabel(semester: number): string {
  return `Semester ${semester}`;
}
