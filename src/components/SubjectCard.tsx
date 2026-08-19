import Link from "next/link";
import { CoverArt } from "@/components/CoverArt";
import { Icon } from "@/components/ui/Icon";
import { LinkPending } from "@/components/NavigationProgress";
import { getSubjectTheme } from "@/lib/subject-theme";
import { toneButton, toneChip, toneTag } from "@/lib/tone";
import type { SubjectSummary } from "@/services/content-service";

/**
 * Kartu mata pelajaran pada halaman depan. Mata pelajaran yang belum berisi soal
 * tetap ditampilkan agar cakupan produk terbaca, tetapi tidak dapat dibuka.
 *
 * Jenjangnya tidak ditulis di kartu: halaman depan sudah mengelompokkan kartu
 * per jenjang, jadi mengulangnya di setiap sampul hanya menambah teks.
 *
 * Warna kartu mengikuti mata pelajarannya — lihat `getSubjectTheme` — sehingga
 * Matematika, Bahasa Indonesia, dan Bahasa Inggris langsung terbedakan sebelum
 * judulnya dibaca.
 */
export function SubjectCard({ summary }: { summary: SubjectSummary }) {
  const { subject, packageCount, tryoutCount, isAvailable } = summary;
  const theme = getSubjectTheme(subject);

  // Jumlah paket dan tryout tampil sebagai keping di badan kartu, jadi sampul tidak mengulangnya.
  const coverSubtitle = isAvailable ? "Latihan bertahap dan tryout" : "Sedang disiapkan";

  const body = (
    <>
      <CoverArt
        className="h-36"
        tone={theme.cover}
        icon={theme.icon}
        title={subject.shortName}
        titleAs="h4"
        subtitle={coverSubtitle}
      />

      <div className="flex flex-1 flex-col p-4">
        {/* Nama mapel cukup sekali di sampul. Deskripsinya pun sengaja tidak
            ditampilkan: sampul dan keping di bawah ini sudah menerangkan
            isinya, dan kartunya jadi lebih ringkas. */}
        <ul className="flex flex-wrap gap-1.5">
          <li
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isAvailable ? toneChip.emerald : toneChip.slate
            }`}
          >
            <Icon
              name={isAvailable ? "check" : "hourglass"}
              className="h-3.5 w-3.5"
              strokeWidth={2.2}
            />
            {isAvailable ? "Tersedia" : "Segera"}
          </li>
          {/* Keping bernilai nol tidak ditampilkan: "0 tryout" tidak menambah
              keterangan apa pun dan justru terbaca sebagai kekurangan. */}
          {packageCount > 0 ? (
            <li
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneTag[theme.accent]}`}
            >
              <Icon name="layers" className="h-3.5 w-3.5" />
              {packageCount} paket
            </li>
          ) : null}
          {tryoutCount > 0 ? (
            <li
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneTag[theme.accent]}`}
            >
              <Icon name="flag" className="h-3.5 w-3.5" />
              {tryoutCount} tryout
            </li>
          ) : null}
        </ul>

        {/* Tombol ditempel ke dasar kartu agar deretan kartu tetap rapi meski isinya berbeda panjang. */}
        <div className="mt-auto pt-4">
          <span
            className={[
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold",
              isAvailable ? toneButton[theme.accent] : "bg-slate-100 text-slate-500",
            ].join(" ")}
          >
            {isAvailable ? <LinkPending /> : null}
            <Icon
              name={isAvailable ? "arrow-right" : "hourglass"}
              className="h-4 w-4"
              strokeWidth={2.2}
            />
            {isAvailable ? "Lihat Paket Soal" : "Belum Tersedia"}
          </span>
        </div>
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
