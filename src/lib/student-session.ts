import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { EducationLevel } from "@/data/types";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Satu akun untuk satu murid.
 *
 * Orang tua mendaftarkan murid sendiri dengan nama dan PIN 6 angka; PIN itu
 * disimpan di `students.access_code` dan menjadi kode masuk. Saat PIN dimasukkan,
 * server membuat baris `student_sessions` dan menyimpan id-nya di cookie
 * httpOnly. Id sesi acak dan dicek ke basis data setiap kali dipakai, jadi
 * cookie tidak perlu ditandatangani dan bisa dicabut dengan menghapus barisnya.
 *
 * Hak akses ada di `student_grants` dan menempel ke murid, bukan ke perangkat:
 * ganti HP cukup masukkan kode yang sama.
 */

export const STUDENT_COOKIE_NAME = "siaptka-student";
export const STUDENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

/** Perangkat aktif paling banyak per murid; masuk dari perangkat berikutnya mengeluarkan yang terlama. */
const MAX_SESSIONS_PER_STUDENT = 2;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface StudentProfile {
  name: string;
  level: EducationLevel;
  gradeLevel: number;
}

export interface StudentGrant {
  scope: "package" | "subject" | "all_in";
  assessmentType: string;
  level: EducationLevel;
  gradeLevel: number;
  semester: number | null;
  subjectId: string | null;
  packageId: string | null;
  expiresAt: string;
}

export interface StudentAccess {
  student: StudentProfile;
  grants: StudentGrant[];
  /** Slug paket terbit yang terbuka oleh grant aktif murid ini. */
  packageSlugs: string[];
}

interface StudentRow {
  id: string;
  name: string;
  level: EducationLevel;
  grade_level: number;
  is_active: boolean;
}

interface GrantRow {
  scope: StudentGrant["scope"];
  assessment_type: string;
  level: EducationLevel;
  grade_level: number;
  semester: number | null;
  subject_id: string | null;
  package_id: string | null;
  starts_at: string;
  expires_at: string;
}

function toProfile(row: StudentRow): StudentProfile {
  return { name: row.name, level: row.level, gradeLevel: row.grade_level };
}

/** Murid aktif pemilik kode ini; kosong bila kodenya bukan kode murid. */
export async function findStudentByCode(code: string): Promise<StudentRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("students")
    .select("id, name, level, grade_level, is_active")
    .eq("access_code", code)
    .maybeSingle<StudentRow>();
  if (error) throw new Error(`Gagal membaca kode murid: ${error.message}`);
  return data && data.is_active ? data : null;
}

/** Membuat sesi baru dan mengeluarkan perangkat terlama bila melebihi batas. */
export async function createStudentSession(studentId: string, userAgent: string | null): Promise<string> {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("student_sessions")
    .insert({ student_id: studentId, user_agent: userAgent?.slice(0, 300) ?? null })
    .select("id")
    .single<{ id: string }>();
  if (error) throw new Error(`Gagal membuat sesi murid: ${error.message}`);

  const { data: sessions } = await db
    .from("student_sessions")
    .select("id")
    .eq("student_id", studentId)
    .order("last_seen", { ascending: false });
  const stale = (sessions ?? []).slice(MAX_SESSIONS_PER_STUDENT).map((row) => row.id as string);
  if (stale.length > 0) await db.from("student_sessions").delete().in("id", stale);

  return data.id;
}

export async function deleteStudentSession(sessionId: string): Promise<void> {
  if (!UUID_PATTERN.test(sessionId)) return;
  await supabaseAdmin().from("student_sessions").delete().eq("id", sessionId);
}

/** Murid pemilik sesi ini, sekaligus mencatat kapan terakhir terlihat. */
export async function studentForSession(sessionId: string | undefined): Promise<(StudentRow & { sessionId: string }) | null> {
  if (!sessionId || !UUID_PATTERN.test(sessionId)) return null;
  const db = supabaseAdmin();
  const { data } = await db
    .from("student_sessions")
    .select("id, students (id, name, level, grade_level, is_active)")
    .eq("id", sessionId)
    .maybeSingle<{ id: string; students: StudentRow | null }>();
  const student = data?.students;
  if (!student || !student.is_active) return null;
  await db.from("student_sessions").update({ last_seen: new Date().toISOString() }).eq("id", sessionId);
  return { ...student, sessionId };
}

/** Kode murid hanya berjalan bila secret key tersedia, misalnya belum diisi di Preview. */
export function isStudentLoginConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

/** Murid yang sedang masuk di permintaan ini, dari cookie sesi. */
export async function getServerStudent() {
  const store = await cookies();
  const sessionId = store.get(STUDENT_COOKIE_NAME)?.value;
  if (!sessionId || !isStudentLoginConfigured()) return null;
  return studentForSession(sessionId);
}

/** Grant aktif murid beserta slug paket terbit yang dibukanya. */
export async function studentAccess(student: StudentRow): Promise<StudentAccess> {
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("student_grants")
    .select("scope, assessment_type, level, grade_level, semester, subject_id, package_id, starts_at, expires_at")
    .eq("student_id", student.id)
    .lte("starts_at", now)
    .gte("expires_at", now)
    .returns<GrantRow[]>();
  if (error) throw new Error(`Gagal membaca hak akses murid: ${error.message}`);
  const grants = data ?? [];

  // Secret key melewati RLS, jadi paket yang belum terbit disaring di sini.
  const slugLists = await Promise.all(
    grants.map(async (grant) => {
      let query = db
        .from("packages")
        .select("slug")
        .eq("is_published", true)
        .eq("assessment_type", grant.assessment_type)
        .eq("level", grant.level)
        .eq("grade_level", grant.grade_level);
      if (grant.semester !== null) query = query.eq("semester", grant.semester);
      if (grant.scope === "subject") query = query.eq("subject_id", grant.subject_id);
      if (grant.scope === "package") query = query.eq("id", grant.package_id);
      const { data: rows } = await query.returns<{ slug: string }[]>();
      return (rows ?? []).map((row) => row.slug);
    }),
  );

  return {
    student: toProfile(student),
    grants: grants.map((grant) => ({
      scope: grant.scope,
      assessmentType: grant.assessment_type,
      level: grant.level,
      gradeLevel: grant.grade_level,
      semester: grant.semester,
      subjectId: grant.subject_id,
      packageId: grant.package_id,
      expiresAt: grant.expires_at,
    })),
    packageSlugs: [...new Set(slugLists.flat())].sort(),
  };
}

/** Pengecekan akses di server, memakai fungsi `student_can_access` di basis data. */
export async function studentCanAccess(studentId: string, packageId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin().rpc("student_can_access", {
    p_student: studentId,
    p_package: packageId,
  });
  if (error) throw new Error(`Gagal memeriksa akses murid: ${error.message}`);
  return data === true;
}

/** Membuat sesi untuk murid ini dan membalas dengan data akunnya beserta cookie sesi. */
export async function studentSignInResponse(
  student: StudentRow,
  userAgent: string | null,
  message: string,
): Promise<NextResponse> {
  const sessionId = await createStudentSession(student.id, userAgent);
  const access = await studentAccess(student);
  const response = NextResponse.json({
    kind: "student",
    message,
    student: access.student,
    unlockedPackageSlugs: access.packageSlugs,
  });
  response.cookies.set(STUDENT_COOKIE_NAME, sessionId, studentCookieOptions);
  return response;
}

/**
 * Akun baru dari pendaftaran mandiri orang tua. PIN menjadi kode masuk, jadi
 * harus unik; kosong bila PIN itu sudah dipakai akun lain.
 */
export async function registerStudent(input: {
  name: string;
  pin: string;
  level: EducationLevel;
  gradeLevel: number;
}): Promise<StudentRow | null> {
  const { data, error } = await supabaseAdmin()
    .from("students")
    .insert({ access_code: input.pin, name: input.name, level: input.level, grade_level: input.gradeLevel })
    .select("id, name, level, grade_level, is_active")
    .single<StudentRow>();
  if (error?.code === "23505") return null;
  if (error) throw new Error(`Gagal mendaftarkan murid: ${error.message}`);
  return data;
}

export const studentCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: STUDENT_COOKIE_MAX_AGE,
};
