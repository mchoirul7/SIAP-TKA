import type { EducationLevel } from "@/data/types";

/**
 * Pilihan kelas mengikuti jenjang paketnya. Sebelumnya daftarnya tetap
 * "Kelas 4-6" untuk semua paket, sehingga peserta SMA tidak menemukan kelasnya
 * sendiri.
 */
const gradesByLevel: Record<EducationLevel, number[]> = {
  SD: [1, 2, 3, 4, 5, 6],
  SMP: [7, 8, 9],
  SMA: [10, 11, 12],
};

export function gradeOptionsFor(level: EducationLevel): string[] {
  return [...gradesByLevel[level].map((grade) => `Kelas ${grade}`), "Lainnya"];
}

/**
 * Kelas yang dipilih sebelumnya bisa saja berasal dari jenjang lain — misalnya
 * peserta pindah dari paket SD ke paket SMA. Bila tidak cocok, kembalikan
 * kelas terakhir jenjang ini sebagai bawaan yang paling masuk akal.
 */
export function resolveGrade(level: EducationLevel, stored: string | undefined): string {
  const options = gradeOptionsFor(level);
  if (stored && options.includes(stored)) return stored;
  // Kelas tertinggi: yang paling siap mengerjakan TKA di jenjang tersebut.
  return options[options.length - 2] ?? options[0];
}
