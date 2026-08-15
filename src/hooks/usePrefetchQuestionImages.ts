"use client";

import { useEffect } from "react";
import type { Question } from "@/data/types";

/**
 * Menyiapkan gambar soal berikutnya sebelum soalnya dibuka.
 *
 * Sebagian besar soal Matematika memuat rumus dan diagram sebagai gambar. Tanpa
 * ini, gambar baru mulai diunduh tepat saat pengguna menekan "Selanjutnya",
 * sehingga soal berikutnya sempat tampil kosong. Mengunduhnya lebih awal
 * membuat perpindahan terasa seketika, dan karena gambarnya di-cache lama,
 * unduhan itu hanya terjadi sekali.
 */
const SRC_PATTERN = /src="(\/soal\/[^"]+)"/g;

function imageSourcesOf(question: Question): string[] {
  const parts: string[] = [question.questionText, question.stimulus ?? ""];

  if (question.type === "category") {
    parts.push(...question.statements.map((statement) => statement.text));
  } else {
    parts.push(...question.options.map((option) => option.text));
  }

  return [...new Set(parts.join(" ").matchAll(SRC_PATTERN))].map((match) => match[1]);
}

export function usePrefetchQuestionImages(
  questions: Question[],
  currentIndex: number,
  /** Berapa soal ke depan yang disiapkan. Dua sudah cukup untuk menutupi jeda. */
  lookahead = 2,
): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const upcoming = questions.slice(currentIndex + 1, currentIndex + 1 + lookahead);
    const sources = [...new Set(upcoming.flatMap(imageSourcesOf))];

    // Peramban akan memakai kembali unduhan ini saat gambarnya benar-benar dirender.
    const images = sources.map((src) => {
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      return image;
    });

    return () => {
      // Melepas rujukan supaya unduhan yang belum selesai tidak menahan memori.
      for (const image of images) image.src = "";
    };
  }, [questions, currentIndex, lookahead]);
}
