import { MASTERY_THRESHOLD } from "@/lib/scoring";
import type { MisconceptionSignal, PracticeAnalysis, TryoutAnalysis } from "@/lib/scoring";

/**
 * Ringkasan hasil dalam dua kalimat pendek.
 *
 * Yang membaca adalah siswa dan orang tuanya, jadi kalimatnya memakai kata
 * sehari-hari: "belum menjawab benar", bukan "akurasi rendah"; "soal 3, 5",
 * bukan "butir 3, 5". Istilah pelajaran memang tetap muncul — bilangan
 * irasional tetap harus disebut bilangan irasional — tetapi bahasa di
 * sekelilingnya dibuat sesederhana mungkin.
 *
 *   "Pada latihan ini, Ananda Sinta menguasai 8 dari 10 soal Operasi Bilangan.
 *    Yang masih salah: semua bentuk akar dianggap irasional (soal 3, 5)."
 *
 * Rincian per materi tetap ada di bawahnya sebagai kartu, jadi paragraf ini
 * tidak perlu menerangkan apa pun lagi.
 */
export interface StudyNarrative {
  body: string;
  /** Dipakai halaman hasil untuk memilih warna dan ikon kartunya. */
  isAllClear: boolean;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} dan ${items[items.length - 1]}`;
}

/** Tanpa nama yang tercatat, sapaannya tetap sopan: "Ananda" saja. */
function greeting(studentName: string | undefined): string {
  const name = studentName?.trim();
  return name ? `Ananda ${name}` : "Ananda";
}

interface NarrativeOptions {
  /** Nama yang diisi peserta sebelum mengerjakan. */
  studentName?: string;
  /** Materi atau mata pelajaran yang dikerjakan, disebut setelah jumlah soal. */
  contextName?: string;
}

/** Dua penyebab terbanyak saja; selebihnya sudah tampil sebagai kartu di bawah. */
const WEAK_LIMIT = 2;

/**
 * Sebagian label pola keliru ditulis sebagai capaian yang belum tercapai
 * ("Keliru: Memahami syarat kesebangunan"), sebagian lagi sebagai anggapan
 * yang salah ("Semua bentuk akar dianggap irasional"). Awalan "Keliru:"
 * dibuang supaya kalimatnya tidak menyebut keliru dua kali, dan huruf besar di
 * awal diturunkan karena label ini menyambung di tengah kalimat.
 */
const COMPETENCY_PREFIX = /^keliru\s*:\s*/i;

function isCompetencyLabel(signal: MisconceptionSignal): boolean {
  return COMPETENCY_PREFIX.test(signal.label.trim());
}

function cleanLabel(label: string): string {
  const text = label.trim().replace(COMPETENCY_PREFIX, "").trim();
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Kalimat kedua: sespesifik mungkin sesuai data yang ada pada soalnya.
 *
 * Pengecoh soal Matematika sudah ditandai pola kelirunya, jadi kesalahannya
 * bisa disebut apa adanya berikut nomor soalnya. Bila soal belum bertanda —
 * mata pelajaran lain, atau soal dikosongkan sehingga tidak ada pengecoh yang
 * terpilih — yang bisa disebut tinggal nama materinya.
 */
function detail(signals: MisconceptionSignal[], weakNames: string[]): string | null {
  const top = signals.slice(0, WEAK_LIMIT);
  if (top.length > 0) {
    const parts = top.map((signal) => {
      const numbers = signal.questionNumbers;
      const label = cleanLabel(signal.label);
      return numbers.length > 0 ? `${label} (soal ${numbers.join(", ")})` : label;
    });
    // Pembuka kalimat mengikuti bentuk label yang paling sering muncul.
    const lead = isCompetencyLabel(top[0]) ? "Yang masih perlu dilatih" : "Yang masih salah";
    return `${lead}: ${joinList(parts)}.`;
  }
  if (weakNames.length > 0) return `Materi ${joinList(weakNames)} masih perlu diperkuat.`;
  return null;
}

function compose(
  opening: string,
  signals: MisconceptionSignal[],
  weakNames: string[],
  score: number,
  fallbackAdvice: string,
): StudyNarrative {
  const specifics = detail(signals, weakNames);
  if (specifics) return { body: `${opening} ${specifics}`, isAllClear: false };

  // Materinya belum terpetakan, tetapi nilainya rendah: jangan mengaku semuanya beres.
  if (score < MASTERY_THRESHOLD) {
    return { body: `${opening} ${fallbackAdvice}`, isAllClear: false };
  }
  return { body: `${opening} Semua materinya sudah dikuasai.`, isAllClear: true };
}

/** "menguasai 0 dari 10 soal" terbaca kasar; nol disebut dengan kalimat sendiri. */
function opening(
  where: string,
  studentName: string | undefined,
  correct: number,
  total: number,
  contextName: string | undefined,
): string {
  const scope = contextName ? ` ${contextName}` : "";
  const who = greeting(studentName);
  if (correct === 0) {
    return `${where}, ${who} belum menjawab benar satu pun dari ${total} soal${scope}.`;
  }
  return `${where}, ${who} menguasai ${correct} dari ${total} soal${scope}.`;
}

export function buildTryoutNarrative(
  analysis: TryoutAnalysis,
  options: NarrativeOptions = {},
): StudyNarrative {
  // Materi prasyarat didahulukan bila ada: itu yang sebaiknya dikuatkan lebih dulu.
  const advice = analysis.prerequisiteAdvice;
  const names = analysis.priorities
    .filter((item) => item.id !== advice?.subtopicId)
    .map((item) => item.name);
  const weakNames = (advice ? [advice.name, ...names] : names).slice(0, WEAK_LIMIT);

  return compose(
    opening(
      "Pada tryout ini",
      options.studentName,
      analysis.correctCount,
      analysis.totalQuestions,
      options.contextName,
    ),
    analysis.misconceptionSignals,
    weakNames,
    analysis.score,
    "Buka pembahasan untuk melihat soal yang jawabannya belum tepat.",
  );
}

export function buildPracticeNarrative(
  analysis: PracticeAnalysis,
  options: NarrativeOptions = {},
): StudyNarrative {
  const weakNames = analysis.conceptsToReview.slice(0, WEAK_LIMIT).map((item) => item.name);

  return compose(
    opening(
      "Pada latihan ini",
      options.studentName,
      analysis.correctCount,
      analysis.totalQuestions,
      options.contextName,
    ),
    analysis.misconceptionSignals,
    weakNames,
    analysis.score,
    "Buka pembahasan untuk melihat soal yang jawabannya belum tepat.",
  );
}
