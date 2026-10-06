"use client";

import { Icon } from "@/components/ui/Icon";

export interface SecureExamNoticeState {
  title: string;
  message: string;
  final?: boolean;
  fullscreenPrompt?: boolean;
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
          notice.final ? "border-rose-300" : "border-amber-300",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-between gap-3 px-4 py-3 text-white",
            notice.final ? "bg-rose-700" : "bg-amber-600",
          ].join(" ")}
        >
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold">
            <Icon
              name={notice.final ? "alert" : "shield-check"}
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
            className={[
              "mt-3 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90",
              notice.final ? "bg-rose-700" : "bg-amber-600",
            ].join(" ")}
          >
            {notice.final ? "Lihat hasil" : notice.fullscreenPrompt ? "Aktifkan layar penuh" : "Mengerti"}
          </button>
        </div>
      </div>
    </div>
  );
}
