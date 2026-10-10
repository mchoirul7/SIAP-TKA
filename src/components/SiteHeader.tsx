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

              {/* Pemilih kelas: daftar ujian dan mapel mengikuti kelas ini. */}
              <button
                type="button"
                onClick={() => setIsClassDialogOpen(true)}
                aria-label={`Ganti kelas, sekarang ${context ? studyContextShortLabel(context) : "belum dipilih"}`}
                className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] border border-sky-100 bg-white px-2.5 text-[12px] font-black text-ink-900 shadow-[0_8px_18px_-14px_rgba(18,21,58,0.5)] transition-colors hover:border-brand-200 sm:gap-2 sm:px-3.5 sm:text-[13px]"
              >
                <Icon name="cap" className="hidden h-4 w-4 text-brand-700 sm:block" strokeWidth={2.4} />
                <span className="whitespace-nowrap">{context ? studyContextShortLabel(context) : "Pilih Kelas"}</span>
                <Icon name="chevron-down" className="h-4 w-4" strokeWidth={2.6} />
              </button>

              {/* Kartu akun: nama murid yang masuk membuka halaman Akun (paket, nilai,
                  perangkat, keluar); tamu mendapat tombol Masuk / Daftar di tempat yang sama. */}
              {student ? (
                <Link
                  href="/akun"
                  title={`Akun ${student.name}`}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[12px] border border-brand-100 bg-white pl-1.5 pr-1.5 text-left shadow-[0_8px_18px_-14px_rgba(18,21,58,0.5)] transition-colors hover:border-brand-300 sm:pr-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-[14px] font-black uppercase text-white">
                    {student.name.trim().charAt(0) || "A"}
                  </span>
                  <span className="hidden leading-tight sm:block">
                    <span className="block max-w-[140px] truncate text-[13px] font-black text-ink-900">{student.name}</span>
                    <span className="block text-[11px] font-semibold text-brand-700">Lihat akun</span>
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAccess()}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[12px] bg-gradient-to-r from-brand-500 to-brand-700 px-3 text-[12px] font-black text-white shadow-[0_8px_18px_-12px_rgba(80,1,218,0.8)] transition-opacity hover:opacity-90 sm:px-4 sm:text-[13px]"
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
