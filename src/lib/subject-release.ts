/**
 * Mata pelajaran yang isinya sudah ada tetapi belum dibuka untuk pembeli.
 *
 * Penahan rilis per mapel. Soal, paket, tryout, dan produknya sudah termuat di
 * basis data — voucher seri SMA mencakup ketiganya — jadi penahannya di sini,
 * bukan dengan menghapus baris di basis data: satu nama ditambahkan ke daftar
 * ini untuk menahan, dan dicoret lagi begitu bahannya siap, tanpa kehilangan
 * riwayat pengerjaan yang sudah ada.
 *
 * Yang disaring adalah paket dan tryoutnya — lihat `content-service`. Mapelnya
 * sendiri tetap tampil di halaman depan, tetapi tanpa paket dan tryout jumlahnya
 * nol, sehingga kartunya jatuh ke penanda "Segera" dan tidak dapat dibuka. Ikut
 * tersaring pula daftar latihan, daftar tryout, dan peta situs, karena semuanya
 * membaca dari fungsi yang sama.
 *
 * Dicocokkan dengan awalan slug supaya berlaku untuk semua jenjang sekaligus —
 * `bahasa-indonesia-sd` maupun `bahasa-indonesia-sma`.
 *
 * Saat ini kosong: Bahasa Indonesia dan Bahasa Inggris sudah dirilis, sehingga
 * seluruh mapel terbuka apa adanya sesuai isi basis data.
 */
const UNRELEASED_SUBJECTS: string[] = [];

/** Mapel yang tidak dikenali dianggap sudah rilis — daftar ini hanya menahan. */
export function isSubjectReleased(slug: string | undefined): boolean {
  if (!slug) return true;
  return !UNRELEASED_SUBJECTS.some((key) => slug.startsWith(key));
}
