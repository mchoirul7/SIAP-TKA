import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { LinkPending } from "@/components/NavigationProgress";
import { iconForSubject } from "@/lib/content-icons";
import { getSubjectTheme } from "@/lib/subject-theme";
import type { SubjectSummary } from "@/services/content-service";

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
  const subjectIcon = iconForSubject(subject);
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
      <div className="flex items-center gap-4 bg-gradient-to-br from-brand-50 via-white to-sky-50 p-5">
        <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[16px] ring-1 ${colors.stat}`}>
          <Icon name={subjectIcon} className="h-8 w-8" strokeWidth={2.1} />
        </span>
        <div className="min-w-0">
          <h3 className="break-words text-[21px] font-black leading-tight text-ink-900">
            {subject.shortName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{levelName(subject.level)}</p>
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
