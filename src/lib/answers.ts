import type { AnswerValue, Question } from "@/data/types";

/**
 * Seluruh perlakuan terhadap jawaban dikumpulkan di sini sebagai fungsi murni,
 * supaya halaman, penilaian, dan penyimpanan memakai aturan yang sama persis.
 *
 * Tiga bentuk soal ditangani: `single`, `mcma`, dan `category`.
 */

/** Jawaban kosong yang sesuai bentuk soal. Dipakai saat pengguna mulai mengisi. */
export function emptyAnswerFor(question: Question): AnswerValue {
  switch (question.type) {
    case "single":
      return { type: "single", key: "" };
    case "mcma":
      return { type: "mcma", keys: [] };
    case "category":
      return { type: "category", assignments: {} };
  }
}

/**
 * Soal dianggap terjawab hanya bila isiannya sudah lengkap. Soal kategori yang
 * baru terisi sebagian tetap dihitung belum terjawab agar penanda pada daftar
 * soal tidak menyesatkan.
 */
export function isAnswered(question: Question, answer: AnswerValue | undefined): boolean {
  if (!answer || answer.type !== question.type) return false;
  switch (question.type) {
    case "single":
      return answer.type === "single" && answer.key !== "";
    case "mcma":
      return answer.type === "mcma" && answer.keys.length > 0;
    case "category":
      return (
        answer.type === "category" &&
        question.statements.every((statement) => Boolean(answer.assignments[statement.id]))
      );
  }
}

/** Sudah ada isian, walaupun belum lengkap. Dipakai untuk soal kategori. */
export function isPartiallyAnswered(question: Question, answer: AnswerValue | undefined): boolean {
  if (!answer || answer.type !== question.type) return false;
  if (answer.type !== "category") return isAnswered(question, answer);
  return Object.values(answer.assignments).some(Boolean);
}

/**
 * Penilaian bersifat utuh: soal dihitung benar hanya bila seluruh bagiannya
 * tepat. Tidak ada nilai sebagian, sehingga satu soal tetap bernilai satu.
 */
export function isCorrectAnswer(question: Question, answer: AnswerValue | undefined): boolean {
  if (!isAnswered(question, answer) || !answer) return false;

  switch (question.type) {
    case "single":
      return answer.type === "single" && answer.key === question.correctAnswer;

    case "mcma": {
      if (answer.type !== "mcma") return false;
      const chosen = new Set(answer.keys);
      const expected = question.correctAnswers;
      return chosen.size === expected.length && expected.every((key) => chosen.has(key));
    }

    case "category":
      return (
        answer.type === "category" &&
        question.statements.every(
          (statement) => answer.assignments[statement.id] === statement.correctCategoryKey,
        )
      );
  }
}

/**
 * Kebenaran per bagian sebuah soal.
 *
 * Nilai ujian tetap utuh (lihat `isCorrectAnswer`), tetapi analisis penguasaan
 * perlu tahu *seberapa banyak* yang sudah tepat: pada soal Benar/Salah, dua dari
 * tiga pernyataan yang tepat bukan hal yang sama dengan nol.
 */
export interface AnswerParts {
  /** Banyak bagian yang dinilai pada soal ini. */
  total: number;
  /** Bagian yang sudah tepat, 0..total. */
  correct: number;
}

/**
 * - `single`   : satu bagian, tepat atau tidak.
 * - `mcma`     : bagiannya sebanyak kunci jawaban. Pengecoh yang ikut dipilih
 *                mengurangi perolehan, supaya mencentang semua pilihan tidak
 *                terbaca sebagai penguasaan.
 * - `category` : satu bagian per pernyataan; pernyataan kosong dihitung keliru.
 */
export function answerParts(question: Question, answer: AnswerValue | undefined): AnswerParts {
  switch (question.type) {
    case "single":
      return { total: 1, correct: isCorrectAnswer(question, answer) ? 1 : 0 };

    case "mcma": {
      const total = Math.max(1, question.correctAnswers.length);
      if (!answer || answer.type !== "mcma" || answer.keys.length === 0) return { total, correct: 0 };
      const expected = new Set(question.correctAnswers);
      const hit = answer.keys.filter((key) => expected.has(key)).length;
      const miss = answer.keys.filter((key) => !expected.has(key)).length;
      return { total, correct: Math.max(0, Math.min(total, hit - miss)) };
    }

    case "category": {
      const total = Math.max(1, question.statements.length);
      const assignments = categoryAssignments(answer);
      const correct = question.statements.filter(
        (statement) => assignments[statement.id] === statement.correctCategoryKey,
      ).length;
      return { total, correct };
    }
  }
}

/** Menyalakan atau mematikan satu pilihan pada soal jawaban ganda. */
export function toggleMcmaKey(answer: AnswerValue | undefined, optionKey: string): AnswerValue {
  const keys = answer?.type === "mcma" ? answer.keys : [];
  const next = keys.includes(optionKey)
    ? keys.filter((key) => key !== optionKey)
    : [...keys, optionKey];
  return { type: "mcma", keys: next };
}

/** Menempatkan satu pernyataan ke sebuah kategori. */
export function setCategoryAssignment(
  answer: AnswerValue | undefined,
  statementId: string,
  categoryKey: string,
): AnswerValue {
  const assignments = answer?.type === "category" ? answer.assignments : {};
  return { type: "category", assignments: { ...assignments, [statementId]: categoryKey } };
}

export function selectedKeys(answer: AnswerValue | undefined): string[] {
  if (!answer) return [];
  if (answer.type === "single") return answer.key ? [answer.key] : [];
  if (answer.type === "mcma") return answer.keys;
  return [];
}

export function categoryAssignments(answer: AnswerValue | undefined): Record<string, string> {
  return answer?.type === "category" ? answer.assignments : {};
}

/**
 * Miskonsepsi yang tersentuh oleh sebuah jawaban. Untuk soal jawaban ganda dan
 * kategori, penilaian dilakukan per bagian sehingga satu soal dapat memunculkan
 * lebih dari satu penanda.
 */
export function misconceptionIdsFor(
  question: Question,
  answer: AnswerValue | undefined,
): string[] {
  if (!answer || answer.type !== question.type) return [];

  switch (question.type) {
    case "single": {
      if (answer.type !== "single" || !answer.key) return [];
      if (answer.key === question.correctAnswer) return [];
      const option = question.options.find((item) => item.key === answer.key);
      return option?.misconceptionId ? [option.misconceptionId] : [];
    }

    case "mcma": {
      if (answer.type !== "mcma") return [];
      const correct = new Set(question.correctAnswers);
      return question.options.flatMap((option) => {
        const chosen = answer.keys.includes(option.key);
        // Penanda muncul bila pengecoh dipilih, bukan saat jawaban benar terlewat.
        if (!chosen || correct.has(option.key)) return [];
        return option.misconceptionId ? [option.misconceptionId] : [];
      });
    }

    case "category": {
      if (answer.type !== "category") return [];
      return question.statements.flatMap((statement) => {
        const assigned = answer.assignments[statement.id];
        if (!assigned || assigned === statement.correctCategoryKey) return [];
        return statement.misconceptionId ? [statement.misconceptionId] : [];
      });
    }
  }
}

const fallbackInstruction: Record<Question["type"], string> = {
  single: "Pilih satu jawaban yang paling tepat.",
  mcma: "Jawaban benar lebih dari satu. Pilih semua yang tepat.",
  category: "Tentukan kategori untuk setiap pernyataan.",
};

export function instructionFor(question: Question): string {
  return question.instruction ?? fallbackInstruction[question.type];
}

export const questionTypeLabel: Record<Question["type"], string> = {
  single: "Pilihan ganda",
  mcma: "Jawaban ganda",
  category: "Benar / Salah",
};

/** Ringkasan kunci jawaban untuk halaman pembahasan. */
export function correctAnswerSummary(question: Question): string {
  switch (question.type) {
    case "single":
      return question.correctAnswer;
    case "mcma":
      return question.correctAnswers.join(" dan ");
    case "category":
      return question.statements
        .map((statement, index) => {
          const label = question.categories.find(
            (category) => category.key === statement.correctCategoryKey,
          )?.label;
          return `${index + 1}. ${label ?? statement.correctCategoryKey}`;
        })
        .join(" · ");
  }
}
