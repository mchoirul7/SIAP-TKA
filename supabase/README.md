# Supabase — urutan eksekusi

Proyek: `dscjpbjevotvycbnzcjd`. Semua dijalankan lewat **SQL Editor** di dashboard.

Seluruh berkas di bawah sudah diuji dengan menjalankannya pada Postgres sungguhan
(PGlite/WASM) — bukan sekadar diperiksa manual. Hasilnya: 90 soal, 4 paket, 13 bacaan,
5 mata pelajaran masuk tanpa galat.

## Urutan

| # | Berkas | Isi |
| --- | --- | --- |
| 1 | `migrations/0001_content.sql` | seluruh tabel, RLS, fungsi `redeem_voucher` |
| 2 | `seed/tka-matematika-sma.sql` | 20 soal, 17 capaian, 43 gambar |
| 3 | `seed/tka-bahasa-indonesia-sma.sql` | 20 soal, 4 capaian, 6 bacaan |
| 4 | `seed/tka-bahasa-inggris-sma.sql` | 20 soal, 4 capaian, 7 bacaan |
| 5 | `seed/0002_seed_content.sql` | paket TKA Matematika SD, 30 soal |

Berkas 2–5 berdiri sendiri dan **aman dijalankan berulang** (`on conflict do update`),
jadi memperbarui satu paket cukup menjalankan ulang berkasnya sendiri.

## Menambah paket baru

Berkas paket dihasilkan dari JSON, bukan ditulis tangan:

```bash
node scripts/import-package.mjs
```

Tambahkan satu entri pada daftar `PACKAGES` di dalam skrip itu — berisi keterangan
yang memang tidak ada di dalam JSON: jenjang, nama mata pelajaran, judul, jenis
paket (`tryout` atau `latihan`), dan durasi.

Skrip juga menulis `<slug>.images.txt`. Unduh gambarnya ke `public/soal/`:

```bash
cat supabase/seed/<slug>.images.txt | while read -r u; do
  curl -sfL "$u" -o "public/soal/$(basename "$u")"
done
```

Gambar sengaja **tidak** disimpan di Supabase Storage — lihat
[`docs/supabase-migration.md`](../docs/supabase-migration.md) bagian 2b.

## Yang dilakukan importer secara otomatis

- membersihkan HTML sisa ekspor CBT (`<label>`, `<td>`, komentar `<!--?xml ... ?-->`)
- menyatukan rumusan kompetensi yang hanya berbeda huruf besar, titik, atau terpotong
- membetulkan urutan kolom pada soal kategori dengan membaca urutan penyebutannya
  di dalam pertanyaan
- menjaga slug tetap unik dalam satu mata pelajaran
- menyalin `kunci_sumber` ke `questions.source_answer_key` sebagai pembanding, bukan
  sebagai penentu jawaban

Setiap penyesuaian yang dilakukan dilaporkan sebagai peringatan saat skrip berjalan.

## Yang perlu diperiksa manusia

- **Pembahasan belum ada** pada seluruh 90 soal. Kolom `questions.explanation` sudah
  siap; isinya dapat ditambahkan bertahap lewat SQL Editor tanpa menyentuh kode.
- **20 soal Matematika SMA tanpa materi** — sumbernya memang tidak menyertakan
  subkompetensi. Kolomnya boleh kosong, jadi tidak menghalangi impor.
- **Satu salah ketik pada Bahasa Inggris**: capaian tertulis "Pengalaman inferensial"
  (seharusnya "Pemahaman"), sehingga tidak ikut tergabung dengan capaian sejenis.
  Importer sengaja tidak membetulkan salah ketik sendiri.
