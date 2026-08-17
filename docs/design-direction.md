# Arah Desain — Siap TKA

Tujuan: terasa seperti **produk belajar yang hangat dan langsung bisa dipakai**.
Halaman depan bukan halaman pengantar: begitu dibuka, orang tua langsung melihat
simulasi dan paket latihan yang tersedia, lalu bisa menekannya.

## Yang dihindari

Halaman depan bergaya portal/landing yang harus dilewati sebelum sampai ke isi,
tampilan polos tanpa penanda visual, neon, dashboard gelap futuristik,
ikon robot/otak, animasi berlebih, copy marketing berlebihan.

## Warna

Palet diambil dari lambang **Siap TKA One**: ungu topi wisuda, kuning keemasan
tulisan "ONE", biru es tulisan "SiAP TKA", dan biru dongker garis tepinya. Warna
utama **ungu**, boleh bergradasi. Gradasi dipakai pada bidang yang memang
dekoratif — pita halaman depan, sampul kartu, tombol utama — bukan pada teks panjang.

| Peran | Nilai |
| --- | --- |
| Background halaman | `ink-50 #f5f6fb`, permukaan kartu `#ffffff` |
| Primary | `brand-500 #8232ff` → `brand-700 #5001da` (ungu lambang) |
| Primary pekat | `brand-800 #4200b0`, `brand-900 #2f0289` — pita, sampul gelap |
| Tint | `brand-50 #f6f2ff`, `brand-100 #ece2ff` — chip, latar lembut |
| Aksen | `accent-400 #fdbe01` → `accent-600 #fd9101` (kuning "ONE") |
| Aksen sejuk | `aqua-300 #7fe4fb` → `aqua-600 #0898c2` (biru es) |
| Teks & judul | `ink-900 #12153a` (dongker lambang), bukan ungu |
| Netral | `slate-*` untuk teks sekunder, garis, latar |

Tiga warna lambang membedakan mata pelajaran: Matematika ungu, Bahasa Indonesia
kuning keemasan, Bahasa Inggris biru es. Mapel baru memakai salah satu dari tiga
warna itu dan dibedakan lewat ikonnya — bukan dengan menambah warna baru.

Di atas kuning dan biru es, tulisan memakai `ink-900`, bukan putih: keduanya
terlalu terang untuk teks putih.

Layar ujian dan latihan sengaja keluar dari palet ini — birunya meniru aplikasi
ANBK agar peserta mengenali suasananya — tetapi ujung gelapnya diturunkan ke
biru dongker lambang supaya tetap sekeluarga.

Semantik hanya dipakai bila punya fungsi (status penguasaan):

| Status | Warna |
| --- | --- |
| Dikuasai (≥80%) | emerald |
| Cukup (60–79%) | amber |
| Perlu diperkuat (<60%) | rose |

Warna status tetap dipisahkan dari warna merek: ungu menandakan merek dan aksi,
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
- `focus-visible` ring ungu terlihat jelas di semua elemen interaktif.
- Kontras teks minimal 4.5:1; status tidak pernah disampaikan lewat warna saja.
- Dialog voucher: fokus otomatis, `Esc` menutup, `aria-modal`.

## Responsif

- Landing & hasil: mobile-first, satu kolom, angka besar tetap terbaca.
- Ujian: mendukung mobile (navigator jadi panel yang bisa dibuka), namun intro
  menyarankan laptop/komputer untuk pengalaman terbaik — tanpa memblokir mobile.
- Target sentuh minimal 44px pada pilihan jawaban dan navigator nomor.
