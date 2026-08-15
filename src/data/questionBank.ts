import { tkaQuestions } from "./tkaQuestions";
import type { Question } from "./types";

/**
 * Satu pintu masuk untuk seluruh soal.
 *
 * Saat ini hanya berisi bank soal TKA resmi hasil impor. Soal contoh buatan
 * prototype (`questions.ts`) sengaja tidak lagi disertakan: berkasnya masih ada
 * di disk sebagai arsip, tetapi tidak dipakai aplikasi. Bank soal berikutnya
 * ditambahkan di sini setelah dikonversi dari berkas standar.
 */
export const questionBank: Question[] = [...tkaQuestions];

export const questionById = new Map(questionBank.map((question) => [question.id, question]));
