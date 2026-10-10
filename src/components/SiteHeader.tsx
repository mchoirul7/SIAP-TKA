"use client";

import Link from "next/link";
import { useState } from "react";
import { ShareButton } from "@/components/ShareButton";
import { StudyContextDialog } from "@/components/StudyContextDialog";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { useAccessDialog } from "@/components/AccessDialog";
import { useStudent } from "@/hooks/useStudent";
import { useStudyContext } from "@/hooks/useStudyContext";
import { studyContextShortLabel } from "@/lib/study-context";
import { site } from "@/lib/site";

export function SiteHeader() {
  const { context, saveContext } = useStudyContext();
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const { student } = useStudent();
  const { openAccess } = useAccessDialog();

  return (
    <>
      <header className="sticky top-0 z-30 pt-3">
        <div className="container-page">
          <div className="flex h-[60px] items-center justify-between gap-2 rounded-[16px] border border-white/80 bg-white/95 px-3 sm:gap-4 shadow-[0_14px_30px_-18px_rgba(18,21,58,0.45)] backdrop-blur sm:px-6">
            <Link href="/" className="flex h-full shrink-0 items-center rounded" aria-label={`${site.name} - beranda`}>
              <Logo className="h-[42px] sm:h-[52px]" priority decorative />
            </Link>

            <div className="hidden h-10 min-w-[160px] max-w-[420px] flex-1 items-center gap-3 rounded-[11px] border border-sky-100 bg-sky-50/60 px-4 text-sm text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:flex">
              <Icon name="search" className="h-5 w-5 text-slate-400" strokeWidth={2.1} />
              <span className="truncate">Cari mata pelajaran atau materi...</span>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ShareButton />

              <button
                type="button"
                onClick={() => setIsClassDialogOpen(true)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[12px] border border-sky-100 bg-white px-2 text-left sm:gap-3 sm:px-4 shadow-[0_8px_18px_-14px_rgba(18,21,58,0.5)] transition-colors hover:border-brand-200"
              >
                <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-400 sm:flex text-base font-black text-white">
                  <Icon name="cap" className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <span className="block leading-tight md:min-w-[86px]">
                  <span className="hidden max-w-[140px] truncate text-[13px] font-black text-ink-900 md:block">{student?.name ?? "Ananda"}</span>
                  <span className="block whitespace-nowrap text-[12px] font-black text-ink-900 md:text-[11px] md:font-semibold md:text-slate-500">
                    {context ? studyContextShortLabel(context) : "Pilih Kelas"}
                  </span>
                </span>
                <Icon name="chevron-down" className="h-4 w-4 text-ink-900" strokeWidth={2.6} />
              </button>

              {/* Latihan Saya: paket yang sudah dibeli; halaman akun ditautkan dari sana. */}
              {student ? (
                <Link
                  href="/latihan-saya"
                  title={`Latihan Saya - ${student.name}`}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] bg-gradient-to-r from-brand-500 to-brand-700 px-3 text-[12px] font-black text-white shadow-[0_8px_18px_-12px_rgba(80,1,218,0.8)] transition-opacity hover:opacity-90"
                >
                  <Icon name="layers" className="h-4 w-4" strokeWidth={2.4} />
                  <span className="hidden sm:inline">Latihan Saya</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAccess({ successHref: "/latihan-saya" })}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] bg-gradient-to-r from-brand-500 to-brand-700 px-3 text-[12px] font-black text-white shadow-[0_8px_18px_-12px_rgba(80,1,218,0.8)] transition-opacity hover:opacity-90"
                >
                  <Icon name="unlock" className="h-4 w-4" strokeWidth={2.4} />
                  <span className="hidden sm:inline">Masuk / Daftar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <StudyContextDialog
        open={isClassDialogOpen}
        initialContext={context}
        onClose={() => setIsClassDialogOpen(false)}
        onApply={(nextContext) => {
          saveContext(nextContext);
          setIsClassDialogOpen(false);
        }}
      />
    </>
  );
}
