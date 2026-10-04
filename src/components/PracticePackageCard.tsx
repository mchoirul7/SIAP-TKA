"use client";

import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { PracticePackage } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import { iconForPackage } from "@/lib/content-icons";
import type { SubjectTheme } from "@/lib/subject-theme";
import { toneButton, toneChip, toneTag } from "@/lib/tone";

export function PracticePackageCard({
  pkg,
  note,
  order,
  theme,
  className = "",
}: {
  pkg: PracticePackage;
  /** Alasan singkat mengapa paket ini disarankan. */
  note?: string;
  order?: number;
  toneIndex?: number;
  theme?: SubjectTheme;
  className?: string;
}) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = pkg.isFreeAccess || (mounted && isUnlocked(pkg));
  const locked = !unlocked;
  const accent = theme?.accent ?? "brand";
  const packageIcon = iconForPackage(pkg, theme?.icon ?? "list-check");
  const packageHref = locked ? `/latihan/${pkg.slug}?akses=1` : `/latihan/${pkg.slug}`;
  const statusLabel = pkg.isFreeAccess ? "Gratis" : locked ? "Buka Akses" : "Terbuka";

  return (
    <article
      className={[
        "flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white",
        "shadow-card transition-shadow hover:shadow-float",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4">
        <span
          aria-hidden="true"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${toneTag[accent]}`}
        >
          <Icon name={packageIcon} className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
            {order ? `Langkah ${order} - Latihan` : "Latihan"}
          </p>
          <h3 className="mt-1 break-words text-[18px] font-black leading-snug text-ink-900">
            <Link href={packageHref} className="hover:text-brand-700">
              {pkg.title}
            </Link>
          </h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {locked ? "Buka dengan kode akses" : "Latihan online dan pembahasan"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{note ?? pkg.summary}</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          <li
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              unlocked ? toneChip.emerald : toneChip.brand
            }`}
          >
            <Icon name={locked ? "lock" : "unlock"} className="h-3.5 w-3.5" strokeWidth={2.2} />
            {statusLabel}
          </li>
          {(
            [
              { icon: "list-check", text: `${pkg.questionIds.length} soal` },
              { icon: "clock", text: `+/- ${pkg.estimatedMinutes} menit` },
              { icon: "chart", text: pkg.difficultyRange },
            ] satisfies { icon: IconName; text: string }[]
          ).map((tag) => (
            <li
              key={tag.text}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneTag[accent]}`}
            >
              <Icon name={tag.icon} className="h-3.5 w-3.5" />
              {tag.text}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4">
          <Link
            href={packageHref}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-opacity hover:opacity-90 ${toneButton[accent]}`}
          >
            <LinkPending />
            <Icon name={locked ? "lock" : "play"} className="h-4 w-4" strokeWidth={2.2} />
            {locked ? "Buka Akses" : "Coba Sekarang"}
          </Link>
        </div>
      </div>
    </article>
  );
}
