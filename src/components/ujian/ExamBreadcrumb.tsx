import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export interface ExamCrumb {
  label: string;
  /** Kosong untuk posisi saat ini. */
  href?: string;
}

export function ExamBreadcrumb({ items }: { items: ExamCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-500">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
            {index > 0 ? <Icon name="arrow-right" className="h-3.5 w-3.5 text-slate-300" strokeWidth={2.6} /> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-brand-700">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
