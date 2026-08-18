"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CoverArt, type CoverTone } from "@/components/CoverArt";
import type { PracticePackage } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { SubjectTheme } from "@/lib/subject-theme";
import { toneButton, toneChip, toneTag } from "@/lib/tone";

/** Warna sampul dipilih berulang dari daftar ini agar deretan kartu tidak seragam. */
const tones: CoverTone[] = ["grape", "gold", "aqua", "twilight"];

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
  const unlocked = mounted && isUnlocked(pkg);
  const locked = !unlocked;
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
        titleAs="h3"
        titleHref={`/latihan/${pkg.slug}`}
        subtitle={locked ? `${pkg.seriesTitle} - dibuka dengan kode akses` : "Latihan online dan pembahasan"}
      />

      <div className="flex flex-1 flex-col p-4">
        {/* Judulnya sudah terbaca di sampul, jadi badan kartu langsung ke
            keterangan. Status ikut turun menjadi keping pertama supaya barisnya
            seragam dan kartunya kehilangan satu baris yang tadinya kosong. */}
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{note ?? pkg.summary}</p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          <li
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              unlocked ? toneChip.emerald : toneChip.brand
            }`}
          >
            <Icon name={locked ? "lock" : "unlock"} className="h-3.5 w-3.5" strokeWidth={2.2} />
            {locked ? "Kode Akses" : "Terbuka"}
          </li>
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
