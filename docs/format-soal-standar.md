# Pemeriksaan Format JSON Soal

> **Pembaruan.** Tiga paket SMA (Matematika, Bahasa Indonesia, Bahasa Inggris)
> sudah dikonversi dan SQL-nya siap dijalankan. Ternyata ada **dua bentuk JSON
> yang berbeda**: berkas `paket_..._standar_final.json` memakai blok
> `paket`/`mapel`/`capaian`/`materi`, sementara ketiga berkas
> `soal_jawaban_*.json` memakai `sumber`/`format`/`bacaan`/`soal` tanpa taksonomi
> terpisah — kompetensi ditulis sebagai teks bebas pada tiap soal.
> [`scripts/import-package.mjs`](../scripts/import-package.mjs) menangani keduanya.
> Temuan tambahan dari ketiga berkas itu ada di bagian 8.

Berkas yang diperiksa: `paket_bahasa_inggris_standar_final.json` (20 soal), dibandingkan
dengan `soal-tka-matematika-sd-30-clean-final.json` (30 soal) yang sudah masuk aplikasi.

Dua catatan kecil lebih dulu: berkasnya **Bahasa Inggris**, bukan Bahasa Indonesia
(`mapel.id = "bahasa_inggris"`), dan **jenjangnya tidak tertulis di mana pun** dalam
JSON — SMA hanya disebut di luar berkas.

## Ringkasan

Strukturnya sudah jauh lebih baik daripada berkas SD: ada `bacaan` terpisah, ada
`capaian`/`materi`, dan kunci jawaban sudah terstruktur di `opsi[].benar`. Tapi
**belum bisa dipakai sebagai standar** karena tiga hal: kosakata tipe soal berbeda
dengan berkas SD, kategori pada soal PG Kategori tidak dideklarasikan, dan taksonomi
`capaian`/`materi` penuh duplikat yang akan merusak analisis prioritas belajar.

Urutan penanganannya: bagian 2 (taksonomi) paling mendesak karena menyangkut isi,
bagian 3 menyangkut bentuk berkas, bagian 4 bisa ditangani importer.

## 1. Yang sudah benar dan sebaiknya dipertahankan

- **`bacaan` sebagai entitas terpisah** dengan `digunakan_oleh_soal`. Ini benar. Satu
  teks dipakai 5 soal, dan menempelkannya ke tiap soal berarti menggandakannya 5 kali.
- **`opsi[].benar` dan `opsi[].jawaban` terstruktur.** Ini sumber kunci yang bisa
  dipercaya.
- **Pemisahan `text` dan `html`** pada bacaan dan soal.
- **`capaian_id` / `materi_id` per soal**, bukan teks yang diulang — walaupun isinya
  masih bermasalah (bagian 2).

## 2. Taksonomi duplikat — masalah paling merusak

Sepuluh `capaian` sebenarnya hanya **tiga capaian**:

| id | Isi |
| --- | --- |
| `capaian_001`, `capaian_005`, `capaian_009` | Pemahaman Tekstual |
| `capaian_002`, `capaian_003`, `capaian_004`, `capaian_006` | Pemahaman Inferensial |
| `capaian_007`, `capaian_008`, `capaian_010` | Evaluasi dan Apresiasi |

Pembedanya cuma titik di akhir kalimat, huruf besar/kecil pada "mampu", dan salah ketik:
`capaian_003` tertulis **"Pengalaman** inferensial" (seharusnya "Pemahaman"), dan
`capaian_008` terpotong di **"penggunaan bahasa oleh"** tanpa "penulis".

Hal yang sama terjadi pada `materi`: `materi_007` isinya persis sama dengan
`capaian_001`, dan `materi_008` sama dengan `capaian_002` — artinya soal 7 dan 8
sebenarnya tidak punya materi, hanya salinan capaiannya.

**Kenapa ini penting.** Mesin prioritas belajar mengelompokkan hasil per materi lalu
mencari yang paling lemah. Kalau satu capaian terpecah menjadi empat id, setiap
kelompok hanya berisi 1–3 soal, dan kalimat "mulai belajar dari X" jadi menunjuk
pecahan acak, bukan kelemahan yang sebenarnya. Dengan 20 soal terbagi ke 10 capaian
dan 20 materi, hampir setiap materi hanya punya **satu** soal — satu soal salah
langsung membuat materi itu 0% dan menjadi "prioritas utama".

**Yang perlu dilakukan:** susun daftar capaian dan materi yang baku sekali saja per
mata pelajaran, lalu soal merujuk ke id itu. Jangan biarkan capaian dibuat ulang per
soal — itu yang menghasilkan duplikat di atas.

## 3. Yang harus diubah pada format

### a. Satu kosakata untuk tipe soal

Sekarang ada tiga kosakata berbeda untuk hal yang sama:

| Berkas SD | Berkas ini (`tipe`) | Berkas ini (`tipe_sumber`) |
| --- | --- | --- |
| `Pilihan Ganda` | `PG` | `Pilihan Ganda (PG)` |
| `Pilihan Ganda Kompleks` | `PG MCMA` | `PGK MCMA` |
| `Benar/Salah Kompleks` | `PG Kategori` | `PGK Kategori` |

Importer harus menebak, dan tebakan itu akan salah begitu ada varian penulisan baru.
Pilih satu — saran saya `pg`, `mcma`, `kategori` — dan buang `tipe_sumber`.

Perhatikan juga: "Benar/Salah Kompleks" pada berkas SD dan "PG Kategori" pada berkas
ini **adalah tipe yang sama**. Benar/Salah hanyalah kategori yang kebetulan bernama
Benar dan Salah.

### b. Kategori wajib dideklarasikan, bukan disimpulkan

Pada soal PG Kategori, nama kategori hanya muncul di dalam `opsi[].jawaban`. Kalau
importer menyimpulkannya dari nilai yang muncul, **urutan kolomnya ikut nilai yang
kebetulan muncul lebih dulu** — dan pada berkas ini dua dari tiga soal jadi terbalik:

| Soal | Perintah menyebut | Urutan bila disimpulkan |
| --- | --- | --- |
| 6 | "preparation or breaks" | Breaks, Preparation ✗ |
| 11 | "Conservation or Relaxation" | Relaxation, Conservation ✗ |
| 3 | "similarity or a difference" | Similarity, Difference ✓ |

Selain itu, kategori yang tidak pernah menjadi jawaban benar akan **hilang sama sekali**
dari tampilan.

Berkas SD sudah benar di sini — ia punya blok `kategori: [{kode, isi}]` eksplisit.
Bawa itu ke format standar.

### c. `kunci_sumber` jangan dijadikan sumber kunci

Isinya teks bebas dengan bentuk yang berbeda-beda:

```
"B"                                             "A, B"        "A,D"
"A, C, D, E"                                    "A, B, dan E"
"Similarity A. Similarity B. Similarity C. Difference"
"Places: A. Relaxation B. Conservation C. Relaxation"
"Pernyataan 1, Pernyataan 3, dan Pernyataan 4"
```

Bentuk terakhir memakai nomor urut, sementara `jawaban_benar` memakai huruf. Tidak ada
yang bisa diandalkan di sini. Pakai `opsi[].benar` dan `opsi[].jawaban` sebagai kunci,
dan simpan `kunci_sumber` **hanya sebagai pembanding saat impor** — kalau tidak cocok,
tandai barisnya untuk diperiksa manusia. Jangan pernah diurai untuk menentukan jawaban.

### d. `jawaban_benar` menggandakan isi tanpa menambah informasi

Untuk soal PG, blok ini menyalin ulang seluruh objek opsi lengkap dengan `text`, `html`,
dan `images`. Padahal `opsi[].benar` sudah menyatakan hal yang sama. Ini kira-kira
melipatgandakan ukuran berkas tanpa guna. Cukup daftar kodenya, atau buang sekalian.

### e. Medan yang belum ada

| Belum ada | Kenapa perlu |
| --- | --- |
| `jenjang` | tidak ada cara tahu ini SMA dari berkasnya sendiri |
| `durasi_menit` | tryout tanpa durasi tidak bisa dijalankan |
| `tingkat_kesulitan` | ada di berkas SD, hilang di sini |
| `pembahasan` | belum ada di kedua berkas |
| `id` pada tiap soal | sekarang hanya `no`, tidak unik antarpaket |

`pembahasan` yang paling terasa: pada produk berbayar, pembahasan justru bagian yang
paling layak dibayar. Sekarang halaman pembahasan menampilkan "belum tersedia".

## 4. Yang bisa ditangani importer (tidak perlu ubah format)

- **HTML kotor.** `opsi[].html` mengandung sisa ekspor: `<label class="form-check-label"
  for="soal_403_opsi_1">`, `<td class="text-left" style="...">`, dan `<!--?xml
  encoding="utf-8" ?-->` yang berulang sampai tujuh kali dalam satu opsi. Penyaring HTML
  di aplikasi sudah membuang tag di luar daftar izin; penanganan komentar baru saja
  ditambahkan ke [`RichText.tsx`](../src/components/RichText.tsx).

  Catatan: **jangan pakai `text` sebagai gantinya.** Pada soal 1, opsi berupa kerangka
  enam baris; `text` menggabungkannya menjadi satu kalimat panjang, padahal yang diuji
  justru bentuk kerangkanya. Yang benar adalah membersihkan `html`, bukan menurunkannya
  ke teks polos.

- **Mojibake.** `â` muncul di tempat tanda kutip tunggal (`parkâs`, `Baliâs`,
  `wasnât`, `teenagersâ`), dan `Â ` di tempat spasi tak terpisah — pada soal 11 bahkan
  di antara setiap kata: `What Â is Â the Â main Â purpose`. Perlu dinormalkan saat
  impor. Periksa dulu berkas aslinya: pada berkas SD gejala serupa ternyata hanya
  artefak tampilan, dan isinya sebenarnya UTF-8 yang bersih.

- **Gambar memakai jalur relatif** `/tka/cbt_images/...`, sedangkan berkas SD memakai
  URL lengkap. Importer perlu base URL agar bisa mengunduh. Gambar tetap disalin ke
  `public/soal/` seperti sekarang, tidak ke Supabase Storage
  (lihat [rancangan Supabase](supabase-migration.md), bagian 2b).

## 5. Satu kekeliruan isi yang perlu diperbaiki di sumber

`bacaan_02`, `bacaan_03`, dan `bacaan_04` sebenarnya **satu bacaan yang terpecah tiga**:

| id | Label | Dipakai soal | Gambar |
| --- | --- | --- | --- |
| `bacaan_02` | Teks untuk soal nomor 6 s.d. 10! | 6 | `04907_553dcd…png` |
| `bacaan_03` | Teks untuk soal nomor 6 s.d. 10! | 7 | `91591_553dcd…png` |
| `bacaan_04` | Teks untuk soal nomor 6 s.d. 10! | 8, 9, 10 | `92769_553dcd…png` |

Labelnya sama persis, dan ketiga gambar punya hash yang sama
(`553dcd423e6da03fc4942ea98fcb90d4`) hanya berbeda awalan angka — jadi memang gambar
yang sama diunggah tiga kali. Kalau dibiarkan, satu infografik yang sama diunduh dan
disimpan tiga kali, dan tampilannya seolah-olah tiga bacaan berbeda.

Sekalian: soal 9 punya empat jawaban benar dari lima pilihan (hanya B yang salah). Soal
semacam ini praktis meminta siswa mencari satu yang salah, dan dengan penilaian utuh
tanpa nilai sebagian, bobotnya jadi berat sebelah. Layak ditinjau tim konten.

## 6. Format standar yang saya usulkan

Menggabungkan kedua berkas, dengan perbaikan di atas:

```jsonc
{
  "paket": {
    "id": "tka-bing-sma-01",
    "tipe": "tryout",                    // "tryout" | "latihan"
    "judul": "Tryout TKA Bahasa Inggris",
    "jenjang": "SMA",                    // WAJIB — belum ada
    "mapel": { "id": "bahasa-inggris", "nama": "Bahasa Inggris SMA",
               "nama_pendek": "Bahasa Inggris" },
    "durasi_menit": 90                   // WAJIB untuk tryout — belum ada
  },

  // Disusun sekali per mapel, bukan dibuat ulang tiap paket.
  "taksonomi": {
    "capaian": [{ "id": "cap-tekstual", "nama": "Pemahaman Tekstual" }],
    "materi":  [{ "id": "mat-kerangka", "capaian_id": "cap-tekstual",
                  "nama": "Membuat kerangka" }]
  },

  "bacaan": [{
    "id": "bacaan-01",
    "label": "Teks untuk soal nomor 1 s.d. 5",
    "html": "<p>King Hung Vuong VI had…</p>",
    "gambar": [{ "src": "…", "alt": "", "width": 362, "height": 543 }]
  }],

  "soal": [{
    "id": "bing-sma-01-001",             // WAJIB, unik lintas paket
    "no": 1,
    "bacaan_id": "bacaan-01",            // null bila tidak memakai bacaan
    "tipe": "pg",                        // "pg" | "mcma" | "kategori"
    "tingkat_kesulitan": "sedang",
    "capaian_id": "cap-tekstual",
    "materi_id": "mat-kerangka",
    "pertanyaan_html": "<p>Which of the following outlines…</p>",

    // Hanya untuk tipe "kategori" — WAJIB, urutannya menentukan urutan kolom.
    "kategori": [{ "kode": "S", "label": "Similarity" },
                 { "kode": "D", "label": "Difference" }],

    "opsi": [
      // pg   : tepat satu "benar": true
      // mcma : minimal dua "benar": true
      // kategori: pakai "kategori_kode", bukan "benar"
      { "kode": "A", "html": "<p>…</p>", "benar": false }
    ],

    "pembahasan_html": "<p>…</p>"        // boleh kosong, tapi sebaiknya diisi
  }]
}
```

Aturan yang membuat berkas ini bisa divalidasi otomatis sebelum diimpor:

1. setiap `capaian_id`, `materi_id`, dan `bacaan_id` harus ada di daftarnya
2. `pg` tepat satu jawaban benar; `mcma` minimal dua; `kategori` setiap opsi punya
   `kategori_kode` yang terdaftar di `kategori`
3. `id` soal unik di seluruh bank soal
4. tidak ada dua `capaian` atau `materi` dengan nama yang sama setelah dinormalkan
   (huruf kecil, tanpa tanda baca ujung) — inilah yang menangkap masalah bagian 2

## 7. Dampak ke skema Supabase

Satu penambahan sudah saya masukkan ke
[`0001_content.sql`](../supabase/migrations/0001_content.sql): tabel **`passages`**
beserta kolom `questions.passage_id`. Sebelumnya bacaan menumpang di kolom `stimulus`
milik masing-masing soal, yang berarti teks 300 kata digandakan sebanyak soal yang
memakainya.

Pemetaan istilah:

| Format soal | Skema Supabase |
| --- | --- |
| `mapel` | `subjects` |
| `capaian` | `topics` |
| `materi` | `subtopics` |
| `submateri` | `concepts` |
| `bacaan` | `passages` |
| `soal` | `questions` |
| `paket` (tipe tryout) | `tryouts` + `tryout_questions` |
| `paket` (tipe latihan) | `practice_packages` + `package_questions` |

Karena `submateri` kosong pada berkas ini sementara `questions.concept_id` wajib diisi,
ada dua pilihan: buat satu konsep bayangan per materi, atau longgarkan `concept_id`
menjadi opsional. Saya menyarankan yang kedua — konsep bayangan hanya menambah baris
yang tidak berarti apa-apa bagi siapa pun.


## 8. Temuan dari ketiga paket SMA

| | Matematika | Bahasa Indonesia | Bahasa Inggris |
| --- | --- | --- | --- |
| Soal | 20 | 20 | 20 |
| Capaian unik | **19** | 4 | 10 |
| Materi terisi | **2 dari 20** | 20 dari 20 | 20 dari 20 |
| Bacaan | 0 | 6 | 7 |
| Gambar | 43 | 5 | 3 |

Tidak ada satu pun soal yang melanggar batasan bentuk jawaban — seluruh 60 soal
diterima skema apa adanya.

**Matematika hampir tidak punya materi.** 18 dari 20 soal `subkompetensi`-nya
kosong, dan dua yang terisi pun tidak berguna: satu berisi `"Pengetahuan dan
Pemahaman"` (itu level kognitif, bukan materi) dan satu lagi potongan kalimat
kompetensinya sendiri. Karena itu `questions.subtopic_id` dibuat boleh kosong.

**Kompetensi Matematika sebenarnya rapi.** Semuanya berpola
`"Memahami, mengaplikasikan, dan bernalar ... terkait <materi>"`, jadi nama materi
yang layak ditampilkan bisa diambil dari bagian setelah kata "terkait" — itulah yang
dilakukan importer. Hasilnya: 19 capaian untuk 20 soal, artinya praktis satu materi
per soal. Analisis "prioritas belajar" tetap berjalan, tapi hasilnya dangkal: materi
terlemah = materi yang kebetulan salah. Ini batas dari isinya, bukan dari kodenya.

**Bahasa Indonesia paling sehat**: 4 capaian dan 12 materi untuk 20 soal — inilah
bentuk taksonomi yang membuat analisis prioritas bermakna.

**Kategori memang tidak selalu Benar/Salah.** Bahasa Indonesia memakai tiga pasang
berbeda: Benar/Salah, Setuju/Tidak Setuju, dan Tepat/Tidak Tepat. Ini menegaskan
bagian 3b: kategori harus dideklarasikan per soal, tidak boleh diasumsikan.

**Urutan kategori memang terbalik pada empat soal**, dan importer membetulkannya
dengan membaca urutan penyebutan di dalam pertanyaan. Satu jebakan yang sempat
menipu: pencocokan biasa membuat kata "salah" ikut cocok di dalam
**"perma-salah-an"**, sehingga urutan justru dibalik keliru. Pencocokannya kini
memakai batas kata.
