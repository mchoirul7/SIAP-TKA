# Supabase — urutan eksekusi

Proyek: `dscjpbjevotvycbnzcjd`. Semua dijalankan lewat **SQL Editor** di dashboard.

Seluruh berkas di bawah disusun idempoten agar aman dijalankan ulang saat konten
atau product voucher berubah.

## Urutan

| # | Berkas | Isi |
| --- | --- | --- |
| 1 | `migrations/0001_content.sql` | tabel konten dasar, RLS awal, fungsi voucher lama |
| 2 | `migrations/0002_series_entitlements.sql` | seri, product voucher per mapel, RPC voucher baru |
| 3 | `seed/tka-matematika-sma.sql` | 20 soal, 17 capaian, 43 gambar |
| 4 | `seed/tka-bahasa-indonesia-sma.sql` | 20 soal, 4 capaian, 6 bacaan |
| 5 | `seed/tka-bahasa-inggris-sma.sql` | 20 soal, 4 capaian, 7 bacaan |
| 6 | `seed/0004_kode_akses_per_mapel.sql` | kode akses MAT / BIN / BING / ALL |
| 7 | `seed/tka-matematika-sd.sql` | 23 paket latihan SD, 230 soal, 115 miskonsepsi |
| 8 | `seed/tka-bahasa-indonesia-sd.sql` | 10 paket latihan SD, 100 soal, 30 bacaan |
| 9 | `seed/tka-matematika-miskonsepsi.sql` | penanda miskonsepsi 219 soal Matematika SMA |
| 10 | `seed/tka-bahasa-indonesia-sma-miskonsepsi.sql` | 100 definisi + penanda 129 soal Bahasa Indonesia SMA |
| 11 | `seed/tka-bahasa-inggris-sma-miskonsepsi.sql` | 90 definisi + penanda 110 soal Bahasa Inggris SMA |
| 12 | `seed/0005_kode_akses_semua_paket.sql` | 5 kode SEMUA01–SEMUA05, 1000 penukaran, membuka seluruh paket |

Berkas seed berdiri sendiri dan **aman dijalankan berulang** (`on conflict do update`),
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

## Paket latihan SD

Paket SD ditulis sendiri, bukan diimpor, jadi berkas SQL-nya dihasilkan skrip lain:

```bash
node scripts/build-matematika-sd.mjs        # supabase/seed/tka-matematika-sd.sql
node scripts/build-bahasa-indonesia-sd.mjs  # supabase/seed/tka-bahasa-indonesia-sd.sql
```

Sumbernya berupa satu berkas JSON per paket di `seed/matematika-sd/` dan
`seed/bahasa-indonesia-sd/`, ditambah `_taksonomi.json` berisi mapel, seri, produk,
capaian, dan materi. Jangan menyunting SQL-nya langsung: ubah JSON-nya lalu jalankan
ulang skripnya.

Kedua skrip menolak menulis SQL bila ada kunci jawaban yang tidak ada di daftar opsi,
rujukan miskonsepsi atau bacaan yang menggantung, atau paket yang soalnya tidak
sepuluh. Skrip Bahasa Indonesia juga melaporkan panjang tiap bacaan (kerangka asesmen
TKA SD: 150–200 kata) dan sebaran huruf kunci.

## Penandaan miskonsepsi

Analisis hasil hanya dapat menyebut pola kesalahan bila tiap pengecoh sudah ditandai
miskonsepsinya. Paket SD sudah membawa penandanya sejak berkas JSON-nya; paket SMA
ditandai lewat berkas peta terpisah supaya teks soalnya tidak perlu ditulis ulang:

```bash
node scripts/generate-misconception-tags.mjs                     # seluruh mapel
node scripts/generate-misconception-tags.mjs bahasa-inggris-sma   # satu mapel
```

Sumbernya `seed/<mapel>-miskonsepsi.map.json`, keluarannya `seed/<mapel>-miskonsepsi.sql`.
Skrip membaca soal yang berlaku dari Supabase, lalu menolak menulis SQL bila ada soal
atau kunci pilihan yang tidak dikenali, id miskonsepsi yang menggantung, atau kunci
jawaban yang ikut ditandai — penanda hanya bermakna pada pengecoh.

Peta boleh memuat definisi miskonsepsinya sendiri (`label`, `description`, `insight`).
Bila ada, definisi itu ikut ditulis sebagai `insert ... on conflict do update`, jadi
memperbaiki kalimat yang tampil di halaman hasil cukup dengan mengubah petanya lalu
menjalankan skripnya ulang. Label dan insight ditulis dalam bahasa Indonesia sebagai
kalimat utuh — keduanya tampil apa adanya pada narasi hasil, yang dibaca siswa dan
orang tuanya.

Penanda berupa angka berarti `mis-<misGroup>-<angka tiga digit>`. Paket tryout memakai
id utuh karena satu paketnya mencakup banyak materi.

## Membuat kode voucher

Kode akses yang dipakai sekarang dibuat lewat `seed/0004_kode_akses_per_mapel.sql`,
bukan satu per satu. Awalan kodenya menyatakan isinya:

| Awalan | Membuka |
| --- | --- |
| `MAT01`–`MAT10` | Matematika SMA |
| `BIN01`–`BIN10` | Bahasa Indonesia SMA |
| `BING01`–`BING10` | Bahasa Inggris SMA |
| `ALL01`–`ALL10` | seluruh mata pelajaran yang aktif |
| `SEMUA01`–`SEMUA05` | seluruh paket, 1000 penukaran per kode |

Kode `SEMUA01`–`SEMUA05` dibuat terpisah lewat `seed/0005_kode_akses_semua_paket.sql`:
kelimanya membuka seluruh paket dan masing-masing berlaku 1000 penukaran. Berkas itu
juga melengkapi katalog `products` lebih dahulu — hak akses hanya dapat dijangkau
voucher bila pasangan mapel+seri punya barisnya di sana, dan pasangan Bahasa Inggris
SMA × Latihan TKA Bahasa Inggris SMA (9 paket) sebelumnya belum punya, sehingga
kesembilan paket itu tidak terbuka oleh kode apa pun.

Semuanya sekali pakai (`max_redemptions = 1`). Menambah stok cukup dengan mengubah
angka pada `generate_series(1, 10)` di berkas itu lalu menjalankannya ulang —
kode yang sudah ada tidak kehilangan cacah pemakaiannya.

Yang dipetakan adalah **slug mata pelajaran**, bukan id product. Satu mapel bisa
tersebar di beberapa seri, dan hak akses terkunci per pasangan mapel+seri, jadi
pemetaan lewat mapel membuat seluruh serinya ikut terbuka. Konsekuensinya: setiap
kali ada seri atau product baru, berkas itu perlu dijalankan ulang supaya kode
lama ikut menjangkaunya.

Untuk kode satuan di luar pola itu, satu kode diarahkan ke satu `products.slug`:

```sql
insert into public.vouchers (code, label, is_active, max_redemptions)
values ('KODE-UNIK-PEMBELI', 'Matematika SMA - Seri Bulan Kemerdekaan', true, 1);

insert into public.voucher_products (code, product_id)
select 'KODE-UNIK-PEMBELI', id
from public.products
where slug = 'matematika-sma-bulan-kemerdekaan';
```

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
