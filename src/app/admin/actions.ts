"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AssessmentType, EducationLevel } from "@/data/types";
import { requireAdmin, signInAdmin, signOutAdmin } from "@/lib/admin-auth";
import { selectionTargets, type AdminScope, type GrantTargetRow } from "@/lib/admin-catalog";
import {
  addGrants,
  clearStudentSessions,
  createStudent,
  deleteGrant,
  resetStudentPin,
  setStudentActive,
} from "@/lib/admin-students";
import { removeStudentDevice } from "@/lib/student-account";

const LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];
const ASSESSMENTS: AssessmentType[] = ["tka", "ulangan_harian", "sumatif_tengah_semester", "sumatif_akhir_semester"];

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
  const pin = text(formData, "pin");
  if (pin && !/^\d{6}$/.test(pin)) back("/admin", "PIN harus 6 angka, atau kosongkan supaya dibuat otomatis.", true);
  let studentId: string;
  try {
    const student = await createStudent({
      name,
      level: pick(text(formData, "level"), LEVELS, "SD"),
      gradeLevel,
      parentPhone: text(formData, "parentPhone") || null,
      pin: pin || null,
    });
    studentId = student.id;
  } catch (error) {
    back("/admin", errorMessage(error, "Gagal membuat akun murid."), true);
  }
  redirect(`/admin/murid/${studentId}?baru=1`);
}

export async function resetPinAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const studentId = text(formData, "studentId");
  const path = `/admin/murid/${studentId}`;
  let pin: string;
  try {
    pin = await resetStudentPin(studentId);
  } catch (error) {
    back(path, errorMessage(error, "Gagal mereset PIN."), true);
  }
  back(path, `PIN baru: ${pin}. Kirim ke orang tua; perangkat lama sudah dikeluarkan.`);
}

/** Pilihan dari PackagePicker: lingkup tersembunyi plus centang All-in, mapel, dan paket. */
async function pickedTargets(formData: FormData): Promise<GrantTargetRow[]> {
  const scope: AdminScope = {
    assessmentType: pick(text(formData, "assessmentType"), ASSESSMENTS, "ulangan_harian"),
    level: pick(text(formData, "level"), LEVELS, "SD"),
    gradeLevel: optionalInt(formData, "gradeLevel") ?? 1,
    semester: optionalInt(formData, "semester"),
  };
  return selectionTargets(scope, {
    allIn: text(formData, "allIn") === "1",
    subjectIds: formData.getAll("subjectId").map(String).filter(Boolean),
    packageIds: formData.getAll("packageId").map(String).filter(Boolean),
  });
}

function months(formData: FormData): number {
  return optionalInt(formData, "months") ?? 6;
}
function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export async function addGrantAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const studentId = text(formData, "studentId");
  const path = `/admin/murid/${studentId}`;
  let count = 0;
  try {
    count = await addGrants({
      studentId,
      targets: await pickedTargets(formData),
      months: months(formData),
      pricePaid: optionalInt(formData, "pricePaid"),
      note: text(formData, "note") || null,
    });
  } catch (error) {
    back(path, errorMessage(error, "Gagal menambah paket."), true);
  }
  revalidatePath(path);
  back(path, `${count} paket dibukakan ke akun; tombol Mulai Latihan-nya kini aktif untuk murid.`);
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
  back(`/admin/murid/${studentId}`, active ? "Akun murid diaktifkan." : "Akun murid dinonaktifkan dan semua perangkatnya dikeluarkan.");
}

export async function removeDeviceAdminAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const studentId = text(formData, "studentId");
  const sessionId = text(formData, "sessionId");
  if (sessionId) await removeStudentDevice(studentId, sessionId);
  else await clearStudentSessions(studentId);
  back(`/admin/murid/${studentId}`, sessionId ? "Perangkat dikeluarkan." : "Semua perangkat dikeluarkan.");
}
