"use client";

import Link from "next/link";
import { LinkPending } from "@/components/NavigationProgress";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useEntitlements } from "@/hooks/useEntitlements";
import { ASSESSMENT_LABEL, semesterLabel } from "@/lib/assessment";
import { iconForPackage } from "@/lib/content-icons";
import { formatRupiah, packagePrice } from "@/lib/pricing";
import { buySinglePackageHref } from "@/lib/subject-catalog";
import type { ExamPackage } from "@/services/content-service";

/** Hiasan kartu tryout: mahkota dan bintang di atas latar gelap. */
function TryoutBanner() {
  return (
    <svg
      viewBox="0 0 320 88"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="tryout-crown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#f5a300" />
        </linearGradient>
      </defs>
      <circle cx="206" cy="50" r="54" fill="#ffffff" opacity="0.06" />
      <circle cx="206" cy="50" r="36" fill="#ffd34d" opacity="0.12" />
      <g transform="translate(176 28)">
        <path d="M4 40 L0 10 L16 22 L30 0 L44 22 L60 10 L56 40 Z" fill="url(#tryout-crown)" stroke="#c77800" strokeWidth="2" strokeLinejoin="round" />
        <rect x="4" y="40" width="52" height="9" rx="3" fill="#f5a300" stroke="#c77800" strokeWidth="2" />
        <circle cx="30" cy="27" r="4.5" fill="#ff5c8a" />
        <circle cx="16" cy="31" r="3" fill="#7dd3fc" />
        <circle cx="44" cy="31" r="3" fill="#7dd3fc" />
        <circle cx="0" cy="10" r="3.5" fill="#ffe27a" />
        <circle cx="30" cy="0" r="3.5" fill="#ffe27a" />
        <circle cx="60" cy="10" r="3.5" fill="#ffe27a" />
      </g>
      <g fill="#ffe27a">
        <path d="M150 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
        <path d="M306 62 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" />
        <path d="M262 64 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" opacity="0.7" />
        <path d="M120 16 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" opacity="0.5" />
      </g>
      <circle cx="160" cy="74" r="2.5" fill="#ffffff" opacity="0.6" />
      <circle cx="300" cy="16" r="2" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

/**
 * Kartu paket pada daftar /ujian. Tombolnya membawa ke halaman persiapan yang
 * sudah ada (`/latihan/[slug]` atau `/tryout/[slug]`), tempat pengerjaan dimulai.
 */
export function PackageCard({ pkg }: { pkg: ExamPackage }) {
  const { mounted, isUnlocked } = useEntitlements();
  const unlocked = pkg.isFreeAccess || (mounted && isUnlocked(pkg));
  const isTryout = pkg.kind === "tryout";
  const price = pkg.isFreeAccess ? null : formatRupiah(packagePrice(pkg.kind, pkg.assessmentType));
  // Ulangan harian mengingatkan bahwa paket lengkap per mapel lebih murah.
  const showSubjectHint = price !== null && pkg.assessmentType === "ulangan_harian";
  const href = isTryout
    ? `/tryout/${pkg.slug}`
    : unlocked
      ? `/latihan/${pkg.slug}`
      : `/latihan/${pkg.slug}?akses=1`;
  const statusLabel = pkg.isFreeAccess ? "Gratis" : unlocked ? "Terbuka" : "Premium";
  const cta = isTryout ? "Mulai Ujian" : "Mulai Latihan";
  // Paket terkunci bisa dibeli satuan lewat WhatsApp.
  const buyHref = unlocked
    ? null
    : buySinglePackageHref({
        context: [pkg.level, `Kelas ${pkg.gradeLevel}`, ...(pkg.semester ? [semesterLabel(pkg.semester)] : [])].join(" "),
        assessment: ASSESSMENT_LABEL[pkg.assessmentType],
        packageTitle: pkg.title,
        price: formatRupiah(packagePrice(pkg.kind, pkg.assessmentType)),
      });
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

  // Tryout memakai tampilan gelap berhias mahkota supaya terbedakan dari latihan.
  const theme = isTryout
    ? {
        card: "relative overflow-hidden border-[#2a1a6e] bg-gradient-to-b from-[#1b1150] to-[#2c1680] text-white shadow-[0_18px_34px_-22px_rgba(44,22,128,0.9)]",
        iconBox: "bg-amber-300/15 text-amber-300 ring-1 ring-inset ring-amber-300/40",
        title: "text-white",
        label: "bg-white/10 text-amber-100",
        meta: "text-indigo-200",
        priceLabel: "text-indigo-200",
        price: "text-amber-300",
        cta: "bg-gradient-to-r from-amber-300 to-amber-500 text-[#2a1460] shadow-[0_12px_24px_-14px_rgba(245,163,0,0.9)]",
        buy: "bg-white/10 text-amber-200 ring-1 ring-inset ring-amber-300/40 hover:bg-white/15",
      }
    : {
        card: "border-sky-100 bg-white shadow-[0_12px_24px_-22px_rgba(18,21,58,0.5)]",
        iconBox: "bg-brand-50 text-brand-700",
        title: "text-ink-900",
        label: "bg-sky-50 text-sky-800",
        meta: "text-slate-500",
        priceLabel: "text-slate-500",
        price: "text-brand-700",
        cta: "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-[0_12px_24px_-16px_rgba(80,1,218,0.9)]",
        buy: "bg-white text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-50",
      };

  return (
    <article className={`flex h-full flex-col rounded-[14px] border p-5 ${theme.card}`}>
      {isTryout ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[88px]">
          <TryoutBanner />
        </div>
      ) : null}
      <div className="relative flex items-start justify-between gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] ${theme.iconBox}`}>
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

      <h3 className={`relative mt-4 text-[18px] font-black leading-snug ${theme.title}`}>{pkg.title}</h3>

      <ul className="relative mt-4 flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <li key={label} className={`rounded-full px-2.5 py-1 text-xs font-bold ${theme.label}`}>
            {label}
          </li>
        ))}
      </ul>

      <ul className={`relative mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold ${theme.meta}`}>
        {meta.map((item) => (
          <li key={item.text} className="inline-flex items-center gap-1.5">
            <Icon name={item.icon} className="h-4 w-4" />
            {item.text}
          </li>
        ))}
      </ul>

      <div className="relative mt-auto pt-5">
        {showSubjectHint ? (
          <p
            className={[
              "mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
              isTryout ? "bg-amber-300/15 text-amber-200" : "bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            <Icon name="info" className="h-3.5 w-3.5" strokeWidth={2.4} />
            Lebih murah beli per mapel
          </p>
        ) : null}
        {/* Paket gratis tidak perlu ditunjukkan harganya. */}
        {price ? (
          <p className="mb-3 flex items-baseline justify-between gap-2">
            <span className={`text-xs font-bold uppercase tracking-wide ${theme.priceLabel}`}>Harga</span>
            <span className={`text-lg font-black ${theme.price}`}>{price}</span>
          </p>
        ) : null}
        <Link
          href={href}
          className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-black transition-opacity hover:opacity-90 ${theme.cta}`}
        >
          <LinkPending />
          <Icon name={unlocked ? "play" : "lock"} className="h-4 w-4" strokeWidth={2.4} />
          {cta}
        </Link>
        {buyHref ? (
          <a
            href={buyHref}
            target="_blank"
            rel="noreferrer"
            className={`mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] text-sm font-black transition-colors ${theme.buy}`}
          >
            <Icon name="whatsapp" className="h-4 w-4" />
            Beli Satuan
          </a>
        ) : null}
      </div>
    </article>
  );
}
