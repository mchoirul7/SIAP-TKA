import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
        title="Tryout yang tersedia"
        description="Simulasi dapat dikerjakan gratis, tanpa pembayaran dan tanpa membuat akun. Hasilnya langsung muncul setelah selesai."
      />

      <ul className="mt-10 space-y-4">
        {tryouts.map((tryout) => {
          const subject = subjectById.get(tryout.subjectId);
          return (
            <li key={tryout.id}>
              <article className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <Badge tone="free">Gratis</Badge>
                      <span className="text-sm text-slate-500">
                        {subject?.name ?? ""} · Jenjang {tryout.level}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                      <Link href={`/tryout/${tryout.slug}`} className="hover:underline">
                        {tryout.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                      {tryout.description}
                    </p>
                  </div>
                  <ButtonLink href={`/tryout/${tryout.slug}`} size="lg">
                    Mulai Simulasi
                  </ButtonLink>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-200 pt-5 sm:grid-cols-4">
                  <div>
                    <dt className="text-sm text-slate-500">Jumlah soal</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums text-ink-900">
                      {tryout.questionIds.length} soal
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Durasi</dt>
                    <dd className="mt-0.5 font-semibold tabular-nums text-ink-900">
                      {tryout.durationMinutes} menit
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Jenjang</dt>
                    <dd className="mt-0.5 font-semibold text-ink-900">{tryout.level}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500">Mata pelajaran</dt>
                    <dd className="mt-0.5 font-semibold text-ink-900">
                      {subject?.shortName ?? "-"}
                    </dd>
                  </div>
                </dl>
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
