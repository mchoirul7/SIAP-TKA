import { readValue, writeValue } from "./local-storage";
import { storageKeys } from "./storage-keys";

export interface StudentProfile {
  name: string;
  grade: string;
}

export function readProfile(): StudentProfile | null {
  const profile = readValue<StudentProfile>(storageKeys.profile);
  if (!profile || typeof profile.name !== "string") return null;
  return { name: profile.name, grade: profile.grade ?? "" };
}

export function writeProfile(profile: StudentProfile): void {
  writeValue(storageKeys.profile, profile);
}
