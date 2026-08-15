import { site } from "@/lib/site";

/**
 * Sampul kartu: bidang bergradasi dengan pola gelombang dan titik.
 * Dibuat sepenuhnya dengan CSS dan SVG sehingga tidak memerlukan berkas gambar.
 */

export type CoverTone = "orange" | "amber" | "rust" | "sunset" | "gold" | "ink";

const toneGradient: Record<CoverTone, string> = {
  orange: "from-brand-500 via-brand-600 to-brand-700",
  amber: "from-amber-400 via-brand-500 to-brand-600",
  rust: "from-brand-600 via-brand-700 to-brand-900",
  sunset: "from-brand-400 via-brand-600 to-rose-700",
  gold: "from-yellow-400 via-brand-500 to-brand-700",
  /** Dipakai kartu tryout, supaya jelas berbeda dari kartu paket latihan. */
  ink: "from-ink-700 via-ink-900 to-brand-900",
};

export function CoverArt({
  label,
  title,
  subtitle,
  tone = "orange",
  className = "",
}: {
  /** Penanda kecil di atas judul, misalnya "SIMULASI" atau "LATIHAN". */
  label: string;
  title: string;
  subtitle?: string;
  tone?: CoverTone;
  className?: string;
}) {
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
        className="pointer-events-none absolute -right-2 -top-2 h-24 w-40 text-white/25"
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-white/15"
        viewBox="0 0 400 96"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 46c60-34 120 26 200 8s140-44 200-14v56H0z" />
      </svg>

      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">{label}</p>
        <p className="mt-1 text-xl font-bold leading-tight text-white drop-shadow-sm sm:text-[22px]">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-1.5 text-xs leading-relaxed text-white/85">{subtitle}</p>
        ) : null}
      </div>

      {/* Penanda produk di sudut kanan bawah */}
      <span className="absolute bottom-4 right-5 z-10 text-[11px] font-bold tracking-tight text-white/80">
        {site.name}
      </span>
    </div>
  );
}
