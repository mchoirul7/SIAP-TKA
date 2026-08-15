"use client";

import { useEffect, useRef, useState } from "react";
import type { EducationLevel } from "@/data/types";

/**
 * Pemilih jenjang. Jenjang yang belum punya mata pelajaran ditandai "segera" dan
 * tidak dapat dipilih — bukan disembunyikan, supaya cakupan produk tetap terbaca.
 */
export function LevelSwitcher({
  value,
  available,
  onChange,
}: {
  value: EducationLevel;
  available: EducationLevel[];
  onChange?: (level: EducationLevel) => void;
}) {
  const levels: EducationLevel[] = ["SD", "SMP", "SMA"];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-ink-900 bg-white px-3.5 text-sm font-bold text-ink-900 transition-colors hover:bg-brand-50"
      >
        {value}
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <ul
          role="listbox"
          aria-label="Pilih jenjang studi"
          className="absolute left-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-float"
        >
          {levels.map((level) => {
            const isAvailable = available.includes(level);
            const isSelected = level === value;

            return (
              <li key={level}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={!isAvailable}
                  onClick={() => {
                    if (!isAvailable) return;
                    onChange?.(level);
                    setIsOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors",
                    isAvailable
                      ? "font-semibold text-ink-900 hover:bg-brand-50"
                      : "cursor-not-allowed text-slate-400",
                  ].join(" ")}
                >
                  {level}
                  {isAvailable ? (
                    isSelected ? (
                      <span className="text-brand-600" aria-hidden="true">
                        ✓
                      </span>
                    ) : null
                  ) : (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Segera
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
