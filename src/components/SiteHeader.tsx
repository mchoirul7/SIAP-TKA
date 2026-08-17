"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { useVoucherDialog } from "@/components/VoucherDialog";
import { site } from "@/lib/site";

/**
 * Header sengaja tidak memuat tautan navigasi.
 *
 * Penelusuran produk sudah berjalan lewat isi halaman — jenjang, lalu mata
 * pelajaran, lalu paket dan tryout di dalamnya — sehingga menu di atas hanya
 * akan menduplikasi jalan yang sama. Yang tersisa cuma jalan pulang (logo) dan
 * satu tindakan yang tidak punya tempat lain: menukar kode akses.
 */
export function SiteHeader() {
  const { openVoucher } = useVoucherDialog();

  return (
    // Kartu putih yang mengambang di atas pita warna halaman depan.
    <header className="sticky top-0 z-30 pt-3 sm:pt-4">
      <div className="container-page">
        <div className="flex h-14 items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/95 px-4 shadow-float backdrop-blur sm:h-16 sm:px-5">
          <Link href="/" className="flex items-center rounded" aria-label={`${site.name} — beranda`}>
            {/* Berkas lambangnya sudah memuat nama produk, jadi tanpa tulisan lagi. */}
            <Logo className="h-9 sm:h-11" priority decorative />
          </Link>

          <button
            type="button"
            onClick={() => openVoucher()}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <Icon name="ticket" className="h-4 w-4" strokeWidth={2} />
            {/* Layar sempit memakai label pendek agar tidak mendorong nama produk. */}
            <span className="sm:hidden">Akses</span>
            <span className="hidden sm:inline">Saya Punya Kode Akses</span>
          </button>
        </div>
      </div>
    </header>
  );
}
