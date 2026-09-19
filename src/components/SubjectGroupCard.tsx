"use client";

import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";

/**
 * Kartu pembuka satu kelompok mata pelajaran.
 *
 * Selebar katalog, bukan satu petak di dalam kisi kartu mapel: kelompoknya
 * memang berisi banyak kartu, dan pemisah selebar halaman membuat jelas bahwa
 * yang di bawahnya adalah isi kelompok ini, bukan sambungan daftar mapel utama.
 */
export function SubjectGroupCard({
  title,
  description,
  preview,
  count,
  isOpen,
  onToggle,
  panelId,
}: {
  title: string;
  description: string;
  /** Beberapa nama mapel di dalamnya, supaya isinya terbaca tanpa dibuka. */
  preview: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={panelId}
      className={[
        "flex w-full items-center gap-3 rounded-lg border p-4 text-left shadow-card transition-all sm:gap-4 sm:p-5",
        isOpen
          ? "border-brand-200 bg-brand-50"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-float",
      ].join(" ")}
    >
      <IconBadge name="layers" tone="brand" size="md" />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-extrabold leading-snug text-ink-900 sm:text-lg">
            {title}
          </span>
          <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800 ring-1 ring-inset ring-brand-200">
            {count} mapel
          </span>
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-slate-600">{description}</span>
        {/* Nama mapelnya dipotong satu baris: petunjuk isi, bukan daftar. */}
        <span className="mt-1 block truncate text-xs font-semibold text-slate-500">{preview}</span>
      </span>

      <span
        aria-hidden="true"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-inset ring-brand-200"
      >
        <Icon
          name="arrow-right"
          className={`h-4 w-4 transition-transform ${isOpen ? "-rotate-90" : "rotate-90"}`}
          strokeWidth={2.2}
        />
      </span>
    </button>
  );
}
