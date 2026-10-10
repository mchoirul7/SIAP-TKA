import type { ExamScope } from "@/lib/assessment";
import { getServerStudent, studentAccess, type StudentGrant } from "@/lib/student-session";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Seberapa banyak paket pada satu lingkup ujian (jenis ujian, jenjang, kelas,
 * semester) yang sudah dimiliki murid yang sedang masuk. Dipakai halaman pilih
 * mapel dan daftar paket supaya mapel yang sudah dibeli tidak ditawarkan lagi.
 */

export interface SubjectOwnership {
  /** Jumlah paket terbit mapel ini yang sudah terbuka. */
  count: number;
  /** Seluruh paket mapel ini terbuka, termasuk yang terbit belakangan. */
  full: boolean;
}

export interface ScopeOwnership {
  /** All-in untuk lingkup ini sudah dimiliki. */
  allIn: boolean;
  bySubject: Map<string, SubjectOwnership>;
}

function grantCoversScope(grant: StudentGrant, scope: ExamScope): boolean {
  return (
    grant.assessmentType === scope.assessmentType &&
    grant.level === scope.level &&
    grant.gradeLevel === scope.gradeLevel &&
    (grant.semester === null || grant.semester === scope.semester)
  );
}

/** Kosong bila belum masuk. */
export async function scopeOwnership(scope: ExamScope): Promise<ScopeOwnership | null> {
  try {
    const student = await getServerStudent();
    if (!student) return null;
    const access = await studentAccess(student);
    const grants = access.grants.filter((grant) => grantCoversScope(grant, scope));
    const allIn = grants.some((grant) => grant.scope === "all_in");
    const fullSubjects = new Set(
      grants.flatMap((grant) => (grant.scope === "subject" && grant.subjectId ? [grant.subjectId] : [])),
    );

    const bySubject = new Map<string, SubjectOwnership>();
    if (access.packageSlugs.length > 0) {
      let query = supabaseAdmin()
        .from("packages")
        .select("subject_id")
        .in("slug", access.packageSlugs)
        .eq("is_published", true)
        .eq("assessment_type", scope.assessmentType)
        .eq("level", scope.level)
        .eq("grade_level", scope.gradeLevel);
      if (scope.semester !== null) query = query.eq("semester", scope.semester);
      const { data } = await query.returns<{ subject_id: string }[]>();
      for (const row of data ?? []) {
        const current = bySubject.get(row.subject_id) ?? { count: 0, full: false };
        current.count += 1;
        bySubject.set(row.subject_id, current);
      }
    }
    for (const subjectId of fullSubjects) {
      bySubject.set(subjectId, { count: bySubject.get(subjectId)?.count ?? 0, full: true });
    }
    return { allIn, bySubject };
  } catch {
    // Data kepemilikan tidak terbaca: halaman tetap tampil seperti untuk tamu.
    return null;
  }
}

/** Kepemilikan satu mapel; paket yang semuanya sudah terbuka dihitung penuh. */
export function subjectOwnership(
  ownership: ScopeOwnership | null,
  subjectId: string | undefined,
  packageCount: number,
): SubjectOwnership | null {
  if (!ownership || !subjectId) return null;
  if (ownership.allIn) return { count: packageCount, full: true };
  const owned = ownership.bySubject.get(subjectId);
  if (!owned) return null;
  return owned.full || (packageCount > 0 && owned.count >= packageCount) ? { count: packageCount, full: true } : owned;
}
