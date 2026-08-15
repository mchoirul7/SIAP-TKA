"use client";

import { useEffect, useState } from "react";
import { LevelSwitcher } from "@/components/LevelSwitcher";
import { SubjectCard } from "@/components/SubjectCard";
import type { EducationLevel } from "@/data/types";
import type { SubjectSummary } from "@/services/content-service";
import { readLevel, writeLevel } from "@/storage/level-storage";

const ALL_LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];
const DEFAULT_LEVEL: EducationLevel = "SMA";

/**
 * Katalog halaman depan.
 *
 * Tidak ada layar pemilihan jenjang di depan: halaman langsung menampilkan mata
 * pelajaran SMA. Jenjang tetap dapat diganti lewat pemilih di sebelah judul, dan
 * pilihannya disimpan di perangkat untuk kunjungan berikutnya.
 */
export function HomeCatalog({ summaries }: { summaries: SubjectSummary[] }) {
  const countByLevel = (target: EducationLevel) =>
    summaries.filter((item) => item.subject.level === target).length;

  // Hanya jenjang yang sudah punya mata pelajaran yang dapat dipilih.
  const availableLevels = ALL_LEVELS.filter((option) => countByLevel(option) > 0);
  const initialLevel =
    countByLevel(DEFAULT_LEVEL) > 0 ? DEFAULT_LEVEL : (availableLevels[0] ?? DEFAULT_LEVEL);

  // Dimulai dari jenjang bawaan supaya isinya langsung tampil pada render pertama,
  // tanpa kerangka kosong yang berkedip. Pilihan tersimpan menyusul di efek.
  const [level, setLevel] = useState<EducationLevel>(initialLevel);

  useEffect(() => {
    const stored = readLevel();
    // Pilihan lama diabaikan bila jenjangnya kini tidak ada isinya.
    if (stored && stored !== initialLevel && countByLevel(stored) > 0) setLevel(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseLevel = (next: EducationLevel) => {
    writeLevel(next);
    setLevel(next);
  };

  const levelSummaries = summaries.filter((item) => item.subject.level === level);

  return (
    <div className="container-page pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">
          Untuk Jenjang Studi
        </h2>
        <LevelSwitcher value={level} available={availableLevels} onChange={chooseLevel} />
      </div>

      <section className="mt-7">
        <h3 className="flex items-center gap-2 text-[17px] font-bold tracking-tight text-ink-900">
          <span
            aria-hidden="true"
            className="inline-block h-4 w-1.5 rounded-full bg-gradient-to-b from-brand-400 to-brand-600"
          />
          Pilih mata pelajaran
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Di dalamnya tersedia paket latihan yang dikerjakan bertahap, beserta tryout untuk
          mengukur hasilnya.
        </p>

        {levelSummaries.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
            Mata pelajaran untuk jenjang ini sedang disiapkan.
          </p>
        ) : (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {levelSummaries.map((summary, index) => (
              <li key={summary.subject.id}>
                <SubjectCard summary={summary} tone={index % 2 === 0 ? "orange" : "rust"} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
