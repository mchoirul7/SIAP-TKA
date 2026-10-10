"use client";

import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Tryout } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import { iconForPackage } from "@/lib/content-icons";
import { toneChip } from "@/lib/tone";

export function TryoutCard({
  tryout,
  className = "",
}: {
  tryout: Tryout;
  className?: string;
}) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = mounted && isUnlocked(tryout);
  const locked = !unlocked;
  const tryoutIcon = iconForPackage(tryout, "trophy");

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
      <div className="flex items-start gap-3 border-b border-rose-100 bg-gradient-to-br from-rose-50 via-white to-slate-50 p-4">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
        >
          <Icon name={tryoutIcon} className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-rose-700">
            {tryout.variantLabel}
          </p>
          <h3 className="mt-1 break-words text-[18px] font-black leading-snug text-ink-900">
            <Link href={`/tryout/${tryout.slug}`} className="hover:text-rose-700">
              {tryout.title}
            </Link>
          </h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {locked ? "Masuk dengan PIN akun untuk membuka" : "Tryout dan hasil terbuka"}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{tryout.description}</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          <li
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              unlocked ? toneChip.emerald : toneChip.brand
            }`}
          >
            <Icon name={locked ? "lock" : "unlock"} className="h-3.5 w-3.5" strokeWidth={2.2} />
            {locked ? "Berbayar" : "Terbuka"}
          </li>
          {(
            [
              {
                icon: "list-check",
                text: `${tryout.questionIds.length} soal`,
                tone: "bg-brand-50 text-brand-800 ring-brand-100",
              },
              {
                icon: "hourglass",
                text: `${tryout.durationMinutes} menit`,
                tone: "bg-rose-50 text-rose-800 ring-rose-100",
              },
              {
                icon: "cap",
                text: `Jenjang ${tryout.level}`,
                tone: "bg-aqua-50 text-aqua-800 ring-aqua-100",
              },
            ] satisfies { icon: IconName; text: string; tone: string }[]
          ).map((tag) => (
            <li
              key={tag.text}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tag.tone}`}
            >
              <Icon name={tag.icon} className="h-3.5 w-3.5" />
              {tag.text}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4">
          <Link
            href={`/tryout/${tryout.slug}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <LinkPending />
            <Icon name={locked ? "lock" : "play"} className="h-4 w-4" strokeWidth={2.2} />
            {locked ? "Buka Tryout" : "Mulai Tryout"}
          </Link>
        </div>
      </div>
    </article>
  );
}
