import { Icon, type IconName } from "@/components/ui/Icon";
import { toneIconBox, type AccentTone } from "@/lib/tone";

const sizes = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-2xl", icon: "h-6 w-6" },
} as const;

/** Kotak ikon berwarna. Dipakai sebagai penanda di judul bagian dan di kartu. */
export function IconBadge({
  name,
  tone = "brand",
  size = "md",
  className,
}: {
  name: IconName;
  tone?: AccentTone;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex shrink-0 items-center justify-center shadow-card",
        sizes[size].box,
        toneIconBox[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon name={name} className={sizes[size].icon} strokeWidth={2} />
    </span>
  );
}
