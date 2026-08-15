"use client";

import { useEffect } from "react";

/** Pemberitahuan singkat pada layar ujian. Tidak menghalangi pengerjaan. */
export function Toast({
  message,
  onDismiss,
  durationMs = 6000,
}: {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md rounded-lg border border-slate-300 bg-white p-4 shadow-raised sm:inset-x-auto sm:right-6"
    >
      <p className="text-sm leading-relaxed text-slate-700">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-sm font-semibold text-brand-700 hover:text-ink-900"
      >
        Mengerti
      </button>
    </div>
  );
}
