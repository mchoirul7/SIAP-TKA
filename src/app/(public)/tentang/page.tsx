import type { Metadata } from "next";
import { LocalDataNotice } from "@/components/LocalDataNotice";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Tentang Siap TKA: cara kerja simulasi, cara hasil disusun, dan batasan versi prototype.",
};

export default function AboutPage() {
  return (
    <div className="container-page py-12 sm:py-14">
      <div className="max-w-3xl">
        <SectionHeader
          as="h1"
          eyebrow="Tentang"
          icon="compass"
          title={`Tentang ${site.name}`}
          description={site.valueProposition}
        />

        <section className="mt-12">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="bulb" tone="violet" size="sm" />
            Mengapa dibuat
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            Menjelang ujian, banyak keluarga memiliki masalah yang sama: nilai latihan sudah
            terlihat, tetapi tidak jelas apa yang harus diperbaiki. Skor 68 tidak memberi tahu
            apakah kesulitannya ada pada pecahan, geometri, atau justru pada materi dasar yang
            terlewat beberapa tahun sebelumnya.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            {site.name} mencoba menjawab pertanyaan berikutnya: setelah tahu nilainya, harus mulai
            dari mana.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="layers" tone="brand" size="sm" />
            Cara hasil disusun
          </h2>
          <ol className="mt-4 space-y-5">
            {[
              {
                title: "Setiap soal terhubung ke konsep",
                body: "Soal tidak hanya dikelompokkan per mata pelajaran, tetapi sampai ke tingkat subtopik dan konsep, sehingga hasilnya cukup rinci untuk ditindaklanjuti.",
              },
              {
                title: "Sebagian konsep punya prasyarat",
                body: "Operasi pecahan bertumpu pada pecahan senilai. Bila keduanya lemah, yang disarankan lebih dulu adalah prasyaratnya, bukan materi yang terlihat di permukaan.",
              },
              {
                title: "Pilihan jawaban ikut dibaca",
                body: "Beberapa pilihan yang keliru mewakili cara berpikir tertentu. Bila pola yang sama muncul berulang, hal itu dirangkum dengan bahasa yang hati-hati sebagai bahan diskusi, bukan sebagai label untuk anak.",
              },
            ].map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold tabular-nums text-white shadow-card"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-ink-900">{item.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="shield-check" tone="emerald" size="sm" />
            Yang tidak dilakukan
          </h2>
          <ul className="mt-4 space-y-2.5">
            {[
              "Tidak ada riwayat pengerjaan yang dikumpulkan. Hasil tersimpan di perangkat yang dipakai, tidak dikirim ke mana pun, dan dapat dihapus kapan saja lewat tombol di bawah halaman ini.",
              "Tidak ada peringkat dan tidak ada perbandingan dengan siswa lain.",
              "Tidak ada poin, lencana, atau rentetan harian yang membuat belajar berubah menjadi kejar-kejaran.",
              "Tidak ada janji nilai tertentu. Simulasi hanya alat bantu untuk melihat posisi saat ini.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
                <Icon
                  name="close"
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-500"
                  strokeWidth={2.4}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
            <IconBadge name="info" tone="amber" size="sm" />
            Catatan versi prototype
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-amber-900">
            Versi ini dibuat untuk menguji struktur produk dan alur penggunaan. Kode akses membuka
            satu mapel dalam satu seri, dan hasil pengerjaan tetap tersimpan di perangkat ini saja.
          </p>
        </section>

        <LocalDataNotice />

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/tryout" size="lg">
            <Icon name="play" className="h-5 w-5" />
            Lihat Tryout
          </ButtonLink>
          <ButtonLink href="/latihan" variant="secondary" size="lg">
            <Icon name="layers" className="h-5 w-5" />
            Lihat Paket Latihan
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
