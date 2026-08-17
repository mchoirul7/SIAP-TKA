/**
 * Alamat produksi. Dibaca dari env agar domain final maupun pratinjau Vercel
 * tidak menuntut perubahan kode; nilai cadangan dipakai saat pengembangan lokal.
 * Garis miring di ujung dibuang supaya penggabungan URL tidak menghasilkan `//`.
 */
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://siap-tka-one.vercel.app").replace(
  /\/+$/,
  "",
);

/** Tempat kode voucher dibeli. Dipakai pada pesan berbagi dan data terstruktur. */
export const shopeeVoucherUrl = "https://shopee.co.id/product/47813351/55316135628/";

/** Nama produk sementara. Ganti di satu tempat ini bila nama final sudah ditentukan. */
export const site = {
  name: "Siap TKA",
  /** Nama penuh yang dipakai pada pemasaran, pesan berbagi, dan data terstruktur. */
  brandName: "SIAP TKA ONE",
  url: siteUrl,
  locale: "id_ID",
  tagline: "Platform latihan dan simulasi TKA dari rumah",
  valueProposition:
    "Akses satu seri mapel, kerjakan tryout dan latihan TKA dari rumah, lalu lihat bagian yang perlu diperkuat.",
  secondaryMessage: "Satu kode akses membuka satu mapel dalam satu seri.",

  /**
   * Kalimat yang dipakai mesin telusur pada hasil pencarian halaman depan.
   * Sengaja berbeda dari `valueProposition`: yang ini memuat kata yang dicari
   * orang tua ("soal TKA", "kisi-kisi", "tryout"), bukan penjelasan produk.
   */
  searchDescription:
    "Latihan soal TKA dan tryout online sesuai kisi-kisi terbaru untuk SD, SMP, dan SMA. Kerjakan dari rumah, lengkap dengan pembahasan tiap soal dan analisa materi yang perlu diperkuat.",
} as const;

/**
 * Kata kunci utama. Bukan lagi faktor peringkat langsung di Google, tetapi tetap
 * dibaca sebagian mesin telusur dan pratinjau tautan — dan menjadi daftar acuan
 * satu tempat untuk menyusun judul serta deskripsi tiap halaman.
 */
export const siteKeywords = [
  "soal TKA",
  "latihan soal TKA",
  "tryout TKA",
  "TKA online",
  "kisi-kisi TKA",
  "contoh soal TKA",
  "bank soal TKA",
  "simulasi TKA",
  "persiapan TKA",
  "TKA SD",
  "TKA SMP",
  "TKA SMA",
  "Tes Kemampuan Akademik",
  "soal TKA dan pembahasan",
  "belajar TKA dari rumah",
  "SIAP TKA ONE",
] as const;

/**
 * Pesan yang sudah terisi saat tombol Bagikan membuka WhatsApp.
 *
 * Ditujukan kepada orang tua, bukan kepada siswa: yang membagikan tautan di grup
 * wali murid adalah orang tua, dan yang membeli vouchernya juga mereka. Karena
 * itu penutupnya satu ajakan yang jelas — ambil kode vouchernya di Shopee.
 */
export const shareContent = {
  /** WhatsApp memberi cukup ruang untuk memuat daftar isi paket. */
  message: [
    "🎓 Ayah/Bunda, TKA sudah semakin dekat.",
    "",
    `Yuk siapkan ananda dari rumah bersama *${site.brandName}* — paket lengkap yang disusun mengikuti kisi-kisi terbaru:`,
    "",
    "✅ Paket soal latihan per mata pelajaran, dikerjakan bertahap",
    "✅ Tryout online dengan timer seperti ujian sebenarnya",
    "✅ Pembahasan lengkap di setiap soal",
    "✅ Analisa hasil: materi mana yang perlu diperkuat lebih dulu",
    "",
    `Lihat paketnya di sini: ${site.url}`,
    "",
    "🎟️ Dapatkan kode vouchernya sekarang di Shopee:",
    shopeeVoucherUrl,
  ].join("\n"),
} as const;
