import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LinkPending } from "@/components/NavigationProgress";
import { getSubjectTheme } from "@/lib/subject-theme";
import {
  toneButton,
  toneIconBox,
  toneSurface,
  toneTag,
  type AccentTone,
} from "@/lib/tone";
import type { SubjectSummary } from "@/services/content-service";

const subjectCoverByKeyword: { match: RegExp; src: string }[] = [
  { match: /matematika|math/, src: "/matematika.png" },
  { match: /bahasa[-\s]?indonesia|indonesian/, src: "/bahasaindonesia.png" },
  { match: /bahasa[-\s]?inggris|english/, src: "/bahasainggris.png" },
];

const coverOverlay: Record<AccentTone, string> = {
  brand: "from-brand-950/35 via-transparent to-brand-950/10",
  gold: "from-ink-950/25 via-transparent to-accent-950/10",
  aqua: "from-ink-950/25 via-transparent to-aqua-950/10",
  emerald: "from-emerald-950/25 via-transparent to-emerald-950/10",
  rose: "from-rose-950/25 via-transparent to-rose-950/10",
  sky: "from-ink-950/25 via-transparent to-aqua-950/10",
  amber: "from-ink-950/25 via-transparent to-accent-950/10",
  violet: "from-brand-950/35 via-transparent to-brand-950/10",
  slate: "from-ink-950/25 via-transparent to-ink-950/10",
};

function subjectCover(subject: { slug?: string; name?: string }) {
  const key = `${subject.slug ?? ""} ${subject.name ?? ""}`.toLowerCase();
  return subjectCoverByKeyword.find((item) => item.match.test(key))?.src;
}

export function SubjectCard({ summary }: { summary: SubjectSummary }) {
  const { subject, packageCount, tryoutCount, isAvailable } = summary;
  const theme = getSubjectTheme(subject);
  const coverSrc = subjectCover(subject);
  const linkDetails = [
    packageCount > 0 ? `${packageCount} paket latihan` : null,
    tryoutCount > 0 ? `${tryoutCount} tryout` : null,
  ].filter(Boolean);
  const linkLabel = `Buka ${subject.shortName}${
    linkDetails.length > 0 ? `, ${linkDetails.join(", ")}` : ""
  }`;

  const card = (
    <article
      className={[
        "flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-card transition-all",
        isAvailable
          ? "border-slate-200 hover:-translate-y-0.5 hover:shadow-float"
          : "border-slate-200 opacity-75",
      ].join(" ")}
      aria-disabled={isAvailable ? undefined : "true"}
    >
      <div
        className={`relative aspect-[3/2] overflow-hidden ${
          coverSrc ? "bg-slate-100" : toneSurface[theme.accent]
        }`}
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span
              aria-hidden="true"
              className={`flex h-14 w-14 items-center justify-center rounded-lg shadow-card ${toneIconBox[theme.accent]}`}
            >
              <Icon name={theme.icon} className="h-7 w-7" strokeWidth={2} />
            </span>
          </div>
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${coverOverlay[theme.accent]}`} />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={[
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-card",
              isAvailable
                ? toneIconBox[theme.accent]
                : "bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200",
            ].join(" ")}
          >
            <Icon name={theme.icon} className="h-5 w-5" strokeWidth={2.1} />
          </span>

          <div className="min-w-0 flex-1">
            <h4 className="break-words text-lg font-extrabold leading-snug text-ink-900">
              {subject.shortName}
            </h4>
            {isAvailable ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {packageCount > 0 ? (
                  <li
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      toneTag[theme.accent]
                    }`}
                  >
                    <Icon name="layers" className="h-3.5 w-3.5" strokeWidth={2.1} />
                    {packageCount} paket latihan
                  </li>
                ) : null}
                {tryoutCount > 0 ? (
                  <li
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      toneTag[theme.accent]
                    }`}
                  >
                    <Icon name="flag" className="h-3.5 w-3.5" strokeWidth={2.1} />
                    {tryoutCount} tryout
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">
                Segera hadir
              </p>
            )}
          </div>
        </div>

        <span
          aria-hidden="true"
          className={[
            "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-extrabold transition-opacity",
            isAvailable
              ? `${toneButton[theme.accent]} hover:opacity-90`
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {isAvailable ? <LinkPending /> : null}
          <Icon
            name={isAvailable ? "arrow-right" : "hourglass"}
            className="h-4 w-4"
            strokeWidth={2.2}
          />
          {isAvailable ? "Lihat Paket Soal" : "Segera Hadir"}
        </span>
      </div>
    </article>
  );

  if (!isAvailable) return card;

  return (
    <Link
      href={`/mapel/${subject.slug}`}
      className="group block h-full"
      aria-label={linkLabel}
    >
      {card}
    </Link>
  );
}
