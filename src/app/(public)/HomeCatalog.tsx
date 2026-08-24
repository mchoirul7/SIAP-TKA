import { SubjectCard } from "@/components/SubjectCard";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import type { EducationLevel } from "@/data/types";
import type { SubjectSummary } from "@/services/content-service";

/**
 * Katalog halaman depan.
 *
 * Jenjang bukan penyaring: ketiganya tampil sekaligus, bertingkat dari SMA di
 * atas sampai SD di bawah, karena pengunjung yang membawa dua anak berbeda
 * jenjang tidak perlu berpindah tampilan untuk melihat keduanya. Tanpa penyaring
 * halaman ini pun tidak lagi menyimpan pilihan di perangkat dan tidak lagi perlu
 * berjalan di peramban — seluruh isinya sudah jadi sejak dari peladen.
 *
 * Keterangan jenjang cukup satu kali di kepala tiap tingkat, jadi kartunya tidak
 * mengulanginya lagi. Jenjang yang isinya belum siap tetap ditampilkan supaya
 * cakupan produk terbaca, ditandai keping kelabu, bukan disembunyikan.
 */

/** Tertinggi lebih dulu: TKA SMA yang paling dekat tenggatnya. */
const LEVEL_ORDER: EducationLevel[] = ["SMA", "SMP", "SD"];

/**
 * Warna keping jenjang. Bukan hiasan: warnanya berbeda supaya mata dapat
 * melompat ke tingkat yang dicari tanpa membaca hurufnya lebih dulu.
 */
const LEVEL_PILL: Record<EducationLevel, string> = {
  SMA: "bg-brand-700 text-white",
  SMP: "bg-aqua-700 text-white",
  SD: "bg-accent-500 text-ink-900",
};

const LEVEL_LABEL: Record<EducationLevel, string> = {
  SMA: "SMA/SMK",
  SMP: "SMP",
  SD: "SD",
};

const SMA_OPTIONAL_SUBJECT: SubjectSummary = {
  subject: {
    id: "sub-mapel-pilihan-sma-smk",
    slug: "mapel-pilihan-sma-smk",
    name: "Mapel Pilihan SMA/SMK",
    shortName: "Mapel Pilihan",
    level: "SMA",
    description: "Mata pelajaran pilihan untuk jenjang SMA/SMK.",
  },
  packageCount: 0,
  tryoutCount: 0,
  isAvailable: false,
};

function subjectsForLevel(summaries: SubjectSummary[], level: EducationLevel) {
  const items = summaries.filter((item) => item.subject.level === level);
  if (level !== "SMA") return items;

  const hasOptionalSubject = items.some((item) =>
    /mapel[-\s]?pilihan|mata[-\s]?pelajaran[-\s]?pilihan/i.test(
      `${item.subject.slug} ${item.subject.name}`,
    ),
  );
  return hasOptionalSubject ? items : [...items, SMA_OPTIONAL_SUBJECT];
}

export function HomeCatalog({ summaries }: { summaries: SubjectSummary[] }) {
  const groups = LEVEL_ORDER.map((level) => ({
    level,
    items: subjectsForLevel(summaries, level),
  }));

  return (
    <div id="katalog-mapel" className="container-page scroll-mt-24 pb-16">
      <div className="flex items-start gap-3">
        <IconBadge name="cap" tone="brand" size="md" />
        <div className="min-w-0">
          <p className="eyebrow">Mulai belajar</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">
            Pilih Mata Pelajaran
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            Pilih mapel, masuk ke paket latihan sesuai materi, lalu akhiri dengan tryout.
          </p>
        </div>
      </div>

      {groups.map(({ level, items }, index) => {
        const isReady = items.length > 0;

        return (
          <section key={level} className={index === 0 ? "mt-7" : "mt-10"}>
            <h3 className="flex items-center gap-2">
              <span
                className={[
                  "inline-flex h-8 items-center rounded-lg px-3 text-sm font-extrabold tracking-wide",
                  isReady ? LEVEL_PILL[level] : "bg-slate-200 text-slate-500",
                ].join(" ")}
              >
                {LEVEL_LABEL[level]}
              </span>
              {!isReady ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                  <Icon name="hourglass" className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Segera
                </span>
              ) : null}
            </h3>

            {isReady ? (
              <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((summary) => (
                  <li key={summary.subject.id}>
                    <SubjectCard summary={summary} />
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
