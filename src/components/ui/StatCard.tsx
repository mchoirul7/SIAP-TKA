import type { ReactNode } from "react";
import { IconBadge } from "@/components/ui/IconBadge";
import type { IconName } from "@/components/ui/Icon";
import { toneLabel, toneSurface, toneValue, type AccentTone } from "@/lib/tone";

/**
 * Kartu angka: satu ikon, satu label, satu angka besar.
 * Dipakai berjajar untuk ringkasan hasil, rincian paket, dan rincian tryout.
 */
export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "brand",
  className,
  valueClassName = "text-2xl",
}: {
  icon: IconName;
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: AccentTone;
  className?: string;
  /** Angka panjang (misalnya durasi) diberi ukuran lebih kecil agar tidak terpotong. */
  valueClassName?: string;
}) {
  return (
    <div
      className={["rounded-2xl border p-4 shadow-card", toneSurface[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      <IconBadge name={icon} tone={tone} size="sm" />
      <p className={`mt-3 text-xs font-bold uppercase tracking-[0.08em] ${toneLabel[tone]}`}>
        {label}
      </p>
      <p className={`mt-0.5 font-extrabold tabular-nums ${valueClassName} ${toneValue[tone]}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-600">{hint}</p> : null}
    </div>
  );
}
