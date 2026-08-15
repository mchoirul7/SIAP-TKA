import Link from "next/link";
import { CoverArt, type CoverTone } from "@/components/CoverArt";
import { Badge } from "@/components/ui/Badge";
import { LinkPending } from "@/components/NavigationProgress";
import type { Tryout } from "@/data/types";

export function TryoutCard({
  tryout,
  tone = "ink",
  className = "",
}: {
  tryout: Tryout;
  tone?: CoverTone;
  className?: string;
}) {
  return (
    <article
      className={[
        "flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white",
        "shadow-card transition-shadow hover:shadow-float",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CoverArt
        className="h-40"
        tone={tone}
        label={tryout.variantLabel}
        title={tryout.title}
        subtitle="Gratis, tanpa akun, hasil langsung"
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-bold leading-snug tracking-tight text-ink-900">
            <Link href={`/tryout/${tryout.slug}`} className="hover:underline">
              {tryout.title}
            </Link>
          </h3>
          <Badge tone="free">Gratis</Badge>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {tryout.description}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {[
            `${tryout.questionIds.length} soal`,
            `${tryout.durationMinutes} menit`,
            `Jenjang ${tryout.level}`,
          ].map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-100"
            >
              {tag}
            </li>
          ))}
        </ul>

        <Link
          href={`/tryout/${tryout.slug}`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <LinkPending />
          Coba Sekarang
        </Link>
      </div>
    </article>
  );
}
