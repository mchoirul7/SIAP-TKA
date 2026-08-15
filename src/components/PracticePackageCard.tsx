"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CoverArt, type CoverTone } from "@/components/CoverArt";
import type { PracticePackage } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";

/** Warna sampul dipilih berulang dari daftar ini agar deretan kartu tidak seragam. */
const tones: CoverTone[] = ["orange", "amber", "rust", "sunset", "gold"];

export function PracticePackageCard({
  pkg,
  note,
  order,
  toneIndex = 0,
  className = "",
}: {
  pkg: PracticePackage;
  /** Alasan singkat mengapa paket ini disarankan. */
  note?: string;
  order?: number;
  toneIndex?: number;
  className?: string;
}) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = mounted && isUnlocked(pkg.slug, pkg.isPremium);
  const locked = pkg.isPremium && !unlocked;

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
      <CoverArt
        className="h-40"
        tone={tones[toneIndex % tones.length]}
        label={order ? `Langkah ${order} · Latihan` : "Latihan"}
        title={pkg.title}
        subtitle={locked ? "Dibuka dengan kode voucher" : "Latihan online dan pembahasan"}
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-bold leading-snug tracking-tight text-ink-900">
            <Link href={`/latihan/${pkg.slug}`} className="hover:underline">
              {pkg.title}
            </Link>
          </h3>
          {pkg.isPremium ? (
            unlocked ? (
              <Badge tone="free">Terbuka</Badge>
            ) : (
              <Badge tone="premium">Premium</Badge>
            )
          ) : (
            <Badge tone="free">Gratis</Badge>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {note ?? pkg.summary}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {[`${pkg.questionIds.length} soal`, `± ${pkg.estimatedMinutes} menit`, pkg.difficultyRange].map(
            (tag) => (
              <li
                key={tag}
                className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-100"
              >
                {tag}
              </li>
            ),
          )}
        </ul>

        <Link
          href={`/latihan/${pkg.slug}`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          {locked ? "Buka Paket" : "Coba Sekarang"}
        </Link>
      </div>
    </article>
  );
}
