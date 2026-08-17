/**
 * Urutan tampil mata pelajaran.
 *
 * Basis data mengurutkan menurut `sort_order` lalu `id`; karena seluruh mapel
 * TKA memakai sort_order yang sama, daftarnya jatuh ke urutan abjad sehingga
 * Bahasa Indonesia selalu muncul lebih dulu. Yang diinginkan produk adalah
 * Matematika, lalu Bahasa Indonesia, lalu Bahasa Inggris. Urutan itu ditetapkan
 * di satu tempat ini dan dipakai semua daftar agar tidak ada halaman yang
 * menyimpang.
 */
const SUBJECT_ORDER = ["matematika", "bahasa-indonesia", "bahasa-inggris"];

/** Mapel di luar daftar ditaruh paling belakang, urutan aslinya dipertahankan. */
export function subjectRank(slug: string | undefined): number {
  if (!slug) return SUBJECT_ORDER.length;
  const index = SUBJECT_ORDER.findIndex((key) => slug.startsWith(key));
  return index === -1 ? SUBJECT_ORDER.length : index;
}

/**
 * Mengurutkan ulang antar mapel tanpa mengubah urutan di dalam satu mapel —
 * `Array.prototype.sort` di JavaScript modern dijamin stabil.
 */
export function sortBySubject<T>(items: T[], slugOf: (item: T) => string | undefined): T[] {
  return [...items].sort((a, b) => subjectRank(slugOf(a)) - subjectRank(slugOf(b)));
}
