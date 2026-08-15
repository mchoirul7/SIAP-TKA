import type { ReactNode } from "react";
import type { IconName } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import type { AccentTone } from "@/lib/tone";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  icon,
  iconTone = "brand",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Ikon penanda di sebelah judul, agar judul bagian tidak tampil polos. */
  icon?: IconName;
  iconTone?: AccentTone;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const titleSize = Tag === "h1" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";

  return (
    <div
      className={["flex flex-wrap items-end justify-between gap-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <Tag className={`flex items-center gap-2.5 ${titleSize} font-extrabold tracking-tight`}>
          {icon ? <IconBadge name={icon} tone={iconTone} size="md" /> : null}
          {title}
        </Tag>
        {description ? (
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
