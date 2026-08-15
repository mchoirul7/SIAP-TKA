"use client";

import { useEffect, useState } from "react";
import { LevelSwitcher } from "@/components/LevelSwitcher";
import { SubjectCard } from "@/components/SubjectCard";
import type { EducationLevel } from "@/data/types";
import type { SubjectSummary } from "@/services/content-service";
import { readLevel, writeLevel } from "@/storage/level-storage";

const ALL_LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];

/**
 * Katalog halaman depan.
 *
 * Kunjungan pertama menanyakan jenjang lebih dulu, lalu pilihannya disimpan di
 * perangkat. Setelah itu yang tampil adalah mata pelajaran pada jenjang tersebut;
 * paket latihan dan tryout dibuka dari halaman mata pelajaran.
 */
export function HomeCatalog({ summaries }: { summaries: SubjectSummary[] }) {
  const countByLevel = (target: EducationLevel) =>
    summaries.filter((item) => item.subject.level === target).length;
  // Hanya jenjang yang sudah punya mata pelajaran yang dapat dipilih.
  const availableLevels = ALL_LEVELS.filter((option) => countByLevel(option) > 0);

  const [level, setLevel] = useState<EducationLevel | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Pilihan lama diabaikan bila jenjangnya kini tidak tersedia, supaya pengguna
    // tidak terjebak pada halaman kosong.
    const stored = readLevel();
    setLevel(stored && countByLevel(stored) > 0 ? stored : null);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseLevel = (next: EducationLevel) => {
    writeLevel(next);
    setLevel(next);
  };

  if (!mounted) {
    return (
      <div className="container-page pb-16">
        <div className="h-56 animate-pulse rounded-2xl bg-white/70" aria-hidden="true" />
      </div>
    );
  }

  if (!level) {
    return (
      <div className="container-page pb-16">
        <LevelPicker onChoose={chooseLevel} countByLevel={countByLevel} />
      </div>
    );
  }

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

/** Pertanyaan pembuka pada kunjungan pertama. Semua jenjang dapat dipilih. */
function LevelPicker({
  onChoose,
  countByLevel,
}: {
  onChoose: (level: EducationLevel) => void;
  countByLevel: (level: EducationLevel) => number;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-float sm:p-8">
      <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">
        Pilih jenjang studi dulu
      </h2>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-600">
        Kami tampilkan mata pelajaran, paket latihan, dan tryout yang sesuai jenjangnya. Pilihan ini
        tersimpan di perangkat ini dan bisa diganti kapan saja.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {ALL_LEVELS.map((option) => {
          const count = countByLevel(option);
          const isAvailable = count > 0;
          return (
            <li key={option}>
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => onChoose(option)}
                className={[
                  "flex w-full flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-colors",
                  isAvailable
                    ? "border-brand-200 bg-brand-50/60 hover:border-brand-500 hover:bg-brand-50"
                    : "cursor-not-allowed border-slate-200 bg-slate-50",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-xl font-extrabold tracking-tight",
                    isAvailable ? "text-ink-900" : "text-slate-400",
                  ].join(" ")}
                >
                  {option}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {isAvailable ? `${count} mata pelajaran` : "Segera hadir"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
