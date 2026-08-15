export type EducationLevel = "SD" | "SMP" | "SMA";

export type Difficulty = "dasar" | "menengah" | "lanjut";

export type ReasoningType = "pemahaman" | "penerapan" | "penalaran";

/**
 * Bentuk soal yang didukung.
 *
 * - `single`   : pilihan ganda biasa, satu jawaban benar
 * - `mcma`     : pilihan ganda kompleks, jawaban benar lebih dari satu
 * - `category` : setiap pernyataan dikelompokkan, misalnya Benar / Salah
 */
export type QuestionType = "single" | "mcma" | "category";

export interface Subject {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  level: EducationLevel;
  description: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  slug: string;
  name: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  slug: string;
  name: string;
  description: string;
}

export interface Concept {
  id: string;
  subtopicId: string;
  name: string;
  description: string;
}

export interface QuestionOption {
  key: string;
  text: string;
  misconceptionId?: string;
}

/** Kolom kategori pada soal tipe `category`, misalnya Benar dan Salah. */
export interface CategoryOption {
  key: string;
  label: string;
}

export interface CategoryStatement {
  id: string;
  text: string;
  correctCategoryKey: string;
  /** Muncul bila pernyataan dikelompokkan secara keliru. */
  misconceptionId?: string;
}

interface QuestionBase {
  id: string;
  subjectId: string;
  topicId: string;
  subtopicId: string;
  conceptId: string;
  competency: string;
  difficulty: Difficulty;
  reasoningType: ReasoningType;
  stimulus?: string;
  questionText: string;
  /** Perintah pengerjaan. Bila kosong, dipakai perintah bawaan sesuai tipe soal. */
  instruction?: string;
  /**
   * Bentuk isi soal dan pilihannya. `html` dipakai soal hasil impor yang memuat
   * gambar, rumus, atau daftar; hanya tag terbatas yang dirender.
   */
  contentFormat?: "text" | "html";
  /** Belum tentu tersedia pada soal hasil impor. */
  explanation?: string;
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: "single";
  options: QuestionOption[];
  correctAnswer: string;
}

export interface MultipleAnswerQuestion extends QuestionBase {
  type: "mcma";
  options: QuestionOption[];
  correctAnswers: string[];
}

export interface CategoryQuestion extends QuestionBase {
  type: "category";
  categories: CategoryOption[];
  statements: CategoryStatement[];
}

export type Question = SingleChoiceQuestion | MultipleAnswerQuestion | CategoryQuestion;

/** Jawaban pengguna, bentuknya mengikuti tipe soal. */
export type AnswerValue =
  | { type: "single"; key: string }
  | { type: "mcma"; keys: string[] }
  | { type: "category"; assignments: Record<string, string> };

/** questionId -> jawaban */
export type AnswerMap = Record<string, AnswerValue>;

/** Jenis tryout yang tersedia untuk satu mata pelajaran. */
export type TryoutVariant = "resmi" | "simulasi" | "singkat";

export interface Tryout {
  id: string;
  slug: string;
  title: string;
  subjectId: string;
  level: EducationLevel;
  variant: TryoutVariant;
  /** Penjelasan singkat pembeda antar jenis tryout, ditampilkan pada kartu. */
  variantLabel: string;
  description: string;
  durationMinutes: number;
  questionIds: string[];
  instructions: string[];
}

export interface PracticePackage {
  id: string;
  slug: string;
  title: string;
  subjectId: string;
  topicId: string;
  subtopicId: string;
  /**
   * Seluruh subtopik yang tersentuh soal di paket ini. Dipakai untuk mencocokkan
   * paket dengan materi yang lemah pada halaman hasil; `subtopicId` sendiri hanya
   * mewakili subtopik soal pertama.
   */
  subtopicIds?: string[];
  summary: string;
  description: string;
  level: EducationLevel;
  difficultyRange: string;
  estimatedMinutes: number;
  skills: string[];
  questionIds: string[];
  isPremium: boolean;
}

export interface Misconception {
  id: string;
  label: string;
  /** Deskripsi internal, dipakai tim konten. Tidak ditampilkan mentah ke siswa. */
  description: string;
  /** Kalimat hati-hati yang ditampilkan pada halaman hasil. */
  insight: string;
}

export interface SubtopicPrerequisite {
  subtopicId: string;
  requiresSubtopicId: string;
  reason: string;
}

export interface ConceptPrerequisite {
  conceptId: string;
  requiresConceptId: string;
}
