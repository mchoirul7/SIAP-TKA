"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useVoucherDialog } from "@/components/VoucherDialog";
import { site } from "@/lib/site";

/**
 * Header sengaja tidak memuat tautan navigasi.
 *
 * Penelusuran produk sudah berjalan lewat isi halaman — jenjang, lalu mata
 * pelajaran, lalu paket dan tryout di dalamnya — sehingga menu di atas hanya
 * akan menduplikasi jalan yang sama. Yang tersisa cuma jalan pulang (logo) dan
 * satu tindakan yang tidak punya tempat lain: menukar kode voucher.
 */
export function SiteHeader() {
  const { openVoucher } = useVoucherDialog();

  return (
    // Kartu putih yang mengambang di atas pita warna halaman depan.
    <header className="sticky top-0 z-30 pt-3 sm:pt-4">
      <div className="container-page">
        <div className="flex h-14 items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/95 px-4 shadow-float backdrop-blur sm:h-16 sm:px-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded"
            aria-label={`${site.name} — beranda`}
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white"
            >
              S
            </span>
            <span className="text-[17px] font-semibold tracking-tight text-ink-900">
              {site.name}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => openVoucher()}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-400 hover:bg-brand-50"
          >
            <Icon name="ticket" className="h-4 w-4" strokeWidth={2} />
            {/* Layar sempit memakai label pendek agar tidak mendorong nama produk. */}
            <span className="sm:hidden">Voucher</span>
            <span className="hidden sm:inline">Saya Punya Voucher</span>
          </button>
        </div>
      </div>
    </header>
  );
}
