# Routes — Siap TKA (Prototype)

Next.js App Router. Semua route statis / client-side; tidak ada route handler, tidak ada env var.

| Route | Tipe | Isi |
| --- | --- | --- |
| `/` | Server | Landing: hero, cara kerja, contoh hasil, online/cetak, paket, FAQ singkat |
| `/tentang` | Server | Tentang produk, prinsip, batasan prototype |
| `/tryout` | Server | Daftar simulasi yang tersedia (badge GRATIS) |
| `/tryout/[tryoutSlug]` | Server + client form | Intro: info, petunjuk, isian nama & kelas, tombol mulai |
| `/tryout/[tryoutSlug]/attempt` | Client | Layar ujian fokus (top bar, soal, navigator, timer) |
| `/tryout/[tryoutSlug]/hasil` | Client | Hasil simulasi + analisis + rekomendasi paket |
| `/mapel/[subjectSlug]` | Server | Halaman mata pelajaran: paket latihan berurutan + daftar tryout |
| `/latihan` | Server | Katalog paket latihan, dikelompokkan per topik |
| `/latihan/[slug]` | Server + client | Detail paket; terkunci → voucher, terbuka → aksi latihan |
| `/latihan/[slug]/kerjakan` | Client | Latihan online (tanpa timer ketat) |
| `/latihan/[slug]/hasil` | Client | Skor latihan + konsep yang perlu diulang |
| `/latihan/[slug]/pembahasan` | Client | Jawaban kamu / jawaban benar / pembahasan |

Satu-satunya `tryoutSlug` pada prototype: `matematika-sd`
→ `/tryout/matematika-sd`, `/tryout/matematika-sd/attempt`, `/tryout/matematika-sd/hasil`.

Slug paket latihan: `pecahan-senilai`, `perbandingan-pecahan`, `operasi-pecahan`,
`keliling-dan-luas`, `membaca-data`.

## Pola halaman dinamis

`params` di Next 15 berupa `Promise`. Halaman `[slug]` dibuat sebagai **server component**
yang `await params`, memvalidasi slug (`notFound()`), lalu meneruskan data ke child
**client component**. Dengan begitu tidak ada `React.use()` tersebar dan tidak ada
akses `localStorage` di server.

## Voucher dialog

Bukan route tersendiri. `VoucherProvider` dipasang di layout publik; tombol
**"Saya Punya Voucher"** di navbar (dan tombol *Buka Paket* di detail paket)
memanggil `openVoucher()` dari context.

## Layar ujian

`/tryout/[slug]/attempt` menggunakan layout tersendiri (`app/tryout/[tryoutSlug]/attempt/layout.tsx`)
tanpa navbar marketing, tanpa footer, tanpa promosi apa pun.
