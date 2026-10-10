import type { AssessmentType } from "@/data/types";
import { ASSESSMENT_LABEL } from "@/lib/assessment";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Isi halaman akun murid: riwayat nilai dan perangkat yang sedang masuk. */

export interface AttemptHistoryItem {
  id: string;
  packageTitle: string;
  kind: "latihan" | "tryout";
  assessmentLabel: string;
  subjectName: string;
  gradeLevel: number | null;
  startedAt: string;
  finishedAt: string | null;
  score: number;
  correctCount: number;
  totalCount: number;
  violations: number;
}

export interface StudentDevice {
  id: string;
  label: string;
  createdAt: string;
  lastSeen: string;
  isCurrent: boolean;
}

interface AttemptRow {
  id: string;
  started_at: string;
  finished_at: string | null;
  score: number | null;
  correct_count: number | null;
  total_count: number | null;
  violations: number | null;
  packages: {
    title: string;
    kind: "latihan" | "tryout";
    assessment_type: AssessmentType;
    grade_level: number | null;
    subjects: { name: string } | null;
  } | null;
}

export async function studentAttemptHistory(studentId: string): Promise<AttemptHistoryItem[]> {
  const { data, error } = await supabaseAdmin()
    .from("attempts")
    .select(
      "id, started_at, finished_at, score, correct_count, total_count, violations, packages (title, kind, assessment_type, grade_level, subjects (name))",
    )
    .eq("student_id", studentId)
    .order("finished_at", { ascending: false })
    .limit(500)
    .returns<AttemptRow[]>();
  if (error) throw new Error(`Gagal membaca riwayat nilai: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    packageTitle: row.packages?.title ?? "Paket dihapus",
    kind: row.packages?.kind ?? "latihan",
    assessmentLabel: row.packages ? (ASSESSMENT_LABEL[row.packages.assessment_type] ?? row.packages.assessment_type) : "",
    subjectName: row.packages?.subjects?.name ?? "",
    gradeLevel: row.packages?.grade_level ?? null,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    score: Number(row.score ?? 0),
    correctCount: row.correct_count ?? 0,
    totalCount: row.total_count ?? 0,
    violations: row.violations ?? 0,
  }));
}

export interface OwnedPackage {
  slug: string;
  title: string;
  kind: "latihan" | "tryout";
  assessmentLabel: string;
  subjectName: string;
  gradeLevel: number;
  semester: number | null;
  lastScore: number | null;
  lastFinishedAt: string | null;
  attemptCount: number;
}

/**
 * Paket yang sudah dibukakan untuk murid ini (Latihan Saya), beserta nilai
 * terakhir dan berapa kali dikerjakan.
 */
export async function studentOwnedPackages(studentId: string, packageSlugs: string[]): Promise<OwnedPackage[]> {
  if (packageSlugs.length === 0) return [];
  const db = supabaseAdmin();
  const [packages, attempts] = await Promise.all([
    db
      .from("packages")
      .select("id, slug, title, kind, assessment_type, grade_level, semester, sort_order, subjects (name, sort_order)")
      .in("slug", packageSlugs)
      .returns<
        {
          id: string;
          slug: string;
          title: string;
          kind: "latihan" | "tryout";
          assessment_type: AssessmentType;
          grade_level: number;
          semester: number | null;
          sort_order: number;
          subjects: { name: string; sort_order: number } | null;
        }[]
      >(),
    db
      .from("attempts")
      .select("package_id, score, finished_at")
      .eq("student_id", studentId)
      .order("finished_at", { ascending: false })
      .returns<{ package_id: string; score: number | null; finished_at: string | null }[]>(),
  ]);
  if (packages.error) throw new Error(`Gagal membaca paket: ${packages.error.message}`);

  const latest = new Map<string, { score: number | null; finishedAt: string | null; count: number }>();
  for (const row of attempts.data ?? []) {
    const current = latest.get(row.package_id);
    if (current) current.count += 1;
    else latest.set(row.package_id, { score: row.score === null ? null : Number(row.score), finishedAt: row.finished_at, count: 1 });
  }

  return (packages.data ?? [])
    .sort(
      (a, b) =>
        a.assessment_type.localeCompare(b.assessment_type) ||
        (a.subjects?.sort_order ?? 0) - (b.subjects?.sort_order ?? 0) ||
        a.kind.localeCompare(b.kind) ||
        a.sort_order - b.sort_order,
    )
    .map((row) => {
      const last = latest.get(row.id);
      return {
        slug: row.slug,
        title: row.title,
        kind: row.kind,
        assessmentLabel: ASSESSMENT_LABEL[row.assessment_type] ?? row.assessment_type,
        subjectName: row.subjects?.name ?? "",
        gradeLevel: row.grade_level,
        semester: row.semester,
        lastScore: last?.score ?? null,
        lastFinishedAt: last?.finishedAt ?? null,
        attemptCount: last?.count ?? 0,
      };
    });
}

/** "Chrome di Android", "Safari di iPhone", dan seterusnya dari user agent. */
export function deviceLabel(userAgent: string | null): string {
  if (!userAgent) return "Perangkat tidak dikenal";
  const ua = userAgent;
  const os = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(ua)
            ? "Mac"
            : /CrOS/.test(ua)
              ? "Chromebook"
              : /Linux/.test(ua)
                ? "Linux"
                : "perangkat lain";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Peramban";
  return `${browser} di ${os}`;
}

export async function studentDevices(studentId: string, currentSessionId: string): Promise<StudentDevice[]> {
  const { data, error } = await supabaseAdmin()
    .from("student_sessions")
    .select("id, user_agent, created_at, last_seen")
    .eq("student_id", studentId)
    .order("last_seen", { ascending: false })
    .returns<{ id: string; user_agent: string | null; created_at: string; last_seen: string }[]>();
  if (error) throw new Error(`Gagal membaca perangkat: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    label: deviceLabel(row.user_agent),
    createdAt: row.created_at,
    lastSeen: row.last_seen,
    isCurrent: row.id === currentSessionId,
  }));
}

/** Menghapus satu perangkat milik murid ini; perangkat murid lain tidak tersentuh. */
export async function removeStudentDevice(studentId: string, sessionId: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("student_sessions")
    .delete()
    .eq("student_id", studentId)
    .eq("id", sessionId);
  if (error) throw new Error(`Gagal menghapus perangkat: ${error.message}`);
}

/** Nama yang mudah dibaca untuk satu grant, misalnya "All-in Ulangan Harian SD Kelas 2". */
export async function grantLabels(
  grants: { scope: string; assessmentType: string; level: string; gradeLevel: number; semester: number | null; subjectId: string | null; packageId: string | null }[],
): Promise<string[]> {
  const db = supabaseAdmin();
  const subjectIds = [...new Set(grants.flatMap((grant) => (grant.subjectId ? [grant.subjectId] : [])))];
  const packageIds = [...new Set(grants.flatMap((grant) => (grant.packageId ? [grant.packageId] : [])))];
  const [subjects, packages] = await Promise.all([
    subjectIds.length
      ? db.from("subjects").select("id, name").in("id", subjectIds).returns<{ id: string; name: string }[]>()
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    packageIds.length
      ? db.from("packages").select("id, title").in("id", packageIds).returns<{ id: string; title: string }[]>()
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);
  const subjectName = new Map((subjects.data ?? []).map((row) => [row.id, row.name]));
  const packageTitle = new Map((packages.data ?? []).map((row) => [row.id, row.title]));

  return grants.map((grant) => {
    const assessment = ASSESSMENT_LABEL[grant.assessmentType as AssessmentType] ?? grant.assessmentType;
    const scope = [grant.level, `Kelas ${grant.gradeLevel}`, ...(grant.semester ? [`Semester ${grant.semester}`] : [])].join(" ");
    if (grant.scope === "all_in") return `All-in ${assessment} ${scope}`;
    if (grant.scope === "subject") {
      return `Paket lengkap ${subjectName.get(grant.subjectId ?? "") ?? grant.subjectId} · ${assessment} ${scope}`;
    }
    return `Paket ${packageTitle.get(grant.packageId ?? "") ?? grant.packageId} · ${assessment} ${scope}`;
  });
}

const CSV_HEADER = [
  "Tanggal",
  "Jam",
  "Jenis Ujian",
  "Mapel",
  "Kelas",
  "Paket",
  "Latihan/Tryout",
  "Benar",
  "Jumlah Soal",
  "Nilai",
  "Durasi (menit)",
  "Pelanggaran Mode Aman",
];

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const WIB = "Asia/Jakarta";

/** Riwayat nilai sebagai CSV yang langsung terbaca rapi di Excel (BOM + pemisah titik koma). */
export function attemptHistoryCsv(items: AttemptHistoryItem[]): string {
  const rows = items.map((item) => {
    const finished = new Date(item.finishedAt ?? item.startedAt);
    const minutes = item.finishedAt
      ? Math.max(0, Math.round((finished.getTime() - new Date(item.startedAt).getTime()) / 60000))
      : "";
    return [
      finished.toLocaleDateString("id-ID", { timeZone: WIB, day: "2-digit", month: "2-digit", year: "numeric" }),
      finished.toLocaleTimeString("id-ID", { timeZone: WIB, hour: "2-digit", minute: "2-digit" }),
      item.assessmentLabel,
      item.subjectName,
      item.gradeLevel ?? "",
      item.packageTitle,
      item.kind === "tryout" ? "Tryout" : "Latihan",
      item.correctCount,
      item.totalCount,
      String(item.score).replace(".", ","),
      minutes,
      item.violations,
    ]
      .map(csvCell)
      .join(";");
  });
  return `﻿${[CSV_HEADER.join(";"), ...rows].join("\r\n")}\r\n`;
}
