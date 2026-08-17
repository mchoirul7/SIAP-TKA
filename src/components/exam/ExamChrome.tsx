"use client";

import type { ReactNode } from "react";
import { ProtectedQuestionContent } from "@/components/ProtectedQuestionContent";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

/**
 * Perkakas tampilan layar pengerjaan.
 *
 * Layar ujian dan layar latihan memakai berkas ini bersama-sama supaya
 * keduanya benar-benar sama bentuknya — bukan sekadar mirip. Tata letaknya
 * mengikuti kebiasaan aplikasi ANBK: latar biru, satu kartu putih, kendali di
 * kepala kartu, dan tiga tombol besar di kakinya.
 */

export type ExamFontSize = "kecil" | "sedang" | "besar";

const fontChoices: { key: ExamFontSize; label: string; className: string }[] = [
  { key: "kecil", label: "kecil", className: "text-[11px]" },
  { key: "sedang", label: "sedang", className: "text-[13px]" },
  { key: "besar", label: "besar", className: "text-[17px]" },
];

// ------------------------------------------------------------------ rangka

export function ExamShell({
  tagline,
  headerRight,
  children,
}: {
  /** Keterangan singkat di sebelah lambang, misalnya "Simulasi TKA". */
  tagline: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="exam-shell min-h-screen pb-8">
      {/* Bilah atas: identitas layanan saja, tanpa navigasi pemasaran apa pun. */}
      <header className="mx-auto flex w-full max-w-[1500px] items-center gap-3 px-3 py-3 sm:px-6 sm:py-4">
        <Logo className="h-11 shrink-0 sm:h-14" priority />
        <p className="min-w-0 truncate border-l border-white/30 pl-3 text-[11px] uppercase tracking-[0.16em] text-white/80 sm:text-xs">
          {tagline}
        </p>
        {headerRight ? <div className="ml-auto flex items-center gap-2">{headerRight}</div> : null}
      </header>

      <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-6">
        <div className="rounded-lg bg-white p-4 shadow-[0_16px_40px_-18px_rgba(8,25,50,0.65)] sm:rounded-xl sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ kepala kartu

export function ExamCardHead({
  title,
  subtitle,
  status,
  infoLabel,
  onOpenInfo,
  onOpenList,
  fontSize,
  onFontSize,
}: {
  title: string;
  /** Nama mata pelajaran atau materi, tampil di kanan pada layar lebar. */
  subtitle: string;
  /** Pil status: sisa waktu pada ujian, kemajuan pada latihan. */
  status: ReactNode;
  infoLabel: string;
  onOpenInfo: () => void;
  onOpenList: () => void;
  fontSize: ExamFontSize;
  onFontSize: (size: ExamFontSize) => void;
}) {
  const fontControl = (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-slate-500">Ukuran font soal:</span>
      {fontChoices.map((choice) => (
        <button
          key={choice.key}
          type="button"
          onClick={() => onFontSize(choice.key)}
          aria-pressed={fontSize === choice.key}
          className={[
            "flex h-7 w-7 items-center justify-center rounded font-semibold leading-none transition-colors",
            choice.className,
            fontSize === choice.key
              ? "bg-[#1877d2] text-white"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
          ].join(" ")}
        >
          <span aria-hidden="true">A</span>
          <span className="sr-only">Ukuran huruf {choice.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Layar lebar: judul di kiri, kendali di kanan. */}
      <div className="hidden items-start justify-between gap-6 sm:flex">
        <div>
          <h1 className="text-xl font-normal text-slate-700">{title}</h1>
          <div className="mt-1.5">{fontControl}</div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenInfo}
              className="inline-flex h-9 items-center rounded-md bg-[#1877d2] px-3.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#1466b6]"
            >
              {infoLabel}
            </button>
            {status}
            <button
              type="button"
              onClick={onOpenList}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1877d2] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1466b6]"
            >
              Daftar Soal
              <GridGlyph />
            </button>
          </div>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>

      {/* Layar sempit: semuanya menumpuk di tengah. */}
      <div className="sm:hidden">
        <h1 className="text-center text-lg font-normal text-slate-700">{title}</h1>
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpenInfo}
            aria-label={infoLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877d2] text-white transition-colors hover:bg-[#1466b6]"
          >
            <Icon name="info" className="h-5 w-5" strokeWidth={2.2} />
          </button>
          {status}
          <button
            type="button"
            onClick={onOpenList}
            aria-label="Daftar soal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877d2] text-white transition-colors hover:bg-[#1466b6]"
          >
            <GridGlyph />
          </button>
        </div>
        <div className="mt-2 flex justify-center">{fontControl}</div>
        <p className="mt-3 text-sm text-slate-600">{subtitle}</p>
      </div>

      <hr className="mt-3 border-t-2 border-slate-100 sm:mt-4" />
    </>
  );
}

/** Pil status di kepala kartu. `alert` dipakai saat waktu ujian menipis. */
export function ExamStatusPill({ children, alert = false }: { children: ReactNode; alert?: boolean }) {
  return (
    <span
      className={[
        "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold tabular-nums",
        alert ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-300 bg-white text-slate-500",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

// ------------------------------------------------------------- papan soal

export function ExamQuestionPanel({
  fontSize,
  stimulus,
  children,
}: {
  fontSize: ExamFontSize;
  /** Bacaan atau gambar pendamping. Bila kosong, panel kiri dilewati di ponsel. */
  stimulus: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="exam-scope mt-3 sm:mt-4" data-font={fontSize}>
      <ProtectedQuestionContent>
        <div className="grid grid-cols-1 rounded border border-slate-200 lg:min-h-[460px] lg:grid-cols-2">
          {/* Tanpa bacaan, panel kiri hanya dipertahankan di layar lebar supaya
              kolom soal tetap seimbang; di ponsel ia dilewati agar tidak boros. */}
          <div
            className={[
              "p-4 sm:p-6",
              stimulus
                ? "border-b-2 border-dotted border-slate-300 lg:border-b-0 lg:border-r-2"
                : "hidden lg:block lg:border-r-2 lg:border-dotted lg:border-slate-300",
            ].join(" ")}
          >
            {stimulus}
          </div>

          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </ProtectedQuestionContent>
    </div>
  );
}

// --------------------------------------------------------- kendali bawah

export function ExamNavBar({
  onPrev,
  prevDisabled = false,
  marked,
  onToggleMark,
  onNext,
  nextLabel,
  isFinish = false,
}: {
  onPrev: () => void;
  prevDisabled?: boolean;
  marked: boolean;
  onToggleMark: () => void;
  onNext: () => void;
  nextLabel: string;
  /** Tombol biru menutup pengerjaan, bukan pindah soal. */
  isFinish?: boolean;
}) {
  return (
    <>
      {/* Layar lebar: tiga tombol lonjong. */}
      <div className="mt-5 hidden grid-cols-3 items-center gap-3 sm:grid">
        <div className="justify-self-start">
          <button
            type="button"
            onClick={onPrev}
            disabled={prevDisabled}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#dc3545] px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CircleChevron direction="left" />
            Soal sebelumnya
          </button>
        </div>

        <div className="justify-self-center">
          <button
            type="button"
            onClick={onToggleMark}
            aria-pressed={marked}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#ffc107] px-6 text-[15px] font-semibold text-slate-900 transition-opacity hover:opacity-90"
          >
            <DoubtBox marked={marked} />
            Ragu-ragu
          </button>
        </div>

        <div className="justify-self-end">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1877d2] px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {isFinish ? (
              <>
                {nextLabel}
                <Icon name="flag" className="h-5 w-5" strokeWidth={2.2} />
              </>
            ) : (
              <>
                {nextLabel}
                <CircleChevron direction="right" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Layar sempit: tiga tombol bundar. */}
      <div className="mt-4 flex items-center justify-around sm:hidden">
        <button
          type="button"
          onClick={onPrev}
          disabled={prevDisabled}
          aria-label="Soal sebelumnya"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dc3545] text-white disabled:opacity-40"
        >
          <CircleChevron direction="left" />
        </button>
        <button
          type="button"
          onClick={onToggleMark}
          aria-pressed={marked}
          aria-label="Tandai ragu-ragu"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffc107] text-slate-900"
        >
          <DoubtBox marked={marked} />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label={nextLabel}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877d2] text-white"
        >
          {isFinish ? (
            <Icon name="flag" className="h-5 w-5" strokeWidth={2.2} />
          ) : (
            <CircleChevron direction="right" />
          )}
        </button>
      </div>
    </>
  );
}

// ------------------------------------------------------------- jendela

/**
 * Satu bentuk jendela untuk daftar soal, informasi, dan konfirmasi selesai,
 * agar ketiganya berperilaku sama. Di layar sempit muncul dari tepi bawah.
 */
export function ExamDialog({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-raised sm:rounded-xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 bg-[#1b5fa8] px-5 py-3.5 text-white">
          <h2 className="text-base font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded p-1 transition-colors hover:bg-white/15"
          >
            <Icon name="close" className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-200 px-5 py-3.5">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

/** Tombol biru penuh di kaki jendela. */
export function ExamDialogAction({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1877d2] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function ExamInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 py-2.5 last:border-b-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

// -------------------------------------------------------------- lambang

/** Ikon petak pada tombol "Daftar Soal". */
export function GridGlyph() {
  return (
    <span aria-hidden="true" className="grid grid-cols-2 gap-[2px]">
      {[0, 1, 2, 3].map((cell) => (
        <span key={cell} className="h-1.5 w-1.5 bg-current" />
      ))}
    </span>
  );
}

/** Anak panah dalam lingkaran, seperti tombol maju-mundur ANBK. */
export function CircleChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/25"
    >
      <Icon
        name={direction === "left" ? "arrow-left" : "arrow-right"}
        className="h-3.5 w-3.5"
        strokeWidth={3}
      />
    </span>
  );
}

/** Kotak centang kecil pada tombol ragu-ragu; terisi bila soal sudah ditandai. */
export function DoubtBox({ marked }: { marked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2 border-slate-900/60",
        marked ? "bg-slate-900" : "bg-white",
      ].join(" ")}
    >
      {marked ? <Icon name="check" className="h-3 w-3 text-white" strokeWidth={3.5} /> : null}
    </span>
  );
}
