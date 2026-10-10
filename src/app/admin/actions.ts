"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AssessmentType, EducationLevel } from "@/data/types";
import { requireAdmin, signInAdmin, signOutAdmin } from "@/lib/admin-auth";
import {
  addGrant,
  clearStudentSessions,
  createStudent,
  deleteGrant,
  setStudentActive,
  type AdminGrant,
} from "@/lib/admin-students";
import { removeStudentDevice } from "@/lib/student-account";

const LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];
const ASSESSMENTS: AssessmentType[] = ["tka", "ulangan_harian", "sumatif_tengah_semester", "sumatif_akhir_semester"];
const SCOPES: AdminGrant["scope"][] = ["package", "subject", "all_in"];

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function optionalInt(formData: FormData, name: string): number | null {
  const value = Number.parseInt(text(formData, name).replace(/\D/g, ""), 10);
  return Number.isFinite(value) ? value : null;
}

function pick<T extends string>(value: string, allowed: T[], fallback: T): T {
  return (allowed as string[]).includes(value) ? (value as T) : fallback;
}

/** Kembali ke halaman asal dengan pesan, karena halaman admin dirender di server. */
function back(path: string, message: string, isError = false): never {
  redirect(`${path}?${isError ? "galat" : "pesan"}=${encodeURIComponent(message)}`);
}

export async function signInAdminAction(formData: FormData): Promise<void> {
  const ok = await signInAdmin(text(formData, "password"));
  if (!ok) back("/admin", "Password admin salah.", true);
  redirect("/admin");
}

export async function signOutAdminAction(): Promise<void> {
  await signOutAdmin();
  redirect("/admin");
}

export async function createStudentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const name = text(formData, "name");
  const gradeLevel = optionalInt(formData, "gradeLevel");
  if (!name || !gradeLevel) back("/admin", "Nama dan kelas wajib diisi.", true);
  const student = await createStudent({
    name,
    level: pick(text(formData, "level"), LEVELS, "SD"),
    gradeLevel,
    parentPhone: text(formData, "parentPhone") || null,
  });
  redirect(`/admin/murid/${student.id}?baru=1`);
}

export async function addGrantAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const studentId = text(formData, "studentId");
  const path = `/admin/murid/${studentId}`;
  try {
    await addGrant({
      studentId,
      scope: pick(text(formData, "scope"), SCOPES, "all_in"),
      assessmentType: pick(text(formData, "assessmentType"), ASSESSMENTS, "ulangan_harian"),
      level: pick(text(formData, "level"), LEVELS, "SD"),
      gradeLevel: optionalInt(formData, "gradeLevel") ?? 1,
      semester: optionalInt(formData, "semester"),
      subjectId: text(formData, "subjectId") || null,
      packageSlug: text(formData, "packageSlug") || null,
      months: optionalInt(formData, "months") ?? 6,
      pricePaid: optionalInt(formData, "pricePaid"),
      note: text(formData, "note") || null,
    });
  } catch (error) {
    back(path, error instanceof Error ? error.message : "Gagal menambah grant.", true);
  }
  revalidatePath(path);
  back(path, "Grant ditambahkan. Paketnya terbuka saat murid membuka halaman lagi.");
}

export async function deleteGrantAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const studentId = text(formData, "studentId");
  await deleteGrant(studentId, text(formData, "grantId"));
  back(`/admin/murid/${studentId}`, "Grant dihapus.");
}

export async function setStudentActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const studentId = text(formData, "studentId");
  const active = text(formData, "active") === "1";
  await setStudentActive(studentId, active);
  back(`/admin/murid/${studentId}`, active ? "Kode murid diaktifkan." : "Kode murid dinonaktifkan dan semua perangkatnya dikeluarkan.");
}

export async function removeDeviceAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const studentId = text(formData, "studentId");
  const sessionId = text(formData, "sessionId");
  if (sessionId) await removeStudentDevice(studentId, sessionId);
  else await clearStudentSessions(studentId);
  back(`/admin/murid/${studentId}`, sessionId ? "Perangkat dikeluarkan." : "Semua perangkat dikeluarkan.");
}
