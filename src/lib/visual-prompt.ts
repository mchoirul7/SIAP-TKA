import type { Question } from "@/data/types";

/**
 * Menyusun perintah pembuatan gambar untuk dikirim ke ChatGPT.
 *
 * Kolom `visual_prompt` pada soal hanya memerikan gambarnya. Kalau itu saja yang
 * dikirim, hasilnya kerap meleset karena pembuat gambar tidak tahu soalnya
 * tentang apa — kubus digambar dengan rusuk yang tidak sesuai angka pada soal,
 * atau grafik digambar dengan titik potong yang keliru. Karena itu soal, seluruh
 * pilihan, dan kunci jawabannya ikut dikirim sebagai konteks, dengan larangan
 * tegas agar tidak satu pun darinya muncul di dalam gambar.
 *
 * Kunci jawaban memang ikut terbawa di alamat tautannya. Itu tidak menambah
 * kebocoran apa pun: penilaian latihan dan tryout dihitung di perangkat, jadi
 * kuncinya memang sudah ada di peramban sejak soal dibuka — lihat
 * `isCorrectAnswer`. Tautannya pun hanya muncul di mode penyusun.
 */

/** Isi soal boleh berbentuk HTML; yang dikirim ke ChatGPT cukup teksnya. */
function plainText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|tr)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pilihan jawaban beserta kuncinya, ditulis sesuai bentuk soalnya. */
function answerLines(question: Question): string[] {
  if (question.type === "category") {
    const categories = question.categories.map((category) => category.label).join(" / ");
    return [
      `Kategori: ${categories}`,
      "Pernyataan dan kunci:",
      ...question.statements.map((statement) => {
        const correct = question.categories.find(
          (category) => category.key === statement.correctCategoryKey,
        );
        return `- ${plainText(statement.text)} → ${correct?.label ?? statement.correctCategoryKey}`;
      }),
    ];
  }

  const options = question.options.map((option) => `${option.key}. ${plainText(option.text)}`);
  const key =
    question.type === "mcma" ? question.correctAnswers.join(", ") : question.correctAnswer;

  return ["Pilihan:", ...options, `Kunci jawaban: ${key || "(belum diisi)"}`];
}

/** Perintah utuh yang dikirim ke ChatGPT. Dapat pula disalin manual. */
export function buildVisualPrompt(question: Question): string {
  const lines = [
    "Buatkan satu gambar untuk menyertai soal ujian berikut. Ikuti deskripsi visualnya persis.",
    "",
    "DESKRIPSI VISUAL:",
    question.visualPrompt ?? "",
    "",
    "KONTEKS SOAL — hanya agar gambarnya konsisten, jangan ditulis ulang di dalam gambar:",
  ];

  if (question.stimulus) lines.push(`Stimulus: ${plainText(question.stimulus)}`);
  lines.push(`Soal: ${plainText(question.questionText)}`, ...answerLines(question));

  lines.push(
    "",
    "Ketentuan gambar:",
    "- Jangan memuat kunci jawaban, tanda benar/salah, atau petunjuk apa pun yang membocorkan jawaban.",
    "- Jangan menuliskan ulang teks soal atau pilihan jawaban di dalam gambar.",
    "- Angka, satuan, dan proporsi harus sesuai dengan yang tertulis pada soal.",
    "- Label seperlunya saja, dalam Bahasa Indonesia.",
    "- Latar putih bersih, garis tegas, rasio mendatar, terbaca jelas saat ditempel di halaman soal.",
  );

  return lines.join("\n");
}

/**
 * Tautan yang membuka ChatGPT dengan perintahnya sudah terisi. Parameter `q`
 * adalah yang dikenali chatgpt.com untuk mengisi dan langsung mengirim.
 */
export function chatGptUrl(prompt: string): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}
