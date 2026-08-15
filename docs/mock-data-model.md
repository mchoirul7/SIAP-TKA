# Model Data Statis — Siap TKA (Prototype)

Semua tipe ada di `src/data/types.ts`. Data statis dipisah per file agar mudah diganti
dengan tabel Supabase yang setara.

```
src/data/
  types.ts             tipe bersama
  subjects.ts          subject, topic, subtopic
  concepts.ts          concept (unit terkecil)
  prerequisites.ts     prasyarat antar subtopik & antar konsep
  misconceptions.ts    daftar pola jawaban keliru
  questions.ts         bank soal (tryout + latihan)
  tryouts.ts           definisi simulasi
  practicePackages.ts  paket latihan
  seedAttempt.ts       jawaban contoh untuk demo hasil
```

## Entitas

```ts
Subject   { id, slug, name, level, shortName, description }
Topic     { id, subjectId, slug, name }
Subtopic  { id, topicId, slug, name, description }
Concept   { id, subtopicId, name, description }

Question {
  id, subjectId, topicId, subtopicId, conceptId,
  competency, difficulty: "dasar" | "menengah" | "lanjut",
  reasoningType: "pemahaman" | "penerapan" | "penalaran",
  stimulus?, questionText,
  options: { key, text, misconceptionId? }[],
  correctAnswer, explanation
}

Tryout    { id, slug, title, subjectId, level, description,
            durationMinutes, questionIds, instructions[] }

PracticePackage {
  id, slug, title, subjectId, topicId, subtopicId,
  summary, description, level, difficultyRange, estimatedMinutes,
  skills[], questionIds, isPremium, pdfUrl?
}

Misconception { id, label, description, insight }
SubtopicPrerequisite { subtopicId, requiresSubtopicId, reason }
ConceptPrerequisite  { conceptId, requiresConceptId }
```

Catatan penting: **hanya `single choice`** yang diimplementasikan.

## Cakupan konten prototype

- 1 subject: **Matematika SD**
- 3 topik: Bilangan, Geometri dan Pengukuran, Data
- 8 subtopik: Pecahan Senilai, Perbandingan Pecahan, Operasi Pecahan, KPK dan FPB,
  Keliling dan Luas, Volume Bangun Ruang, Penyajian Data, Rata-rata
- 25 soal tryout + 30 soal latihan = 55 soal
- 1 tryout (25 soal, 50 menit)
- 5 paket latihan (4 premium, 1 gratis)
- 8 misconception, 6 prasyarat subtopik

## Skenario demo (`seedAttempt.ts`)

Jawaban contoh dirancang menghasilkan:

| Subtopik | Akurasi | Status |
| --- | --- | --- |
| Pecahan Senilai | 25% | Perlu diperkuat |
| Perbandingan Pecahan | 50% | Perlu diperkuat |
| Operasi Pecahan | 50% | Perlu diperkuat |
| Keliling dan Luas | 75% | Cukup |
| KPK dan FPB, Volume, Data, Rata-rata | 100% | Dikuasai |

Total: **17 benar, 7 salah, 1 kosong → skor 68 (Cukup)**.

Karena Perbandingan/Operasi Pecahan berprasyarat pada Pecahan Senilai yang juga lemah,
halaman hasil menampilkan **"Mulai dari Pecahan Senilai"**.
Distractor yang dipilih memicu 2 pola jawaban berulang
(`m-senilai-tambah` 3×, `m-penyebut-besar` 2×) sehingga bagian **Pola Jawaban** muncul.

## Lapisan akses data

Halaman **tidak** meng-import `src/data/*` secara langsung. Semua lewat `src/services/`:

```ts
getTryouts()  getTryoutBySlug()  getQuestionsForTryout()
startAttempt()  saveAnswer()  toggleMark()  submitTryout()  getTryoutResult()
getPracticePackages()  getPracticePackageBySlug()  getQuestionsForPackage()
redeemVoucher()  isPackageUnlocked()  getUnlockedPackages()
```

Saat Supabase masuk, isi fungsi-fungsi ini diganti; signature-nya tetap.

## localStorage

Prefix `siaptka:` — lihat `src/storage/storage-keys.ts`.

| Key | Isi |
| --- | --- |
| `siaptka:profile` | nama & kelas siswa |
| `siaptka:tryout-attempt:<slug>` | startedAt, answers, marked, integrity, submittedAt |
| `siaptka:practice-attempt:<slug>` | answers, startedAt, finishedAt |
| `siaptka:entitlements` | unlockedPackages, kode voucher, waktu redeem |

Seluruh akses melalui `src/storage/*` (SSR-safe, try/catch, versi schema),
tidak pernah memanggil `localStorage` langsung dari komponen.
