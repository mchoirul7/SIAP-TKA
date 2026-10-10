import { site } from "@/lib/site";

/**
 * Pertanyaan yang benar-benar ditanyakan orang tua sebelum membeli.
 *
 * Dipakai dua kali dari satu sumber: tampil sebagai daftar tanya jawab di
 * halaman depan, dan dikirim sebagai data terstruktur `FAQPage` supaya
 * jawabannya berpeluang tampil langsung di bawah hasil pencarian. Keduanya
 * harus sama persis — Google menolak tanya jawab yang tidak terlihat di
 * halaman.
 *
 * Isinya mengikuti keadaan katalog yang sebenarnya, bukan rencana: begitu ada
 * mapel atau jenjang yang berubah ketersediaannya, jawaban di sini ikut
 * diperbarui, karena inilah yang dibaca orang tua sebelum membayar.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const homeFaq: FaqItem[] = [
  {
    question: "Apa itu TKA?",
    answer:
      "TKA adalah Tes Kemampuan Akademik, ujian yang mengukur penguasaan materi mata pelajaran. Soalnya tidak berhenti pada hafalan: sebagian besar meminta siswa menerapkan konsep pada situasi baru, sehingga latihan yang berulang pada bentuk soal yang tepat sangat menentukan.",
  },
  {
    question: `Apa saja isi paket ${site.brandName}?`,
    answer:
      "Setiap seri berisi paket soal latihan per mata pelajaran yang dikerjakan bertahap dari subtopik ke subtopik, tryout online dengan pembatas waktu seperti ujian sebenarnya, pembahasan pada tiap soal, serta analisa hasil yang menunjukkan materi mana yang perlu diperkuat lebih dulu.",
  },
  {
    question: "Untuk jenjang apa saja?",
    answer:
      "SD, SMP, dan SMA/SMK — ketiganya sudah dapat dikerjakan, bukan lagi menunggu. Jenjang dipilih di halaman depan, lalu mata pelajaran untuk jenjang tersebut muncul beserta paket latihan dan tryoutnya.",
  },
  {
    question: "Mata pelajaran apa saja yang sudah tersedia?",
    answer:
      "Untuk SMA/SMK tersedia Matematika, Bahasa Indonesia, dan Bahasa Inggris secara lengkap — paket latihan, tryout, pembahasan, dan analisa hasil. Untuk SD dan SMP tersedia Matematika dan Bahasa Indonesia dengan kelengkapan yang sama. Di luar itu ada mata pelajaran pilihan SMA dan program keahlian SMK yang tryoutnya sudah dapat dikerjakan.",
  },
  {
    question: "Apakah mata pelajaran pilihan dan jurusan SMK juga ada?",
    answer:
      "Ada. Mata pelajaran pilihan SMA — Fisika, Kimia, Biologi, Ekonomi, Geografi, Sosiologi, Sejarah, PPKn, dan Matematika Tingkat Lanjut — beserta program keahlian SMK dikelompokkan dalam kartu Mapel Pilihan SMA dan Mapel Pilihan SMK di halaman depan, supaya daftar mapel utama tidak ikut penuh. Tryoutnya sudah dapat dikerjakan sekarang, dan paket latihan per materinya sedang dilengkapi bertahap sampai setara mata pelajaran utama.",
  },
  {
    question: "Apakah soalnya sesuai kisi-kisi TKA?",
    answer:
      "Soal disusun mengikuti kisi-kisi terbaru dan dipetakan sampai ke tingkat subtopik dan konsep. Karena itu hasil pengerjaan tidak berhenti pada angka, tetapi menunjuk bagian materi mana yang masih lemah.",
  },
  {
    question: "Bagaimana cara membuat akun murid?",
    answer:
      "Tekan Masuk / Daftar, lalu isi nama murid dan buat PIN 6 angka. PIN itu dipakai untuk masuk lagi di HP atau laptop mana pun, dan satu akun bisa dipakai di dua perangkat sekaligus. Semua paket yang dibeli dan riwayat nilai tersimpan di akun itu.",
  },
  {
    question: "Bagaimana cara membeli paket?",
    answer: `Masuk ke akun murid, buka paket yang diinginkan, lalu pilih paket lengkap satu mata pelajaran atau beli satuan lewat WhatsApp admin ${site.brandName}. Setelah pembayaran, admin membukakan paketnya ke akun dan paket itu langsung bisa dikerjakan.`,
  },
  {
    question: "Apakah setiap paket bisa dicoba dulu sebelum membeli?",
    answer:
      "Bisa. Pada setiap mata pelajaran yang sudah punya paket latihan, paket pertamanya gratis, cukup daftar akun dengan nama dan PIN supaya nilainya terekam — lengkap dengan pembahasan dan analisa hasilnya — supaya bentuk soal dan cara kerjanya dapat dilihat sendiri sebelum memutuskan membeli.",
  },
  {
    question: "Apakah perlu memasang aplikasi?",
    answer:
      "Tidak. Semua dikerjakan langsung dari peramban di ponsel, tablet, atau komputer. Jawaban dan sisa waktu tersimpan di perangkat yang dipakai, jadi halaman yang tidak sengaja tertutup dapat dilanjutkan tanpa mengulang dari awal.",
  },
];
