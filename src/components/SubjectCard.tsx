import Link from "next/link";
import { CoverArt, type CoverTone } from "@/components/CoverArt";
import { Badge } from "@/components/ui/Badge";
import { LinkPending } from "@/components/NavigationProgress";
import type { SubjectSummary } from "@/services/content-service";

/**
 * Kartu mata pelajaran pada halaman depan. Mata pelajaran yang belum berisi soal
 * tetap ditampilkan agar cakupan produk terbaca, tetapi tidak dapat dibuka.
 */
export function SubjectCard({
  summary,
  tone = "orange",
}: {
  summary: SubjectSummary;
  tone?: CoverTone;
}) {
  const { subject, packageCount, tryoutCount, isAvailable } = summary;

  const body = (
    <>
      <CoverArt
        className="h-36"
        tone={tone}
        label={`Jenjang ${subject.level}`}
        title={subject.shortName}
        subtitle={isAvailable ? `${packageCount} paket latihan · ${tryoutCount} tryout` : "Sedang disiapkan"}
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-bold leading-snug tracking-tight text-ink-900">
            {subject.shortName}
          </h3>
          {isAvailable ? <Badge tone="free">Tersedia</Badge> : <Badge tone="neutral">Segera</Badge>}
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {subject.description}
        </p>

        <span
          className={[
            "mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold",
            isAvailable
              ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {isAvailable ? <LinkPending /> : null}
          {isAvailable ? "Lihat Paket Soal" : "Belum Tersedia"}
        </span>
      </div>
    </>
  );

  const shell =
    "flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card";

  if (!isAvailable) {
    return (
      <article className={`${shell} opacity-75`} aria-disabled="true">
        {body}
      </article>
    );
  }

  return (
    <Link
      href={`/mapel/${subject.slug}`}
      className={`${shell} transition-shadow hover:shadow-float`}
    >
      {body}
    </Link>
  );
}
