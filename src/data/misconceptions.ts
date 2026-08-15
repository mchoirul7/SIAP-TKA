import type { Misconception } from "./types";

/**
 * `insight` adalah kalimat yang ditampilkan ke siswa/orang tua.
 * Gunakan bahasa hati-hati: menggambarkan pola jawaban, bukan melabeli anak.
 */
export const misconceptions: Misconception[] = [
  {
    id: "m-senilai-tambah",
    label: "Membuat pecahan senilai dengan menambah",
    description:
      "Menambah (atau mengurangi) bilangan yang sama pada pembilang dan penyebut, bukan mengalikan atau membaginya.",
    insight:
      "Pada beberapa soal pecahan senilai, pilihan jawaban menunjukkan bahwa pecahan senilai masih dibentuk dengan menambah bilangan yang sama pada pembilang dan penyebut. Bagian ini sebaiknya diperkuat dengan kembali ke gambar dan perkalian.",
  },
  {
    id: "m-penyebut-besar",
    label: "Penyebut lebih besar dianggap bernilai lebih besar",
    description:
      "Menentukan pecahan yang lebih besar hanya berdasarkan besar penyebutnya.",
    insight:
      "Pada beberapa soal perbandingan pecahan, pilihan jawaban menunjukkan bahwa nilai pecahan masih ditentukan dari besar penyebutnya saja. Perbandingan pecahan masih perlu diperkuat.",
  },
  {
    id: "m-pembilang-saja",
    label: "Membandingkan hanya lewat pembilang",
    description: "Membandingkan dua pecahan hanya dengan melihat pembilangnya.",
    insight:
      "Pada beberapa soal, pilihan jawaban menunjukkan bahwa pecahan masih dibandingkan hanya dari pembilangnya. Menyamakan penyebut lebih dahulu perlu lebih sering dilatih.",
  },
  {
    id: "m-jumlah-penyebut",
    label: "Menjumlahkan penyebut",
    description:
      "Menjumlahkan atau mengurangkan pembilang dan penyebut sekaligus pada operasi pecahan.",
    insight:
      "Pada beberapa soal operasi pecahan, pilihan jawaban menunjukkan bahwa penyebut ikut dijumlahkan. Langkah menyamakan penyebut masih perlu dilatih.",
  },
  {
    id: "m-keliling-luas-tertukar",
    label: "Keliling dan luas tertukar",
    description: "Menggunakan rumus luas ketika diminta keliling, atau sebaliknya.",
    insight:
      "Pada beberapa soal bangun datar, pilihan jawaban menunjukkan bahwa keliling dan luas masih tertukar. Membedakan keduanya perlu diperkuat.",
  },
  {
    id: "m-luas-segitiga-tanpa-setengah",
    label: "Luas segitiga tanpa dibagi dua",
    description: "Menghitung luas segitiga dengan alas × tinggi tanpa dibagi dua.",
    insight:
      "Pada soal luas segitiga, pilihan jawaban menunjukkan bahwa hasil alas × tinggi belum dibagi dua.",
  },
  {
    id: "m-volume-jumlah-rusuk",
    label: "Volume dijumlahkan, bukan dikalikan",
    description: "Menjumlahkan panjang rusuk untuk menghitung volume.",
    insight:
      "Pada soal volume, pilihan jawaban menunjukkan bahwa ukuran bangun masih dijumlahkan, belum dikalikan.",
  },
  {
    id: "m-rata-rata-tanpa-bagi",
    label: "Rata-rata tanpa dibagi banyak data",
    description: "Menjumlahkan seluruh data tanpa membaginya dengan banyak data.",
    insight:
      "Pada soal rata-rata, pilihan jawaban menunjukkan bahwa jumlah data belum dibagi dengan banyaknya data.",
  },
];
