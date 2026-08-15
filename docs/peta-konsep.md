# Peta Konsep dan Ketepatan Rekomendasi

Menjawab satu pertanyaan: apakah rekomendasi bisa menunjuk **konsep** yang harus
dipelajari, bukan sekadar materi?

Jawabannya: bisa, tetapi bukan peta konsep yang menentukan. Yang menentukan adalah
**berapa banyak bukti yang dikumpulkan tiap konsep**, dan itu masalah yang berbeda.

## 1. Keadaan sekarang

| Tabel | Isi |
| --- | --- |
| `subjects` | 3 |
| `topics` (capaian) | 25 |
| `subtopics` (materi) | 33 |
| `passages` | 13 |
| `questions` | 60 |
| `packages` | 3 |
| **`concepts`** | **0** |
| **`misconceptions`** | **0** |
| **`subtopic_prerequisites`** | **0** |
| **`concept_prerequisites`** | **0** |
| `vouchers` | 0 |

Metadata pada 60 soal yang sudah masuk:

| Kolom | Terisi |
| --- | --- |
| `topic_id` | 60/60 |
| `subtopic_id` | 40/60 |
| `competency` | 60/60 |
| **`concept_id`** | **0/60** |
| **`difficulty`** | **0/60** |
| **`reasoning_type`** | **0/60** |
| **`explanation`** | **0/60** |
| **penanda miskonsepsi pada pengecoh** | **0/60** |

Berkas sumbernya memang tidak memuat semua itu. Yang ada hanya rumusan kompetensi
dan subkompetensi sebagai teks bebas.

## 2. Peta konsep mengisi taksonomi, bukan penandaan soal

Ini pemisahan yang penting, karena keduanya sering dikira satu pekerjaan.

**Peta konsep mengisi tabel taksonomi** — `concepts`, `concept_prerequisites`,
`subtopic_prerequisites`, dan `misconceptions`. Sekali kerja per mata pelajaran,
dipakai selamanya.

**Menandai soal adalah pekerjaan terpisah** — menentukan soal nomor berapa menguji
konsep apa, tingkat kesulitannya, dan pengecoh mana menandakan salah paham yang mana.
Ini per soal, dan tidak bisa disimpulkan dari peta konsep. Untuk 60 soal sekarang
seluruhnya masih kosong.

Tanpa langkah kedua, tabel `concepts` terisi tetapi tidak ada satu pun soal yang
menunjuk ke sana — dan rekomendasinya tetap berhenti di tingkat materi.

## 3. Batas ketepatan yang perlu disadari lebih dulu

Ini bagian yang paling menentukan, dan tidak bisa diperbaiki oleh peta konsep
sebagus apa pun.

Dari 33 materi yang dipakai 60 soal, **28 materi hanya diuji oleh satu soal.**

Artinya, di tingkat materi pun buktinya sudah tipis. Turun satu tingkat lagi ke
konsep membuatnya lebih tipis: hampir setiap konsep akan diuji satu soal, sering
nol.

Satu soal salah **bukan bukti** bahwa sebuah konsep belum dikuasai. Bisa saja salah
baca, tergesa, atau keliru menghitung padahal konsepnya paham. Menyatakan "kamu
lemah pada konsep X" dari satu soal adalah klaim yang melampaui datanya, dan justru
menurunkan kepercayaan pada produk ketika sarannya terasa meleset.

Perlu diingat juga: pengerjaan siswa tidak disimpan di server, jadi tidak ada
riwayat lintas percobaan yang bisa dikumpulkan untuk memperkuat bukti. Yang tersedia
hanya satu paket yang baru saja dikerjakan.

## 4. Yang benar-benar membuat rekomendasi spesifik

Bukan menambah tingkat taksonomi, melainkan **menandai pengecoh**.

Bandingkan dua kalimat yang sama-sama berasal dari satu soal:

> Soal nomor 7 salah. Kamu perlu memperkuat Operasi Pecahan.

> Pada soal penjumlahan pecahan, kamu memilih jawaban yang diperoleh dengan
> menjumlahkan penyebutnya. Penyebut disamakan lebih dulu, bukan dijumlahkan.

Keduanya bersandar pada satu soal. Yang kedua jauh lebih tepat sasaran — bukan
karena taksonominya lebih dalam, tetapi karena **jawaban yang dipilih** memberi tahu
cara berpikirnya, bukan sekadar benar atau salah.

Inilah alasan `misconceptions` dan penanda `misconceptionId` pada tiap pengecoh
adalah pekerjaan berdampak paling besar. Mesin penilaiannya sudah siap: lihat
`misconceptionIdsFor()` di [`src/lib/answers.ts`](../src/lib/answers.ts), yang sudah
membaca penanda itu per pilihan, termasuk pada soal jawaban ganda dan kategori.
Yang belum ada hanya datanya.

## 5. Prasyarat: mengubah bukti tipis menjadi kesimpulan kuat

Cara kedua untuk mendapat ketepatan tanpa menambah soal.

Bila tiga konsep yang lemah semuanya bertumpu pada satu konsep dasar yang sama,
tiga bukti tipis itu menunjuk ke satu akar yang sama — dan kesimpulannya menjadi
jauh lebih kuat daripada masing-masing bukti sendirian.

Mesin ini juga sudah ada, `buildPrerequisiteAdvice()` di
[`src/lib/scoring.ts`](../src/lib/scoring.ts), tetapi baru bekerja di tingkat materi
dan tabel prasyaratnya masih kosong.

## 6. Bentuk peta konsep yang saya butuhkan

Satu berkas per mata pelajaran. Kolom bertanda **wajib** harus ada.

```jsonc
{
  "mapel": "matematika-sma",

  "capaian": [
    { "id": "cap-aljabar", "nama": "Aljabar" }               // wajib
  ],

  "materi": [
    { "id": "mat-splm", "capaian_id": "cap-aljabar",         // wajib
      "nama": "Sistem Persamaan Linear Multivariabel" }
  ],

  "konsep": [
    { "id": "kon-splm-eliminasi", "materi_id": "mat-splm",   // wajib
      "nama": "Eliminasi pada sistem tiga variabel",
      "deskripsi": "Menghilangkan satu variabel dengan menyamakan koefisien." }
  ],

  // Konsep apa yang harus dikuasai lebih dulu. Inilah yang membuat rekomendasi
  // bisa menunjuk akar masalah, bukan gejalanya.
  "prasyarat_konsep": [
    { "konsep_id": "kon-splm-eliminasi", "butuh": "kon-aljabar-operasi-suku" }
  ],

  // Alasan ditulis untuk dibaca siswa, jadi pakai bahasa yang wajar.
  "prasyarat_materi": [
    { "materi_id": "mat-splm", "butuh": "mat-persamaan-linear",
      "alasan": "Sistem tiga variabel diselesaikan dengan cara yang sama seperti dua variabel." }
  ],

  "miskonsepsi": [
    { "id": "mis-penyebut-dijumlah",
      "label": "Menjumlahkan penyebut",
      "deskripsi": "Catatan internal untuk tim konten.",
      "kalimat": "Pada penjumlahan pecahan, penyebut disamakan lebih dulu, bukan dijumlahkan." }
  ]
}
```

Dan penandaan per soal — ini bagian yang tidak bisa diturunkan dari peta konsep:

```jsonc
{
  "soal_id": "tka-matematika-sma-007",
  "konsep_id": "kon-splm-eliminasi",        // wajib untuk analisis konsep
  "tingkat_kesulitan": "menengah",
  "jenis_penalaran": "penerapan",
  "pengecoh": {                              // paling berdampak
    "B": "mis-penyebut-dijumlah",
    "D": "mis-tanda-terbalik"
  },
  "pembahasan": "<p>…</p>"
}
```

## 7. Urutan pengerjaan

1. **Peta konsep per mata pelajaran** — capaian, materi, konsep, prasyarat,
   miskonsepsi. Sekali kerja, dipakai seterusnya.
2. **Selaraskan taksonomi yang sudah ada.** `topics` dan `subtopics` sekarang
   dihasilkan otomatis dari teks kompetensi, dengan id buatan mesin seperti
   `top-matematika-sma-01`. Begitu peta konsep resmi ada, peta itu yang menjadi
   acuan dan soal dipetakan ulang ke id-nya.
3. **Tandai 60 soal** — konsep, kesulitan, penalaran, dan pengecoh. Ini yang paling
   memakan waktu dan menuntut penilaian guru; tidak bisa ditebak mesin.
4. **Isi pembahasan.** Sekalian, karena orang yang menandai pengecoh sudah harus
   memahami soalnya.
5. **Naikkan analisis ke tingkat konsep** — mengelompokkan hasil per konsep,
   menelusuri prasyarat, dan menyusun narasi dari miskonsepsi yang tersentuh.

Langkah 1 dan 3 dari Anda. Langkah 2 dan 5 dari saya. Langkah 4 bisa dibagi.

## 8. Saran menulis narasinya nanti

Agar tetap jujur pada kekuatan buktinya:

- **Bila ada miskonsepsi tersentuh:** sebut cara berpikirnya, bukan nomor soalnya.
  Ini bukti terkuat yang bisa didapat dari satu soal.
- **Bila beberapa konsep lemah bertemu di satu prasyarat:** sebut prasyarat itu
  sebagai titik mulai.
- **Bila hanya satu soal yang salah tanpa penanda apa pun:** sebut materinya, jangan
  konsepnya. Datanya belum cukup untuk sespesifik itu, dan menahan diri di sini
  justru menjaga kepercayaan pada saran-saran lain yang memang kuat.

Aturan ketiga itu yang membuat dua aturan pertama layak dipercaya.
