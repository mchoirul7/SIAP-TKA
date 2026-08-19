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

export function HomeCatalog({ summaries }: { summaries: SubjectSummary[] }) {
  const groups = LEVEL_ORDER.map((level) => ({
    level,
    items: summaries.filter((item) => item.subject.level === level),
  }));

  return (
    <div className="container-page pb-16">
      <h2 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-[28px]">
        <IconBadge name="cap" tone="brand" size="md" />
        Pilih Mata Pelajaran
      </h2>

      {groups.map(({ level, items }, index) => {
        const isReady = items.length > 0;

        return (
          <section key={level} className={index === 0 ? "mt-6" : "mt-9"}>
            <h3 className="flex items-center gap-2.5">
              <span
                className={[
                  "inline-flex h-8 items-center rounded-lg px-3 text-sm font-extrabold tracking-wide",
                  isReady ? LEVEL_PILL[level] : "bg-slate-200 text-slate-500",
                ].join(" ")}
              >
                {level}
              </span>
              {isReady ? (
                <span className="text-sm font-semibold text-slate-500">{items.length} mapel</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200">
                  <Icon name="hourglass" className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Segera
                </span>
              )}
            </h3>

            {isReady ? (
              <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
