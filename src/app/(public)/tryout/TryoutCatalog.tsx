"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import type { Subject, Tryout } from "@/data/types";
import { useStudyContext } from "@/hooks/useStudyContext";
import {
  DEFAULT_STUDY_CONTEXT,
  studyContextLabel,
  studyContextShortLabel,
} from "@/lib/study-context";

export function TryoutCatalog({
  tryouts,
  subjects,
}: {
  tryouts: Tryout[];
  subjects: Subject[];
}) {
  const { context } = useStudyContext();
  const activeContext = context ?? DEFAULT_STUDY_CONTEXT;
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const filteredTryouts = tryouts.filter((tryout) => tryout.level === activeContext.level);
  const contextLabel = studyContextLabel(activeContext);

  return (
    <>
      <SectionHeader
        as="h1"
        eyebrow={contextLabel}
        icon="flag"
        iconTone="rose"
        title="Tryout TKA Online yang Tersedia"
        description={`Tryout ditampilkan khusus untuk ${studyContextShortLabel(activeContext)} agar paket tidak tercampur dengan jenjang lain.`}
      />

      {filteredTryouts.length > 0 ? (
        <ul className="mt-10 space-y-4">
          {filteredTryouts.map((tryout) => {
            const subject = subjectById.get(tryout.subjectId);
            return (
              <li key={tryout.id}>
                <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
                  <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-rose-500 to-ink-800" />

                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge tone="voucher">Kode Akses</Badge>
                          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                            <Icon name="cap" className="h-4 w-4 text-brand-600" />
                            {subject?.name ?? ""} &middot; {contextLabel}
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
                        Buka Tryout
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
                        label="Kelas"
                        value={studyContextShortLabel(activeContext)}
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
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-[15px] leading-relaxed text-slate-600">
          Belum ada tryout untuk {contextLabel}. Paket simulasi sedang disiapkan.
        </div>
      )}

      <p className="mt-8 text-sm leading-relaxed text-slate-500">
        Simulasi lain untuk mata pelajaran dan jenjang berikutnya sedang disiapkan.
      </p>
    </>
  );
}
