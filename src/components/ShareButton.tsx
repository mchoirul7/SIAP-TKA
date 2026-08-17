"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { shareContent, site } from "@/lib/site";

/**
 * Tombol berbagi di kepala halaman.
 *
 * Di ponsel dipakai lembar berbagi bawaan sistem, sehingga WhatsApp, Instagram,
 * dan aplikasi lain yang terpasang muncul apa adanya tanpa kita daftarkan satu
 * per satu. Peramban desktop belum umum mendukungnya, jadi di sana ditampilkan
 * daftar tujuan yang dibuka lewat tautan berbagi masing-masing layanan.
 *
 * Pesannya sendiri hidup di `shareContent` — satu tempat, supaya bunyi ajakan
 * yang sampai ke grup wali murid tidak berbeda-beda antar tombol.
 */
export function ShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Menutup daftar saat pengguna menekan di luar atau menekan Escape.
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

  const handleShare = async () => {
    // Alamat halaman tidak dioper terpisah: pesannya sudah memuat alamat situs
    // dan tautan voucher, dan sebagian aplikasi menempelkan `url` di ujung
    // sehingga tautannya tampil dua kali.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareContent.title, text: shareContent.message });
        return;
      } catch {
        // Dibatalkan pengguna atau ditolak peramban: jatuh ke daftar tujuan.
      }
    }
    setIsOpen((open) => !open);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareContent.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleShare}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-400 hover:bg-brand-100"
      >
        <Icon name="share" className="h-4 w-4" strokeWidth={2} />
        <span className="hidden sm:inline">Bagikan</span>
        <span className="sr-only sm:hidden">Bagikan {site.brandName}</span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label="Bagikan ke"
          className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-raised"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bagikan ke
          </p>

          {shareTargets.map((target) => (
            <a
              key={target.label}
              role="menuitem"
              href={target.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800"
            >
              <span aria-hidden="true" className="text-base leading-none">
                {target.emoji}
              </span>
              {target.label}
            </a>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={copyMessage}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800"
          >
            <Icon
              name={copied ? "check" : "note"}
              className={`h-4 w-4 ${copied ? "text-emerald-600" : "text-slate-500"}`}
              strokeWidth={2}
            />
            {copied ? "Pesan tersalin" : "Salin pesan ajakan"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

const encodedMessage = encodeURIComponent(shareContent.message);
const encodedShort = encodeURIComponent(shareContent.shortMessage);
const encodedUrl = encodeURIComponent(site.url);

/**
 * Facebook sengaja hanya menerima alamat: kolom teksnya sudah lama diabaikan.
 * Judul dan gambar yang muncul di sana datang dari tag Open Graph halaman.
 */
const shareTargets = [
  { label: "WhatsApp", emoji: "💬", href: `https://wa.me/?text=${encodedMessage}` },
  {
    label: "Telegram",
    emoji: "✈️",
    href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
  },
  {
    label: "Facebook",
    emoji: "👍",
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  },
  { label: "X (Twitter)", emoji: "𝕏", href: `https://twitter.com/intent/tweet?text=${encodedShort}` },
] as const;
