import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Kartu pilihan pada alur /ujian: jenis ujian maupun semester. Isinya sengaja
 * sedikit — ikon, nama, satu kalimat — dan seluruh kartu adalah tautan.
 */
export function ExamTypeCard({
  href,
  title,
  description,
  icon,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  icon?: IconName;
  /** Pengganti ilustrasi, misalnya angka semester. */
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[14px] border border-sky-100 bg-white p-5 shadow-[0_16px_34px_-26px_rgba(18,21,58,0.5)] transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_20px_36px_-24px_rgba(80,1,218,0.45)] sm:p-6"
    >
      <span className="flex items-start justify-between gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-brand-50 to-sky-50 text-brand-700 ring-1 ring-inset ring-brand-100">
          {icon ? (
            <Icon name={icon} className="h-8 w-8" strokeWidth={2.2} />
          ) : (
            <span className="text-[26px] font-black text-brand-700">{badge}</span>
          )}
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
          <LinkPending />
          <Icon name="arrow-right" className="h-5 w-5" strokeWidth={2.6} />
        </span>
      </span>
      <span className="mt-5 block text-[21px] font-black leading-tight text-ink-900">{title}</span>
      <span className="mt-2 block text-[15px] font-medium leading-snug text-slate-600">{description}</span>
    </Link>
  );
}
