import type { ReactNode } from "react";

/** Permukaan dasar: garis tipis, bukan bayangan. Dipakai hanya bila konten memang perlu dibatasi. */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={["rounded-lg border border-slate-200 bg-white", className].filter(Boolean).join(" ")}
    >
      {children}
    </Tag>
  );
}
