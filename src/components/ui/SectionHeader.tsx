import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
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
        <Tag className={`${titleSize} font-semibold tracking-tight`}>{title}</Tag>
        {description ? (
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
