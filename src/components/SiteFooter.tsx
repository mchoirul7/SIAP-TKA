import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="container-page py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded bg-brand-800 text-xs font-bold text-white"
              >
                S
              </span>
              <span className="font-semibold tracking-tight text-ink-900">{site.name}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {site.tagline}. Simulasi dapat dikerjakan gratis, dan hasilnya menunjukkan bagian
              mana yang sebaiknya diperkuat lebih dulu.
            </p>
          </div>

          <nav aria-label="Tautan footer" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            <Link href="/tryout" className="text-slate-600 hover:text-brand-800">
              Tryout
            </Link>
            <Link href="/latihan" className="text-slate-600 hover:text-brand-800">
              Paket Latihan
            </Link>
            <Link href="/tentang" className="text-slate-600 hover:text-brand-800">
              Tentang
            </Link>
          </nav>
        </div>

        <p className="mt-8 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
          Versi prototype. Data soal, hasil, dan voucher masih bersifat contoh dan tersimpan di
          perangkat ini saja. {site.name} bukan bagian dari penyelenggara ujian resmi.
        </p>
      </div>
    </footer>
  );
}
