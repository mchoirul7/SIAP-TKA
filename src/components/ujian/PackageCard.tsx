"use client";

import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useEntitlements } from "@/hooks/useEntitlements";
import { ASSESSMENT_LABEL, semesterLabel } from "@/lib/assessment";
import { iconForPackage } from "@/lib/content-icons";
import type { ExamPackage } from "@/services/content-service";

/**
 * Harga satu paket, sama untuk semua mata pelajaran dan kelas. Latihan TKA
 * dihargai lebih tinggi daripada latihan ulangan dan sumatif.
 */
function priceLabel(pkg: ExamPackage): string {
  if (pkg.kind === "tryout") return "Rp20.000";
  return pkg.assessmentType === "tka" ? "Rp5.000" : "Rp2.500";
}

/**
 * Kartu paket pada daftar /ujian. Tombolnya membawa ke halaman persiapan yang
 * sudah ada (`/latihan/[slug]` atau `/tryout/[slug]`), tempat pengerjaan dimulai.
 */
export function PackageCard({ pkg }: { pkg: ExamPackage }) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = pkg.isFreeAccess || (mounted && isUnlocked(pkg));
  const isTryout = pkg.kind === "tryout";
  const href = isTryout
    ? `/tryout/${pkg.slug}`
    : unlocked
      ? `/latihan/${pkg.slug}`
      : `/latihan/${pkg.slug}?akses=1`;
  const statusLabel = pkg.isFreeAccess ? "Gratis" : unlocked ? "Terbuka" : "Premium";
  const cta = isTryout ? "Mulai Ujian" : "Mulai Latihan";
  const packageIcon = iconForPackage(pkg, isTryout ? "trophy" : "list-check");

  const meta: { icon: IconName; text: string }[] = [
    { icon: "list-check", text: `${pkg.questionCount} soal` },
    ...(pkg.minutes
      ? [{ icon: "clock" as const, text: isTryout ? `${pkg.minutes} menit` : `± ${pkg.minutes} menit` }]
      : []),
  ];
  const labels = [
    ASSESSMENT_LABEL[pkg.assessmentType],
    isTryout ? "Tryout" : "Latihan",
    `Kelas ${pkg.gradeLevel}`,
    ...(pkg.semester ? [semesterLabel(pkg.semester)] : []),
  ];

  return (
    <article className="flex h-full flex-col rounded-[14px] border border-sky-100 bg-white p-5 shadow-[0_12px_24px_-22px_rgba(18,21,58,0.5)]">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-brand-50 text-brand-700">
          <Icon name={packageIcon} className="h-5 w-5" strokeWidth={2.4} />
        </span>
        <span
          className={[
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
            unlocked ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
          ].join(" ")}
        >
          <Icon name={unlocked ? "unlock" : "lock"} className="h-3.5 w-3.5" strokeWidth={2.2} />
          {statusLabel}
        </span>
      </div>

      <h3 className="mt-4 text-[18px] font-black leading-snug text-ink-900">{pkg.title}</h3>
      {pkg.summary ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{pkg.summary}</p>
      ) : null}

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <li key={label} className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">
            {label}
          </li>
        ))}
      </ul>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-slate-500">
        {meta.map((item) => (
          <li key={item.text} className="inline-flex items-center gap-1.5">
            <Icon name={item.icon} className="h-4 w-4" />
            {item.text}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5">
        {/* Paket gratis tidak perlu ditunjukkan harganya. */}
        {!pkg.isFreeAccess ? (
          <p className="mb-3 flex items-baseline justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Harga</span>
            <span className="text-lg font-black text-brand-700">{priceLabel(pkg)}</span>
          </p>
        ) : null}
        <Link
          href={href}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-brand-500 to-brand-700 text-sm font-black text-white shadow-[0_12px_24px_-16px_rgba(80,1,218,0.9)] transition-opacity hover:opacity-90"
        >
          <LinkPending />
          <Icon name={unlocked ? "play" : "lock"} className="h-4 w-4" strokeWidth={2.4} />
          {cta}
        </Link>
      </div>
    </article>
  );
}
