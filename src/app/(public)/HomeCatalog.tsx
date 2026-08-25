"use client";

import { useId, useState } from "react";
import { SubjectCard } from "@/components/SubjectCard";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import type { EducationLevel } from "@/data/types";
import type { SubjectSummary } from "@/services/content-service";

/**
 * Katalog halaman depan.
 *
 * Jenjang dibuat bertab supaya pengguna ponsel tidak perlu menggulir melewati
 * semua tingkat sekolah. Data tetap datang dari server; komponen ini hanya
 * menyimpan jenjang yang sedang dilihat.
 */

/** SMA/SMK dan SD tampil dulu; SMP tetap ada, tetapi ditempatkan terakhir. */
const LEVEL_ORDER: EducationLevel[] = ["SMA", "SD", "SMP"];

const LEVEL_PILL: Record<EducationLevel, string> = {
  SMA: "bg-brand-700 text-white",
  SMP: "bg-aqua-700 text-white",
  SD: "bg-accent-500 text-ink-900",
};

const LEVEL_LABEL: Record<EducationLevel, string> = {
  SMA: "SMA/SMK",
  SMP: "SMP",
  SD: "SD",
};

const LEVEL_SHORT_NOTE: Record<EducationLevel, string> = {
  SMA: "Paling siap",
  SD: "Tersedia",
  SMP: "Segera",
};

const SMA_OPTIONAL_SUBJECT: SubjectSummary = {
  subject: {
    id: "sub-mapel-pilihan-sma-smk",
    slug: "mapel-pilihan-sma-smk",
    name: "Mapel Pilihan SMA/SMK",
    shortName: "Mapel Pilihan",
    level: "SMA",
    description: "Mata pelajaran pilihan untuk jenjang SMA/SMK.",
  },
  packageCount: 0,
  tryoutCount: 0,
  isAvailable: false,
};

function subjectsForLevel(summaries: SubjectSummary[], level: EducationLevel) {
  const items = summaries.filter((item) => item.subject.level === level);
  if (level !== "SMA") return items;

  const hasOptionalSubject = items.some((item) =>
    /mapel[-\s]?pilihan|mata[-\s]?pelajaran[-\s]?pilihan/i.test(
      `${item.subject.slug} ${item.subject.name}`,
    ),
  );
  return hasOptionalSubject ? items : [...items, SMA_OPTIONAL_SUBJECT];
}

function availableCount(items: SubjectSummary[]): number {
  return items.filter((item) => item.isAvailable).length;
}

export function HomeCatalog({ summaries }: { summaries: SubjectSummary[] }) {
  const selectId = useId();
  const [activeLevel, setActiveLevel] = useState<EducationLevel>(LEVEL_ORDER[0]);
  const groups = LEVEL_ORDER.map((level) => ({
    level,
    items: subjectsForLevel(summaries, level),
  }));
  const activeGroup = groups.find((group) => group.level === activeLevel) ?? groups[0];
  const activeItems = activeGroup.items;
  const activeAvailableCount = availableCount(activeItems);
  const activeIsEmpty = activeItems.length === 0;

  return (
    <div id="katalog-mapel" className="container-page scroll-mt-24 pb-16">
      <div className="flex items-start gap-3">
        <IconBadge name="cap" tone="brand" size="md" />
        <div className="min-w-0">
          <p className="eyebrow">Mulai belajar</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">
            Pilih Mata Pelajaran
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Pilih mapel, masuk ke paket latihan sesuai materi, lalu akhiri dengan tryout.
          </p>
        </div>
      </div>

      <div className="mt-5 sm:hidden">
        <label htmlFor={selectId} className="sr-only">
          Pilih jenjang
        </label>
        <div className="relative">
          <select
            id={selectId}
            value={activeLevel}
            onChange={(event) => setActiveLevel(event.target.value as EducationLevel)}
            className="h-12 w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 pr-10 text-base font-extrabold text-ink-900 shadow-card outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {groups.map(({ level, items }) => {
              const count = availableCount(items);
              return (
                <option key={level} value={level}>
                  {LEVEL_LABEL[level]} - {count > 0 ? `${count} mapel` : "segera"}
                </option>
              );
            })}
          </select>
          <Icon
            name="arrow-right"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-500"
            strokeWidth={2.2}
          />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Pilih jenjang"
        className="mt-5 hidden grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-card sm:grid"
      >
        {groups.map(({ level, items }) => {
          const isActive = level === activeLevel;
          const count = availableCount(items);
          const isEmpty = items.length === 0;

          return (
            <button
              key={level}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${level.toLowerCase()}`}
              id={`tab-${level.toLowerCase()}`}
              onClick={() => setActiveLevel(level)}
              className={[
                "flex h-14 min-w-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-extrabold transition-colors",
                isActive
                  ? LEVEL_PILL[level]
                  : "text-slate-600 hover:bg-slate-50 hover:text-ink-900",
              ].join(" ")}
            >
              <span className="truncate">{LEVEL_LABEL[level]}</span>
              <span
                className={[
                  "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                  isActive
                    ? "bg-white/20 text-current"
                    : isEmpty
                      ? "bg-slate-100 text-slate-500"
                      : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {count > 0 ? `${count} mapel` : LEVEL_SHORT_NOTE[level]}
              </span>
            </button>
          );
        })}
      </div>

      <section
        id={`panel-${activeLevel.toLowerCase()}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeLevel.toLowerCase()}`}
        className="mt-5"
      >
        <h3 className="flex items-center gap-2">
          <span
            className={[
              "inline-flex h-8 items-center rounded-lg px-3 text-sm font-extrabold tracking-wide",
              activeIsEmpty ? "bg-slate-200 text-slate-500" : LEVEL_PILL[activeLevel],
            ].join(" ")}
          >
            {LEVEL_LABEL[activeLevel]}
          </span>
          {activeAvailableCount === 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
              <Icon name="hourglass" className="h-3.5 w-3.5" strokeWidth={2.2} />
              Segera
            </span>
          ) : null}
        </h3>

        {activeIsEmpty ? (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-5 text-sm leading-relaxed text-slate-600">
            Paket untuk jenjang {LEVEL_LABEL[activeLevel]} sedang disiapkan.
          </div>
        ) : (
          <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeItems.map((summary) => (
              <li key={summary.subject.id}>
                <SubjectCard summary={summary} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
