import { shopeeVoucherUrl, site } from "@/lib/site";

/**
 * Pertanyaan yang benar-benar ditanyakan orang tua sebelum membeli.
 *
 * Dipakai dua kali dari satu sumber: tampil sebagai daftar tanya jawab di
 * halaman depan, dan dikirim sebagai data terstruktur `FAQPage` supaya
 * jawabannya berpeluang tampil langsung di bawah hasil pencarian. Keduanya
 * harus sama persis — Google menolak tanya jawab yang tidak terlihat di
 * halaman.
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
    question: "Apakah soalnya sesuai kisi-kisi TKA?",
    answer:
      "Soal disusun mengikuti kisi-kisi terbaru dan dipetakan sampai ke tingkat subtopik dan konsep. Karena itu hasil pengerjaan tidak berhenti pada angka, tetapi menunjuk bagian materi mana yang masih lemah.",
  },
  {
    question: "Bagaimana cara mendapatkan kode akses?",
    answer: `Kode akses dibeli lewat Shopee di ${shopeeVoucherUrl}. Setelah kode diterima, masukkan lewat tombol "Saya Punya Kode Akses" di halaman ini, dan satu mata pelajaran dalam seri tersebut langsung terbuka beserta tryout, latihan, hasil, dan pembahasannya.`,
  },
  {
    question: "Untuk jenjang apa saja?",
    answer:
      "Tersedia untuk jenjang SD, SMP, dan SMA. Jenjang dipilih di halaman depan, lalu mata pelajaran yang sudah tersedia untuk jenjang tersebut akan muncul beserta paket latihan dan tryoutnya.",
  },
  {
    question: "Apakah perlu memasang aplikasi?",
    answer:
      "Tidak. Semua dikerjakan langsung dari peramban di ponsel, tablet, atau komputer. Jawaban dan sisa waktu tersimpan di perangkat yang dipakai, jadi halaman yang tidak sengaja tertutup dapat dilanjutkan tanpa mengulang dari awal.",
  },
];
