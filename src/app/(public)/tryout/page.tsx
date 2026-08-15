import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import { getSubjects, getTryouts } from "@/services/content-service";

export const metadata: Metadata = {
  title: "Tryout",
  description:
    "Daftar simulasi TKA yang dapat dikerjakan gratis, lengkap dengan jumlah soal dan durasi.",
};

export default async function TryoutListPage() {
  const [tryouts, subjects] = await Promise.all([getTryouts(), getSubjects()]);
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));

  return (
    <div className="container-page py-12 sm:py-14">
      <SectionHeader
        as="h1"
        eyebrow="Simulasi"
        icon="flag"
        iconTone="rose"
        title="Tryout yang tersedia"
        description="Simulasi dapat dikerjakan gratis, tanpa pembayaran dan tanpa membuat akun. Hasilnya langsung muncul setelah selesai."
      />

      <ul className="mt-10 space-y-4">
        {tryouts.map((tryout) => {
          const subject = subjectById.get(tryout.subjectId);
          return (
            <li key={tryout.id}>
              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
                {/* Pita warna tipis di kepala kartu, penanda bahwa ini simulasi. */}
                <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-rose-500 to-ink-800" />

                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge tone="free">Gratis</Badge>
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Icon name="cap" className="h-4 w-4 text-brand-600" />
                          {subject?.name ?? ""} · Jenjang {tryout.level}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-extrabold tracking-tight sm:text-2xl">
                        <Link href={`/tryout/${tryout.slug}`} className="hover:underline">
                          {tryout.title}
                        </Link>
                      </h2>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                        {tryout.description}
                      </p>
                    </div>
                    <ButtonLink href={`/tryout/${tryout.slug}`} size="lg">
                      <Icon name="play" className="h-5 w-5" />
                      Mulai Simulasi
                    </ButtonLink>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <StatCard
                      icon="list-check"
                      tone="brand"
                      label="Jumlah soal"
                      value={`${tryout.questionIds.length} soal`}
                      valueClassName="text-lg"
                    />
                    <StatCard
                      icon="hourglass"
                      tone="rose"
                      label="Durasi"
                      value={`${tryout.durationMinutes} menit`}
                      valueClassName="text-lg"
                    />
                    <StatCard
                      icon="cap"
                      tone="sky"
                      label="Jenjang"
                      value={tryout.level}
                      valueClassName="text-lg"
                    />
                    <StatCard
                      icon="book"
                      tone="violet"
                      label="Mata pelajaran"
                      value={subject?.shortName ?? "-"}
                      valueClassName="text-lg"
                    />
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-sm leading-relaxed text-slate-500">
        Simulasi lain untuk mata pelajaran dan jenjang berikutnya sedang disiapkan.
      </p>
    </div>
  );
}
