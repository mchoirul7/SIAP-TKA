import type { ReactNode } from "react";

type Tone = "neutral" | "free" | "premium" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  free: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  premium: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-200",
  info: "bg-brand-800 text-white",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
