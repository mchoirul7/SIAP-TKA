import { randomInt } from "node:crypto";
import type { AssessmentType, EducationLevel } from "@/data/types";
import { ACCESS_MONTHS } from "@/lib/pricing";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Pengelolaan kode murid dan grant oleh admin. Hanya dipanggil dari server action admin. */

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

/** Huruf yang mudah tertukar (O/0, I/1/L) tidak dipakai supaya kode mudah diketik dari WhatsApp. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomBlock(length: number): string {
  return Array.from({ length }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
}

export function generateStudentCode(): string {
  return `SIAP-${randomBlock(4)}-${randomBlock(4)}`;
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

export async function createStudent(input: {
  name: string;
  level: EducationLevel;
  gradeLevel: number;
  parentPhone: string | null;
}): Promise<AdminStudent> {
  // Kode acak 8 huruf hampir tidak mungkin kembar; dicoba ulang bila kebetulan sudah dipakai.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabaseAdmin()
      .from("students")
      .insert({
        access_code: generateStudentCode(),
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
  throw new Error("Gagal membuat kode murid yang unik. Coba lagi.");
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

export interface NewGrantInput {
  studentId: string;
  scope: AdminGrant["scope"];
  assessmentType: AssessmentType;
  level: EducationLevel;
  gradeLevel: number;
  semester: number | null;
  subjectId: string | null;
  packageSlug: string | null;
  months: number;
  pricePaid: number | null;
  note: string | null;
}

/**
 * Menambah grant. Paket satuan dicari dari slug-nya, dan jenis ujian, jenjang,
 * kelas, serta semesternya diambil dari paket itu supaya tidak salah isi.
 */
export async function addGrant(input: NewGrantInput): Promise<void> {
  const db = supabaseAdmin();
  let row = {
    student_id: input.studentId,
    scope: input.scope,
    assessment_type: input.assessmentType,
    level: input.level,
    grade_level: input.gradeLevel,
    semester: input.semester,
    subject_id: input.scope === "subject" ? input.subjectId : null,
    package_id: null as string | null,
  };

  if (input.scope === "package") {
    const { data: pkg } = await db
      .from("packages")
      .select("id, assessment_type, level, grade_level, semester, subject_id")
      .eq("slug", input.packageSlug ?? "")
      .maybeSingle<{ id: string; assessment_type: AssessmentType; level: EducationLevel; grade_level: number; semester: number | null; subject_id: string }>();
    if (!pkg) throw new Error(`Paket dengan slug "${input.packageSlug}" tidak ditemukan.`);
    row = {
      ...row,
      assessment_type: pkg.assessment_type,
      level: pkg.level,
      grade_level: pkg.grade_level,
      semester: pkg.semester,
      package_id: pkg.id,
    };
  }
  if (input.scope === "subject" && !input.subjectId) throw new Error("Pilih mapel untuk paket lengkap per mapel.");

  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setMonth(expiresAt.getMonth() + (input.months > 0 ? input.months : ACCESS_MONTHS));

  const { error } = await db.from("student_grants").insert({
    ...row,
    starts_at: startsAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    price_paid: input.pricePaid,
    note: input.note,
  });
  if (error) throw new Error(`Gagal menambah grant: ${error.message}`);
}

export async function deleteGrant(studentId: string, grantId: string): Promise<void> {
  const { error } = await supabaseAdmin().from("student_grants").delete().eq("student_id", studentId).eq("id", grantId);
  if (error) throw new Error(`Gagal menghapus grant: ${error.message}`);
}

export async function clearStudentSessions(studentId: string): Promise<void> {
  const { error } = await supabaseAdmin().from("student_sessions").delete().eq("student_id", studentId);
  if (error) throw new Error(`Gagal mengeluarkan perangkat: ${error.message}`);
}
