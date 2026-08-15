import type { Metadata } from "next";
import { PracticePackageCard } from "@/components/PracticePackageCard";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VoucherPrompt } from "@/components/VoucherPrompt";
import { getSubjectTheme } from "@/lib/subject-theme";
import { toneLabel } from "@/lib/tone";
import { getPracticePackagesGroupedByTopic, getSubjects } from "@/services/content-service";

export const metadata: Metadata = {
  title: "Paket Soal Latihan",
  description:
    "Paket soal latihan, dikerjakan online beserta pembahasannya.",
};

export default async function PracticeCatalogPage() {
  const [groups, subjects] = await Promise.all([
    getPracticePackagesGroupedByTopic(),
    getSubjects(),
  ]);
  // Satu topik hanya milik satu mata pelajaran, jadi seluruh kartu di bawahnya memakai satu warna.
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));

  return (
    <div className="container-page py-12 sm:py-14">
      <SectionHeader
        as="h1"
        icon="layers"
        title="Paket Soal Latihan"
        description="Setiap paket fokus pada satu subtopik agar dapat diselesaikan dalam satu kali duduk. Paket premium mencakup latihan online dan pembahasan setiap soal."
      />

      {groups.length === 0 ? (
        <p className="mt-10 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 px-5 py-10 text-center text-sm leading-relaxed text-slate-600">
          <Icon name="hourglass" className="h-6 w-6 text-brand-500" />
          Belum ada paket latihan yang tersedia. Paket disusun dari bank soal, dan akan muncul di
          sini begitu paketnya dimasukkan.
        </p>
      ) : null}

      <div className="mt-10 space-y-12">
        {groups.map((group) => {
          const subject = subjectById.get(group.topic.subjectId);
          const theme = getSubjectTheme(subject ?? { slug: group.topic.subjectId });

          return (
            <section key={group.topic.id}>
              <h2
                className={`flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-sm font-bold uppercase tracking-[0.12em] ${toneLabel[theme.accent]}`}
              >
                <Icon name={theme.icon} className="h-4 w-4" strokeWidth={2.2} />
                {group.topic.name}
                {subject ? (
                  <span className="font-semibold normal-case tracking-normal text-slate-500">
                    · {subject.shortName}
                  </span>
                ) : null}
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.packages.map((pkg) => (
                  <li key={pkg.id}>
                    <PracticePackageCard pkg={pkg} theme={theme} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-14">
        <VoucherPrompt />
      </div>

    </div>
  );
}
