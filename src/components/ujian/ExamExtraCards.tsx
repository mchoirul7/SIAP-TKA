import Image from "next/image";
import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon } from "@/components/ui/Icon";

const coverSizes = "(min-width: 1280px) 19vw, (min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw";

const cardClass =
  "group flex h-full flex-col overflow-hidden rounded-[1.1rem] bg-white shadow-[0_16px_34px_-26px_rgba(18,21,58,0.5)] ring-1 transition-transform hover:-translate-y-0.5";

/**
 * Kartu pertama halaman pilih mapel: latihan ujicoba yang dibuka gratis.
 * Berwarna jingga supaya menonjol di antara kartu mapel.
 */
export function TrialCard({ href }: { href: string }) {
  return (
    <Link href={href} className={`${cardClass} ring-amber-300 hover:ring-amber-400`}>
      <span className="relative block aspect-[460/176] w-full overflow-hidden">
        <Image src="/beranda/mapel/ujicoba-gratis.svg" alt="" fill unoptimized sizes={coverSizes} className="object-cover" />
      </span>
      <span className="relative -mt-4 flex flex-1 flex-col rounded-t-[1.1rem] bg-gradient-to-b from-amber-50 to-orange-100 px-4 pb-4 pt-4">
        <span className="block text-[17px] font-black uppercase leading-tight text-orange-900">Ujicoba Gratis</span>
        <span className="mt-1.5 line-clamp-3 text-[14px] font-medium leading-snug text-orange-800/80">
          Coba dulu pengalaman ujian untuk ananda di sini.
        </span>
        {/* Seluruh kartu sudah berupa tautan, jadi tombolnya cukup tampilan. */}
        <span className="mt-auto pt-3">
          <span className="relative inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-amber-500 to-orange-600 text-sm font-black uppercase tracking-wide text-white shadow-[0_12px_24px_-16px_rgba(234,88,12,0.9)] transition-opacity group-hover:opacity-90">
            <LinkPending />
            Coba Sekarang
            <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.8} />
          </span>
        </span>
      </span>
    </Link>
  );
}

/** Kartu terakhir halaman pilih mapel: permintaan soal khusus lewat WhatsApp. */
export function CustomRequestCard({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`${cardClass} ring-brand-100 hover:ring-brand-200`}>
      <span className="relative block aspect-[460/176] w-full overflow-hidden">
        <Image src="/beranda/mapel/custom-request.svg" alt="" fill unoptimized sizes={coverSizes} className="object-cover" />
      </span>
      <span className="relative -mt-4 flex flex-1 flex-col rounded-t-[1.1rem] bg-white px-4 pb-4 pt-4">
        <span className="block text-[17px] font-black uppercase leading-tight text-ink-900">Custom Request</span>
        <span className="mt-1.5 line-clamp-3 text-[14px] font-medium leading-snug text-slate-600">
          Soal dari Anda, disusun sesuai kisi-kisi atau kebutuhan Anda. Hubungi kami lewat WhatsApp.
        </span>
        <span className="mt-auto flex items-center justify-between gap-1.5 pt-3">
          <span className="whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-bold text-brand-700">
            Hubungi WA
          </span>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-transform group-hover:translate-x-0.5">
            <Icon name="arrow-right" className="h-5 w-5" strokeWidth={2.8} />
          </span>
        </span>
      </span>
    </a>
  );
}
