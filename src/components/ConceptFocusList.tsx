import { RichText } from "@/components/RichText";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { statusBarClass, statusLabel, misconceptionLabel } from "@/lib/format";
import { plainText } from "@/lib/markup";
import { toneChip } from "@/lib/tone";
import type { ConceptFocus } from "@/lib/scoring";

/**
 * Rincian "apa yang perlu dipelajari".
 *
 * Tiap konsep tampil sebagai satu kartu: berapa soal yang benar, penjelasan
 * singkat konsepnya, dan — bila terbaca dari pilihan jawaban — bagian mana yang
 * sering keliru. Semuanya diambil dari katalog konten, bukan dirangkai di sini,
 * supaya bahasanya tetap terkendali oleh tim konten.
 *
 * Teks katalognya tidak selalu teks biasa: nama konsep, penjelasan, dan catatan
 * miskonsepsi dapat terbawa markup dari bank soal asalnya — pembungkus <p>,
 * penanda <sup>, sampai rumus yang berbentuk gambar. Karena itu semuanya
 * dirender lewat `RichText`, bukan ditaruh apa adanya sebagai teks; kalau tidak,
 * tagnya yang justru terbaca siswa. Yang dipasang di dalam judul atau di tengah
 * kalimat memakai mode `inline`, supaya markup bloknya diratakan lebih dulu.
 */

const statusTone = {
  "perlu-diperkuat": "rose",
  cukup: "amber",
  dikuasai: "emerald",
} as const;

export function ConceptFocusList({ concepts }: { concepts: ConceptFocus[] }) {
  if (concepts.length === 0) return null;

  return (
    <ol className="mt-5 space-y-4">
      {concepts.map((concept, index) => {
        const tone = statusTone[concept.status];

        return (
          <li
            key={concept.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold tabular-nums text-white shadow-card"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[17px] font-extrabold leading-snug tracking-tight text-ink-900">
                    <RichText as="span" inline html={concept.name} />
                  </h3>
                  {concept.parentName ? (
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                      <Icon name="layers" className="h-4 w-4 text-slate-400" />
                      <span>
                        Cakupan:{" "}
                        <strong className="font-bold text-slate-700">
                          <RichText as="span" inline html={concept.parentName} />
                        </strong>
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneChip[tone]}`}
              >
                <Icon name="target" className="h-4 w-4" strokeWidth={2.2} />
                {statusLabel[concept.status]}
              </span>
            </div>

            <div className="mt-4">
              {/* Angka di samping bilah adalah angka yang digambarkan bilah itu, yakni
                  penguasaan per bagian — bukan ketepatan per soal. Dua ukuran berbeda
                  pada satu baris membuat bilah yang terisi 22% terbaca "0%". */}
              <p className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold text-slate-700">
                  Benar {concept.correct} dari {concept.total} soal
                </span>
                <span className="tabular-nums text-slate-500">Penguasaan {concept.mastery}%</span>
              </p>
              <ProgressBar
                className="mt-2"
                value={concept.mastery}
                barClassName={statusBarClass[concept.status]}
                label={`Penguasaan ${plainText(concept.name)}`}
              />
              {/* Soal Benar/Salah dan jawaban ganda dinilai utuh, tetapi bagian yang
                  sudah tepat tetap dicatat supaya penguasaan tidak terbaca nol. Apa yang
                  dihitung sebagai satu bagian ikut disebut: tanpa itu, "4 dari 18" pada
                  paket berisi 10 soal terbaca sebagai angka yang tidak nyambung. */}
              {concept.hasPartialCredit ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Penguasaan dihitung per bagian:{" "}
                  <span className="font-semibold text-slate-700">
                    {concept.partsCorrect} dari {concept.partsTotal} bagian
                  </span>{" "}
                  sudah tepat ({concept.mastery}%). Satu soal pilihan ganda dihitung satu bagian,
                  sedangkan pada soal Benar/Salah tiap pernyataannya dan pada soal jawaban ganda
                  tiap kuncinya dihitung satu bagian sendiri. Nilai soalnya tetap utuh, jadi soal
                  yang baru benar sebagian belum terhitung benar.
                </p>
              ) : null}
            </div>

            {concept.description ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-aqua-200 bg-aqua-50/70 p-4">
                <IconBadge name="book" tone="sky" size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-aqua-700">
                    Yang perlu dipelajari
                  </p>
                  <RichText
                    className="mt-1 text-[15px] leading-relaxed text-slate-700"
                    html={concept.description}
                  />
                </div>
              </div>
            ) : null}

            {concept.misconceptions.map((signal) => (
              <div
                key={signal.id}
                className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4"
              >
                <IconBadge name="alert" tone="amber" size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-800">
                    Yang tadi keliru
                  </p>
                  {/* Judulnya memakai <div>: label yang terbawa markup dapat berisi
                      <p> sendiri, dan <p> di dalam <p> bukan HTML yang sah. */}
                  <div className="mt-1 text-[15px] font-semibold leading-relaxed text-ink-900">
                    <RichText as="span" inline html={misconceptionLabel(signal.label)} />
                    {signal.count > 1 ? (
                      <span className="ml-1.5 font-normal text-amber-800">
                        (muncul {signal.count}×)
                      </span>
                    ) : null}
                  </div>
                  <RichText
                    className="mt-1 text-[15px] leading-relaxed text-slate-700"
                    html={signal.insight}
                  />
                  {signal.questionNumbers.length > 0 ? (
                    <p className="mt-1.5 text-sm text-amber-900">
                      Terbaca pada soal nomor {signal.questionNumbers.join(", ")}.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </li>
        );
      })}
    </ol>
  );
}
