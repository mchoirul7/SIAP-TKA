import type { Concept } from "./types";

export const concepts: Concept[] = [
  // Pecahan Senilai
  {
    id: "c-senilai-mengenali",
    subtopicId: "st-pecahan-senilai",
    name: "Mengenali pecahan senilai",
    description: "Menentukan apakah dua pecahan bernilai sama, termasuk dari representasi gambar.",
  },
  {
    id: "c-senilai-menentukan",
    subtopicId: "st-pecahan-senilai",
    name: "Menentukan pecahan senilai",
    description:
      "Mencari nilai yang belum diketahui dengan mengalikan atau membagi pembilang dan penyebut dengan bilangan yang sama.",
  },

  // Perbandingan Pecahan
  {
    id: "c-banding-penyebut-sama",
    subtopicId: "st-perbandingan-pecahan",
    name: "Membandingkan pecahan berpenyebut sama",
    description: "Membandingkan dua pecahan yang penyebutnya sama dengan melihat pembilangnya.",
  },
  {
    id: "c-banding-penyebut-beda",
    subtopicId: "st-perbandingan-pecahan",
    name: "Membandingkan pecahan berpenyebut berbeda",
    description: "Menyamakan penyebut lebih dulu sebelum membandingkan atau mengurutkan pecahan.",
  },

  // Operasi Pecahan
  {
    id: "c-operasi-jumlah-kurang",
    subtopicId: "st-operasi-pecahan",
    name: "Penjumlahan dan pengurangan pecahan",
    description: "Menjumlahkan dan mengurangkan pecahan, termasuk yang penyebutnya berbeda.",
  },
  {
    id: "c-operasi-kali-bagi",
    subtopicId: "st-operasi-pecahan",
    name: "Perkalian dan pembagian pecahan",
    description: "Mengalikan dan membagi pecahan serta menyederhanakan hasilnya.",
  },

  // KPK dan FPB
  {
    id: "c-fpb",
    subtopicId: "st-kpk-fpb",
    name: "Faktor persekutuan terbesar",
    description: "Menentukan FPB dua bilangan dan menggunakannya pada soal pembagian merata.",
  },
  {
    id: "c-kpk",
    subtopicId: "st-kpk-fpb",
    name: "Kelipatan persekutuan terkecil",
    description: "Menentukan KPK dua bilangan dan menggunakannya pada soal kejadian berulang.",
  },

  // Keliling dan Luas
  {
    id: "c-keliling-persegi-panjang",
    subtopicId: "st-keliling-luas",
    name: "Keliling persegi dan persegi panjang",
    description: "Menghitung keliling dari panjang sisi bangun datar sederhana.",
  },
  {
    id: "c-luas-segitiga",
    subtopicId: "st-keliling-luas",
    name: "Luas segitiga",
    description: "Menghitung luas segitiga dari alas dan tinggi.",
  },
  {
    id: "c-luas-gabungan",
    subtopicId: "st-keliling-luas",
    name: "Luas bangun gabungan",
    description: "Menghitung luas daerah yang tersusun atau terpotong dari beberapa bangun datar.",
  },

  // Volume
  {
    id: "c-volume-kubus",
    subtopicId: "st-volume",
    name: "Volume kubus",
    description: "Menghitung volume kubus dari panjang rusuknya.",
  },
  {
    id: "c-volume-balok",
    subtopicId: "st-volume",
    name: "Volume balok",
    description: "Menghitung volume balok dari panjang, lebar, dan tinggi.",
  },

  // Penyajian Data
  {
    id: "c-baca-tabel",
    subtopicId: "st-penyajian-data",
    name: "Membaca tabel",
    description: "Mengambil informasi dari tabel frekuensi sederhana.",
  },
  {
    id: "c-baca-diagram",
    subtopicId: "st-penyajian-data",
    name: "Membaca diagram batang",
    description: "Menafsirkan diagram batang dan membandingkan antar kategori.",
  },

  // Rata-rata
  {
    id: "c-rata-rata-hitung",
    subtopicId: "st-rata-rata",
    name: "Menghitung rata-rata",
    description: "Menjumlahkan seluruh data lalu membaginya dengan banyak data.",
  },
  {
    id: "c-rata-rata-terapan",
    subtopicId: "st-rata-rata",
    name: "Menggunakan rata-rata",
    description: "Menentukan data yang belum diketahui bila rata-ratanya diketahui.",
  },

  // --- Satuan pengukuran ---
  {
    id: "c-satuan-panjang",
    subtopicId: "st-satuan-pengukuran",
    name: "Satuan panjang",
    description: "Mengubah antar satuan panjang dan menjumlahkannya pada satu situasi.",
  },
  {
    id: "c-satuan-berat",
    subtopicId: "st-satuan-pengukuran",
    name: "Satuan berat",
    description: "Mengubah antar satuan berat lalu membandingkan hasilnya.",
  },
  {
    id: "c-satuan-volume",
    subtopicId: "st-satuan-pengukuran",
    name: "Satuan volume cair",
    description: "Mengubah antar satuan volume cair seperti hektoliter, liter, dan desiliter.",
  },

  // --- Waktu dan kecepatan ---
  {
    id: "c-satuan-waktu",
    subtopicId: "st-waktu-kecepatan",
    name: "Selisih dan durasi waktu",
    description: "Menghitung selang waktu dalam hari, minggu, jam, dan menit.",
  },
  {
    id: "c-kecepatan",
    subtopicId: "st-waktu-kecepatan",
    name: "Jarak, kecepatan, dan waktu",
    description: "Menggunakan hubungan jarak, kecepatan rata-rata, dan waktu tempuh.",
  },

  // --- Sifat bangun ---
  {
    id: "c-sifat-bangun-datar",
    subtopicId: "st-sifat-bangun",
    name: "Sifat bangun datar",
    description: "Mengenali bangun datar dari sisi, sudut, dan diagonalnya.",
  },
  {
    id: "c-sifat-bangun-ruang",
    subtopicId: "st-sifat-bangun",
    name: "Sifat bangun ruang",
    description: "Menggunakan sifat sisi dan rusuk bangun ruang untuk menarik kesimpulan.",
  },

  // --- Operasi bilangan cacah ---
  {
    id: "c-operasi-cacah",
    subtopicId: "st-operasi-bilangan",
    name: "Perkalian dan pembagian bilangan cacah",
    description: "Menyelesaikan perkalian, pembagian, dan pembagian bersisa pada soal cerita.",
  },
];
