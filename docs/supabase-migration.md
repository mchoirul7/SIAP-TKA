# Rancangan Pemindahan Konten ke Supabase

Proyek: `dscjpbjevotvycbnzcjd`

## 1. Garis pemisah

Satu aturan yang menentukan seluruh rancangan ini:

> **Supabase menyimpan bahan ajar. Perangkat pengguna menyimpan pengerjaan.**

| Pindah ke Supabase | Tetap di perangkat |
| --- | --- |
| Mata pelajaran, topik, subtopik, konsep | Nama dan kelas |
| Soal beserta pilihan, pernyataan, dan kuncinya | Jawaban simulasi dan latihan |
| Tryout dan urutan soalnya | Timer, tanda ragu-ragu, penghitung integritas |
| Paket latihan dan urutan soalnya | Skor dan hasil analisis |
| Miskonsepsi dan prasyarat antarmateri | Jenjang yang dipilih |
| Kode voucher dan paket yang dibukanya | Paket yang sudah terbuka (entitlement) |

Tidak ada satu pun tabel yang menyimpan baris per pengguna. Tidak ada `user_id`
di mana pun dalam skema. Ini bukan sekadar akibat belum ada autentikasi — ini
keputusan produk yang sudah tertulis di README dan tetap berlaku setelah backend
masuk.

Konsekuensi yang perlu disadari: karena entitlement disimpan di perangkat, orang
yang paham teknis bisa memalsukannya lewat `localStorage`. Menutup celah itu
menuntut akun pengguna dan tabel entitlement per pengguna — yang justru
bertentangan dengan aturan di atas. Untuk sekarang ini pertukaran yang disengaja.

## 2. Soal batas Supabase

Ukuran konten sama sekali bukan masalah. Yang perlu dijaga adalah **egress** dan
**project pausing**.

**Volume konten saat ini**

| | Ukuran |
| --- | --- |
| SQL 3 paket SMA + 1 paket SD (110 soal) | 266 KB |
| Perkiraan di Postgres beserta indeks | di bawah 1 MB |
| Gambar soal (`public/soal`, 89 berkas) | 5,6 MB |

Terhadap kuota basis data paket gratis (sekitar 500 MB), konten ini memakai
kurang dari 0,2%. Bank soal boleh tumbuh puluhan kali lipat sebelum ukurannya
terasa. Angka kuota Supabase berubah dari waktu ke waktu — konfirmasi ulang di
dashboard sebelum mengambil keputusan berdasarkan angka di atas.

**Dua keputusan yang membuat batas itu tidak mengikat:**

### a. Baca saat build, bukan saat pengguna membuka halaman

Seluruh halaman aplikasi ini sudah statis (SSG). Kalau Supabase dibaca di server
component dan `generateStaticParams` **saat `next build`**, maka:

- egress Supabase saat runtime ≈ **nol**, berapa pun jumlah pengunjung
- halaman tetap secepat sekarang karena disajikan dari CDN Vercel
- Supabase tidak pernah menjadi titik gagal saat pengguna sedang ujian

Konsekuensinya: **mengubah soal berarti build ulang**. Untuk bank soal yang
berubah mingguan ini wajar. Bila nanti ingin berubah tanpa deploy, tambahkan
`revalidate` pada fetch-nya lalu picu lewat Supabase Database Webhook — tapi
jangan lakukan sebelum benar-benar dibutuhkan, karena itu memindahkan biaya ke
egress runtime.

### b. Gambar soal tetap di `public/`, jangan ke Supabase Storage

Ini keputusan yang paling menentukan, dan bobotnya naik setelah paket SMA masuk:
gambar soal kini **5,6 MB** untuk 89 berkas — paket Matematika SMA saja menyumbang
43 gambar karena hampir semua rumusnya berupa gambar.

Kalau dipindah ke Supabase Storage, satu sesi ujian Matematika menarik sekitar
1,5 MB dari kuota egress. Dengan kuota sekitar 5 GB/bulan, langit-langitnya ada di
kisaran **3.000 sesi per bulan**, dan ikut turun setiap kali bank soal bertambah.

Dibiarkan di `public/`, gambar disajikan CDN Vercel, tidak menyentuh kuota
Supabase sama sekali, dan ikut terversi bersama kode. Gambar soal adalah aset
statis yang jarang berubah; tidak ada alasan menaruhnya di object storage.

Yang disimpan di basis data cukup **nama berkasnya**, bukan berkasnya.

### c. Risiko yang tersisa: proyek gratis berhenti sendiri

Proyek Supabase gratis dijeda setelah kira-kira seminggu tanpa aktivitas. Karena
rancangan ini hanya menyentuh Supabase saat build, proyek bisa saja tertidur lalu
**build berikutnya gagal**. Tiga pilihan:

1. jadwalkan ping ringan (satu `select 1` per beberapa hari) lewat cron
2. terima saja dan bangunkan manual sebelum deploy
3. naikkan paket bila proyek sudah dipakai sungguhan

Pilihan 1 paling murah dan tidak menambah beban egress berarti.

## 3. Skema

Ada di [`supabase/migrations/0001_content.sql`](../supabase/migrations/0001_content.sql).

**Taksonomi** — `subjects` → `topics` → `subtopics` → `concepts`, ditambah
`misconceptions`, `subtopic_prerequisites`, dan `concept_prerequisites`. Semuanya
memakai id bertipe `text` yang sama persis dengan id di `src/data` sekarang,
supaya seed dapat dijalankan berulang tanpa memutus rujukan.

**Soal** — satu tabel `questions`. Bentuk jawaban berbeda per tipe, jadi
disimpan sebagai `jsonb` (`options`, `categories`, `statements`) alih-alih
dipecah menjadi tabel opsi dan pernyataan yang selalu setengah kosong. Yang
menjaga kewarasannya adalah batasan `questions_shape`: soal `single` wajib punya
`correct_answer` dan tidak boleh punya `statements`, soal `mcma` wajib punya
minimal dua kunci, soal `category` wajib punya `categories` dan `statements`.
Baris yang bentuknya salah ditolak basis data, bukan baru ketahuan saat dirender.

**Paket** — tryout dan latihan memakai **satu tabel `packages`** yang dibedakan
kolom `kind`, karena berkas JSON sumbernya memang satu bentuk yang sama. Semua
package menempel ke `subject_id` dan `series_id`; kombinasi itulah unit jualan
voucher.

**Seri dan produk voucher** — `content_series` menyimpan seri seperti
`bulan-kemerdekaan`, sedangkan `products` menyimpan kombinasi mata pelajaran +
seri. Satu product membuka seluruh `packages` pada kombinasi itu.

**Urutan soal** — `package_questions` menyimpan kolom `position` dengan
`unique (package_id, position)`. Urutan soal adalah bagian dari paket, bukan
kebetulan urutan baris.

**Terbit atau tidak** — `packages.is_published` default `false`, dan kebijakan RLS
hanya membaca paket yang sudah terbit. Paket yang sedang disusun boleh berada di
basis data tanpa muncul di aplikasi.

**Boleh kosong** — `subtopic_id`, `concept_id`, `difficulty`, dan `reasoning_type`
sengaja tidak wajib. Pada paket Matematika SMA, 18 dari 20 soal tidak menyertakan
subkompetensi sama sekali; kalau kolomnya wajib, seluruh paket gagal masuk.

**Jejak asal** — `packages.source_id` dan `source_file` mencatat berkas asalnya,
dan `questions.source_answer_key` menyimpan `kunci_sumber` apa adanya sebagai
pembanding, bukan sebagai penentu jawaban.

## 4. Voucher: satu-satunya yang wajib dibaca saat runtime

Voucher sekarang ditebus lewat server, bukan divalidasi di bundle JavaScript.
Ini penting karena kode voucher tidak boleh bisa dibaca dari devtools.

Rancangannya:

- tabel `vouchers`, `voucher_products`, dan relasi voucher lama `voucher_packages`
  **tidak punya kebijakan RLS untuk select**, jadi anon tidak bisa membacanya sama
  sekali
- penukaran lewat route `POST /api/voucher/redeem`, lalu fungsi
  `redeem_voucher(p_code)` yang `security definer`
- fungsi itu mengembalikan `subject_slug`, `series_slug`, dan daftar slug package
  dalam product tersebut; perangkat menyimpan entitlement `subjectSlug:seriesSlug`
- `redemption_count` hanya cacah agregat — tidak ada kolom yang mencatat siapa

Biayanya satu permintaan kecil per penukaran voucher. Tidak berpengaruh pada
kuota.

## 5. Dampak ke kode — bagian yang paling banyak kerjanya

Lapisan `src/services/*` memang sudah dirancang sebagai sekat, tapi ada satu
masalah yang harus dibereskan lebih dulu:

> Service saat ini **mencampur konten dan pengerjaan dalam satu berkas**, dan
> komponen client mengimpor keduanya.

Contohnya `tryout-service.ts` berisi `getQuestionsForTryout()` (konten) sekaligus
`getAttempt()` dan `saveAnswer()` (localStorage). Berkas itu diimpor oleh
`ExamRunner.tsx` yang merupakan komponen client. Kalau service ini mulai
mengimpor klien Supabase, klien itu ikut masuk ke bundel browser — persis yang
tidak kita mau.

**Pemisahan yang diperlukan:**

| Berkas baru | Sifat | Isi |
| --- | --- | --- |
| `services/content/*.ts` | server, async | baca Supabase, dipanggil server component saat build |
| `services/device/*.ts` | client, sync | localStorage: attempt, entitlement, profil, jenjang |

Komponen client tidak boleh lagi memanggil service konten. Konten diambil di
server component lalu **dioper sebagai props**. Yang terdampak:

- `HomeCatalog.tsx` — sekarang memanggil `getSubjectsByLevel()` dan
  `getAvailableLevels()` langsung di client; keduanya harus dioper dari
  `page.tsx`. Jenjang pilihan pengguna tetap dibaca di client dari
  `localStorage`, lalu dipakai menyaring daftar mapel yang sudah diterima.
- `PackageDetail.tsx`, `TryoutIntro.tsx`, `PracticeRunner.tsx`,
  `ExplanationView.tsx`, `PracticeResultView.tsx`, `TryoutResultView.tsx`,
  `ExamRunner.tsx` — sudah menerima `pkg`/`tryout`/`questions` sebagai props,
  jadi tinggal berhenti mengimpor service konten untuk keperluan lain.

Yang **tidak berubah sama sekali**: `src/lib/scoring.ts`, `src/lib/answers.ts`,
dan `src/lib/narrative.ts`. Ketiganya fungsi murni yang bekerja atas soal dan
jawaban, tanpa peduli soal itu datang dari berkas TS atau dari Postgres.

## 6. Penanda "paket sudah pernah dikerjakan"

Anda meminta ini dipertimbangkan. Menurut saya **sebagian dihapus, sebagian
dipertahankan** — keduanya terlihat mirip tapi fungsinya berbeda jauh.

Perlu dicatat lebih dulu: penanda ini sepenuhnya `localStorage` dan **tidak ada
hubungannya dengan Supabase**. Menghapusnya tidak menghemat apa pun di server.
Alasan menghapusnya murni soal kejujuran tampilan.

**Dihapus** — janji ingatan yang tidak ditepati produk:

| Tempat | Yang muncul sekarang |
| --- | --- |
| `TryoutIntro.tsx` | panel "Simulasi sudah dikerjakan · Terakhir dikerjakan {tanggal}" beserta tombol "Lihat Hasil" |
| `PackageDetail.tsx` | "Latihan ini pernah diselesaikan. Lihat hasil terakhir" |
| `PackageDetail.tsx` | label tombol berubah jadi "Lanjutkan Latihan" |

Tiga alasan: menampilkan tanggal pengerjaan terakhir membuat produk terkesan
menyimpan riwayat, padahal secara sengaja tidak; penanda itu terikat peramban,
jadi hilang begitu pengguna ganti perangkat dan terbaca sebagai kerusakan; dan
posisinya bertentangan dengan pernyataan di halaman Tentang.

**Dipertahankan** — pemulihan pengerjaan yang sedang berjalan:

Panel "Simulasi belum selesai · Lanjutkan Tryout" di `TryoutIntro.tsx` bukan
riwayat. Itu jaring pengaman untuk halaman yang tidak sengaja tertutup di tengah
ujian, dan menghapusnya berarti satu tab tertutup menghanguskan pengerjaan.
Fungsi ini justru salah satu yang paling berharga di prototype.

**Akibat yang perlu diputuskan:** setelah penanda dihapus, halaman hasil hanya
terlihat sekali — tepat setelah submit, saat aplikasi mengarahkan ke sana.
Membuka kembali halaman intro akan menampilkan tombol "Mulai" biasa, dan
menekannya menimpa hasil sebelumnya. Menurut saya itu konsisten dengan posisi
produk, tapi ini keputusan Anda.

## 7. Cara menjalankan

Migrasi dasar ada di [`supabase/migrations/0001_content.sql`](../supabase/migrations/0001_content.sql).
Lapisan seri mapel dan product voucher ada di
[`supabase/migrations/0002_series_entitlements.sql`](../supabase/migrations/0002_series_entitlements.sql).

Urutan untuk lingkungan baru:

1. jalankan migrasi `0001_content.sql`
2. jalankan migrasi `0002_series_entitlements.sql`
3. jalankan seed paket yang diperlukan dari folder [`supabase/seed`](../supabase/seed)
4. pastikan `ENTITLEMENT_COOKIE_SECRET` diset di environment deployment

Menambah voucher baru dilakukan dengan membuat baris di `vouchers`, lalu
menghubungkannya ke product seri mapel di `voucher_products`. Contoh ada di
[`supabase/README.md`](../supabase/README.md).

Berkas paket dihasilkan oleh [`scripts/import-package.mjs`](../scripts/import-package.mjs)
(`node scripts/import-package.mjs`). Keterangan yang tidak ada di dalam JSON
diisi lewat daftar `PACKAGES` di dalam skrip itu. Menambah paket baru cukup
menambah satu entri di sana.

Seed dibuat idempoten (`on conflict do update`), jadi aman dijalankan ulang
setiap kali bank soal berubah.

## 8. Data lain yang bisa menyusul

Diinformasikan saja, belum tentu perlu sekarang:

- **`site.ts`** — nama produk dan pesan pemasaran. Kecil, tapi memindahkannya ke
  tabel `settings` memungkinkan penggantian nama tanpa deploy. Nilainya rendah
  selama nama masih sering berubah di masa prototype.
- **Cacah agregat** — berapa kali sebuah tryout dimulai atau diselesaikan, tanpa
  identitas siapa pun. Ini tidak melanggar aturan di bagian 1 dan berguna untuk
  tahu paket mana yang dipakai. Cukup satu tabel `usage_counters` berisi
  `(kind, ref_id, count)` yang dinaikkan lewat RPC.
- **Pembahasan 30 soal TKA** — belum ada di berkas sumbernya. Setelah tabel
  `questions` berdiri, pembahasan bisa diisi bertahap lewat SQL Editor tanpa
  menyentuh kode sama sekali. Ini keuntungan paling langsung dari pemindahan ini.
- **Bahasa Indonesia SD** — sekarang kartu bertanda "Segera" tanpa soal. Begitu
  bank soalnya ada, cukup tambah baris; aplikasi tidak perlu diubah.

## 9. Urutan pengerjaan yang disarankan

1. jalankan migrasi dan seed, pastikan datanya benar lewat SQL Editor
2. pisahkan service menjadi `content/` dan `device/` — **tanpa** mengubah sumber
   data dulu, masih membaca `src/data`; pastikan build tetap hijau
3. oper konten sebagai props ke `HomeCatalog`, hilangkan impor service konten
   dari seluruh komponen client
4. baru ganti isi `services/content/*` dengan query Supabase
5. pindahkan voucher ke `redeem_voucher`, hapus kode dari `site.ts`
6. hapus penanda "sudah pernah dikerjakan" sesuai bagian 6

Langkah 2 dan 3 adalah bagian yang paling banyak menyentuh berkas, dan keduanya
bisa dikerjakan sekarang tanpa Supabase sama sekali. Mengerjakannya lebih dulu
membuat langkah 4 menjadi perubahan kecil yang mudah diperiksa.
