"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CoverArt, type CoverTone } from "@/components/CoverArt";
import type { PracticePackage } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { SubjectTheme } from "@/lib/subject-theme";
import { toneButton, toneTag } from "@/lib/tone";

/** Warna sampul dipilih berulang dari daftar ini agar deretan kartu tidak seragam. */
const tones: CoverTone[] = ["orange", "amber", "rust", "sunset", "gold"];

export function PracticePackageCard({
  pkg,
  note,
  order,
  toneIndex = 0,
  theme,
  className = "",
}: {
  pkg: PracticePackage;
  /** Alasan singkat mengapa paket ini disarankan. */
  note?: string;
  order?: number;
  toneIndex?: number;
  /**
   * Warna mata pelajaran pemilik paket. Bila diisi, kartu memakai warna itu
   * sehingga sederet paket dari mapel yang sama terbaca sebagai satu kelompok.
   * Bila dikosongkan, warnanya berganti-ganti mengikuti `toneIndex`.
   */
  theme?: SubjectTheme;
  className?: string;
}) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = mounted && isUnlocked(pkg.slug, pkg.isPremium);
  const locked = pkg.isPremium && !unlocked;
  const accent = theme?.accent ?? "brand";

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
        tone={theme?.cover ?? tones[toneIndex % tones.length]}
        icon={theme?.icon}
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
          {(
            [
              { icon: "list-check", text: `${pkg.questionIds.length} soal` },
              { icon: "clock", text: `± ${pkg.estimatedMinutes} menit` },
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

        {/* Tombol menempel di dasar kartu agar deretan kartu tetap sejajar. */}
        <div className="mt-auto pt-4">
          <Link
            href={`/latihan/${pkg.slug}`}
            className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-opacity hover:opacity-90 ${toneButton[accent]}`}
          >
            <Icon name={locked ? "lock" : "play"} className="h-4 w-4" strokeWidth={2.2} />
            {locked ? "Buka Paket" : "Coba Sekarang"}
          </Link>
        </div>
      </div>
    </article>
  );
}
