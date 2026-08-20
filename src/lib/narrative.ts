import { MASTERY_THRESHOLD, SUFFICIENT_THRESHOLD } from "@/lib/scoring";
import { materialNameInSentence, shortMaterialName } from "@/lib/material-name";
import { isCompetencyMisconception, misconceptionLabelInSentence } from "@/lib/format";
import type {
  ConceptFocus,
  MisconceptionSignal,
  PracticeAnalysis,
  TryoutAnalysis,
} from "@/lib/scoring";

/**
 * Ringkasan hasil dalam tiga kalimat.
 *
 * Yang membaca adalah siswa dan orang tuanya, jadi urutannya mengikuti tiga
 * pertanyaan yang mereka ajukan sendiri: hasilnya bagaimana, lemahnya di mana,
 * lalu sebaiknya apa.
 *
 *   1. capaian   "Ananda Salman Al Farisi menjawab benar 25 dari 30 soal yang
 *                 dikerjakan dan menunjukkan penguasaan Matematika yang baik."
 *   2. kelemahan "Kelemahan yang perlu ditingkatkan terutama terdapat pada
 *                 pecahan senilai dan hubungan antar-satuan baku panjang, dengan
 *                 pola kesalahan berupa membandingkan nilai sebelum menyamakan
 *                 penyebutnya."
 *   3. saran     "Ananda disarankan memperkuat kedua materi tersebut lewat paket
 *                 latihan Pecahan Senilai lewat Gambar dan Simbol dan membaca
 *                 kembali pembahasan soal yang jawabannya belum tepat."
 *
 * Setiap bagian kalimatnya berasal dari data, bukan dari kalimat siap pakai:
 * angka dari hasil, nama materi dari konsep yang penguasaannya masih rendah,
 * pola kesalahan dari miskonsepsi yang tertandai pada pengecoh yang dipilih,
 * dan saran dari materi prasyarat atau paket lanjutan yang direkomendasikan.
 * Bila salah satu datanya tidak ada, kalimatnya memang tidak dibentuk: lebih
 * baik ringkasannya pendek daripada menyebut sesuatu yang tidak terukur.
 *
 * Bahasanya memakai kata sehari-hari, dan nama materi dipendekkan lebih dulu
 * (lihat `material-name.ts`) supaya kalimatnya masih terbaca. Nama utuh, angka
 * per materi, dan nomor soalnya tetap tersedia pada kartu rincian di bawah
 * ringkasan ini.
 */
export interface StudyNarrative {
  /** Tiap kalimat terpisah, bila halaman ingin menatanya sendiri. */
  sentences: string[];
  /** Seluruh kalimat dalam satu paragraf. */
  body: string;
  /** Dipakai halaman hasil untuk memilih warna dan ikon kartunya. */
  isAllClear: boolean;
}

interface NarrativeOptions {
  /** Nama yang diisi peserta sebelum mengerjakan. */
  studentName?: string;
  /** Mata pelajaran atau materi yang dikerjakan, disebut pada kalimat pertama. */
  contextName?: string;
  /** Judul paket latihan lanjutan, bila halaman sudah memilihkannya. */
  nextPackageTitle?: string;
}

/** Dua materi dan dua pola saja; selebihnya sudah tampil sebagai kartu di bawah. */
const WEAK_LIMIT = 2;

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} dan ${items[items.length - 1]}`;
}

/** Nama pola keliru kerap memuat kata "dan", jadi antarpola disambung "serta". */
function joinPatterns(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} serta ${items[items.length - 1]}`;
}

/** Tanpa nama yang tercatat, sapaannya tetap sopan: "Ananda" saja. */
function greeting(studentName: string | undefined): string {
  const name = studentName?.trim();
  return name ? `Ananda ${name}` : "Ananda";
}

interface NarrativeInput {
  correct: number;
  total: number;
  score: number;
  /** Nama materi yang penguasaannya masih rendah, dari yang paling lemah. */
  weakNames: string[];
  /** Pola keliru yang terbaca, dari yang paling sering muncul. */
  signals: MisconceptionSignal[];
  /** Materi prasyarat yang sebaiknya dikuatkan lebih dulu, bila terbaca. */
  prerequisite?: { name: string; supports: string[] } | null;
}

/** Nama materi yang lemah, sudah dipendekkan dan siap disebut dalam kalimat. */
function weakNamesOf(focus: ConceptFocus[]): string[] {
  const names: string[] = [];
  for (const item of focus) {
    const name = materialNameInSentence(item.name);
    if (!names.includes(name)) names.push(name);
    if (names.length === WEAK_LIMIT) break;
  }
  return names;
}

/**
 * Nama yang disebut pada kalimat pertama. Sebagian materi dicatat sebagai rumusan
 * capaian yang panjang ("Mengidentifikasi penggunaan kata serapan dari bahasa
 * daerah/asing dalam berbagai bidang"); nama seperti itu membuat kalimatnya tidak
 * terbaca, jadi diganti "materi ini" — judul paketnya sudah tampil di atas narasi.
 */
const CONTEXT_WORD_LIMIT = 5;

function contextPhrase(contextName: string | undefined): string {
  const name = contextName?.trim();
  if (!name) return "materi ini";
  const short = shortMaterialName(name);
  return short.split(/\s+/).length <= CONTEXT_WORD_LIMIT ? short : "materi ini";
}

/** Kalimat pertama: hasilnya bagaimana. */
function achievementSentence(
  input: NarrativeInput,
  studentName: string | undefined,
  contextName: string | undefined,
): string {
  const who = greeting(studentName);
  const subject = contextPhrase(contextName);

  if (input.correct === 0) {
    return `${who} belum menjawab benar satu pun dari ${input.total} soal yang dikerjakan, sehingga penguasaan ${subject} masih perlu dibangun dari dasar.`;
  }

  const quality =
    input.score >= MASTERY_THRESHOLD
      ? "yang baik"
      : input.score >= SUFFICIENT_THRESHOLD
        ? "yang cukup"
        : "yang masih perlu diperkuat";

  return `${who} menjawab benar ${input.correct} dari ${input.total} soal yang dikerjakan dan menunjukkan penguasaan ${subject} ${quality}.`;
}

/**
 * Kalimat kedua: lemahnya di mana, sespesifik data yang tersedia.
 *
 * Nama materi datang dari penguasaan per konsep, pola kesalahan dari miskonsepsi
 * yang tertandai pada pengecoh yang benar-benar dipilih. Bila pengecohnya belum
 * bertanda — mata pelajaran yang penandaannya belum masuk, atau soal yang
 * dikosongkan sehingga tidak ada pengecoh terpilih — kalimatnya berhenti pada
 * nama materinya saja.
 */
function weaknessSentence(input: NarrativeInput): string | null {
  const names = input.weakNames.slice(0, WEAK_LIMIT);
  // Dua nama materi dan dua pola sekaligus membuat kalimatnya terlalu panjang
  // untuk dibaca sekali jalan; pola yang paling sering muncul saja yang disebut.
  const top = input.signals.slice(0, names.length > 1 ? 1 : WEAK_LIMIT);
  // Nama materi disambung "dan", pola disambung "serta": nama pola sendiri
  // sering memuat kata "dan" ("tangga dam dan hm dilompati").
  const patterns = joinPatterns(top.map((signal) => misconceptionLabelInSentence(signal.label)));

  if (names.length > 0 && patterns) {
    const bridge = isCompetencyMisconception(top[0].label)
      ? `; yang belum tercapai adalah ${patterns}`
      : `, dengan pola kesalahan berupa ${patterns}`;
    return `Kelemahan yang perlu ditingkatkan terutama terdapat pada ${joinList(names)}${bridge}.`;
  }
  if (names.length > 0) {
    return `Kelemahan yang perlu ditingkatkan terutama terdapat pada ${joinList(names)}.`;
  }
  if (patterns) {
    return isCompetencyMisconception(top[0].label)
      ? `Yang belum tercapai pada latihan ini adalah ${patterns}.`
      : `Pola kesalahan yang terbaca dari pilihan jawabannya berupa ${patterns}.`;
  }
  return null;
}

/** "kedua materi tersebut" hanya benar bila memang ada dua yang disebut. */
function materialReference(count: number): string {
  return count > 1 ? "kedua materi tersebut" : "materi tersebut";
}

/**
 * Kalimat ketiga: sebaiknya apa.
 *
 * Materi prasyarat didahulukan bila terbaca — memperkuat materi yang menjadi
 * dasarnya lebih menolong daripada mengulang materi yang tampak lemah. Bila
 * tidak ada, sarannya mengarah ke paket latihan yang sudah dipilihkan halaman
 * hasil, dan paling akhir ke pembahasan soalnya.
 */
function adviceSentence(input: NarrativeInput, nextPackageTitle: string | undefined): string {
  // Nama lengkapnya sudah disebut pada kalimat pertama; di sini cukup "Ananda".
  const who = "Ananda";
  const reference = materialReference(input.weakNames.length);
  const prerequisite = input.prerequisite;

  if (prerequisite && prerequisite.supports.length > 0) {
    const basis = joinList(prerequisite.supports.map(materialNameInSentence));
    return `${who} disarankan memperkuat ${materialNameInSentence(prerequisite.name)} lebih dulu, karena materi itu menjadi dasar ${basis}.`;
  }
  if (nextPackageTitle?.trim()) {
    // Judul paket diberi tanda kutip: judulnya sendiri sering memuat kata sambung
    // ("Pecahan Senilai lewat Gambar dan Simbol"), sehingga batasnya perlu terlihat.
    return `${who} disarankan memperkuat ${reference} melalui paket latihan “${nextPackageTitle.trim()}”, lalu membaca kembali pembahasan soal yang jawabannya belum tepat.`;
  }
  if (input.weakNames.length > 0) {
    return `${who} disarankan mengulang latihan pada ${reference}, lalu membaca kembali pembahasan soal yang jawabannya belum tepat.`;
  }
  return `${who} disarankan membaca kembali pembahasan soal yang jawabannya belum tepat.`;
}

function compose(input: NarrativeInput, options: NarrativeOptions): StudyNarrative {
  const achievement = achievementSentence(input, options.studentName, options.contextName);
  const weakness = weaknessSentence(input);

  // Tidak ada materi lemah yang terbaca dan nilainya memang tinggi: cukup dipuji.
  if (!weakness && input.score >= MASTERY_THRESHOLD) {
    const closing =
      "Seluruh materi pada latihan ini sudah dikuasai, jadi Ananda dapat lanjut ke materi berikutnya.";
    return {
      sentences: [achievement, closing],
      body: `${achievement} ${closing}`,
      isAllClear: true,
    };
  }

  const advice = adviceSentence(input, options.nextPackageTitle);
  const sentences = weakness ? [achievement, weakness, advice] : [achievement, advice];
  return { sentences, body: sentences.join(" "), isAllClear: false };
}

export function buildPracticeNarrative(
  analysis: PracticeAnalysis,
  options: NarrativeOptions = {},
): StudyNarrative {
  return compose(
    {
      correct: analysis.correctCount,
      total: analysis.totalQuestions,
      score: analysis.score,
      weakNames: weakNamesOf(analysis.conceptsToReview),
      signals: analysis.misconceptionSignals,
    },
    options,
  );
}

export function buildTryoutNarrative(
  analysis: TryoutAnalysis,
  options: NarrativeOptions = {},
): StudyNarrative {
  const advice = analysis.prerequisiteAdvice;
  // Materi prasyarat tidak disebut dua kali: bila ia yang menjadi saran, materi
  // itu dikeluarkan dari daftar kelemahan.
  const focus = analysis.conceptFocus.filter((item) => item.subtopicId !== advice?.subtopicId);
  const conceptNames = weakNamesOf(focus.length > 0 ? focus : analysis.conceptFocus);
  // Soal yang belum ditandai konsep tidak muncul di conceptFocus; untuk hasil
  // seperti itu nama materinya diambil dari prioritas per subtopik.
  const weakNames =
    conceptNames.length > 0
      ? conceptNames
      : analysis.priorities
          .filter((item) => item.id !== advice?.subtopicId)
          .slice(0, WEAK_LIMIT)
          .map((item) => materialNameInSentence(item.name));

  return compose(
    {
      correct: analysis.correctCount,
      total: analysis.totalQuestions,
      score: analysis.score,
      weakNames,
      signals: analysis.misconceptionSignals,
      prerequisite: advice ? { name: advice.name, supports: advice.supports } : null,
    },
    options,
  );
}
