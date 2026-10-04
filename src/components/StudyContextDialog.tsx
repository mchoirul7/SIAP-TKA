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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/42 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-[640px] overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_28px_80px_-34px_rgba(18,21,58,0.75)]">
        <div className="flex items-start justify-between gap-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-brand-50 px-5 py-5 sm:px-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.08em] text-brand-700">
              SIAP TKA ONE
            </p>
            <h2 className="mt-1 text-[28px] font-black leading-tight text-ink-900">{title}</h2>
            <p className="mt-2 text-[15px] font-medium leading-relaxed text-slate-600">
              Pilih jenjang dan kelas untuk melihat latihan yang sesuai.
            </p>
          </div>
          {!required && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-brand-200 hover:text-brand-700"
              aria-label="Tutup dialog"
            >
              <Icon name="close" className="h-5 w-5" strokeWidth={2.5} />
            </button>
          ) : null}
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p className="text-sm font-black text-ink-900">Pilih Jenjang</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {LEVEL_OPTIONS.map((option) => {
              const isActive = option.level === level;
              return (
                <button
                  key={option.level}
                  type="button"
                  onClick={() => selectLevel(option.level)}
                  className={[
                    "rounded-[14px] border p-4 text-left transition-all",
                    isActive
                      ? "border-brand-300 bg-brand-50 text-brand-800 shadow-[0_12px_24px_-20px_rgba(80,1,218,0.7)]"
                      : "border-slate-200 bg-white text-ink-900 hover:border-sky-200 hover:bg-sky-50",
                  ].join(" ")}
                >
                  <span className="block text-[16px] font-black leading-tight">{option.label}</span>
                  <span className="mt-2 block text-sm font-semibold text-slate-600">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-ink-900">Pilih Kelas</p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {levelOptionFor(level).label}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {grades.map((item) => {
              const isActive = item === grade;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGrade(item)}
                  className={[
                    "h-12 rounded-[12px] border text-[15px] font-black transition-all",
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

          <button
            type="button"
            onClick={() => onApply({ level, grade })}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-[13px] bg-gradient-to-r from-brand-600 to-brand-700 text-[16px] font-black text-white shadow-[0_18px_30px_-20px_rgba(80,1,218,0.95)] transition-transform hover:-translate-y-0.5"
          >
            {required ? "Mulai Belajar" : "Terapkan"}
            <Icon name="arrow-right" className="h-5 w-5" strokeWidth={2.7} />
          </button>
        </div>
      </div>
    </div>
  );
}
