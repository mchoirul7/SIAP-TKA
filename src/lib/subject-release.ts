/**
 * Mata pelajaran yang isinya sudah ada tetapi belum dibuka untuk pembeli.
 *
 * Soal, paket, tryout, dan produknya sudah termuat di basis data — voucher seri
 * SMA bahkan sudah mencakup ketiganya — tetapi rilisnya ditahan sampai bahannya
 * siap. Karena itu penahannya di sini, bukan dengan menghapus baris di basis
 * data: begitu siap, cukup satu nama dicoret dari daftar ini dan mapelnya
 * langsung terbuka utuh beserta seluruh riwayat pengerjaan yang sudah ada.
 *
 * Yang disaring adalah paket dan tryoutnya — lihat `content-service`. Mapelnya
 * sendiri tetap tampil di halaman depan, tetapi tanpa paket dan tryout jumlahnya
 * nol, sehingga kartunya jatuh ke penanda "Segera" dan tidak dapat dibuka. Ikut
 * tersaring pula daftar latihan, daftar tryout, dan peta situs, karena semuanya
 * membaca dari fungsi yang sama.
 *
 * Dicocokkan dengan awalan slug supaya berlaku untuk semua jenjang sekaligus —
 * `bahasa-indonesia-sd` maupun `bahasa-indonesia-sma`.
 */
const UNRELEASED_SUBJECTS = ["bahasa-indonesia", "bahasa-inggris"];

/** Mapel yang tidak dikenali dianggap sudah rilis — daftar ini hanya menahan. */
export function isSubjectReleased(slug: string | undefined): boolean {
  if (!slug) return true;
  return !UNRELEASED_SUBJECTS.some((key) => slug.startsWith(key));
}
