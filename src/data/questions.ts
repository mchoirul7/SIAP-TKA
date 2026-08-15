import type { Question } from "./types";

const S = "sub-mat-sd";

/**
 * Bank soal prototype. Pecahan ditulis dengan notasi miring (2/3) agar konsisten
 * dan mudah dibaca pada layar kecil.
 *
 * Soal t01–t25 dipakai simulasi TKA. Soal p-* dipakai paket latihan.
 */
export const questions: Question[] = [
  // ==========================================================
  // TRYOUT — Pecahan Senilai (t01–t04)
  // ==========================================================
  {
    id: "t01",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-mengenali",
    competency: "Mengenali pecahan yang bernilai sama",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Pecahan yang senilai dengan 2/3 adalah ....",
    options: [
      { key: "A", text: "4/6" },
      { key: "B", text: "3/4", misconceptionId: "m-senilai-tambah" },
      { key: "C", text: "2/6" },
      { key: "D", text: "4/3" },
    ],
    correctAnswer: "A",
    explanation:
      "Pecahan senilai diperoleh dengan mengalikan pembilang dan penyebut dengan bilangan yang sama. 2/3 dikalikan 2 pada pembilang dan penyebut menjadi 4/6. Menambah 1 pada pembilang dan penyebut (menjadi 3/4) tidak menghasilkan pecahan senilai.",
  },
  {
    id: "t02",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-menentukan",
    competency: "Menentukan bilangan yang belum diketahui pada pecahan senilai",
    difficulty: "dasar",
    reasoningType: "penerapan",
    questionText: "Perhatikan pecahan senilai berikut: 3/5 = n/20. Nilai n adalah ....",
    options: [
      { key: "A", text: "9" },
      { key: "B", text: "12" },
      { key: "C", text: "18", misconceptionId: "m-senilai-tambah" },
      { key: "D", text: "60" },
    ],
    correctAnswer: "B",
    explanation:
      "Penyebut 5 menjadi 20 berarti dikalikan 4. Pembilang juga harus dikalikan 4, sehingga n = 3 × 4 = 12. Menambahkan 15 pada penyebut lalu menambahkan 15 juga pada pembilang (menjadi 18) tidak menjaga nilai pecahan.",
  },
  {
    id: "t03",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-mengenali",
    competency: "Menyederhanakan pecahan pada situasi nyata",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText:
      "Sebuah kue dipotong menjadi 8 bagian sama besar. Rani memakan 2 bagian. Bagian kue yang dimakan Rani senilai dengan ....",
    options: [
      { key: "A", text: "1/4" },
      { key: "B", text: "1/7", misconceptionId: "m-senilai-tambah" },
      { key: "C", text: "2/4" },
      { key: "D", text: "1/2" },
    ],
    correctAnswer: "A",
    explanation:
      "Rani memakan 2/8 bagian. Pembilang dan penyebut sama-sama dibagi 2 sehingga 2/8 = 1/4. Mengurangi 1 dari pembilang dan penyebut (menjadi 1/7) mengubah nilai pecahan.",
  },
  {
    id: "t04",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-menentukan",
    competency: "Mengidentifikasi kelompok pecahan senilai",
    difficulty: "menengah",
    reasoningType: "penalaran",
    questionText: "Kelompok pecahan berikut yang seluruh anggotanya senilai adalah ....",
    options: [
      { key: "A", text: "1/2, 2/4, 3/6" },
      { key: "B", text: "1/2, 2/3, 3/4", misconceptionId: "m-senilai-tambah" },
      { key: "C", text: "1/3, 2/6, 3/8" },
      { key: "D", text: "2/5, 4/10, 6/12" },
    ],
    correctAnswer: "A",
    explanation:
      "1/2, 2/4, dan 3/6 semuanya bernilai setengah karena pembilang dan penyebutnya dikalikan bilangan yang sama. Pilihan B dibentuk dengan menambah 1 pada pembilang dan penyebut, sehingga nilainya justru berubah naik.",
  },

  // ==========================================================
  // TRYOUT — Perbandingan Pecahan (t05–t08)
  // ==========================================================
  {
    id: "t05",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-sama",
    competency: "Membandingkan pecahan berpenyebut sama",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Di antara pecahan 2/9, 5/9, 4/9, dan 7/9, pecahan yang nilainya paling besar adalah ....",
    options: [
      { key: "A", text: "2/9" },
      { key: "B", text: "4/9" },
      { key: "C", text: "5/9" },
      { key: "D", text: "7/9" },
    ],
    correctAnswer: "D",
    explanation:
      "Karena penyebutnya sama, pecahan dibandingkan dari pembilangnya saja. Pembilang terbesar adalah 7, sehingga 7/9 paling besar.",
  },
  {
    id: "t06",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-beda",
    competency: "Membandingkan pecahan berpembilang sama",
    difficulty: "menengah",
    reasoningType: "pemahaman",
    questionText: "Pecahan yang lebih besar antara 1/3 dan 1/5 adalah ....",
    options: [
      { key: "A", text: "1/3" },
      { key: "B", text: "1/5", misconceptionId: "m-penyebut-besar" },
      { key: "C", text: "keduanya sama besar" },
      { key: "D", text: "tidak dapat dibandingkan" },
    ],
    correctAnswer: "A",
    explanation:
      "Satu benda yang dibagi 3 menghasilkan potongan yang lebih besar daripada bila dibagi 5. Jadi 1/3 lebih besar daripada 1/5. Penyebut yang lebih besar justru membuat potongannya lebih kecil.",
  },
  {
    id: "t07",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-beda",
    competency: "Membandingkan pecahan berpenyebut berbeda",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText: "Pecahan yang lebih besar antara 3/5 dan 2/3 adalah ....",
    options: [
      { key: "A", text: "2/3" },
      { key: "B", text: "3/5", misconceptionId: "m-pembilang-saja" },
      { key: "C", text: "keduanya sama besar" },
      { key: "D", text: "tidak dapat dibandingkan karena penyebutnya berbeda" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebutnya menjadi 15: 3/5 = 9/15 dan 2/3 = 10/15. Karena 10/15 lebih besar, maka 2/3 lebih besar. Pembilang yang lebih besar tidak selalu berarti pecahannya lebih besar.",
  },
  {
    id: "t08",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-beda",
    competency: "Mengurutkan pecahan",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText: "Urutan pecahan 1/2, 2/5, dan 3/4 dari yang terkecil adalah ....",
    options: [
      { key: "A", text: "2/5, 1/2, 3/4" },
      { key: "B", text: "1/2, 2/5, 3/4", misconceptionId: "m-penyebut-besar" },
      { key: "C", text: "3/4, 1/2, 2/5" },
      { key: "D", text: "1/2, 3/4, 2/5" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebutnya menjadi 20: 1/2 = 10/20, 2/5 = 8/20, dan 3/4 = 15/20. Urutan dari yang terkecil adalah 8/20, 10/20, 15/20 atau 2/5, 1/2, 3/4. Mengurutkan berdasarkan besar penyebut akan memberi hasil yang keliru.",
  },

  // ==========================================================
  // TRYOUT — Operasi Pecahan (t09–t12)
  // ==========================================================
  {
    id: "t09",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-jumlah-kurang",
    competency: "Menjumlahkan pecahan berpenyebut sama",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Hasil dari 1/5 + 2/5 adalah ....",
    options: [
      { key: "A", text: "3/5" },
      { key: "B", text: "3/10", misconceptionId: "m-jumlah-penyebut" },
      { key: "C", text: "2/5" },
      { key: "D", text: "3/25" },
    ],
    correctAnswer: "A",
    explanation:
      "Penyebutnya sudah sama, sehingga cukup pembilangnya yang dijumlahkan: 1 + 2 = 3, hasilnya 3/5. Penyebut tidak ikut dijumlahkan.",
  },
  {
    id: "t10",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-jumlah-kurang",
    competency: "Menjumlahkan pecahan berpenyebut berbeda",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText: "Hasil dari 1/2 + 1/3 adalah ....",
    options: [
      { key: "A", text: "5/6" },
      { key: "B", text: "2/5", misconceptionId: "m-jumlah-penyebut" },
      { key: "C", text: "2/6" },
      { key: "D", text: "1/6" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebut dengan KPK dari 2 dan 3, yaitu 6. Maka 1/2 = 3/6 dan 1/3 = 2/6, sehingga hasilnya 3/6 + 2/6 = 5/6.",
  },
  {
    id: "t11",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-jumlah-kurang",
    competency: "Menyelesaikan soal cerita pengurangan pecahan",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText:
      "Ibu memiliki 3/4 kg gula. Sebanyak 1/2 kg dipakai untuk membuat kue. Sisa gula Ibu adalah ....",
    options: [
      { key: "A", text: "1/4 kg" },
      { key: "B", text: "2/2 kg", misconceptionId: "m-jumlah-penyebut" },
      { key: "C", text: "1/2 kg" },
      { key: "D", text: "2/4 kg" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebutnya: 1/2 = 2/4. Maka 3/4 − 2/4 = 1/4 kg. Mengurangkan pembilang dan penyebut sekaligus akan memberi hasil yang keliru.",
  },
  {
    id: "t12",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-kali-bagi",
    competency: "Mengalikan dua pecahan",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText: "Hasil dari 2/3 × 3/4 adalah ....",
    options: [
      { key: "A", text: "1/2" },
      { key: "B", text: "5/7", misconceptionId: "m-jumlah-penyebut" },
      { key: "C", text: "6/7" },
      { key: "D", text: "2/4" },
    ],
    correctAnswer: "A",
    explanation:
      "Kalikan pembilang dengan pembilang dan penyebut dengan penyebut: (2 × 3)/(3 × 4) = 6/12. Setelah disederhanakan dengan membagi 6, hasilnya 1/2.",
  },

  // ==========================================================
  // TRYOUT — KPK dan FPB (t13–t15)
  // ==========================================================
  {
    id: "t13",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-kpk-fpb",
    conceptId: "c-fpb",
    competency: "Menentukan FPB dua bilangan",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "FPB dari 12 dan 18 adalah ....",
    options: [
      { key: "A", text: "2" },
      { key: "B", text: "3" },
      { key: "C", text: "6" },
      { key: "D", text: "36" },
    ],
    correctAnswer: "C",
    explanation:
      "Faktor 12 adalah 1, 2, 3, 4, 6, 12. Faktor 18 adalah 1, 2, 3, 6, 9, 18. Faktor persekutuan terbesarnya adalah 6.",
  },
  {
    id: "t14",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-kpk-fpb",
    conceptId: "c-kpk",
    competency: "Menentukan KPK dua bilangan",
    difficulty: "menengah",
    reasoningType: "pemahaman",
    questionText: "KPK dari 4 dan 6 adalah ....",
    options: [
      { key: "A", text: "2" },
      { key: "B", text: "10" },
      { key: "C", text: "12" },
      { key: "D", text: "24" },
    ],
    correctAnswer: "C",
    explanation:
      "Kelipatan 4 adalah 4, 8, 12, 16, ... dan kelipatan 6 adalah 6, 12, 18, ... Kelipatan persekutuan terkecilnya adalah 12.",
  },
  {
    id: "t15",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-kpk-fpb",
    conceptId: "c-kpk",
    competency: "Menerapkan KPK pada kejadian berulang",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText:
      "Lampu A menyala setiap 4 detik dan lampu B menyala setiap 6 detik. Jika keduanya menyala bersama pada detik ke-0, keduanya akan menyala bersama lagi pada detik ke ....",
    options: [
      { key: "A", text: "10" },
      { key: "B", text: "12" },
      { key: "C", text: "18" },
      { key: "D", text: "24" },
    ],
    correctAnswer: "B",
    explanation:
      "Waktu menyala bersama berikutnya adalah KPK dari 4 dan 6, yaitu 12 detik.",
  },

  // ==========================================================
  // TRYOUT — Keliling dan Luas (t16–t19)
  // ==========================================================
  {
    id: "t16",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-keliling-persegi-panjang",
    competency: "Menghitung keliling persegi panjang",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText:
      "Sebuah persegi panjang memiliki panjang 12 cm dan lebar 7 cm. Kelilingnya adalah ....",
    options: [
      { key: "A", text: "19 cm" },
      { key: "B", text: "38 cm" },
      { key: "C", text: "84 cm", misconceptionId: "m-keliling-luas-tertukar" },
      { key: "D", text: "48 cm" },
    ],
    correctAnswer: "B",
    explanation:
      "Keliling persegi panjang = 2 × (panjang + lebar) = 2 × (12 + 7) = 2 × 19 = 38 cm. Hasil 84 cm adalah luasnya, bukan kelilingnya.",
  },
  {
    id: "t17",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-luas-segitiga",
    competency: "Menghitung luas segitiga",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText:
      "Sebuah segitiga memiliki alas 10 cm dan tinggi 6 cm. Luas segitiga tersebut adalah ....",
    options: [
      { key: "A", text: "16 cm persegi" },
      { key: "B", text: "30 cm persegi" },
      { key: "C", text: "60 cm persegi", misconceptionId: "m-luas-segitiga-tanpa-setengah" },
      { key: "D", text: "32 cm persegi" },
    ],
    correctAnswer: "B",
    explanation:
      "Luas segitiga = (alas × tinggi) : 2 = (10 × 6) : 2 = 60 : 2 = 30 cm persegi. Hasil 60 diperoleh bila lupa membagi dua.",
  },
  {
    id: "t18",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-keliling-persegi-panjang",
    competency: "Menerapkan keliling pada situasi nyata",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText:
      "Sebuah kebun berbentuk persegi dengan panjang sisi 15 m akan dipagari mengelilingi tepinya. Panjang pagar yang dibutuhkan adalah ....",
    options: [
      { key: "A", text: "30 m" },
      { key: "B", text: "45 m" },
      { key: "C", text: "60 m" },
      { key: "D", text: "225 m", misconceptionId: "m-keliling-luas-tertukar" },
    ],
    correctAnswer: "C",
    explanation:
      "Pagar mengelilingi tepi kebun, sehingga yang dihitung adalah keliling: 4 × 15 = 60 m. Hasil 225 adalah luas kebun.",
  },
  {
    id: "t19",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-luas-gabungan",
    competency: "Menghitung luas daerah gabungan",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    stimulus:
      "Sebuah halaman berbentuk persegi panjang berukuran panjang 20 m dan lebar 12 m. Di dalam halaman tersebut terdapat kolam berbentuk persegi panjang berukuran 6 m × 4 m. Sisa halaman akan ditutup rumput.",
    questionText: "Luas halaman yang ditutup rumput adalah ....",
    options: [
      { key: "A", text: "216 m persegi" },
      { key: "B", text: "240 m persegi" },
      { key: "C", text: "264 m persegi" },
      { key: "D", text: "24 m persegi" },
    ],
    correctAnswer: "A",
    explanation:
      "Luas halaman = 20 × 12 = 240 m persegi. Luas kolam = 6 × 4 = 24 m persegi. Luas yang ditutup rumput = 240 − 24 = 216 m persegi.",
  },

  // ==========================================================
  // TRYOUT — Volume (t20–t21)
  // ==========================================================
  {
    id: "t20",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-volume",
    conceptId: "c-volume-kubus",
    competency: "Menghitung volume kubus",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Sebuah kubus memiliki panjang rusuk 5 cm. Volume kubus tersebut adalah ....",
    options: [
      { key: "A", text: "15 cm kubik", misconceptionId: "m-volume-jumlah-rusuk" },
      { key: "B", text: "25 cm kubik" },
      { key: "C", text: "125 cm kubik" },
      { key: "D", text: "150 cm kubik" },
    ],
    correctAnswer: "C",
    explanation:
      "Volume kubus = rusuk × rusuk × rusuk = 5 × 5 × 5 = 125 cm kubik. Menjumlahkan 5 + 5 + 5 akan memberi hasil yang keliru.",
  },
  {
    id: "t21",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-volume",
    conceptId: "c-volume-balok",
    competency: "Menghitung volume balok",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText:
      "Sebuah kotak berbentuk balok memiliki panjang 8 cm, lebar 5 cm, dan tinggi 4 cm. Volume kotak tersebut adalah ....",
    options: [
      { key: "A", text: "17 cm kubik", misconceptionId: "m-volume-jumlah-rusuk" },
      { key: "B", text: "40 cm kubik" },
      { key: "C", text: "160 cm kubik" },
      { key: "D", text: "184 cm kubik" },
    ],
    correctAnswer: "C",
    explanation:
      "Volume balok = panjang × lebar × tinggi = 8 × 5 × 4 = 160 cm kubik.",
  },

  // ==========================================================
  // TRYOUT — Penyajian Data (t22–t23)
  // ==========================================================
  {
    id: "t22",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-penyajian-data",
    conceptId: "c-baca-tabel",
    competency: "Membaca tabel frekuensi",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    stimulus:
      "Tabel olahraga kegemaran siswa Kelas 5:\nSepak bola — 12 siswa\nBulu tangkis — 9 siswa\nRenang — 7 siswa\nBasket — 4 siswa",
    questionText: "Olahraga yang paling banyak digemari siswa Kelas 5 adalah ....",
    options: [
      { key: "A", text: "Sepak bola" },
      { key: "B", text: "Bulu tangkis" },
      { key: "C", text: "Renang" },
      { key: "D", text: "Basket" },
    ],
    correctAnswer: "A",
    explanation:
      "Jumlah siswa terbanyak pada tabel adalah 12 siswa untuk sepak bola.",
  },
  {
    id: "t23",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-penyajian-data",
    conceptId: "c-baca-diagram",
    competency: "Menafsirkan data pada tabel",
    difficulty: "menengah",
    reasoningType: "penerapan",
    stimulus:
      "Tabel olahraga kegemaran siswa Kelas 5:\nSepak bola — 12 siswa\nBulu tangkis — 9 siswa\nRenang — 7 siswa\nBasket — 4 siswa",
    questionText:
      "Selisih banyak siswa yang menggemari sepak bola dan renang adalah ....",
    options: [
      { key: "A", text: "3 siswa" },
      { key: "B", text: "5 siswa" },
      { key: "C", text: "7 siswa" },
      { key: "D", text: "19 siswa" },
    ],
    correctAnswer: "B",
    explanation: "Selisihnya adalah 12 − 7 = 5 siswa.",
  },

  // ==========================================================
  // TRYOUT — Rata-rata (t24–t25)
  // ==========================================================
  {
    id: "t24",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-rata-rata",
    conceptId: "c-rata-rata-hitung",
    competency: "Menghitung rata-rata sekumpulan data",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Rata-rata dari data 7, 8, 9, 6, dan 5 adalah ....",
    options: [
      { key: "A", text: "6" },
      { key: "B", text: "7" },
      { key: "C", text: "8" },
      { key: "D", text: "35", misconceptionId: "m-rata-rata-tanpa-bagi" },
    ],
    correctAnswer: "B",
    explanation:
      "Jumlah seluruh data adalah 7 + 8 + 9 + 6 + 5 = 35. Banyak data ada 5, sehingga rata-ratanya 35 : 5 = 7.",
  },
  {
    id: "t25",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-rata-rata",
    conceptId: "c-rata-rata-terapan",
    competency: "Menentukan data yang belum diketahui dari rata-rata",
    difficulty: "menengah",
    reasoningType: "penalaran",
    questionText:
      "Rata-rata empat nilai ulangan Dita adalah 80. Tiga nilai yang sudah diketahui adalah 75, 85, dan 80. Nilai ulangan Dita yang keempat adalah ....",
    options: [
      { key: "A", text: "75" },
      { key: "B", text: "78" },
      { key: "C", text: "80" },
      { key: "D", text: "85" },
    ],
    correctAnswer: "C",
    explanation:
      "Jumlah keempat nilai = 4 × 80 = 320. Jumlah tiga nilai yang diketahui = 75 + 85 + 80 = 240. Nilai keempat = 320 − 240 = 80.",
  },

  // ==========================================================
  // LATIHAN — Paket Pecahan Senilai (p-ps-1 … p-ps-6)
  // ==========================================================
  {
    id: "p-ps-1",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-mengenali",
    competency: "Mengenali pecahan senilai dari gambar",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    stimulus:
      "Sebuah persegi dibagi menjadi 6 bagian sama besar, 4 bagian diarsir.",
    questionText: "Bagian yang diarsir senilai dengan pecahan ....",
    options: [
      { key: "A", text: "2/3" },
      { key: "B", text: "3/5", misconceptionId: "m-senilai-tambah" },
      { key: "C", text: "1/2" },
      { key: "D", text: "4/10" },
    ],
    correctAnswer: "A",
    explanation:
      "Bagian yang diarsir adalah 4/6. Pembilang dan penyebut dibagi 2 sehingga menjadi 2/3.",
  },
  {
    id: "p-ps-2",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-menentukan",
    competency: "Menentukan pembilang yang belum diketahui",
    difficulty: "dasar",
    reasoningType: "penerapan",
    questionText: "Nilai n pada 2/7 = n/28 adalah ....",
    options: [
      { key: "A", text: "8" },
      { key: "B", text: "14" },
      { key: "C", text: "23", misconceptionId: "m-senilai-tambah" },
      { key: "D", text: "56" },
    ],
    correctAnswer: "A",
    explanation: "Penyebut 7 menjadi 28 berarti dikalikan 4, sehingga n = 2 × 4 = 8.",
  },
  {
    id: "p-ps-3",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-menentukan",
    competency: "Menentukan penyebut yang belum diketahui",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText: "Nilai n pada 15/n = 3/4 adalah ....",
    options: [
      { key: "A", text: "16" },
      { key: "B", text: "20" },
      { key: "C", text: "45" },
      { key: "D", text: "60" },
    ],
    correctAnswer: "B",
    explanation:
      "Pembilang 3 menjadi 15 berarti dikalikan 5, sehingga penyebutnya juga dikalikan 5: n = 4 × 5 = 20.",
  },
  {
    id: "p-ps-4",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-mengenali",
    competency: "Menyederhanakan pecahan",
    difficulty: "menengah",
    reasoningType: "pemahaman",
    questionText: "Bentuk paling sederhana dari 18/24 adalah ....",
    options: [
      { key: "A", text: "9/12" },
      { key: "B", text: "6/8" },
      { key: "C", text: "3/4" },
      { key: "D", text: "2/3" },
    ],
    correctAnswer: "C",
    explanation:
      "FPB dari 18 dan 24 adalah 6. Setelah pembilang dan penyebut dibagi 6, hasilnya 3/4.",
  },
  {
    id: "p-ps-5",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-menentukan",
    competency: "Menerapkan pecahan senilai pada situasi nyata",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText:
      "Dari 30 siswa di kelas, 18 siswa membawa bekal. Bagian siswa yang membawa bekal senilai dengan ....",
    options: [
      { key: "A", text: "3/5" },
      { key: "B", text: "2/3" },
      { key: "C", text: "1/2" },
      { key: "D", text: "18/12" },
    ],
    correctAnswer: "A",
    explanation: "18/30 dibagi 6 pada pembilang dan penyebut menghasilkan 3/5.",
  },
  {
    id: "p-ps-6",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-menentukan",
    competency: "Menilai pernyataan tentang pecahan senilai",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText:
      "Pernyataan yang benar tentang cara membuat pecahan senilai adalah ....",
    options: [
      {
        key: "A",
        text: "Pembilang dan penyebut dikalikan dengan bilangan yang sama, selain nol",
      },
      {
        key: "B",
        text: "Pembilang dan penyebut ditambah dengan bilangan yang sama",
        misconceptionId: "m-senilai-tambah",
      },
      { key: "C", text: "Hanya pembilang yang dikalikan" },
      { key: "D", text: "Pembilang dikalikan dan penyebut dibagi" },
    ],
    correctAnswer: "A",
    explanation:
      "Nilai pecahan tetap bila pembilang dan penyebut dikalikan atau dibagi dengan bilangan sama yang bukan nol. Menambah bilangan yang sama akan mengubah nilainya.",
  },

  // ==========================================================
  // LATIHAN — Paket Perbandingan Pecahan (p-pp-1 … p-pp-6)
  // ==========================================================
  {
    id: "p-pp-1",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-sama",
    competency: "Membandingkan pecahan berpenyebut sama",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Tanda yang tepat untuk 3/8 ... 5/8 adalah ....",
    options: [
      { key: "A", text: "lebih kecil dari" },
      { key: "B", text: "lebih besar dari" },
      { key: "C", text: "sama dengan" },
      { key: "D", text: "tidak dapat ditentukan" },
    ],
    correctAnswer: "A",
    explanation: "Penyebutnya sama, dan 3 lebih kecil dari 5, sehingga 3/8 lebih kecil dari 5/8.",
  },
  {
    id: "p-pp-2",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-beda",
    competency: "Membandingkan pecahan berpembilang sama",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Pecahan terkecil di antara 1/4, 1/6, dan 1/3 adalah ....",
    options: [
      { key: "A", text: "1/6" },
      { key: "B", text: "1/4" },
      { key: "C", text: "1/3", misconceptionId: "m-penyebut-besar" },
      { key: "D", text: "ketiganya sama" },
    ],
    correctAnswer: "A",
    explanation:
      "Bila pembilangnya sama, semakin besar penyebut semakin kecil nilainya. Jadi 1/6 paling kecil.",
  },
  {
    id: "p-pp-3",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-beda",
    competency: "Membandingkan pecahan berpenyebut berbeda",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText: "Pecahan yang lebih besar antara 5/8 dan 2/3 adalah ....",
    options: [
      { key: "A", text: "2/3" },
      { key: "B", text: "5/8", misconceptionId: "m-pembilang-saja" },
      { key: "C", text: "keduanya sama besar" },
      { key: "D", text: "tidak dapat ditentukan" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebutnya menjadi 24: 5/8 = 15/24 dan 2/3 = 16/24. Karena 16/24 lebih besar, maka 2/3 lebih besar.",
  },
  {
    id: "p-pp-4",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-beda",
    competency: "Membandingkan pecahan pada situasi nyata",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText:
      "Andi menghabiskan 2/5 bagian air di botolnya, sedangkan Budi menghabiskan 1/2 bagian air di botol yang sama besar. Siswa yang menghabiskan lebih banyak air adalah ....",
    options: [
      { key: "A", text: "Budi" },
      { key: "B", text: "Andi", misconceptionId: "m-penyebut-besar" },
      { key: "C", text: "keduanya sama banyak" },
      { key: "D", text: "tidak dapat dibandingkan" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebutnya menjadi 10: 2/5 = 4/10 dan 1/2 = 5/10. Jadi Budi menghabiskan lebih banyak.",
  },
  {
    id: "p-pp-5",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-beda",
    competency: "Mengurutkan pecahan",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText: "Urutan pecahan 3/4, 2/3, dan 5/6 dari yang terbesar adalah ....",
    options: [
      { key: "A", text: "5/6, 3/4, 2/3" },
      { key: "B", text: "2/3, 3/4, 5/6" },
      { key: "C", text: "3/4, 5/6, 2/3" },
      { key: "D", text: "5/6, 2/3, 3/4", misconceptionId: "m-penyebut-besar" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebutnya menjadi 12: 3/4 = 9/12, 2/3 = 8/12, 5/6 = 10/12. Urutan dari terbesar adalah 10/12, 9/12, 8/12 atau 5/6, 3/4, 2/3.",
  },
  {
    id: "p-pp-6",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-perbandingan-pecahan",
    conceptId: "c-banding-penyebut-beda",
    competency: "Menentukan pecahan di antara dua pecahan",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText: "Pecahan yang nilainya terletak antara 1/2 dan 3/4 adalah ....",
    options: [
      { key: "A", text: "5/8" },
      { key: "B", text: "3/8" },
      { key: "C", text: "7/8" },
      { key: "D", text: "1/4" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebutnya menjadi 8: 1/2 = 4/8 dan 3/4 = 6/8. Pecahan di antaranya adalah 5/8.",
  },

  // ==========================================================
  // LATIHAN — Paket Operasi Pecahan (p-op-1 … p-op-6)
  // ==========================================================
  {
    id: "p-op-1",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-jumlah-kurang",
    competency: "Mengurangkan pecahan berpenyebut sama",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Hasil dari 7/9 − 2/9 adalah ....",
    options: [
      { key: "A", text: "5/9" },
      { key: "B", text: "5/7", misconceptionId: "m-jumlah-penyebut" },
      { key: "C", text: "9/9" },
      { key: "D", text: "5/18" },
    ],
    correctAnswer: "A",
    explanation:
      "Penyebutnya sama, jadi cukup pembilangnya yang dikurangkan: 7 − 2 = 5, hasilnya 5/9. Penyebut tidak ikut dikurangkan.",
  },
  {
    id: "p-op-2",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-jumlah-kurang",
    competency: "Menjumlahkan pecahan berpenyebut berbeda",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText: "Hasil dari 2/5 + 1/4 adalah ....",
    options: [
      { key: "A", text: "13/20" },
      { key: "B", text: "3/9", misconceptionId: "m-jumlah-penyebut" },
      { key: "C", text: "3/20" },
      { key: "D", text: "8/20" },
    ],
    correctAnswer: "A",
    explanation:
      "KPK dari 5 dan 4 adalah 20. Maka 2/5 = 8/20 dan 1/4 = 5/20, sehingga hasilnya 13/20.",
  },
  {
    id: "p-op-3",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-jumlah-kurang",
    competency: "Mengurangkan pecahan berpenyebut berbeda",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText: "Hasil dari 5/6 − 1/3 adalah ....",
    options: [
      { key: "A", text: "1/2" },
      { key: "B", text: "4/3", misconceptionId: "m-jumlah-penyebut" },
      { key: "C", text: "4/6" },
      { key: "D", text: "1/3" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebut menjadi 6: 1/3 = 2/6. Maka 5/6 − 2/6 = 3/6 yang disederhanakan menjadi 1/2.",
  },
  {
    id: "p-op-4",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-kali-bagi",
    competency: "Mengalikan pecahan dengan bilangan bulat",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText: "Hasil dari 3/4 × 8 adalah ....",
    options: [
      { key: "A", text: "6" },
      { key: "B", text: "24" },
      { key: "C", text: "11/4" },
      { key: "D", text: "3/32" },
    ],
    correctAnswer: "A",
    explanation: "3/4 × 8 = (3 × 8) : 4 = 24 : 4 = 6.",
  },
  {
    id: "p-op-5",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-kali-bagi",
    competency: "Membagi pecahan",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText: "Hasil dari 3/4 : 1/2 adalah ....",
    options: [
      { key: "A", text: "3/2" },
      { key: "B", text: "3/8" },
      { key: "C", text: "2/3" },
      { key: "D", text: "3/6" },
    ],
    correctAnswer: "A",
    explanation:
      "Membagi dengan 1/2 sama dengan mengalikan dengan 2/1, sehingga 3/4 × 2/1 = 6/4 = 3/2.",
  },
  {
    id: "p-op-6",
    type: "single",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-jumlah-kurang",
    competency: "Menyelesaikan soal cerita operasi pecahan",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText:
      "Seorang pedagang memiliki 5/6 kuintal beras. Sebanyak 1/3 kuintal terjual pagi hari dan 1/4 kuintal terjual sore hari. Sisa beras pedagang tersebut adalah ....",
    options: [
      { key: "A", text: "1/4 kuintal" },
      { key: "B", text: "3/12 kuintal" },
      { key: "C", text: "1/3 kuintal" },
      { key: "D", text: "7/12 kuintal" },
    ],
    correctAnswer: "A",
    explanation:
      "Samakan penyebut menjadi 12: 5/6 = 10/12, 1/3 = 4/12, 1/4 = 3/12. Sisa = 10/12 − 4/12 − 3/12 = 3/12 = 1/4 kuintal. Pilihan 3/12 benar nilainya tetapi belum disederhanakan.",
  },

  // ==========================================================
  // LATIHAN — Paket Keliling dan Luas (p-kl-1 … p-kl-6)
  // ==========================================================
  {
    id: "p-kl-1",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-keliling-persegi-panjang",
    competency: "Menghitung keliling persegi",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Keliling persegi dengan panjang sisi 9 cm adalah ....",
    options: [
      { key: "A", text: "36 cm" },
      { key: "B", text: "18 cm" },
      { key: "C", text: "81 cm", misconceptionId: "m-keliling-luas-tertukar" },
      { key: "D", text: "27 cm" },
    ],
    correctAnswer: "A",
    explanation: "Keliling persegi = 4 × sisi = 4 × 9 = 36 cm.",
  },
  {
    id: "p-kl-2",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-keliling-persegi-panjang",
    competency: "Menghitung luas persegi panjang",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    questionText: "Luas persegi panjang dengan panjang 14 cm dan lebar 6 cm adalah ....",
    options: [
      { key: "A", text: "84 cm persegi" },
      { key: "B", text: "40 cm persegi", misconceptionId: "m-keliling-luas-tertukar" },
      { key: "C", text: "20 cm persegi" },
      { key: "D", text: "42 cm persegi" },
    ],
    correctAnswer: "A",
    explanation: "Luas persegi panjang = panjang × lebar = 14 × 6 = 84 cm persegi. Hasil 40 adalah kelilingnya.",
  },
  {
    id: "p-kl-3",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-luas-segitiga",
    competency: "Menghitung luas segitiga",
    difficulty: "menengah",
    reasoningType: "penerapan",
    questionText: "Luas segitiga dengan alas 16 cm dan tinggi 9 cm adalah ....",
    options: [
      { key: "A", text: "72 cm persegi" },
      { key: "B", text: "144 cm persegi", misconceptionId: "m-luas-segitiga-tanpa-setengah" },
      { key: "C", text: "25 cm persegi" },
      { key: "D", text: "50 cm persegi" },
    ],
    correctAnswer: "A",
    explanation: "Luas segitiga = (16 × 9) : 2 = 144 : 2 = 72 cm persegi.",
  },
  {
    id: "p-kl-4",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-luas-segitiga",
    competency: "Menentukan tinggi segitiga dari luasnya",
    difficulty: "menengah",
    reasoningType: "penalaran",
    questionText: "Sebuah segitiga memiliki luas 48 cm persegi dan alas 12 cm. Tinggi segitiga tersebut adalah ....",
    options: [
      { key: "A", text: "8 cm" },
      { key: "B", text: "4 cm", misconceptionId: "m-luas-segitiga-tanpa-setengah" },
      { key: "C", text: "6 cm" },
      { key: "D", text: "16 cm" },
    ],
    correctAnswer: "A",
    explanation:
      "Dari luas = (alas × tinggi) : 2 diperoleh alas × tinggi = 2 × 48 = 96. Maka tinggi = 96 : 12 = 8 cm.",
  },
  {
    id: "p-kl-5",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-luas-gabungan",
    competency: "Menghitung luas bangun gabungan",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    stimulus:
      "Sebuah bangun tersusun dari persegi panjang berukuran 10 cm × 6 cm dan sebuah segitiga dengan alas 10 cm dan tinggi 4 cm yang menempel pada sisi atasnya.",
    questionText: "Luas seluruh bangun tersebut adalah ....",
    options: [
      { key: "A", text: "80 cm persegi" },
      { key: "B", text: "100 cm persegi", misconceptionId: "m-luas-segitiga-tanpa-setengah" },
      { key: "C", text: "60 cm persegi" },
      { key: "D", text: "70 cm persegi" },
    ],
    correctAnswer: "A",
    explanation:
      "Luas persegi panjang = 10 × 6 = 60 cm persegi. Luas segitiga = (10 × 4) : 2 = 20 cm persegi. Totalnya 60 + 20 = 80 cm persegi.",
  },
  {
    id: "p-kl-6",
    type: "single",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-keliling-luas",
    conceptId: "c-keliling-persegi-panjang",
    competency: "Menerapkan keliling dan luas pada situasi nyata",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText:
      "Sebuah lapangan berbentuk persegi panjang berukuran 30 m × 20 m. Rian berlari mengelilingi lapangan sebanyak 2 kali. Jarak yang ditempuh Rian adalah ....",
    options: [
      { key: "A", text: "200 m" },
      { key: "B", text: "100 m" },
      { key: "C", text: "600 m", misconceptionId: "m-keliling-luas-tertukar" },
      { key: "D", text: "1.200 m" },
    ],
    correctAnswer: "A",
    explanation:
      "Keliling lapangan = 2 × (30 + 20) = 100 m. Dua kali putaran = 2 × 100 = 200 m. Hasil 600 adalah luas lapangan.",
  },

  // ==========================================================
  // LATIHAN — Paket Membaca dan Menyajikan Data (p-md-1 … p-md-6) — GRATIS
  // ==========================================================
  {
    id: "p-md-1",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-penyajian-data",
    conceptId: "c-baca-tabel",
    competency: "Membaca tabel data",
    difficulty: "dasar",
    reasoningType: "pemahaman",
    stimulus:
      "Data banyak buku yang dipinjam siswa selama satu minggu:\nSenin — 15 buku\nSelasa — 12 buku\nRabu — 18 buku\nKamis — 9 buku\nJumat — 21 buku",
    questionText: "Hari dengan jumlah peminjaman buku paling sedikit adalah ....",
    options: [
      { key: "A", text: "Kamis" },
      { key: "B", text: "Selasa" },
      { key: "C", text: "Senin" },
      { key: "D", text: "Rabu" },
    ],
    correctAnswer: "A",
    explanation: "Jumlah terkecil pada data adalah 9 buku, yaitu hari Kamis.",
  },
  {
    id: "p-md-2",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-penyajian-data",
    conceptId: "c-baca-tabel",
    competency: "Menghitung total data",
    difficulty: "dasar",
    reasoningType: "penerapan",
    stimulus:
      "Data banyak buku yang dipinjam siswa selama satu minggu:\nSenin — 15 buku\nSelasa — 12 buku\nRabu — 18 buku\nKamis — 9 buku\nJumat — 21 buku",
    questionText: "Jumlah seluruh buku yang dipinjam selama satu minggu adalah ....",
    options: [
      { key: "A", text: "75 buku" },
      { key: "B", text: "65 buku" },
      { key: "C", text: "70 buku" },
      { key: "D", text: "80 buku" },
    ],
    correctAnswer: "A",
    explanation: "15 + 12 + 18 + 9 + 21 = 75 buku.",
  },
  {
    id: "p-md-3",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-penyajian-data",
    conceptId: "c-baca-diagram",
    competency: "Menafsirkan diagram batang",
    difficulty: "menengah",
    reasoningType: "penerapan",
    stimulus:
      "Diagram batang nilai ulangan Matematika:\nNilai 6 — 4 siswa\nNilai 7 — 8 siswa\nNilai 8 — 10 siswa\nNilai 9 — 5 siswa\nNilai 10 — 3 siswa",
    questionText: "Banyak siswa yang memperoleh nilai lebih dari 7 adalah ....",
    options: [
      { key: "A", text: "18 siswa" },
      { key: "B", text: "15 siswa" },
      { key: "C", text: "26 siswa" },
      { key: "D", text: "13 siswa" },
    ],
    correctAnswer: "A",
    explanation:
      "Nilai lebih dari 7 berarti nilai 8, 9, dan 10: 10 + 5 + 3 = 18 siswa. Nilai 7 tidak ikut dihitung.",
  },
  {
    id: "p-md-4",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-rata-rata",
    conceptId: "c-rata-rata-hitung",
    competency: "Menghitung rata-rata dari data",
    difficulty: "menengah",
    reasoningType: "penerapan",
    stimulus:
      "Data banyak buku yang dipinjam siswa selama satu minggu:\nSenin — 15 buku\nSelasa — 12 buku\nRabu — 18 buku\nKamis — 9 buku\nJumat — 21 buku",
    questionText: "Rata-rata banyak buku yang dipinjam per hari adalah ....",
    options: [
      { key: "A", text: "15 buku" },
      { key: "B", text: "12 buku" },
      { key: "C", text: "75 buku", misconceptionId: "m-rata-rata-tanpa-bagi" },
      { key: "D", text: "18 buku" },
    ],
    correctAnswer: "A",
    explanation: "Jumlah data 75 dibagi banyak hari 5 menghasilkan rata-rata 15 buku per hari.",
  },
  {
    id: "p-md-5",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-penyajian-data",
    conceptId: "c-baca-diagram",
    competency: "Membandingkan kategori pada data",
    difficulty: "menengah",
    reasoningType: "penalaran",
    stimulus:
      "Diagram batang nilai ulangan Matematika:\nNilai 6 — 4 siswa\nNilai 7 — 8 siswa\nNilai 8 — 10 siswa\nNilai 9 — 5 siswa\nNilai 10 — 3 siswa",
    questionText: "Pernyataan yang benar berdasarkan data tersebut adalah ....",
    options: [
      { key: "A", text: "Nilai yang paling banyak diperoleh siswa adalah 8" },
      { key: "B", text: "Semua siswa memperoleh nilai di atas 7" },
      { key: "C", text: "Banyak siswa yang memperoleh nilai 6 lebih banyak daripada nilai 9" },
      { key: "D", text: "Tidak ada siswa yang memperoleh nilai 10" },
    ],
    correctAnswer: "A",
    explanation:
      "Batang tertinggi adalah nilai 8 dengan 10 siswa. Pilihan lain bertentangan dengan data yang tersedia.",
  },
  {
    id: "p-md-6",
    type: "single",
    subjectId: S,
    topicId: "top-data",
    subtopicId: "st-rata-rata",
    conceptId: "c-rata-rata-terapan",
    competency: "Menggunakan rata-rata untuk menentukan data",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    questionText:
      "Rata-rata berat badan 5 anak adalah 32 kg. Setelah satu anak lain ikut ditimbang, rata-ratanya menjadi 33 kg. Berat badan anak yang baru ditimbang adalah ....",
    options: [
      { key: "A", text: "38 kg" },
      { key: "B", text: "33 kg" },
      { key: "C", text: "35 kg" },
      { key: "D", text: "40 kg" },
    ],
    correctAnswer: "A",
    explanation:
      "Jumlah berat 5 anak = 5 × 32 = 160 kg. Jumlah berat 6 anak = 6 × 33 = 198 kg. Berat anak yang baru = 198 − 160 = 38 kg.",
  },

  // ==========================================================
  // TRYOUT — Pilihan ganda kompleks (MCMA) dan kategori Benar/Salah
  // ==========================================================
  {
    id: "t26",
    type: "mcma",
    subjectId: S,
    topicId: "top-geometri",
    subtopicId: "st-satuan-pengukuran",
    conceptId: "c-konversi-satuan-berat",
    competency: "Mengubah dan membandingkan satuan berat pada situasi nyata",
    difficulty: "menengah",
    reasoningType: "penalaran",
    stimulus:
      "Setiap bulan Ramadan, SD Harapan mengadakan bakti sosial. Mereka membagi sembako yang berisi 3 kg beras, dua bungkus gula pasir dengan berat masing-masing kemasan 5 hg, dan lima bungkus mi instan dengan berat per bungkus 85 g.",
    questionText:
      "Pilihlah pernyataan yang benar sesuai dengan informasi tersebut!",
    options: [
      { key: "A", text: "Total berat semua isi paket adalah 4.425 gram." },
      {
        key: "B",
        text: "Berat mi instan dalam paket tersebut lebih dari 0,5 kilogram.",
        misconceptionId: "m-konversi-satuan",
      },
      { key: "C", text: "Satu kemasan gula pasir lebih berat dibandingkan seluruh mi instan." },
      {
        key: "D",
        text: "Berat beras dalam paket sama dengan 300 gram.",
        misconceptionId: "m-konversi-satuan",
      },
    ],
    correctAnswers: ["A", "C"],
    explanation:
      "Samakan seluruh satuan ke gram: beras 3 kg = 3.000 g, gula 2 × 5 hg = 2 × 500 g = 1.000 g, mi 5 × 85 g = 425 g. Totalnya 3.000 + 1.000 + 425 = 4.425 g, sehingga pernyataan A benar. Mi instan hanya 425 g atau 0,425 kg, jadi belum lebih dari 0,5 kg. Satu kemasan gula 500 g memang lebih berat daripada seluruh mi instan 425 g, sehingga pernyataan C benar. Beras 3 kg sama dengan 3.000 g, bukan 300 g.",
  },
  {
    id: "t27",
    type: "category",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-kali-bagi",
    competency: "Menerapkan operasi pecahan campuran pada soal cerita bertahap",
    difficulty: "lanjut",
    reasoningType: "penalaran",
    stimulus:
      "Pak Bondan seorang penjual susu kedelai. Suatu hari, Pak Bondan memproduksi susu kedelai sebanyak 7 wadah yang masing-masing berisi 6 1/4 liter susu kedelai. Seluruh hasil produksi tersebut akan dituangkan ke dalam 50 botol besar dengan isi yang sama banyak dan ke dalam 15 botol kecil dengan isi setiap botolnya adalah setengah botol besar.",
    questionText:
      "Tentukan Benar atau Salah untuk setiap pernyataan berikut tentang hasil produksi susu kedelai Pak Bondan!",
    categories: [
      { key: "benar", label: "Benar" },
      { key: "salah", label: "Salah" },
    ],
    statements: [
      {
        id: "s1",
        text: "Pada hari itu Pak Bondan memproduksi 43 3/4 liter susu kedelai.",
        correctCategoryKey: "benar",
      },
      {
        id: "s2",
        text: "Setiap botol besar diisi susu kedelai sebanyak 35/46 liter.",
        correctCategoryKey: "benar",
      },
      {
        id: "s3",
        text: "Total susu kedelai yang dikemas dalam botol kecil adalah 525/46 liter.",
        correctCategoryKey: "salah",
        misconceptionId: "m-jumlah-penyebut",
      },
    ],
    explanation:
      "Total produksi = 7 × 6 1/4 = 7 × 25/4 = 175/4 = 43 3/4 liter, sehingga pernyataan pertama benar. Misalkan isi satu botol besar adalah x liter, maka botol kecil berisi x/2 liter. Seluruh susu tertuang habis: 50x + 15 × (x/2) = 43 3/4, yaitu 57,5x = 175/4 sehingga x = 35/46 liter dan pernyataan kedua benar. Total pada botol kecil = 15 × (35/46 : 2) = 15 × 35/92 = 525/92 liter, bukan 525/46 liter, sehingga pernyataan ketiga salah.",
  },
  {
    id: "t28",
    type: "mcma",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-menentukan",
    competency: "Memilih beberapa pecahan yang senilai",
    difficulty: "menengah",
    reasoningType: "penalaran",
    questionText: "Pilihlah pecahan yang senilai dengan 3/4!",
    options: [
      { key: "A", text: "6/8" },
      { key: "B", text: "4/5", misconceptionId: "m-senilai-tambah" },
      { key: "C", text: "9/12" },
      { key: "D", text: "5/6", misconceptionId: "m-senilai-tambah" },
    ],
    correctAnswers: ["A", "C"],
    explanation:
      "3/4 dikalikan 2 pada pembilang dan penyebut menjadi 6/8, dan dikalikan 3 menjadi 9/12. Pilihan 4/5 dan 5/6 dibentuk dengan menambah bilangan yang sama pada pembilang dan penyebut, sehingga nilainya berubah.",
  },

  // ==========================================================
  // LATIHAN — contoh bentuk MCMA dan kategori pada paket
  // ==========================================================
  {
    id: "p-ps-7",
    type: "mcma",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-pecahan-senilai",
    conceptId: "c-senilai-mengenali",
    competency: "Memilih beberapa pecahan senilai dari sekumpulan pilihan",
    difficulty: "menengah",
    reasoningType: "penalaran",
    questionText: "Pilihlah pecahan yang senilai dengan 2/5!",
    options: [
      { key: "A", text: "4/10" },
      { key: "B", text: "3/6", misconceptionId: "m-senilai-tambah" },
      { key: "C", text: "6/15" },
      { key: "D", text: "8/20" },
    ],
    correctAnswers: ["A", "C", "D"],
    explanation:
      "2/5 dikalikan 2 menjadi 4/10, dikalikan 3 menjadi 6/15, dan dikalikan 4 menjadi 8/20. Pilihan 3/6 diperoleh dengan menambah 1 pada pembilang dan penyebut, sehingga nilainya menjadi 1/2.",
  },
  {
    id: "p-op-7",
    type: "category",
    subjectId: S,
    topicId: "top-bilangan",
    subtopicId: "st-operasi-pecahan",
    conceptId: "c-operasi-jumlah-kurang",
    competency: "Menilai kebenaran hasil operasi pecahan",
    difficulty: "menengah",
    reasoningType: "penalaran",
    questionText: "Tentukan Benar atau Salah untuk setiap pernyataan berikut!",
    categories: [
      { key: "benar", label: "Benar" },
      { key: "salah", label: "Salah" },
    ],
    statements: [
      { id: "s1", text: "1/4 + 1/2 = 3/4", correctCategoryKey: "benar" },
      {
        id: "s2",
        text: "2/3 + 1/6 = 3/9",
        correctCategoryKey: "salah",
        misconceptionId: "m-jumlah-penyebut",
      },
      { id: "s3", text: "5/8 − 1/4 = 3/8", correctCategoryKey: "benar" },
    ],
    explanation:
      "Pernyataan pertama benar karena 1/2 = 2/4, sehingga 1/4 + 2/4 = 3/4. Pernyataan kedua salah: 2/3 = 4/6, sehingga 4/6 + 1/6 = 5/6, bukan 3/9 yang diperoleh dari menjumlahkan pembilang dan penyebut sekaligus. Pernyataan ketiga benar karena 1/4 = 2/8, sehingga 5/8 − 2/8 = 3/8.",
  },
];
