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
| Simulasi / tryout | Gratis, tanpa pembayaran |
| Hasil + prioritas belajar | Gratis |
| Paket latihan (online + pembahasan) | Premium, dibuka dengan voucher |
| 1 paket contoh | Gratis (`Membaca dan Menyajikan Data`) |

Alur monetisasi:

```
Tryout gratis → Hasil → Area lemah → Rekomendasi paket
   → Paket terkunci → Voucher → Paket terbuka → Latihan online
```

Voucher prototype: **`TKA-DEMO-2026`** (divalidasi client-side, state disimpan di localStorage).

## User flow utama

1. **Landing** — memahami produk dalam 20 detik, klik *Mulai Tryout Gratis*.
2. **Daftar tryout** (`/tryout`) — satu simulasi tersedia, badge GRATIS.
3. **Intro tryout** — nama + kelas, petunjuk pengerjaan, mulai.
4. **Ujian** — layar fokus, timer berjalan dari `startedAt`, jawaban tersimpan otomatis.
5. **Hasil** — skor, ringkasan, **Prioritas Belajar (3 area)**, saran prasyarat, pola jawaban, performa topik, paket yang disarankan.
6. **Paket latihan** — detail paket, terkunci, masukkan voucher, terbuka.
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
  ditutup: nama & kelas, jawaban simulasi berjalan, hasil terakhir, dan paket yang terbuka.
- Penghitung integritas ringan (pindah tab, blur, keluar layar penuh) juga tinggal di
  perangkat dan hanya dipakai sebagai catatan netral pada halaman hasil. Tidak dikirim,
  tidak dipakai menuduh.
- Pengguna dapat menghapus seluruh data perangkat kapan saja lewat **Tentang → Hapus Data di Perangkat Ini** (`clearLocalData()` di `src/services/local-data-service.ts`).

Saat backend ditambahkan, yang boleh berpindah ke server adalah **bank soal, paket, dan
voucher** — bukan rekaman pengerjaan siswa.

## Batasan tahap ini

Tidak diimplementasikan: Supabase/database, auth backend, payment gateway, backend voucher,
admin panel, fitur AI, leaderboard/gamifikasi, dashboard guru/sekolah, cetak PDF.

Seluruh data statis ada di `src/data/`, seluruh state pengguna ada di `localStorage`
melalui lapisan `src/storage/`, dan seluruh akses data melalui `src/services/`
sehingga penggantian ke Supabase nanti hanya menyentuh satu lapisan.
