import { randomInt } from "node:crypto";
import type { AssessmentType, EducationLevel } from "@/data/types";
import type { GrantTargetRow } from "@/lib/admin-catalog";
import { ACCESS_MONTHS } from "@/lib/pricing";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Pengelolaan akun murid (PIN) dan grant oleh admin. Hanya dipanggil dari server action admin. */

export interface AdminStudent {
  id: string;
  accessCode: string;
  name: string;
  level: EducationLevel;
  gradeLevel: number;
  parentPhone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminGrant {
  id: string;
  scope: "package" | "subject" | "all_in";
  assessmentType: AssessmentType;
  level: EducationLevel;
  gradeLevel: number;
  semester: number | null;
  subjectId: string | null;
  packageId: string | null;
  startsAt: string;
  expiresAt: string;
  pricePaid: number | null;
  note: string | null;
}

interface StudentRow {
  id: string;
  access_code: string;
  name: string;
  level: EducationLevel;
  grade_level: number;
  parent_phone: string | null;
  is_active: boolean;
  created_at: string;
}

const STUDENT_COLUMNS = "id, access_code, name, level, grade_level, parent_phone, is_active, created_at";

function toStudent(row: StudentRow): AdminStudent {
  return {
    id: row.id,
    accessCode: row.access_code,
    name: row.name,
    level: row.level,
    gradeLevel: row.grade_level,
    parentPhone: row.parent_phone,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

/** PIN acak 6 angka untuk akun yang dibuat admin atau PIN yang direset. */
export function generatePin(): string {
  return String(randomInt(1_000_000)).padStart(6, "0");
}

export async function searchStudents(query: string): Promise<AdminStudent[]> {
  let request = supabaseAdmin().from("students").select(STUDENT_COLUMNS).order("created_at", { ascending: false }).limit(50);
  const term = query.trim().replace(/[%,()]/g, "");
  if (term) request = request.or(`access_code.ilike.%${term}%,name.ilike.%${term}%,parent_phone.ilike.%${term}%`);
  const { data, error } = await request.returns<StudentRow[]>();
  if (error) throw new Error(`Gagal membaca murid: ${error.message}`);
  return (data ?? []).map(toStudent);
}

export async function getAdminStudent(id: string): Promise<AdminStudent | null> {
  const { data } = await supabaseAdmin().from("students").select(STUDENT_COLUMNS).eq("id", id).maybeSingle<StudentRow>();
  return data ? toStudent(data) : null;
}

/**
 * Akun murid dari admin. PIN boleh diisi sendiri; bila kosong dibuat acak dan
 * dicoba ulang kalau kebetulan sudah dipakai akun lain.
 */
export async function createStudent(input: {
  name: string;
  level: EducationLevel;
  gradeLevel: number;
  parentPhone: string | null;
  pin: string | null;
}): Promise<AdminStudent> {
  for (let attempt = 0; attempt < (input.pin ? 1 : 10); attempt += 1) {
    const { data, error } = await supabaseAdmin()
      .from("students")
      .insert({
        access_code: input.pin ?? generatePin(),
        name: input.name,
        level: input.level,
        grade_level: input.gradeLevel,
        parent_phone: input.parentPhone,
      })
      .select(STUDENT_COLUMNS)
      .single<StudentRow>();
    if (!error) return toStudent(data);
    if (error.code !== "23505") throw new Error(`Gagal membuat murid: ${error.message}`);
  }
  throw new Error(input.pin ? `PIN ${input.pin} sudah dipakai akun lain.` : "Gagal membuat PIN yang unik. Coba lagi.");
}

/** PIN baru untuk orang tua yang lupa. Semua perangkat lama ikut dikeluarkan. */
export async function resetStudentPin(id: string): Promise<string> {
  const db = supabaseAdmin();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const pin = generatePin();
    const { error } = await db.from("students").update({ access_code: pin }).eq("id", id);
    if (!error) {
      await db.from("student_sessions").delete().eq("student_id", id);
      return pin;
    }
    if (error.code !== "23505") throw new Error(`Gagal mereset PIN: ${error.message}`);
  }
  throw new Error("Gagal membuat PIN yang unik. Coba lagi.");
}

export async function setStudentActive(id: string, isActive: boolean): Promise<void> {
  const db = supabaseAdmin();
  const { error } = await db.from("students").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(`Gagal mengubah status murid: ${error.message}`);
  if (!isActive) await db.from("student_sessions").delete().eq("student_id", id);
}

export async function listGrants(studentId: string): Promise<AdminGrant[]> {
  const { data, error } = await supabaseAdmin()
    .from("student_grants")
    .select("id, scope, assessment_type, level, grade_level, semester, subject_id, package_id, starts_at, expires_at, price_paid, note")
    .eq("student_id", studentId)
    .order("starts_at", { ascending: false })
    .returns<
      {
        id: string;
        scope: AdminGrant["scope"];
        assessment_type: AssessmentType;
        level: EducationLevel;
        grade_level: number;
        semester: number | null;
        subject_id: string | null;
        package_id: string | null;
        starts_at: string;
        expires_at: string;
        price_paid: number | null;
        note: string | null;
      }[]
    >();
  if (error) throw new Error(`Gagal membaca grant: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id,
    scope: row.scope,
    assessmentType: row.assessment_type,
    level: row.level,
    gradeLevel: row.grade_level,
    semester: row.semester,
    subjectId: row.subject_id,
    packageId: row.package_id,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    pricePaid: row.price_paid,
    note: row.note,
  }));
}

/**
 * Menambah beberapa grant sekaligus dari pilihan centang. Harga dicatat di
 * baris pertama saja supaya total pembelian tidak terhitung berulang.
 */
export async function addGrants(input: {
  studentId: string;
  targets: GrantTargetRow[];
  months: number;
  pricePaid: number | null;
  note: string | null;
}): Promise<number> {
  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setMonth(expiresAt.getMonth() + (input.months > 0 ? input.months : ACCESS_MONTHS));

  const rows = input.targets.map((target, index) => ({
    student_id: input.studentId,
    ...target,
    starts_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    price_paid: index === 0 ? input.pricePaid : null,
    note: input.note,
  }));
  const { error } = await supabaseAdmin().from("student_grants").insert(rows);
  if (error) throw new Error(`Gagal menambah grant: ${error.message}`);
  return rows.length;
}
export async function deleteGrant(studentId: string, grantId: string): Promise<void> {
  const { error } = await supabaseAdmin().from("student_grants").delete().eq("student_id", studentId).eq("id", grantId);
  if (error) throw new Error(`Gagal menghapus grant: ${error.message}`);
}

export async function clearStudentSessions(studentId: string): Promise<void> {
  const { error } = await supabaseAdmin().from("student_sessions").delete().eq("student_id", studentId);
  if (error) throw new Error(`Gagal mengeluarkan perangkat: ${error.message}`);
}
