"use client";

import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { useVoucherDialog } from "@/components/VoucherDialog";
import { site } from "@/lib/site";

const navItems: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Beranda", icon: "cap" },
  { href: "/latihan", label: "Latihan Soal", icon: "list-check" },
  { href: "/tryout", label: "Tryout", icon: "note" },
  { href: "/tentang", label: "FAQ", icon: "help" },
];

export function SiteHeader() {
  const { openVoucher } = useVoucherDialog();

  return (
    <header className="sticky top-0 z-30 pt-3 sm:pt-4">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-5 rounded-[18px] border border-white/80 bg-white/95 px-5 shadow-float backdrop-blur sm:h-[68px] sm:px-8">
          <Link href="/" className="flex shrink-0 items-center rounded" aria-label={`${site.name} - beranda`}>
            <Logo className="h-11 sm:h-[54px]" priority decorative />
          </Link>

          <nav aria-label="Navigasi utama" className="hidden min-w-0 flex-1 items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-ink-700 transition-colors hover:text-brand-700"
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" strokeWidth={2.3} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ShareButton />

            <button
              type="button"
              onClick={() => openVoucher()}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[11px] border border-brand-200 bg-white px-4 text-sm font-extrabold text-brand-700 shadow-[0_1px_0_rgba(80,1,218,0.08)] transition-colors hover:border-brand-400 hover:bg-brand-50 sm:px-5"
            >
              <Icon name="ticket" className="h-4 w-4" strokeWidth={2.3} />
              <span className="sm:hidden">Akses</span>
              <span className="hidden sm:inline">Saya Punya Kode Akses</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
