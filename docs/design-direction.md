# Arah Desain — Siap TKA

Tujuan: terasa seperti **produk belajar yang hangat dan langsung bisa dipakai**.
Halaman depan bukan halaman pengantar: begitu dibuka, orang tua langsung melihat
simulasi dan paket latihan yang tersedia, lalu bisa menekannya.

## Yang dihindari

Halaman depan bergaya portal/landing yang harus dilewati sebelum sampai ke isi,
tampilan polos tanpa penanda visual, neon, ungu "AI", dashboard gelap futuristik,
ikon robot/otak, animasi berlebih, copy marketing berlebihan.

## Warna

Warna utama **oranye**, boleh bergradasi. Gradasi dipakai pada bidang yang memang
dekoratif — pita halaman depan, sampul kartu, tombol utama — bukan pada teks panjang.

| Peran | Nilai |
| --- | --- |
| Background halaman | `ink-50 #f8f7f6`, permukaan kartu `#ffffff` |
| Primary | `brand-500 #f97316` → `brand-600 #ea580c` (gradasi tombol & sampul) |
| Primary pekat | `brand-700 #c2410c`, `brand-900 #7c2d12` — pita, sampul gelap |
| Tint | `brand-50 #fff7ed`, `brand-100 #ffedd5` — chip, latar lembut |
| Teks & judul | `ink-900 #1f1b17` (grafit hangat), bukan oranye |
| Netral | `slate-*` untuk teks sekunder, garis, latar |

Semantik hanya dipakai bila punya fungsi (status penguasaan):

| Status | Warna |
| --- | --- |
| Dikuasai (≥80%) | emerald |
| Cukup (60–79%) | amber |
| Perlu diperkuat (<60%) | rose |

Warna status tetap dipisahkan dari warna merek: oranye menandakan merek dan aksi,
sedangkan emerald/amber/rose hanya menandakan tingkat penguasaan.

## Bentuk & permukaan

- Kartu katalog: `rounded-2xl`, sampul bergradasi setinggi 160px, badan putih.
- Sampul kartu dibuat dengan CSS + SVG (gelombang dan pola titik), tanpa berkas gambar,
  sehingga tidak ada aset yang perlu dikelola dan halaman tetap ringan.
- Header berupa kartu putih mengambang di atas pita warna.
- Pita halaman depan ditutup lengkungan SVG yang menyambung ke latar halaman.
- Border 1px `slate-200` tetap dipakai pada permukaan yang tidak bergradasi.

## Tipografi

- Font stack sistem (Segoe UI / system-ui / Roboto / Helvetica) — cepat, netral, familiar,
  tidak butuh unduhan font saat build sehingga deploy Vercel selalu bersih.
- Judul `font-semibold`, tracking sedikit rapat; tidak memakai bobot ekstra-bold.
- Body 16px, `leading-relaxed`. Teks soal dinaikkan ke 17–18px dengan lebar maksimum
  ~68 karakter agar stimulus panjang nyaman dibaca.
- Angka penting (skor, akurasi) memakai `tabular-nums`.

## Komponen

`Button`, `Badge`, `Card`, `ProgressBar`, `SectionHeader`, `QuestionOption`,
`QuestionBody`, `QuestionReview`, `QuestionNavigator`, `ResultStatus`, `CoverArt`,
`CardCarousel`, `LevelSwitcher`, `TryoutCard`, `PracticePackageCard`, `VoucherDialog`, `Toast`.
Sederhana, satu tanggung jawab, tanpa design-system berlapis.

`QuestionBody` dan `QuestionReview` menangani ketiga bentuk soal sekaligus, sehingga
layar ujian, layar latihan, dan halaman pembahasan tidak pernah berbeda perilaku.

## Layar ujian

Perlakuan khusus: tanpa navbar marketing, tanpa footer, tanpa promosi.
Top bar tipis berisi nama ujian, progres, dan timer. Area soal lebar terbatas.
Navigator nomor soal memakai status yang jelas (belum dijawab / sudah dijawab / ragu-ragu)
dengan bentuk + warna, tidak hanya warna.

## Aksesibilitas

- HTML semantik (`main`, `nav`, `section`, `h1`–`h3`, `fieldset`/`legend` untuk pilihan jawaban).
- Pilihan jawaban adalah `<label>` + `<input>` — `radio` untuk pilihan tunggal,
  `checkbox` untuk jawaban ganda, sehingga bentuk soal terbaca oleh pembaca layar.
  Target klik seluas satu baris.
- Soal kategori memakai satu grup radio per pernyataan, dengan label kategori yang
  tetap terbaca di layar sempit.
- `focus-visible` ring oranye terlihat jelas di semua elemen interaktif.
- Kontras teks minimal 4.5:1; status tidak pernah disampaikan lewat warna saja.
- Dialog voucher: fokus otomatis, `Esc` menutup, `aria-modal`.

## Responsif

- Landing & hasil: mobile-first, satu kolom, angka besar tetap terbaca.
- Ujian: mendukung mobile (navigator jadi panel yang bisa dibuka), namun intro
  menyarankan laptop/komputer untuk pengalaman terbaik — tanpa memblokir mobile.
- Target sentuh minimal 44px pada pilihan jawaban dan navigator nomor.
