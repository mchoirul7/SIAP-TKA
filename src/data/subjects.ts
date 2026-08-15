import type { Subject, Subtopic, Topic } from "./types";

export const subjects: Subject[] = [
  {
    id: "sub-mat-sd",
    slug: "matematika-sd",
    name: "Matematika SD",
    shortName: "Matematika",
    level: "SD",
    description:
      "Bilangan, geometri dan pengukuran, serta pengolahan data untuk jenjang sekolah dasar.",
  },
  {
    // Belum memiliki soal. Sengaja ditampilkan agar struktur mata pelajaran per
    // jenjang terbaca sejak awal, dengan penanda "segera" pada kartunya.
    id: "sub-bin-sd",
    slug: "bahasa-indonesia-sd",
    name: "Bahasa Indonesia SD",
    shortName: "Bahasa Indonesia",
    level: "SD",
    description:
      "Membaca pemahaman, kosakata, dan kaidah bahasa untuk jenjang sekolah dasar.",
  },
];

export const topics: Topic[] = [
  { id: "top-bilangan", subjectId: "sub-mat-sd", slug: "bilangan", name: "Bilangan" },
  {
    id: "top-geometri",
    subjectId: "sub-mat-sd",
    slug: "geometri-pengukuran",
    name: "Geometri dan Pengukuran",
  },
  { id: "top-data", subjectId: "sub-mat-sd", slug: "data", name: "Data" },
];

export const subtopics: Subtopic[] = [
  {
    id: "st-pecahan-senilai",
    topicId: "top-bilangan",
    slug: "pecahan-senilai",
    name: "Pecahan Senilai",
    description:
      "Mengenali dan menentukan pecahan yang bernilai sama melalui perkalian atau pembagian pembilang dan penyebut.",
  },
  {
    id: "st-perbandingan-pecahan",
    topicId: "top-bilangan",
    slug: "perbandingan-pecahan",
    name: "Perbandingan Pecahan",
    description:
      "Membandingkan dan mengurutkan pecahan, baik berpenyebut sama maupun berbeda.",
  },
  {
    id: "st-operasi-pecahan",
    topicId: "top-bilangan",
    slug: "operasi-pecahan",
    name: "Operasi Pecahan",
    description:
      "Penjumlahan, pengurangan, perkalian, dan pembagian pecahan serta penerapannya pada soal cerita.",
  },
  {
    id: "st-kpk-fpb",
    topicId: "top-bilangan",
    slug: "kpk-fpb",
    name: "KPK dan FPB",
    description:
      "Menentukan kelipatan persekutuan terkecil dan faktor persekutuan terbesar serta penerapannya.",
  },
  {
    id: "st-keliling-luas",
    topicId: "top-geometri",
    slug: "keliling-dan-luas",
    name: "Keliling dan Luas Bangun Datar",
    description:
      "Menghitung keliling dan luas persegi, persegi panjang, dan segitiga, termasuk bangun gabungan.",
  },
  {
    id: "st-volume",
    topicId: "top-geometri",
    slug: "volume-bangun-ruang",
    name: "Volume Bangun Ruang",
    description: "Menghitung volume kubus dan balok serta penerapannya pada situasi sehari-hari.",
  },
  {
    id: "st-satuan-pengukuran",
    topicId: "top-geometri",
    slug: "satuan-pengukuran",
    name: "Satuan Pengukuran",
    description:
      "Mengubah dan membandingkan satuan panjang, berat, dan volume pada situasi sehari-hari.",
  },
  {
    id: "st-waktu-kecepatan",
    topicId: "top-geometri",
    slug: "waktu-dan-kecepatan",
    name: "Waktu dan Kecepatan",
    description:
      "Menghitung selisih dan durasi waktu, serta hubungan jarak, kecepatan, dan waktu tempuh.",
  },
  {
    id: "st-sifat-bangun",
    topicId: "top-geometri",
    slug: "sifat-bangun",
    name: "Sifat Bangun",
    description:
      "Mengenali bangun datar dan bangun ruang berdasarkan sifat sisi, sudut, dan diagonalnya.",
  },
  {
    id: "st-operasi-bilangan",
    topicId: "top-bilangan",
    slug: "operasi-bilangan-cacah",
    name: "Operasi Bilangan Cacah",
    description:
      "Perkalian, pembagian, dan pembagian bersisa pada bilangan cacah beserta penerapannya.",
  },
  {
    id: "st-penyajian-data",
    topicId: "top-data",
    slug: "penyajian-data",
    name: "Penyajian Data",
    description: "Membaca dan menafsirkan data dari tabel serta diagram batang sederhana.",
  },
  {
    id: "st-rata-rata",
    topicId: "top-data",
    slug: "rata-rata",
    name: "Rata-rata",
    description: "Menentukan rata-rata sekumpulan data dan menggunakannya untuk menjawab pertanyaan.",
  },
];
