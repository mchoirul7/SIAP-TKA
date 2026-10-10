import type { AssessmentType, EducationLevel, PackageKind } from "@/data/types";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Katalog paket untuk pemilih centang di halaman admin, dan penerjemahan
 * pilihan centang menjadi baris grant murid.
 */

export interface AdminScope {
  assessmentType: AssessmentType;
  level: EducationLevel;
  gradeLevel: number;
  semester: number | null;
}

export interface ScopeSubject {
  id: string;
  name: string;
  packages: { id: string; title: string; kind: PackageKind }[];
}

const ASSESSMENTS: AssessmentType[] = ["tka", "ulangan_harian", "sumatif_tengah_semester", "sumatif_akhir_semester"];
const LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];

/** Lingkup dari parameter alamat (?ujian=&jenjang=&kelas=&semester=); kosong bila belum lengkap. */
export function scopeFromParams(params: { ujian?: string; jenjang?: string; kelas?: string; semester?: string }): AdminScope | null {
  const assessmentType = ASSESSMENTS.find((value) => value === params.ujian);
  const level = LEVELS.find((value) => value === params.jenjang);
  const gradeLevel = Number.parseInt(params.kelas ?? "", 10);
  if (!assessmentType || !level || !Number.isFinite(gradeLevel)) return null;
  const semester = params.semester === "1" || params.semester === "2" ? Number(params.semester) : null;
  return { assessmentType, level, gradeLevel, semester };
}

/** Mapel beserta paket terbit pada satu lingkup, urut mapel lalu urutan paket. */
export async function scopeCatalog(scope: AdminScope): Promise<ScopeSubject[]> {
  let query = supabaseAdmin()
    .from("packages")
    .select("id, title, kind, subject_id, subjects (name, sort_order)")
    .eq("is_published", true)
    .eq("assessment_type", scope.assessmentType)
    .eq("level", scope.level)
    .eq("grade_level", scope.gradeLevel)
    .order("kind")
    .order("sort_order")
    .order("id");
  if (scope.semester !== null) query = query.eq("semester", scope.semester);
  const { data, error } = await query.returns<
    { id: string; title: string; kind: PackageKind; subject_id: string; subjects: { name: string; sort_order: number } | null }[]
  >();
  if (error) throw new Error(`Gagal membaca paket: ${error.message}`);

  const bySubject = new Map<string, ScopeSubject & { order: number }>();
  for (const row of data ?? []) {
    const subject = bySubject.get(row.subject_id) ?? {
      id: row.subject_id,
      name: row.subjects?.name ?? row.subject_id,
      order: row.subjects?.sort_order ?? 0,
      packages: [],
    };
    subject.packages.push({ id: row.id, title: row.title, kind: row.kind });
    bySubject.set(row.subject_id, subject);
  }
  return [...bySubject.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

export interface GrantTargetRow {
  scope: "package" | "subject" | "all_in";
  assessment_type: AssessmentType;
  level: EducationLevel;
  grade_level: number;
  semester: number | null;
  subject_id: string | null;
  package_id: string | null;
}

/**
 * Pilihan centang menjadi baris grant. All-in menutup pilihan lain; paket
 * satuan yang mapelnya sudah dicentang penuh tidak perlu dibuat lagi.
 */
export async function selectionTargets(
  scope: AdminScope,
  selection: { allIn: boolean; subjectIds: string[]; packageIds: string[] },
): Promise<GrantTargetRow[]> {
  const base = {
    assessment_type: scope.assessmentType,
    level: scope.level,
    grade_level: scope.gradeLevel,
    semester: scope.semester,
  };
  if (selection.allIn) return [{ ...base, scope: "all_in", subject_id: null, package_id: null }];

  const subjects = [...new Set(selection.subjectIds)];
  const rows: GrantTargetRow[] = subjects.map((subjectId) => ({ ...base, scope: "subject", subject_id: subjectId, package_id: null }));

  const packageIds = [...new Set(selection.packageIds)];
  if (packageIds.length > 0) {
    // Jenis ujian, jenjang, kelas, dan semester paket satuan diambil dari paketnya sendiri.
    const { data, error } = await supabaseAdmin()
      .from("packages")
      .select("id, subject_id, assessment_type, level, grade_level, semester")
      .in("id", packageIds)
      .returns<{ id: string; subject_id: string; assessment_type: AssessmentType; level: EducationLevel; grade_level: number; semester: number | null }[]>();
    if (error) throw new Error(`Gagal membaca paket terpilih: ${error.message}`);
    for (const pkg of data ?? []) {
      if (subjects.includes(pkg.subject_id)) continue;
      rows.push({
        scope: "package",
        assessment_type: pkg.assessment_type,
        level: pkg.level,
        grade_level: pkg.grade_level,
        semester: pkg.semester,
        subject_id: null,
        package_id: pkg.id,
      });
    }
  }
  if (rows.length === 0) throw new Error("Belum ada yang dicentang. Pilih All-in, mapel, atau paket.");
  return rows;
}
