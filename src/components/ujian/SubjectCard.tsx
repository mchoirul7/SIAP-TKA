import Image from "next/image";
import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon } from "@/components/ui/Icon";
import type { SubjectTone } from "@/lib/subject-catalog";

const toneClass: Record<SubjectTone, { pill: string; arrow: string }> = {
  emerald: { pill: "bg-emerald-50 text-emerald-700", arrow: "bg-emerald-50 text-emerald-600" },
  sky: { pill: "bg-sky-50 text-sky-700", arrow: "bg-sky-50 text-sky-600" },
  orange: { pill: "bg-orange-50 text-orange-600", arrow: "bg-orange-50 text-orange-500" },
  violet: { pill: "bg-violet-50 text-violet-700", arrow: "bg-violet-50 text-violet-600" },
};

/**
 * Kartu mapel pada alur /ujian. Mapel yang punya paket menautkan ke daftar
 * paketnya; yang belum, menampilkan "Belum tersedia" dan tombol request soal.
 */
export function SubjectCard({
  href,
  requestHref,
  name,
  description,
  art,
  tone,
  packageCount,
}: {
  href: string | null;
  requestHref: string;
  name: string;
  description: string;
  art: string;
  tone: SubjectTone;
  packageCount: number;
}) {
  const colors = toneClass[tone];
  const body = (
    <>
      <span className="relative block aspect-[460/176] w-full overflow-hidden">
        <Image src={art} alt="" fill sizes="(min-width: 1280px) 19vw, (min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw" className="object-cover" />
      </span>
      <span className="relative -mt-4 flex flex-1 flex-col rounded-t-[1.1rem] bg-white px-4 pb-4 pt-4">
        <span className="block text-[17px] font-black leading-tight text-ink-900">{name}</span>
        <span className="mt-1.5 block text-[14px] font-medium leading-snug text-slate-600">{description}</span>
        <span className="mt-auto flex flex-wrap items-center justify-between gap-1.5 pt-3">
          {href ? (
            <>
              <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold ${colors.pill}`}>
                {packageCount} paket tersedia
              </span>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5 ${colors.arrow}`}>
                <LinkPending />
                <Icon name="arrow-right" className="h-5 w-5" strokeWidth={2.8} />
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

  const className =
    "group flex h-full flex-col overflow-hidden rounded-[1.1rem] bg-white shadow-[0_16px_34px_-26px_rgba(18,21,58,0.5)] ring-1 ring-sky-100";

  return href ? (
    <Link href={href} className={`${className} transition-transform hover:-translate-y-0.5 hover:ring-brand-200`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
