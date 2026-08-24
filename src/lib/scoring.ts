import { concepts } from "@/data/concepts";
import { misconceptions } from "@/data/misconceptions";
import { practicePackages } from "@/data/practicePackages";
import { subtopicPrerequisites } from "@/data/prerequisites";
import { subtopics, topics } from "@/data/subjects";
import type {
  AnswerMap,
  AnswerValue,
  Concept,
  ConceptPrerequisite,
  Misconception,
  PracticePackage,
  Question,
  Subtopic,
  SubtopicPrerequisite,
  Topic,
} from "@/data/types";
import { answerParts, isAnswered, isCorrectAnswer, misconceptionIdsFor } from "@/lib/answers";
import { difficultyLabel } from "@/lib/format";

/**
 * Seluruh perhitungan hasil dikumpulkan di file ini sebagai fungsi murni
 * (masukan: soal + jawaban, keluaran: analisis). Ketika backend ditambahkan,
 * fungsi yang sama dapat dijalankan di server tanpa perubahan.
 */

export type MasteryStatus = "perlu-diperkuat" | "cukup" | "dikuasai";

export type { AnswerMap };

export interface MasteryBucket {
  id: string;
  name: string;
  total: number;
  answered: number;
  correct: number;
  /** 0–100, dibulatkan. Soal kosong dihitung sebagai belum tepat. */
  accuracy: number;
  /**
   * Bagian yang tepat dan banyaknya bagian yang dinilai — pernyataan pada soal
   * Benar/Salah, kunci pada soal jawaban ganda, satu bagian pada pilihan ganda
   * biasa. Skor ujian tetap utuh; angka ini khusus untuk membaca penguasaan.
   */
  partsCorrect: number;
  partsTotal: number;
  /** 0–100 dari perolehan per bagian. Inilah dasar `status`, bukan `accuracy`. */
  mastery: number;
  /**
   * Benar bila soal utuh dan bagian memberi gambaran berbeda, misalnya nol soal
   * tepat padahal separuh pernyataannya sudah benar. Dipakai halaman hasil untuk
   * menjelaskan dua angka yang tidak sama.
   */
  hasPartialCredit: boolean;
  status: MasteryStatus;
}

export interface PriorityItem extends MasteryBucket {
  topicName: string;
  description: string;
}

export interface PrerequisiteAdvice {
  subtopicId: string;
  name: string;
  accuracy: number;
  /** Jumlah soal benar dan total soal materi ini, untuk kalimat "benar 2 dari 6 soal". */
  correct: number;
  total: number;
  /** Nama subtopik prioritas yang bertumpu pada materi ini. */
  supports: string[];
  reason: string;
}

export interface MisconceptionSignal {
  id: string;
  label: string;
  insight: string;
  count: number;
  /** Nomor soal tempat pola ini muncul, mengikuti urutan paket. */
  questionNumbers: number[];
}

/**
 * Satu materi yang perlu dipelajari lagi, lengkap dengan penjelasan singkat dan
 * pola keliru yang muncul pada jawabannya. Dipakai halaman hasil untuk
 * menjelaskan *apa* yang harus dipelajari, bukan sekadar angka benar-salah.
 *
 * Rinciannya diambil dari tingkat terdalam yang tersedia di katalog: konsep bila
 * soalnya sudah ditandai konsep, kalau belum turun ke subtopik. Soal yang belum
 * ditandai keduanya tidak dimunculkan, supaya tidak ada kartu tanpa nama.
 */
export interface ConceptFocus extends MasteryBucket {
  /** Asal rincian: `konsep` (paling rinci) atau `subtopik`. */
  level: "konsep" | "subtopik";
  /** Penjelasan singkat dari katalog. */
  description: string;
  /** Materi induk: subtopik untuk konsep, topik untuk subtopik. */
  parentName: string;
  /** Subtopik pemilik, dipakai untuk mencari paket latihan lanjutan. */
  subtopicId: string;
  /** Miskonsepsi yang tersentuh pada soal-soal materi ini. */
  misconceptions: MisconceptionSignal[];
}

export interface AnalysisCatalog {
  topics?: Topic[];
  subtopics?: Subtopic[];
  concepts?: Concept[];
  misconceptions?: Misconception[];
  subtopicPrerequisites?: SubtopicPrerequisite[];
  conceptPrerequisites?: ConceptPrerequisite[];
  practicePackages?: PracticePackage[];
}

export interface TryoutAnalysis {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  /** 0–100 */
  score: number;
  status: MasteryStatus;
  /** Perolehan per bagian untuk seluruh paket; skor tetap dihitung per soal utuh. */
  partsCorrect: number;
  partsTotal: number;
  /** 0–100 dari perolehan per bagian, angka yang sama dengan `mastery` per materi. */
  partsScore: number;
  /** Benar bila skor per soal dan perolehan per bagian memang berbeda jauh. */
  hasPartialCredit: boolean;
  byTopic: MasteryBucket[];
  bySubtopic: MasteryBucket[];
  byConcept: MasteryBucket[];
  byDifficulty: MasteryBucket[];
  priorities: PriorityItem[];
  prerequisiteAdvice: PrerequisiteAdvice | null;
  misconceptionSignals: MisconceptionSignal[];
  /** Konsep yang perlu dipelajari, dengan penjelasan dan pola kelirunya. */
  conceptFocus: ConceptFocus[];
  recommendedPackageSlugs: string[];
}

export const MASTERY_THRESHOLD = 80;
export const SUFFICIENT_THRESHOLD = 60;

export function statusFromAccuracy(accuracy: number): MasteryStatus {
  if (accuracy >= MASTERY_THRESHOLD) return "dikuasai";
  if (accuracy >= SUFFICIENT_THRESHOLD) return "cukup";
  return "perlu-diperkuat";
}

export function isCorrect(question: Question, answer: AnswerValue | undefined): boolean {
  return isCorrectAnswer(question, answer);
}

function resolveCatalog(catalog: AnalysisCatalog = {}) {
  const topicList = catalog.topics ?? topics;
  const subtopicList = catalog.subtopics ?? subtopics;
  const conceptList = catalog.concepts ?? concepts;
  const misconceptionList = catalog.misconceptions ?? misconceptions;

  return {
    topics: topicList,
    subtopics: subtopicList,
    concepts: conceptList,
    misconceptions: misconceptionList,
    subtopicPrerequisites: catalog.subtopicPrerequisites ?? subtopicPrerequisites,
    conceptPrerequisites: catalog.conceptPrerequisites ?? [],
    practicePackages: catalog.practicePackages ?? practicePackages,
    topicById: new Map(topicList.map((topic) => [topic.id, topic])),
    subtopicById: new Map(subtopicList.map((subtopic) => [subtopic.id, subtopic])),
    conceptById: new Map(conceptList.map((concept) => [concept.id, concept])),
    misconceptionById: new Map(
      misconceptionList.map((misconception) => [misconception.id, misconception]),
    ),
  };
}

interface Tally {
  total: number;
  answered: number;
  correct: number;
  partsCorrect: number;
  partsTotal: number;
}

function tallyOf(questions: Question[], answers: AnswerMap): Tally {
  const tally: Tally = { total: 0, answered: 0, correct: 0, partsCorrect: 0, partsTotal: 0 };
  for (const question of questions) {
    const answer = answers[question.id];
    const parts = answerParts(question, answer);
    tally.total += 1;
    if (isAnswered(question, answer)) tally.answered += 1;
    if (isCorrect(question, answer)) tally.correct += 1;
    tally.partsCorrect += parts.correct;
    tally.partsTotal += parts.total;
  }
  return tally;
}

function tallyBy(
  questions: Question[],
  answers: AnswerMap,
  keyOf: (question: Question) => string,
): Map<string, Tally> {
  const grouped = new Map<string, Question[]>();
  for (const question of questions) {
    const key = keyOf(question);
    const list = grouped.get(key) ?? [];
    list.push(question);
    grouped.set(key, list);
  }
  return new Map([...grouped].map(([key, group]) => [key, tallyOf(group, answers)]));
}

/**
 * Satu materi beserta hasilnya. Dua angka dihitung berdampingan: `accuracy`
 * mengikuti aturan ujian (soal utuh), `mastery` mengikuti bagian yang tepat.
 * Status penguasaan memakai `mastery` supaya pekerjaan yang sudah benar
 * sebagian tidak terbaca sebagai nol sama sekali.
 */
function toBucket(id: string, name: string, tally: Tally): MasteryBucket {
  const accuracy = tally.total === 0 ? 0 : Math.round((tally.correct / tally.total) * 100);
  const mastery = accuracy;

  return {
    id,
    name,
    total: tally.total,
    answered: tally.answered,
    correct: tally.correct,
    accuracy,
    partsCorrect: tally.partsCorrect,
    partsTotal: tally.partsTotal,
    mastery,
    hasPartialCredit: false,
    status: statusFromAccuracy(mastery),
  };
}

function toBuckets(
  tallies: Map<string, Tally>,
  nameOf: (id: string) => string,
  order?: string[],
): MasteryBucket[] {
  const buckets = [...tallies].map(([id, tally]) => toBucket(id, nameOf(id), tally));
  if (order) {
    buckets.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }
  return buckets;
}

function buildPrerequisiteAdvice(
  priorities: PriorityItem[],
  bySubtopicId: Map<string, MasteryBucket>,
  prerequisites: SubtopicPrerequisite[],
): PrerequisiteAdvice | null {
  const priorityIds = new Set(priorities.map((p) => p.id));
  const candidates = new Map<string, { supports: string[]; reason: string }>();

  for (const priority of priorities) {
    const rules = prerequisites.filter((rule) => rule.subtopicId === priority.id);
    for (const rule of rules) {
      const prerequisiteBucket = bySubtopicId.get(rule.requiresSubtopicId);
      // Hanya disarankan bila prasyaratnya ikut diujikan dan hasilnya belum kuat.
      if (!prerequisiteBucket || prerequisiteBucket.mastery >= MASTERY_THRESHOLD) continue;
      if (priorityIds.has(rule.requiresSubtopicId) === false && prerequisiteBucket.status === "cukup") {
        continue;
      }
      const entry = candidates.get(rule.requiresSubtopicId) ?? { supports: [], reason: rule.reason };
      entry.supports.push(priority.name);
      candidates.set(rule.requiresSubtopicId, entry);
    }
  }

  if (candidates.size === 0) return null;

  const ranked = [...candidates.entries()].sort((a, b) => {
    const supportDiff = b[1].supports.length - a[1].supports.length;
    if (supportDiff !== 0) return supportDiff;
    return (bySubtopicId.get(a[0])?.mastery ?? 0) - (bySubtopicId.get(b[0])?.mastery ?? 0);
  });

  const [subtopicId, entry] = ranked[0];
  const bucket = bySubtopicId.get(subtopicId);
  if (!bucket) return null;

  return {
    subtopicId,
    name: bucket.name,
    accuracy: bucket.accuracy,
    correct: bucket.correct,
    total: bucket.total,
    supports: entry.supports,
    reason: entry.reason,
  };
}

interface SignalOptions {
  /** Berapa kali sebuah pola harus muncul sebelum dilaporkan. */
  minimumOccurrence?: number;
  /** Banyak pola yang ditampilkan. */
  limit?: number;
  /** questionId -> nomor soal pada paket, untuk menunjuk soalnya. */
  numberOf?: Map<string, number>;
}

/**
 * Pola keliru yang terbaca dari jawaban.
 *
 * Satu soal dapat memunculkan lebih dari satu pola: pada soal jawaban ganda dan
 * Benar/Salah penilaiannya per bagian, sehingga pengecoh yang dicentang dan
 * pernyataan yang salah kelompok masing-masing dicatat.
 */
function buildMisconceptionSignals(
  questions: Question[],
  answers: AnswerMap,
  misconceptionById: Map<string, Misconception>,
  { minimumOccurrence = 2, limit = 4, numberOf }: SignalOptions = {},
): MisconceptionSignal[] {
  const counts = new Map<string, { count: number; numbers: Set<number> }>();
  for (const question of questions) {
    for (const id of misconceptionIdsFor(question, answers[question.id])) {
      const entry = counts.get(id) ?? { count: 0, numbers: new Set<number>() };
      entry.count += 1;
      const number = numberOf?.get(question.id);
      if (number) entry.numbers.add(number);
      counts.set(id, entry);
    }
  }

  return [...counts.entries()]
    .filter(([, entry]) => entry.count >= minimumOccurrence)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .flatMap(([id, entry]) => {
      const misconception = misconceptionById.get(id);
      if (!misconception) return [];
      return [
        {
          id,
          label: misconception.label,
          insight: misconception.insight,
          count: entry.count,
          questionNumbers: [...entry.numbers].sort((a, b) => a - b),
        },
      ];
    });
}

/** Nomor soal mengikuti urutan paket, sama dengan yang terlihat di halaman pembahasan. */
function questionNumbers(questions: Question[]): Map<string, number> {
  return new Map(questions.map((question, index) => [question.id, index + 1]));
}

interface FocusKey {
  id: string;
  level: ConceptFocus["level"];
  name: string;
  description: string;
  parentName: string;
  subtopicId: string;
}

/**
 * Materi milik sebuah soal, diambil dari tingkat terdalam yang dikenali katalog.
 * Mengembalikan `null` bila soal belum ditandai konsep maupun subtopik — soal
 * seperti itu tetap ikut dinilai, hanya tidak muncul di rincian materi.
 */
function focusKeyFor(
  question: Question,
  resolved: ReturnType<typeof resolveCatalog>,
): FocusKey | null {
  const concept = resolved.conceptById.get(question.conceptId);
  if (concept) {
    const subtopic = resolved.subtopicById.get(concept.subtopicId);
    return {
      id: `konsep:${concept.id}`,
      level: "konsep",
      name: concept.name,
      description: concept.description,
      parentName: subtopic?.name ?? "",
      subtopicId: concept.subtopicId,
    };
  }

  const subtopic = resolved.subtopicById.get(question.subtopicId);
  if (subtopic) {
    const topic = resolved.topicById.get(subtopic.topicId);
    return {
      id: `subtopik:${subtopic.id}`,
      level: "subtopik",
      name: subtopic.name,
      description: subtopic.description,
      parentName: topic?.name ?? "",
      subtopicId: subtopic.id,
    };
  }

  return null;
}

/**
 * Rincian materi beserta hasilnya, diurutkan dari yang paling sedikit benar.
 * Setiap butir membawa penjelasannya sendiri dan pola keliru yang muncul,
 * sehingga halaman hasil tidak perlu menghitung apa pun lagi.
 */
function buildStudyFocus(
  questions: Question[],
  answers: AnswerMap,
  resolved: ReturnType<typeof resolveCatalog>,
): ConceptFocus[] {
  const groups = new Map<string, { key: FocusKey; questions: Question[] }>();
  const numberOf = questionNumbers(questions);

  for (const question of questions) {
    const key = focusKeyFor(question, resolved);
    if (!key) continue;
    const entry = groups.get(key.id) ?? { key, questions: [] };
    entry.questions.push(question);
    groups.set(key.id, entry);
  }

  return [...groups.values()]
    .map(({ key, questions: group }) => ({
      ...toBucket(key.id, key.name, tallyOf(group, answers)),
      level: key.level,
      description: key.description,
      parentName: key.parentName,
      subtopicId: key.subtopicId,
      // Satu kali muncul sudah cukup: pada satu materi, pola keliru jarang berulang.
      misconceptions: buildMisconceptionSignals(group, answers, resolved.misconceptionById, {
        minimumOccurrence: 1,
        limit: 5,
        numberOf,
      }),
    }))
    .sort((a, b) => a.mastery - b.mastery || b.total - a.total);
}

/**
 * Paket latihan untuk sederet subtopik, tanpa pengulangan dan searah urutannya.
 * Paket dianggap cocok bila salah satu soalnya berada di subtopik tersebut,
 * bukan hanya bila subtopik utamanya sama.
 */
function packagesForSubtopics(subtopicIds: string[], packages: PracticePackage[]): string[] {
  const coverage = (pkg: PracticePackage) =>
    pkg.subtopicIds?.length ? pkg.subtopicIds : [pkg.subtopicId];

  const slugs: string[] = [];
  for (const subtopicId of subtopicIds) {
    for (const pkg of packages.filter((item) => coverage(item).includes(subtopicId))) {
      if (!slugs.includes(pkg.slug)) slugs.push(pkg.slug);
    }
  }
  return slugs;
}

export function analyzeTryout(
  questions: Question[],
  answers: AnswerMap,
  catalog?: AnalysisCatalog,
): TryoutAnalysis {
  return analyzeTryoutWithCatalog(questions, answers, catalog);
}

export function analyzeTryoutWithCatalog(
  questions: Question[],
  answers: AnswerMap,
  catalog?: AnalysisCatalog,
): TryoutAnalysis {
  const resolved = resolveCatalog(catalog);
  const overall = tallyOf(questions, answers);
  const totalQuestions = overall.total;
  const answeredCount = overall.answered;
  const correctCount = overall.correct;
  const unansweredCount = totalQuestions - answeredCount;
  const wrongCount = totalQuestions - correctCount - unansweredCount;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const partsScore = score;

  const byTopic = toBuckets(
    tallyBy(questions, answers, (q) => q.topicId),
    (id) => resolved.topicById.get(id)?.name ?? id,
    resolved.topics.map((t) => t.id),
  );
  const bySubtopic = toBuckets(
    tallyBy(questions, answers, (q) => q.subtopicId),
    (id) => resolved.subtopicById.get(id)?.name ?? id,
    resolved.subtopics.map((s) => s.id),
  );
  const byConcept = toBuckets(
    tallyBy(questions, answers, (q) => q.conceptId),
    (id) => resolved.conceptById.get(id)?.name ?? id,
  );
  const byDifficulty = toBuckets(
    tallyBy(questions, answers, (q) => q.difficulty),
    (id) => difficultyLabel[id as keyof typeof difficultyLabel] ?? id,
    ["dasar", "menengah", "lanjut"],
  );

  const bySubtopicId = new Map(bySubtopic.map((bucket) => [bucket.id, bucket]));

  const priorities: PriorityItem[] = bySubtopic
    // Subtopik yang tidak dikenali katalog dilewati agar tidak muncul sebagai nama kosong.
    .filter(
      (bucket) => bucket.mastery < MASTERY_THRESHOLD && resolved.subtopicById.has(bucket.id),
    )
    .sort((a, b) => a.mastery - b.mastery || b.total - a.total)
    .slice(0, 3)
    .map((bucket) => {
      const subtopic = resolved.subtopicById.get(bucket.id);
      const topic = subtopic ? resolved.topicById.get(subtopic.topicId) : undefined;
      return {
        ...bucket,
        topicName: topic?.name ?? "",
        description: subtopic?.description ?? "",
      };
    });

  const prerequisiteAdvice = buildPrerequisiteAdvice(
    priorities,
    bySubtopicId,
    resolved.subtopicPrerequisites,
  );

  // Paket yang disarankan mengikuti urutan prioritas; prasyarat didahulukan bila ada.
  const orderedSubtopicIds = [
    ...(prerequisiteAdvice ? [prerequisiteAdvice.subtopicId] : []),
    ...priorities.map((p) => p.id),
  ];
  const recommendedPackageSlugs = packagesForSubtopics(
    orderedSubtopicIds,
    resolved.practicePackages,
  ).slice(0, 6);

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    wrongCount,
    unansweredCount,
    score,
    status: statusFromAccuracy(score),
    partsCorrect: overall.partsCorrect,
    partsTotal: overall.partsTotal,
    partsScore,
    hasPartialCredit: false,
    byTopic,
    bySubtopic,
    byConcept,
    byDifficulty,
    priorities,
    prerequisiteAdvice,
    misconceptionSignals: buildMisconceptionSignals(questions, answers, resolved.misconceptionById, {
      minimumOccurrence: 2,
      limit: 5,
      numberOf: questionNumbers(questions),
    }),
    conceptFocus: buildStudyFocus(questions, answers, resolved)
      .filter((focus) => focus.mastery < MASTERY_THRESHOLD)
      .slice(0, 4),
    recommendedPackageSlugs,
  };
}

export interface PracticeAnalysis {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  status: MasteryStatus;
  /**
   * Perolehan per bagian untuk seluruh paket. Skor tetap dihitung per soal utuh;
   * angka ini yang menunjukkan pekerjaan yang sudah benar sebagian.
   */
  partsCorrect: number;
  partsTotal: number;
  /** 0–100 dari perolehan per bagian, angka yang sama dengan `mastery` per materi. */
  partsScore: number;
  /** Benar bila skor per soal dan perolehan per bagian memang berbeda jauh. */
  hasPartialCredit: boolean;
  /** Konsep yang perlu dipelajari lagi, sudah berisi penjelasan dan pola kelirunya. */
  conceptsToReview: ConceptFocus[];
  strongConcepts: MasteryBucket[];
  misconceptionSignals: MisconceptionSignal[];
  /** Paket latihan lanjutan untuk konsep-konsep yang masih lemah. */
  recommendedPackageSlugs: string[];
}

export function analyzePractice(
  questions: Question[],
  answers: AnswerMap,
  catalog?: AnalysisCatalog,
): PracticeAnalysis {
  return analyzePracticeWithCatalog(questions, answers, catalog);
}

export function analyzePracticeWithCatalog(
  questions: Question[],
  answers: AnswerMap,
  catalog?: AnalysisCatalog,
): PracticeAnalysis {
  const resolved = resolveCatalog(catalog);
  const overall = tallyOf(questions, answers);
  const totalQuestions = overall.total;
  const correctCount = overall.correct;
  const unansweredCount = totalQuestions - overall.answered;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const partsScore = score;

  const focus = buildStudyFocus(questions, answers, resolved);
  const conceptsToReview = focus
    .filter((item) => item.mastery < MASTERY_THRESHOLD)
    .slice(0, 5);

  return {
    totalQuestions,
    correctCount,
    wrongCount: totalQuestions - correctCount - unansweredCount,
    unansweredCount,
    score,
    status: statusFromAccuracy(score),
    partsCorrect: overall.partsCorrect,
    partsTotal: overall.partsTotal,
    partsScore,
    hasPartialCredit: false,
    conceptsToReview,
    strongConcepts: focus.filter((item) => item.mastery >= MASTERY_THRESHOLD),
    misconceptionSignals: buildMisconceptionSignals(questions, answers, resolved.misconceptionById, {
      minimumOccurrence: 1,
      limit: 6,
      numberOf: questionNumbers(questions),
    }),
    // Latihan lanjutan diambil dari subtopik pemilik konsep yang masih lemah.
    recommendedPackageSlugs: packagesForSubtopics(
      conceptsToReview.map((concept) => concept.subtopicId).filter(Boolean),
      resolved.practicePackages,
    ).slice(0, 6),
  };
}
