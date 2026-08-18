import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Sampul kartu: bidang bergradasi dengan pola gelombang dan titik.
 * Dibuat sepenuhnya dengan CSS dan SVG sehingga tidak memerlukan berkas gambar.
 */

/**
 * Seluruh gradasi disusun dari empat warna lambang Siap TKA One, jadi kartu
 * apa pun tetap terbaca sekeluarga dengan lambangnya.
 */
export type CoverTone =
  /** Ungu topi wisuda — warna utama. */
  | "grape"
  /** Kuning keemasan tulisan "ONE". */
  | "gold"
  /** Biru es tulisan "SiAP TKA". */
  | "aqua"
  /** Biru dongker garis tepi; dipakai kartu tryout agar berbeda dari latihan. */
  | "ink"
  /** Ungu yang meluruh ke dongker, untuk kartu yang perlu lebih tenang. */
  | "twilight";

const toneGradient: Record<CoverTone, string> = {
  grape: "from-brand-400 via-brand-600 to-brand-800",
  gold: "from-accent-300 via-accent-500 to-accent-700",
  aqua: "from-aqua-300 via-aqua-500 to-aqua-700",
  ink: "from-ink-700 via-ink-900 to-brand-900",
  twilight: "from-brand-500 via-brand-800 to-ink-900",
};

/**
 * Kuning keemasan dan biru es terlalu terang untuk tulisan putih — di atas
 * keduanya teks memakai biru dongker lambang, sekaligus pola hiasannya.
 * Warnanya tetap warna lambang; yang berubah hanya tinta di atasnya.
 */
const toneOnDark: Record<CoverTone, boolean> = {
  grape: true,
  gold: false,
  aqua: false,
  ink: true,
  twilight: true,
};

export function CoverArt({
  label,
  title,
  titleAs: TitleTag = "p",
  titleHref,
  subtitle,
  tone = "grape",
  icon,
  className = "",
}: {
  /** Penanda kecil di atas judul, misalnya "SIMULASI" atau "LATIHAN". */
  label: string;
  title: string;
  /**
   * Judul sampul sekaligus judul kartunya. Kartu yang berdiri di dalam daftar
   * mengisinya dengan "h3" supaya judul itu terbaca sebagai tajuk dan badan
   * kartu tidak perlu mengulanginya.
   */
  titleAs?: "p" | "h2" | "h3";
  /** Bila diisi, judulnya menjadi tautan ke halaman kartu. */
  titleHref?: string;
  subtitle?: string;
  tone?: CoverTone;
  /** Ikon khas mata pelajaran, ditampilkan sebagai keping di sebelah penanda. */
  icon?: IconName;
  className?: string;
}) {
  const onDark = toneOnDark[tone];
  const ink = {
    pattern: onDark ? "text-white/25" : "text-ink-900/15",
    wave: onDark ? "text-white/15" : "text-white/25",
    chip: onDark
      ? "bg-white/20 text-white ring-white/30"
      : "bg-ink-900/10 text-ink-900 ring-ink-900/15",
    label: onDark ? "text-white/75" : "text-ink-800/75",
    title: onDark ? "text-white drop-shadow-sm" : "text-ink-900",
    subtitle: onDark ? "text-white/85" : "text-ink-800/85",
  };

  return (
    <div
      className={[
        "relative isolate flex flex-col justify-center overflow-hidden bg-gradient-to-br p-5",
        toneGradient[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Pola titik di sudut kanan atas */}
      <svg
        aria-hidden="true"
        className={`pointer-events-none absolute -right-2 -top-2 h-24 w-40 ${ink.pattern}`}
        viewBox="0 0 160 96"
        fill="currentColor"
      >
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 8 }).map((__, column) => (
            <rect
              key={`${row}-${column}`}
              x={column * 20 + 4}
              y={row * 18 + 4}
              width={column % 3 === 0 ? 14 : 8}
              height={8}
              rx={4}
            />
          )),
        )}
      </svg>

      {/* Gelombang lembut di bagian bawah */}
      <svg
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full ${ink.wave}`}
        viewBox="0 0 400 96"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 46c60-34 120 26 200 8s140-44 200-14v56H0z" />
      </svg>

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          {icon ? (
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset ${ink.chip}`}
            >
              <Icon name={icon} className="h-4 w-4" strokeWidth={2} />
            </span>
          ) : null}
          <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${ink.label}`}>{label}</p>
        </div>
        <TitleTag className={`mt-1 text-xl font-bold leading-tight sm:text-[22px] ${ink.title}`}>
          {titleHref ? (
            <Link href={titleHref} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </TitleTag>
        {subtitle ? (
          <p className={`mt-1.5 text-xs leading-relaxed ${ink.subtitle}`}>{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
