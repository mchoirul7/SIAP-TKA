import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LinkPending } from "@/components/NavigationProgress";
import { getSubjectTheme } from "@/lib/subject-theme";
import type { SubjectSummary } from "@/services/content-service";

const subjectCoverByKeyword: { match: RegExp; src: string }[] = [
  { match: /matematika|math/, src: "/matematika.png" },
  { match: /bahasa[-\s]?indonesia|indonesian/, src: "/bahasaindonesia.png" },
  { match: /bahasa[-\s]?inggris|english/, src: "/bahasainggris.png" },
];

const tone = {
  brand: {
    stat: "bg-brand-50 text-brand-700 ring-brand-100",
    button: "from-brand-500 to-brand-700 text-white",
  },
  gold: {
    stat: "bg-orange-50 text-orange-600 ring-orange-100",
    button: "from-amber-400 to-orange-600 text-white",
  },
  aqua: {
    stat: "bg-sky-50 text-sky-600 ring-sky-100",
    button: "from-cyan-400 to-sky-600 text-white",
  },
  emerald: {
    stat: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    button: "from-emerald-400 to-emerald-600 text-white",
  },
  rose: {
    stat: "bg-rose-50 text-rose-600 ring-rose-100",
    button: "from-rose-400 to-rose-600 text-white",
  },
  sky: {
    stat: "bg-sky-50 text-sky-600 ring-sky-100",
    button: "from-sky-400 to-sky-600 text-white",
  },
  amber: {
    stat: "bg-amber-50 text-amber-600 ring-amber-100",
    button: "from-amber-400 to-orange-600 text-white",
  },
  violet: {
    stat: "bg-violet-50 text-violet-600 ring-violet-100",
    button: "from-violet-500 to-brand-700 text-white",
  },
  slate: {
    stat: "bg-slate-50 text-slate-600 ring-slate-100",
    button: "from-slate-500 to-slate-700 text-white",
  },
} as const;

function subjectKey(subject: { slug?: string; name?: string }) {
  return `${subject.slug ?? ""} ${subject.name ?? ""}`.toLowerCase();
}

function subjectCover(subject: { slug?: string; name?: string }) {
  const key = subjectKey(subject);
  return subjectCoverByKeyword.find((item) => item.match.test(key))?.src;
}

function ctaName(name: string) {
  return name.replace(/^TKA\s+/i, "");
}

function levelName(level: SubjectSummary["subject"]["level"]) {
  if (level === "SMA") return "SMA/MA/SMK";
  if (level === "SMP") return "SMP/MTs";
  return "SD/MI";
}

export function SubjectCard({ summary }: { summary: SubjectSummary }) {
  const { subject, packageCount, tryoutCount, isAvailable } = summary;
  const theme = getSubjectTheme(subject);
  const coverSrc = subjectCover(subject);
  const colors = tone[theme.accent];
  const linkLabel = `Buka ${subject.shortName}, ${packageCount} paket latihan, ${tryoutCount} tryout`;

  const card = (
    <article
      className={[
        "flex h-full flex-col overflow-hidden rounded-[13px] border bg-white shadow-[0_14px_35px_-22px_rgba(12,10,55,0.55),0_2px_8px_rgba(12,10,55,0.08)] transition-all",
        isAvailable
          ? "border-slate-200 hover:-translate-y-0.5 hover:shadow-float"
          : "border-slate-200 opacity-75",
      ].join(" ")}
      aria-disabled={isAvailable ? undefined : "true"}
    >
      <div className="relative aspect-[2.36/1] overflow-hidden bg-slate-100">
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt=""
            fill
            sizes="(min-width: 1280px) 31vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover object-center"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-700 to-sky-600 text-white">
            <Icon name={theme.icon} className="h-14 w-14" strokeWidth={1.8} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/42 via-transparent to-transparent" />
        <div className="absolute left-5 top-5 rounded-full bg-white/85 px-4 py-1 text-[12px] font-extrabold text-brand-700 shadow-sm">
          {levelName(subject.level)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="flex min-w-0 items-center gap-3 pr-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ring-1 ${colors.stat}`}>
              <Icon name="layers" className="h-5 w-5" strokeWidth={2.3} />
            </span>
            <span className="min-w-0">
              <span className="block text-[18px] font-extrabold leading-none text-ink-900">
                {packageCount}
              </span>
              <span className="mt-1 block text-sm font-medium leading-tight text-slate-600">
                paket latihan
              </span>
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-3 px-4">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] ring-1 ${colors.stat}`}>
              <Icon name="note" className="h-5 w-5" strokeWidth={2.3} />
            </span>
            <span className="min-w-0">
              <span className="block text-[18px] font-extrabold leading-none text-ink-900">
                {tryoutCount}
              </span>
              <span className="mt-1 block text-sm font-medium leading-tight text-slate-600">tryout</span>
            </span>
          </div>
        </div>

        <span
          aria-hidden="true"
          className={[
            "mt-5 inline-flex h-12 w-full items-center justify-center gap-3 rounded-[9px] bg-gradient-to-r px-4 text-[15px] font-extrabold shadow-[0_8px_18px_-12px_rgba(12,10,55,0.7)] transition-opacity",
            isAvailable ? `${colors.button} hover:opacity-90` : "from-slate-100 to-slate-200 text-slate-500",
          ].join(" ")}
        >
          {isAvailable ? <LinkPending /> : null}
          <Icon
            name={isAvailable ? "arrow-right" : "hourglass"}
            className="h-5 w-5"
            strokeWidth={2.4}
          />
          {isAvailable ? `Lihat Paket Soal ${ctaName(subject.shortName)}` : "Segera Hadir"}
        </span>
      </div>
    </article>
  );

  if (!isAvailable) return card;

  return (
    <Link href={`/mapel/${subject.slug}`} className="group block h-full" aria-label={linkLabel}>
      {card}
    </Link>
  );
}
