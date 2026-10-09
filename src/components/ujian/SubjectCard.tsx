import Image from "next/image";
import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon } from "@/components/ui/Icon";
import { formatRupiah } from "@/lib/pricing";
import type { SubjectTone } from "@/lib/subject-catalog";

const toneClass: Record<SubjectTone, { pill: string }> = {
  emerald: { pill: "bg-emerald-50 text-emerald-700" },
  sky: { pill: "bg-sky-50 text-sky-700" },
  orange: { pill: "bg-orange-50 text-orange-600" },
  violet: { pill: "bg-violet-50 text-violet-700" },
};

/**
 * Kartu mapel pada alur /ujian. Mapel yang punya paket diberi tombol "Cek
 * Paket" ke daftar paketnya dan "Beli" lewat WhatsApp; yang belum,
 * menampilkan "Belum tersedia" dan tombol request soal.
 */
export function SubjectCard({
  href,
  buyHref,
  requestHref,
  name,
  description,
  art,
  tone,
  packageCount,
  price,
  originalPrice,
  tryoutCount,
}: {
  href: string | null;
  /** Tautan WhatsApp untuk membeli paket lengkap; kosong bila tidak dijual. */
  buyHref: string | null;
  requestHref: string;
  name: string;
  description: string;
  art: string;
  tone: SubjectTone;
  packageCount: number;
  /** Harga paket lengkap dalam rupiah; kosong bila tidak dijual. */
  price: number | null;
  /** Total harga satuan semua paketnya, dicoret di samping harga paket lengkap. */
  originalPrice: number | null;
  /** Jumlah tryout, hanya untuk TKA; kosong pada jenis ujian lain. */
  tryoutCount: number | null;
}) {
  const colors = toneClass[tone];
  const body = (
    <>
      <span className="relative block aspect-[460/176] w-full overflow-hidden">
        <Image src={art} alt="" fill sizes="(min-width: 1280px) 19vw, (min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw" className="object-cover" />
      </span>
      <span className="relative -mt-4 flex flex-1 flex-col rounded-t-[1.1rem] bg-white px-4 pb-4 pt-4">
        <span className="block text-[17px] font-black leading-tight text-ink-900">{name}</span>
        <span className="mt-1.5 line-clamp-3 text-[14px] font-medium leading-snug text-slate-600">{description}</span>
        {/* Harga satu mapel berisi semua paketnya. */}
        {price !== null ? (
          <span className="mt-auto flex items-baseline justify-end gap-1.5 whitespace-nowrap pt-3">
            {originalPrice !== null ? (
              <s className="text-[13px] font-bold text-slate-400">{formatRupiah(originalPrice)}</s>
            ) : null}
            <span className="text-lg font-black text-brand-700">{formatRupiah(price)}</span>
          </span>
        ) : null}
        <span className={`flex flex-wrap items-center justify-between gap-1.5 ${price !== null ? "pt-2" : "mt-auto pt-3"}`}>
          {href ? (
            <>
              <span className="flex flex-wrap gap-1.5">
                <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold ${colors.pill}`}>
                  {packageCount} paket tersedia
                </span>
                {tryoutCount !== null ? (
                  <span className="whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-bold text-amber-700">
                    {tryoutCount}x tryout
                  </span>
                ) : null}
              </span>
              <span className={`mt-1.5 grid w-full gap-2 ${buyHref ? "grid-cols-2" : "grid-cols-1"}`}>
                <Link
                  href={href}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-gradient-to-b from-slate-50 to-slate-200 text-[13px] font-black text-slate-700 ring-1 ring-inset ring-slate-300 transition-colors hover:from-slate-100 hover:to-slate-300"
                >
                  <LinkPending />
                  Cek Paket
                </Link>
                {buyHref ? (
                  <a
                    href={buyHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-gradient-to-r from-brand-500 to-brand-700 text-[13px] font-black text-white shadow-[0_10px_20px_-14px_rgba(80,1,218,0.9)] transition-opacity hover:opacity-90"
                  >
                    <Icon name="whatsapp" className="h-4 w-4" />
                    Beli
                  </a>
                ) : null}
              </span>
            </>
          ) : (
            <>
              <span className="whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-1 text-[12px] font-bold text-rose-500">Belum tersedia</span>
              <a
                href={requestHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-1 text-[12px] font-black text-rose-600 transition-colors hover:bg-rose-100"
              >
                Request Soal
                <Icon name="arrow-right" className="h-3.5 w-3.5" strokeWidth={2.8} />
              </a>
            </>
          )}
        </span>
      </span>
    </>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.1rem] bg-white shadow-[0_16px_34px_-26px_rgba(18,21,58,0.5)] ring-1 ring-sky-100">
      {body}
    </div>
  );
}
