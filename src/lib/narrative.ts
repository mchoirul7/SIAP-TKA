import type { MisconceptionSignal, PracticeAnalysis, TryoutAnalysis } from "@/lib/scoring";

/**
 * Hasil ujian diringkas menjadi satu narasi saja: materi apa yang harus
 * dipelajari lebih dulu, dan mengapa. Rincian per topik, per subtopik, dan
 * pola jawaban sengaja tidak ditampilkan agar tidak ada yang perlu ditafsirkan
 * sendiri oleh orang tua.
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

function misconceptionNote(signals: MisconceptionSignal[]): string {
  if (signals.length === 0) return "";
  const [first, second] = signals;
  return (
    ` Pola jawaban yang ikut terlihat: ${first.insight}` +
    (second ? ` Pola lain yang perlu diperhatikan: ${second.insight}` : "")
  );
}

export function buildTryoutNarrative(
  analysis: TryoutAnalysis,
  /** Kalimat penutup hanya menyebut paket latihan bila memang ada yang disarankan. */
  options: { hasRecommendedPackages?: boolean } = {},
): StudyNarrative {
  const closing = options.hasRecommendedPackages
    ? " Paket latihan di bawah sudah disusun mengikuti urutan tersebut."
    : "";

  if (analysis.priorities.length === 0) {
    return {
      headline: "Semua materi pada simulasi ini sudah dikuasai",
      body:
        "Tidak ada materi dengan ketepatan di bawah 80% pada simulasi ini. " +
        "Langkah berikutnya adalah melanjutkan latihan ke tingkat kesulitan yang lebih tinggi, " +
        "bukan mengulang materi yang sama.",
      isAllClear: true,
    };
  }

  const advice = analysis.prerequisiteAdvice;
  const [first, ...rest] = analysis.priorities;

  // Bila materi prasyaratnya ikut lemah, prasyarat itu yang didahulukan.
  if (advice) {
    const laterNames = joinList(
      analysis.priorities.filter((item) => item.id !== advice.subtopicId).map((item) => item.name),
    );

    return {
      headline: `Mulai belajar dari ${advice.name}`,
      body:
        `${advice.name} menjadi dasar untuk ${joinList(advice.supports)}, ` +
        `dan pada simulasi ini ketepatannya baru ${advice.accuracy}%. ${advice.reason} ` +
        `Karena itu bagian ini dikuatkan lebih dulu` +
        (laterNames ? `, baru dilanjutkan ke ${laterNames}.` : ".") +
        closing,
      isAllClear: false,
    };
  }

  const laterNames = joinList(rest.map((item) => item.name));

  return {
    headline: `Mulai belajar dari ${first.name}`,
    body:
      `Pada simulasi ini, ${first.name} baru tepat ${first.correct} dari ${first.total} soal ` +
      `(${first.accuracy}%) — bagian terlemah dibanding materi lain yang diujikan. ` +
      `${first.description} Perkuat bagian ini lebih dulu` +
      (laterNames ? `, baru dilanjutkan ke ${laterNames}.` : ".") +
      closing,
    isAllClear: false,
  };
}

export function buildPracticeNarrative(analysis: PracticeAnalysis): StudyNarrative {
  if (analysis.conceptsToReview.length === 0) {
    return {
      headline: "Seluruh konsep pada paket ini sudah kuat",
      body:
        "Tidak ada konsep dengan ketepatan di bawah 80% pada latihan ini. " +
        "Latihan dapat dilanjutkan ke paket berikutnya.",
      isAllClear: true,
    };
  }

  const [first, ...rest] = analysis.conceptsToReview;
  const laterNames = joinList(rest.map((item) => item.name));

  return {
    headline: `Ulangi bagian ${first.name}`,
    body:
      `Pada latihan ini, ${first.name} baru tepat ${first.correct} dari ${first.total} soal ` +
      `(${first.accuracy}%)` +
      (laterNames ? `, diikuti ${laterNames}.` : ".") +
      " Baca pembahasannya lebih dulu, lalu kerjakan ulang paket ini untuk melihat perubahannya.",
    isAllClear: false,
  };
}
