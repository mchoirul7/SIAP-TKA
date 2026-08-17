import type { Difficulty, ReasoningType } from "@/data/types";
import type { MasteryStatus } from "./scoring";

/** Label penanda soal. Dipakai analisis maupun label diagnostik di halaman soal. */
export const difficultyLabel: Record<Difficulty, string> = {
  dasar: "Dasar",
  menengah: "Menengah",
  lanjut: "Lanjut",
};

export const reasoningLabel: Record<ReasoningType, string> = {
  pemahaman: "Pemahaman",
  penerapan: "Penerapan",
  penalaran: "Penalaran",
};

/** 754 -> "12:34" ; dipakai timer ujian. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** 4492 -> "01:14:52" ; jam ikut ditampilkan, seperti penunjuk waktu ANBK. */
export function formatExamClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

/** 1860 -> "31 menit" ; dipakai ringkasan hasil. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.max(0, Math.round(totalSeconds / 60));
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} jam` : `${hours} jam ${rest} menit`;
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(timestamp));
}

export const statusLabel: Record<MasteryStatus, string> = {
  "perlu-diperkuat": "Perlu diperkuat",
  cukup: "Cukup",
  dikuasai: "Dikuasai",
};

/** Kelas untuk chip status. Warna semantik hanya dipakai pada elemen yang benar-benar berstatus. */
export const statusChipClass: Record<MasteryStatus, string> = {
  "perlu-diperkuat": "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200",
  cukup: "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200",
  dikuasai: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
};

export const statusBarClass: Record<MasteryStatus, string> = {
  "perlu-diperkuat": "bg-rose-500",
  cukup: "bg-amber-500",
  dikuasai: "bg-emerald-600",
};
