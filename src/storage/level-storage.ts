import type { EducationLevel } from "@/data/types";
import { readValue, writeValue } from "./local-storage";
import { storageKeys } from "./storage-keys";

/**
 * Jenjang yang dipilih pengguna. Ditanyakan sekali pada kunjungan pertama lalu
 * disimpan di perangkat, supaya katalog langsung menampilkan mata pelajaran
 * yang relevan tanpa bertanya berulang kali.
 */
const LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];

export function readLevel(): EducationLevel | null {
  const value = readValue<string>(storageKeys.level);
  return LEVELS.includes(value as EducationLevel) ? (value as EducationLevel) : null;
}

export function writeLevel(level: EducationLevel): void {
  writeValue(storageKeys.level, level);
}
