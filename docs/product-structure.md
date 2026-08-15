# Struktur Produk — Siap TKA (Prototype)

> Nama produk **"Siap TKA"** bersifat sementara dan mudah diganti (satu tempat: `src/lib/site.ts`).

## Positioning

Platform latihan dan simulasi TKA dari rumah.

- **Value proposition:** "Coba simulasi TKA dari rumah, lihat bagian yang perlu diperkuat, lalu latihan lebih terarah."
- **Secondary:** "Bukan hanya tahu nilainya. Tahu harus memperbaiki dari mana."
- **Buyer utama:** orang tua. **User utama:** siswa.
- Produk tidak pernah menjual AI. Seluruh rekomendasi bersifat rule-based dan dijelaskan secara terbuka.

## Model bisnis yang tercermin di UI

| Bagian | Akses |
| --- | --- |
| Simulasi / tryout | Dibuka dengan voucher seri mapel |
| Hasil + prioritas belajar | Dibuka dengan voucher seri mapel |
| Paket latihan (online + pembahasan) | Dibuka dengan voucher seri mapel |
| Konten tanpa voucher | Tidak ada |

Alur monetisasi:

```
Pilih mapel + seri → Voucher → Tryout + latihan terbuka
   → Hasil → Area lemah → Paket latihan yang perlu dikerjakan
```

Unit jualan: **1 kode voucher membuka 1 mata pelajaran dalam 1 seri**.
Contoh: `Matematika SMA + Seri Bulan Kemerdekaan`.

## User flow utama

1. **Landing** — memahami produk dalam 20 detik, pilih jenjang dan mapel.
2. **Halaman mapel** — melihat tryout dan latihan dalam seri yang tersedia.
3. **Voucher** — masukkan kode untuk membuka mapel dalam seri itu.
4. **Intro tryout** — nama + kelas, petunjuk pengerjaan, mulai.
5. **Ujian** — layar fokus, timer berjalan dari `startedAt`, jawaban tersimpan otomatis.
6. **Hasil** — skor, ringkasan, **Prioritas Belajar (3 area)**, saran prasyarat, pola jawaban, performa topik, paket yang disarankan.
7. **Latihan online** — tanpa timer ketat, hasil + pembahasan.
8. **Belajar saya** (`/belajar`) — ringkasan tryout terakhir, prioritas, paket milik user.

## Hierarki kompetensi

```
Subject (Matematika SD)
└── Topic (Bilangan / Geometri dan Pengukuran / Data)
    └── Subtopic (Pecahan Senilai, Operasi Pecahan, ...)
        └── Concept (Menentukan pecahan senilai, ...)
```

- **Prerequisite** dipetakan pada level subtopik dan konsep (`src/data/prerequisites.ts`).
- **Misconception** dipetakan pada level opsi jawaban (`misconceptionId` pada distractor).

Dua hal inilah yang membuat halaman hasil terasa berguna, tanpa perlu graph database:
jika sebuah subtopik lemah **dan** prasyaratnya juga lemah, produk menyarankan mulai dari prasyaratnya.

## Prinsip data: pengerjaan tidak direkam

Ini keputusan produk, bukan sekadar konsekuensi karena backend belum ada — **berlaku juga
setelah Supabase masuk.**

- Pengerjaan siswa **tidak dicatat sebagai riwayat**. Satu tryout menyimpan satu keadaan
  terakhir; mengulang simulasi menimpanya, bukan menambah baris baru.
- Tidak ada data yang dikirim ke server, tidak ada analytics pengerjaan, tidak ada akun.
- Yang tersimpan hanya keadaan yang sedang berjalan agar alur tidak putus saat halaman
  ditutup: nama & kelas, jawaban simulasi berjalan, hasil terakhir, dan seri mapel yang terbuka.
- Penghitung integritas ringan (pindah tab, blur, keluar layar penuh) juga tinggal di
  perangkat dan hanya dipakai sebagai catatan netral pada halaman hasil. Tidak dikirim,
  tidak dipakai menuduh.
- Pengguna dapat menghapus seluruh data perangkat kapan saja lewat **Tentang → Hapus Data di Perangkat Ini** (`clearLocalData()` di `src/services/local-data-service.ts`).

Yang berpindah ke server adalah **bank soal, paket, seri, product voucher, dan redeem
voucher** — bukan rekaman pengerjaan siswa.

## Batasan tahap ini

Tidak diimplementasikan: auth backend, payment gateway, admin panel, fitur AI,
leaderboard/gamifikasi, dashboard guru/sekolah, cetak PDF.

Bank soal, paket, seri, product voucher, dan redeem voucher sudah dipindahkan ke
Supabase. Seluruh state pengerjaan pengguna tetap di perangkat melalui
`localStorage`; entitlement voucher disimpan sebagai kunci seri mapel
(`subjectSlug:seriesSlug`) dan cookie server bertanda tangan untuk melindungi
route konten.
