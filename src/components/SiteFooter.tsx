import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-50">
      <div className="container-page py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <Logo className="h-10" />
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {site.tagline}. Simulasi latihan dan tryout TKA dan hasilnya menunjukkan bagian
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

      </div>
    </footer>
  );
}
