export function ProgressBar({
  value,
  barClassName = "bg-brand-700",
  className,
  label,
}: {
  /** 0–100 */
  value: number;
  barClassName?: string;
  className?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={["h-2 w-full overflow-hidden rounded-full bg-slate-200", className]
        .filter(Boolean)
        .join(" ")}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={["h-full rounded-full transition-[width] duration-300", barClassName].join(" ")}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
