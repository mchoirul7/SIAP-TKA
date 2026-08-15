import { MASTERY_THRESHOLD } from "@/lib/scoring";
import type { MisconceptionSignal, PracticeAnalysis, TryoutAnalysis } from "@/lib/scoring";

/**
 * Hasil diringkas menjadi satu paragraf: apa yang perlu dipelajari lebih dulu,
 * dan kenapa.
 *
 * Kalimatnya sengaja dibuat sederhana dan menyapa siswa langsung ("kamu"),
 * karena halaman ini dibaca siswa sendiri. Istilah teknis seperti "ketepatan",
 * "prasyarat", atau "akurasi" diganti dengan kalimat sehari-hari, dan angka
 * ditulis sebagai "benar 3 dari 5 soal" — bukan persen — supaya langsung
 * terbayang. Rincian per konsep ditampilkan terpisah sebagai kartu.
 */
export interface StudyNarrative {
  headline: string;
  body: string;
  /** Ditampilkan bila tidak ada materi yang perlu diperkuat. */
  isAllClear: boolean;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} dan ${items[items.length - 1]}`;
}

/** Satu kalimat tambahan tentang pola jawaban yang sering keliru. */
export function misconceptionNote(signals: MisconceptionSignal[]): string {
  const first = signals[0];
  if (!first) return "";
  return ` Yang paling sering keliru: ${first.insight}`;
}

export function buildTryoutNarrative(
  analysis: TryoutAnalysis,
  /** Kalimat penutup hanya menyebut paket latihan bila memang ada yang disarankan. */
  options: { hasRecommendedPackages?: boolean } = {},
): StudyNarrative {
  const closing = options.hasRecommendedPackages
    ? " Paket latihan di bawah sudah diurutkan sesuai itu, jadi tinggal dikerjakan dari yang paling atas."
    : "";

  if (analysis.priorities.length === 0) {
    // Nilai masih rendah tetapi materinya belum terpetakan: jangan mengaku semuanya beres.
    if (analysis.score < MASTERY_THRESHOLD) {
      return {
        headline: "Baca ulang soal yang belum tepat",
        body:
          `Kamu benar ${analysis.correctCount} dari ${analysis.totalQuestions} soal. ` +
          "Rincian materinya belum tersedia untuk simulasi ini, jadi mulailah dari soal yang " +
          "jawabannya masih keliru dan pelajari pembahasannya satu per satu.",
        isAllClear: false,
      };
    }

    return {
      headline: "Semua materi di simulasi ini sudah kamu kuasai",
      body:
        "Tidak ada materi yang perlu diulang dari simulasi ini. " +
        "Langkah berikutnya: coba soal yang lebih sulit, bukan mengulang materi yang sama.",
      isAllClear: true,
    };
  }

  const advice = analysis.prerequisiteAdvice;
  const [first, ...rest] = analysis.priorities;

  // Bila materi dasarnya ikut lemah, materi dasar itu yang dikerjakan lebih dulu.
  if (advice) {
    const laterNames = joinList(
      analysis.priorities.filter((item) => item.id !== advice.subtopicId).map((item) => item.name),
    );

    return {
      headline: `Mulai dari ${advice.name}`,
      body:
        `${advice.name} adalah bekal untuk ${joinList(advice.supports)}. ` +
        `Di simulasi ini bagian itu baru benar ${advice.correct} dari ${advice.total} soal. ` +
        `${advice.reason} Jadi kuatkan bagian ini dulu` +
        (laterNames ? `, baru lanjut ke ${laterNames}.` : ".") +
        closing,
      isAllClear: false,
    };
  }

  const laterNames = joinList(rest.map((item) => item.name));

  return {
    headline: `Mulai dari ${first.name}`,
    body:
      `Di simulasi ini kamu benar ${first.correct} dari ${first.total} soal ${first.name} — ` +
      `paling sedikit dibanding materi lain. Kuatkan bagian ini dulu` +
      (laterNames ? `, baru lanjut ke ${laterNames}.` : ".") +
      closing,
    isAllClear: false,
  };
}

export function buildPracticeNarrative(
  analysis: PracticeAnalysis,
  options: { hasRecommendedPackages?: boolean } = {},
): StudyNarrative {
  if (analysis.conceptsToReview.length === 0) {
    // Nilai masih rendah tetapi materinya belum terpetakan: jangan mengaku semuanya beres.
    if (analysis.score < MASTERY_THRESHOLD) {
      return {
        headline: "Baca ulang soal yang belum tepat",
        body:
          `Kamu benar ${analysis.correctCount} dari ${analysis.totalQuestions} soal. ` +
          "Rincian materinya belum tersedia untuk paket ini, jadi buka pembahasan dan pelajari " +
          "soal yang jawabannya masih keliru, lalu kerjakan ulang paketnya.",
        isAllClear: false,
      };
    }

    return {
      headline: "Semua materi di paket ini sudah kamu kuasai",
      body:
        "Tidak ada materi yang perlu diulang dari latihan ini. " +
        "Lanjut saja ke paket berikutnya.",
      isAllClear: true,
    };
  }

  const [first, ...rest] = analysis.conceptsToReview;
  const laterNames = joinList(rest.map((item) => item.name));
  const closing = options.hasRecommendedPackages
    ? " Paket latihan di bawah bisa dipakai untuk berlatih lagi."
    : "";

  return {
    headline: `Pelajari lagi ${first.name}`,
    body:
      `Di latihan ini kamu benar ${first.correct} dari ${first.total} soal ${first.name}` +
      (laterNames ? `, lalu ${laterNames}.` : ".") +
      misconceptionNote(first.misconceptions) +
      " Baca pembahasannya dulu, lalu kerjakan ulang paket ini dan bandingkan hasilnya." +
      closing,
    isAllClear: false,
  };
}
