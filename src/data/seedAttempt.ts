/**
 * Jawaban contoh untuk keperluan demo prototype.
 *
 * Dirancang agar halaman hasil menampilkan skenario yang utuh:
 * - Pecahan Senilai lemah (25%), Perbandingan Pecahan (50%), Operasi Pecahan (50%)
 * - Keliling dan Luas cukup (75%), sisanya dikuasai
 * - Skor akhir 68 dari 100: 17 benar, 7 salah, 1 kosong
 * - Distractor yang dipilih memunculkan dua pola jawaban berulang
 *
 * File ini hanya dipakai tombol "Lihat contoh hasil" pada halaman intro tryout
 * dan tidak memengaruhi pengerjaan sungguhan.
 */
import type { AnswerMap } from "./types";

/** Kunci pilihan tunggal pada attempt contoh, ditulis ringkas lalu dibungkus di bawah. */
const seedSingleChoices: Record<string, string> = {
  t01: "A",
  t02: "C",
  t03: "B",
  t04: "B",
  t05: "D",
  t06: "B",
  t07: "A",
  t08: "B",
  t09: "A",
  t10: "B",
  t11: "A",
  // t12 sengaja dibiarkan kosong
  t13: "C",
  t14: "C",
  t15: "B",
  t16: "B",
  t17: "C",
  t18: "C",
  t19: "A",
  t20: "C",
  t21: "C",
  t22: "A",
  t23: "B",
  t24: "B",
  t25: "C",
};

export const seedTryoutAnswers: AnswerMap = Object.fromEntries(
  Object.entries(seedSingleChoices).map(([questionId, key]) => [
    questionId,
    { type: "single", key },
  ]),
);

export const seedMarkedQuestionIds = ["t08", "t12"];

export const seedDurationMinutes = 31;
