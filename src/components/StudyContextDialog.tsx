"use client";

import { useEffect, useState } from "react";
import type { EducationLevel } from "@/data/types";
import {
  DEFAULT_STUDY_CONTEXT,
  gradesForLevel,
  LEVEL_OPTIONS,
  levelOptionFor,
  type StudyContext,
} from "@/lib/study-context";
import { Icon } from "@/components/ui/Icon";

export function StudyContextDialog({
  open,
  required = false,
  initialContext,
  onApply,
  onClose,
}: {
  open: boolean;
  required?: boolean;
  initialContext?: StudyContext | null;
  onApply: (context: StudyContext) => void;
  onClose?: () => void;
}) {
  const [level, setLevel] = useState<EducationLevel>(
    initialContext?.level ?? DEFAULT_STUDY_CONTEXT.level,
  );
  const [grade, setGrade] = useState<number>(initialContext?.grade ?? DEFAULT_STUDY_CONTEXT.grade);

  useEffect(() => {
    if (!open) return;
    const nextLevel = initialContext?.level ?? DEFAULT_STUDY_CONTEXT.level;
    const nextGrades = gradesForLevel(nextLevel);
    setLevel(nextLevel);
    setGrade(initialContext?.grade && nextGrades.includes(initialContext.grade) ? initialContext.grade : nextGrades[0]);
  }, [initialContext, open]);

  if (!open) return null;

  const grades = gradesForLevel(level);
  const title = required ? "Mulai dari kelasmu" : "Ganti Kelas";

  const selectLevel = (nextLevel: EducationLevel) => {
    setLevel(nextLevel);
    setGrade(gradesForLevel(nextLevel)[0]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/42 p-3 backdrop-blur-sm sm:p-6">
      {/* Tingginya dibatasi layar supaya tombol Terapkan selalu terlihat, termasuk
          di ponsel pendek atau saat bilah browser memakan tempat. Isinya yang
          bergulir, bukan tombolnya yang terdorong keluar layar. */}
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] border border-white/70 bg-white shadow-[0_28px_80px_-34px_rgba(18,21,58,0.75)] sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-brand-50 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.08em] text-brand-700 sm:text-xs">
              SIAP TKA ONE
            </p>
            <h2 className="mt-0.5 text-xl font-black leading-tight text-ink-900 sm:text-2xl">{title}</h2>
            <p className="mt-1 text-[13px] font-medium leading-snug text-slate-600 sm:text-sm">
              Pilih jenjang dan kelas untuk melihat latihan yang sesuai.
            </p>
          </div>
          {!required && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand-200 hover:text-brand-700"
              aria-label="Tutup dialog"
            >
              <Icon name="close" className="h-4 w-4" strokeWidth={2.5} />
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <p className="text-[13px] font-black text-ink-900">Pilih Jenjang</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {LEVEL_OPTIONS.map((option) => {
              const isActive = option.level === level;
              return (
                <button
                  key={option.level}
                  type="button"
                  onClick={() => selectLevel(option.level)}
                  className={[
                    "rounded-[12px] border px-2 py-2.5 text-center transition-all sm:px-3 sm:py-3",
                    isActive
                      ? "border-brand-300 bg-brand-50 text-brand-800 shadow-[0_12px_24px_-20px_rgba(80,1,218,0.7)]"
                      : "border-slate-200 bg-white text-ink-900 hover:border-sky-200 hover:bg-sky-50",
                  ].join(" ")}
                >
                  <span className="block text-[13px] font-black leading-tight sm:text-[15px]">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold text-slate-600 sm:text-xs">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[13px] font-black text-ink-900">
            Pilih Kelas{" "}
            <span className="font-medium text-slate-500">· {levelOptionFor(level).label}</span>
          </p>

          <div className="mt-2 grid grid-cols-3 gap-2">
            {grades.map((item) => {
              const isActive = item === grade;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGrade(item)}
                  className={[
                    "h-10 rounded-[10px] border text-sm font-black transition-all",
                    isActive
                      ? "border-brand-400 bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-[0_14px_24px_-18px_rgba(80,1,218,0.9)]"
                      : "border-slate-200 bg-white text-ink-900 hover:border-brand-200 hover:bg-brand-50",
                  ].join(" ")}
                >
                  Kelas {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => onApply({ level, grade })}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-brand-600 to-brand-700 text-[15px] font-black text-white shadow-[0_18px_30px_-20px_rgba(80,1,218,0.95)] transition-transform hover:-translate-y-0.5"
          >
            {required ? "Mulai Belajar" : "Terapkan"}
            <Icon name="arrow-right" className="h-4 w-4" strokeWidth={2.7} />
          </button>
        </div>
      </div>
    </div>
  );
}
