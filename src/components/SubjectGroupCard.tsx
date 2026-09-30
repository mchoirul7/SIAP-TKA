"use client";

import { Icon } from "@/components/ui/Icon";

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
  preview: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  panelId: string;
}) {
  return (
    <div className="rounded-[13px] border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_30px_-24px_rgba(12,10,55,0.65),0_1px_4px_rgba(12,10,55,0.06)] sm:px-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-[0_12px_24px_-16px_rgba(80,1,218,0.8)]">
          <Icon name="layers" className="h-7 w-7" strokeWidth={2.2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-[24px] font-black leading-tight text-ink-900">{title}</h3>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700 ring-1 ring-inset ring-brand-100">
              {count} mapel
            </span>
          </div>
          <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{description}</p>
          <p className="mt-1 truncate text-[14px] leading-relaxed text-slate-600">{preview}</p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-[10px] border border-brand-200 bg-white px-5 text-[15px] font-black text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
        >
          {isOpen ? "Tutup Mapel" : "Lihat Mapel"}
          <Icon
            name="arrow-right"
            className={`h-5 w-5 transition-transform ${isOpen ? "-rotate-90" : ""}`}
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  );
}
