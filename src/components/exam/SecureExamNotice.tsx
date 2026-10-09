"use client";

import { Icon } from "@/components/ui/Icon";

export interface SecureExamNoticeState {
  title: string;
  message: string;
}

export function SecureExamNotice({
  notice,
  onClose,
}: {
  notice: SecureExamNoticeState;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md">
      <div
        role="alertdialog"
        aria-modal="false"
        aria-label={notice.title}
        className={[
          "overflow-hidden rounded-lg border bg-white shadow-raised",
          "border-amber-300",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-between gap-3 px-4 py-3 text-white",
            "bg-amber-600",
          ].join(" ")}
        >
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold">
            <Icon
              name="shield-check"
              className="h-5 w-5 shrink-0"
              strokeWidth={2.3}
            />
            <span className="truncate">{notice.title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup peringatan"
            className="rounded p-1 transition-colors hover:bg-white/15"
          >
            <Icon name="close" className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="text-sm leading-relaxed text-slate-700">{notice.message}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-amber-600 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}

/** Menutup layar soal sampai layar penuh dinyalakan lagi. */
export function FullscreenGate({ onEnter, note }: { onEnter: () => void; note?: string }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/85 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="fullscreen-gate-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-raised"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200">
          <Icon name="shield-check" className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <h2 id="fullscreen-gate-title" className="mt-4 text-lg font-extrabold text-ink-900">
          Nyalakan layar penuh dulu
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Mode Ujian Fokus aktif. Soal bisa dikerjakan lagi setelah layar penuh menyala.
          {note ? ` ${note}` : ""}
        </p>
        <button
          type="button"
          onClick={onEnter}
          autoFocus
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Nyalakan layar penuh
        </button>
      </div>
    </div>
  );
}
