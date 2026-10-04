import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ExamBreadcrumb, type ExamCrumb } from "./ExamBreadcrumb";

/** Kepala halaman yang sama untuk setiap langkah alur /ujian. */
export function ExamPageHeader({
  breadcrumb,
  back,
  eyebrow,
  title,
  subtitle,
}: {
  breadcrumb: ExamCrumb[];
  back?: { href: string; label: string };
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header>
      <ExamBreadcrumb items={breadcrumb} />
      {back ? (
        <Link
          href={back.href}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-700"
        >
          <Icon name="arrow-left" className="h-4 w-4" strokeWidth={2.5} />
          {back.label}
        </Link>
      ) : null}
      {eyebrow ? (
        <p className="mt-5 inline-flex h-8 items-center rounded-full bg-brand-100 px-3.5 text-sm font-black text-brand-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-3 text-[32px] font-black leading-[1.08] text-ink-900 sm:text-[40px]">{title}</h1>
      {subtitle ? <p className="mt-2 text-[17px] font-medium text-slate-600">{subtitle}</p> : null}
    </header>
  );
}
