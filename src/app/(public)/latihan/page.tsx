import type { Metadata } from "next";
import { PracticePackageCard } from "@/components/PracticePackageCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VoucherPrompt } from "@/components/VoucherPrompt";
import { getPracticePackagesGroupedByTopic } from "@/services/practice-service";

export const metadata: Metadata = {
  title: "Paket Latihan",
  description:
    "Paket latihan Matematika SD per subtopik, dikerjakan online beserta pembahasannya.",
};

export default function PracticeCatalogPage() {
  const groups = getPracticePackagesGroupedByTopic();

  return (
    <div className="container-page py-12 sm:py-14">
      <SectionHeader
        as="h1"
        title="Paket Latihan"
        description="Setiap paket fokus pada satu subtopik agar dapat diselesaikan dalam satu kali duduk. Paket premium mencakup latihan online dan pembahasan setiap soal."
      />

      {groups.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm leading-relaxed text-slate-500">
          Belum ada paket latihan yang tersedia. Paket disusun dari bank soal, dan akan muncul di
          sini begitu paketnya dimasukkan.
        </p>
      ) : null}

      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <section key={group.topic.id}>
            <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-700">
              {group.topic.name}
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.packages.map((pkg) => (
                <li key={pkg.id}>
                  <PracticePackageCard pkg={pkg} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-14">
        <VoucherPrompt />
      </div>

    </div>
  );
}
