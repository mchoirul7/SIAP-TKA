import { readValue, writeValue } from "./local-storage";
import { storageKeys } from "./storage-keys";

export interface StudentProfile {
  studentId?: string;
  name: string;
  grade: string;
}

function createStudentId(): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12);
  return `student_${random}`;
}

export function readProfile(): StudentProfile | null {
  const profile = readValue<StudentProfile>(storageKeys.profile);
  if (!profile || typeof profile.name !== "string") return null;
  return { studentId: profile.studentId, name: profile.name, grade: profile.grade ?? "" };
}

export function writeProfile(profile: StudentProfile): void {
  const previous = readProfile();
  writeValue(storageKeys.profile, {
    ...profile,
    studentId: profile.studentId ?? previous?.studentId ?? createStudentId(),
  });
}
