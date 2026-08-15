/**
 * Cincin nilai: skor 0–100 digambar sebagai busur.
 *
 * Bentuk lingkaran membuat besar-kecilnya nilai terbaca sebelum angkanya
 * dibaca — berguna di halaman hasil yang dilihat siswa sekilas.
 */

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Warna busur saat cincin dipakai di atas latar putih. */
function arcColor(value: number): string {
  if (value >= 80) return "text-emerald-500";
  if (value >= 60) return "text-amber-500";
  return "text-rose-500";
}

export function ScoreRing({
  value,
  variant = "on-color",
  className = "h-32 w-32",
}: {
  /** 0–100 */
  value: number;
  /** `on-color` untuk di atas bidang oranye, `on-white` untuk di atas kartu putih. */
  variant?: "on-color" | "on-white";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const onColor = variant === "on-color";

  return (
    <div className={`relative shrink-0 ${className}`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          className={onColor ? "text-white/25" : "text-slate-200"}
          stroke="currentColor"
        />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          stroke="currentColor"
          className={[
            "transition-[stroke-dashoffset] duration-700",
            onColor ? "text-white" : arcColor(clamped),
          ].join(" ")}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped / 100)}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-3xl font-extrabold tabular-nums leading-none ${
            onColor ? "text-white" : "text-ink-900"
          }`}
        >
          {clamped}
        </span>
        <span className={`text-xs font-semibold ${onColor ? "text-white/75" : "text-slate-500"}`}>
          dari 100
        </span>
      </div>
      <span className="sr-only">Skor {clamped} dari 100</span>
    </div>
  );
}
