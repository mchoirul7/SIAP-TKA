import type { ConceptPrerequisite, SubtopicPrerequisite } from "./types";

/**
 * Peta prasyarat antar subtopik. Dipakai halaman hasil untuk menyarankan
 * "mulai dari materi ini" ketika sebuah subtopik lemah dan prasyaratnya juga lemah.
 */
export const subtopicPrerequisites: SubtopicPrerequisite[] = [
  {
    subtopicId: "st-perbandingan-pecahan",
    requiresSubtopicId: "st-pecahan-senilai",
    reason:
      "Membandingkan pecahan berpenyebut berbeda menuntut kemampuan mengubah pecahan menjadi pecahan senilai terlebih dahulu.",
  },
  {
    subtopicId: "st-operasi-pecahan",
    requiresSubtopicId: "st-pecahan-senilai",
    reason:
      "Menyamakan penyebut pada penjumlahan dan pengurangan pecahan bertumpu pada pemahaman pecahan senilai.",
  },
  {
    subtopicId: "st-operasi-pecahan",
    requiresSubtopicId: "st-kpk-fpb",
    reason:
      "Menentukan penyebut bersama yang paling sederhana memakai KPK, dan menyederhanakan hasil memakai FPB.",
  },
  {
    subtopicId: "st-keliling-luas",
    requiresSubtopicId: "st-operasi-pecahan",
    reason:
      "Sebagian soal luas melibatkan perkalian dan pembagian, termasuk pembagian dua pada luas segitiga.",
  },
  {
    subtopicId: "st-volume",
    requiresSubtopicId: "st-keliling-luas",
    reason:
      "Volume dibangun dari gagasan luas alas, sehingga luas bangun datar perlu kokoh lebih dahulu.",
  },
  {
    subtopicId: "st-rata-rata",
    requiresSubtopicId: "st-penyajian-data",
    reason:
      "Menghitung rata-rata dimulai dari membaca data pada tabel atau diagram dengan tepat.",
  },
];

export const conceptPrerequisites: ConceptPrerequisite[] = [
  { conceptId: "c-banding-penyebut-beda", requiresConceptId: "c-senilai-menentukan" },
  { conceptId: "c-banding-penyebut-beda", requiresConceptId: "c-banding-penyebut-sama" },
  { conceptId: "c-operasi-jumlah-kurang", requiresConceptId: "c-senilai-menentukan" },
  { conceptId: "c-operasi-kali-bagi", requiresConceptId: "c-operasi-jumlah-kurang" },
  { conceptId: "c-senilai-menentukan", requiresConceptId: "c-senilai-mengenali" },
  { conceptId: "c-luas-gabungan", requiresConceptId: "c-keliling-persegi-panjang" },
  { conceptId: "c-volume-balok", requiresConceptId: "c-volume-kubus" },
  { conceptId: "c-rata-rata-terapan", requiresConceptId: "c-rata-rata-hitung" },
];
