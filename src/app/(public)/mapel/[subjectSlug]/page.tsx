import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PracticePackageCard } from "@/components/PracticePackageCard";
import { TryoutCard } from "@/components/TryoutCard";
import {
  getPracticePackages,
  getSubjectBySlug,
  getSubjects,
  getTryouts,
} from "@/services/content-service";

export async function generateStaticParams() {
  const subjects = await getSubjects();
  return subjects.map((subject) => ({ subjectSlug: subject.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}): Promise<Metadata> {
  const { subjectSlug } = await params;
  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject) return { title: "Mata pelajaran tidak ditemukan" };
  return { title: subject.name, description: subject.description };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}) {
  const { subjectSlug } = await params;
  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject) notFound();

  const [tryouts, packages] = await Promise.all([getTryouts(), getPracticePackages()]);
  const subjectTryouts = tryouts.filter((tryout) => tryout.subjectId === subject.id);
  const subjectPackages = packages.filter((pkg) => pkg.subjectId === subject.id);

  return (
    <div className="container-page py-10 sm:py-12">
      <nav aria-label="Remah roti" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-800">
          Beranda
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-ink-900">{subject.shortName}</span>
      </nav>

      <header className="mt-4">
        <p className="eyebrow">Jenjang {subject.level}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{subject.name}</h1>
        {subject.description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            {subject.description}
          </p>
        ) : null}
      </header>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink-900">
          <span
            aria-hidden="true"
            className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-brand-400 to-brand-600"
          />
          Paket Soal Latihan
        </h2>
        {subjectPackages.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm leading-relaxed text-slate-500">
            Paket latihan untuk mata pelajaran ini sedang disiapkan.
          </p>
        ) : (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjectPackages.map((pkg, index) => (
              <li key={pkg.id}>
                <PracticePackageCard pkg={pkg} toneIndex={index} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Tryout: warna kartu sengaja dibedakan dari paket latihan. */}
      <section className="mt-14">
        <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink-900">
          <span
            aria-hidden="true"
            className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-ink-600 to-ink-900"
          />
          Tryout {subject.shortName}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
          Dikerjakan dengan batas waktu seperti ujian sebenarnya. Hasilnya menunjukkan materi mana
          yang perlu dipelajari lebih dulu.
        </p>

        {subjectTryouts.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
            Tryout untuk mata pelajaran ini sedang disiapkan.
          </p>
        ) : (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjectTryouts.map((tryout) => (
              <li key={tryout.id}>
                <TryoutCard tryout={tryout} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
