"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Question } from "@/data/types";
import { useAuthorMode } from "@/hooks/useAuthorMode";
import { buildVisualPrompt, chatGptUrl } from "@/lib/visual-prompt";

/**
 * Tombol tanda tanya di sebelah soal, hanya muncul di mode penyusun — lihat
 * `author-mode`. Isinya deskripsi gambar yang ditulis penyusun soal, beserta
 * satu tautan yang membuka ChatGPT dengan perintah pembuat gambarnya sudah
 * terisi dan terkirim, lengkap dengan konteks soalnya.
 *
 * Maksudnya memangkas satu putaran kerja: tidak perlu lagi menyalin deskripsi,
 * menempelkannya, lalu mengetik ulang konteks soalnya satu per satu.
 */
export function VisualPromptHint({ question }: { question: Question }) {
  const isAuthor = useAuthorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Menutup panel saat ditekan di luar atau saat Escape — sama seperti tombol
  // berbagi, supaya perilaku panel mengambang di aplikasi ini seragam.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (!isAuthor || !question.visualPrompt) return null;

  const prompt = buildVisualPrompt(question);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        title="Prompt gambar untuk soal ini"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-violet-300 bg-violet-50 text-violet-700 transition-colors hover:border-violet-500 hover:bg-violet-100"
      >
        <Icon name="help" className="h-3.5 w-3.5" strokeWidth={2.2} />
        <span className="sr-only">Prompt gambar untuk soal ini</span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-8 z-40 w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-left shadow-float">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Prompt gambar
          </p>

          {/* Deskripsi mentahnya ditampilkan apa adanya supaya penyusun dapat
              menilai sendiri apakah masih perlu disunting sebelum dikirim. */}
          <p className="mt-1.5 max-h-52 overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">
            {question.visualPrompt}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={chatGptUrl(prompt)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-700 px-3 text-[13px] font-bold text-white transition-colors hover:bg-violet-800"
            >
              <Icon name="sparkles" className="h-4 w-4" strokeWidth={2.2} />
              Buat di ChatGPT
            </a>
            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Icon
                name={copied ? "check" : "note"}
                className={`h-4 w-4 ${copied ? "text-emerald-600" : "text-slate-500"}`}
                strokeWidth={2}
              />
              {copied ? "Tersalin" : "Salin"}
            </button>
          </div>

          {/* Yang dikirim jauh lebih panjang daripada yang tampil di atas, jadi
              perlu disebut agar tidak dikira hanya deskripsinya yang terkirim. */}
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Yang dikirim sudah termasuk teks soal, pilihan, dan kunci jawabannya sebagai konteks,
            dengan larangan menampilkannya di gambar.
          </p>
        </div>
      ) : null}
    </span>
  );
}
