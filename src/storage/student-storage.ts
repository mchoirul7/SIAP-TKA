import type { EducationLevel } from "@/data/types";
import { readValue, removeValue, writeValue } from "./local-storage";
import { writeProfile } from "./profile-storage";
import { storageKeys } from "./storage-keys";

/**
 * Salinan data murid yang sedang masuk, hanya untuk tampilan. Sumber
 * kebenarannya tetap di server: halaman terkunci memeriksa sesi murid sendiri.
 */
export interface StoredStudent {
  student: { name: string; level: EducationLevel; gradeLevel: number };
  packageSlugs: string[];
  syncedAt: number;
}

export function readStudent(): StoredStudent | null {
  const stored = readValue<StoredStudent>(storageKeys.student);
  if (!stored || !stored.student || !Array.isArray(stored.packageSlugs)) return null;
  return stored;
}

export function writeStudent(student: StoredStudent["student"], packageSlugs: string[]): void {
  writeValue<StoredStudent>(storageKeys.student, { student, packageSlugs, syncedAt: Date.now() });
  // Nama di hasil latihan ("Ananda ...") diambil dari akun, jadi tidak perlu diketik ulang.
  writeProfile({ name: student.name, grade: `Kelas ${student.gradeLevel}` });
}

export function clearStudent(): void {
  removeValue(storageKeys.student);
}
