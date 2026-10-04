import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/** Pengganti daftar yang kosong: penjelasan singkat dan jalan kembali. */
export function ExamEmptyState({
  message,
  backHref,
  backLabel,
}: {
  message: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mt-6 rounded-[16px] border border-dashed border-brand-200 bg-gradient-to-br from-brand-50 via-white to-sky-50 p-6 sm:p-8">
      <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white text-brand-700 shadow-[0_10px_20px_-16px_rgba(80,1,218,0.8)]">
        <Icon name="info" className="h-6 w-6" strokeWidth={2.3} />
      </span>
      <p className="mt-4 max-w-2xl text-[18px] font-black leading-snug text-ink-900">{message}</p>
      <p className="mt-2 max-w-2xl text-[15px] font-medium leading-relaxed text-slate-600">
        Paket baru terus ditambahkan. Sementara itu, coba pilihan lain yang sudah tersedia.
      </p>
      <Link
        href={backHref}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-[10px] bg-gradient-to-r from-brand-600 to-brand-700 px-5 text-sm font-black text-white shadow-[0_12px_24px_-16px_rgba(80,1,218,0.9)]"
      >
        <Icon name="arrow-left" className="h-4 w-4" strokeWidth={2.6} />
        {backLabel}
      </Link>
    </div>
  );
}
