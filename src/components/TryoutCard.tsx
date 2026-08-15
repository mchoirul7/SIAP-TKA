import Link from "next/link";
import { CoverArt, type CoverTone } from "@/components/CoverArt";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";
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
          {(
            [
              { icon: "list-check", text: `${tryout.questionIds.length} soal`, tone: "bg-brand-50 text-brand-800 ring-brand-100" },
              { icon: "hourglass", text: `${tryout.durationMinutes} menit`, tone: "bg-rose-50 text-rose-800 ring-rose-100" },
              { icon: "cap", text: `Jenjang ${tryout.level}`, tone: "bg-sky-50 text-sky-800 ring-sky-100" },
            ] satisfies { icon: IconName; text: string; tone: string }[]
          ).map((tag) => (
            <li
              key={tag.text}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tag.tone}`}
            >
              <Icon name={tag.icon} className="h-3.5 w-3.5" />
              {tag.text}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4">
          <Link
            href={`/tryout/${tryout.slug}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            <LinkPending />
            <Icon name="play" className="h-4 w-4" strokeWidth={2.2} />
            Coba Sekarang
          </Link>
        </div>
      </div>
    </article>
  );
}
