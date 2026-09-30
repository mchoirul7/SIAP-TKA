/**
 * Pengelompokan mata pelajaran di katalog.
 *
 * Jenjang SMA/SMK kini memuat dua puluhan mapel: tiga mapel wajib, sembilan
 * mapel pilihan SMA, dan tujuh program keahlian SMK. Menampilkan semuanya
 * sekaligus membuat yang dicari kebanyakan orang — Matematika, Bahasa
 * Indonesia, Bahasa Inggris — tenggelam di antara mapel yang hanya relevan
 * bagi sebagian siswa. Karena itu yang wajib tampil apa adanya, sisanya
 * dilipat ke dalam satu kartu kelompok yang dibuka bila memang dicari.
 *
 * Pembedanya slug, bukan `sort_order` basis data: urutan di sana dipakai untuk
 * mengurutkan, bukan untuk menyatakan mapel ini wajib atau pilihan.
 */

export type SubjectGroupKey = "utama" | "pilihan-sma" | "pilihan-smk";

/** Mapel yang diujikan untuk semua siswa, di jenjang mana pun. */
const CORE_SUBJECTS = ["matematika", "bahasa-indonesia", "bahasa-inggris"];

/** `matematika-sma` → `matematika`, sedangkan `matematika-tingkat-lanjut-sma` tetap utuh. */
function subjectBase(slug: string): string {
  return slug.replace(/-(sd|smp|sma|smk)$/, "");
}

export function subjectGroupKey(subject: { slug?: string }): SubjectGroupKey {
  const slug = subject.slug ?? "";
  if (slug.startsWith("smk-")) return "pilihan-smk";
  if (CORE_SUBJECTS.includes(subjectBase(slug))) return "utama";
  return "pilihan-sma";
}

/** Urutan tampil kelompok yang dilipat, di bawah mapel utama. */
export const COLLAPSED_GROUP_ORDER: Exclude<SubjectGroupKey, "utama">[] = [
  "pilihan-sma",
  "pilihan-smk",
];

export const GROUP_LABEL: Record<Exclude<SubjectGroupKey, "utama">, string> = {
  "pilihan-sma": "Mapel Pilihan SMA/MA",
  "pilihan-smk": "Mapel Pilihan SMK",
};

export const GROUP_DESCRIPTION: Record<Exclude<SubjectGroupKey, "utama">, string> = {
  "pilihan-sma": "Mapel yang diujikan sesuai pilihan jurusan di rapor siswa.",
  "pilihan-smk": "Paket sesuai program keahlian yang diambil siswa SMK.",
};
