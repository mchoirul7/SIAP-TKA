import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PracticePackageCard } from "@/components/PracticePackageCard";
import { TryoutCard } from "@/components/TryoutCard";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { breadcrumbSchema, courseSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";
import { getSubjectTheme } from "@/lib/subject-theme";
import { toneLabel } from "@/lib/tone";
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
  if (!subject) return { title: "Mata pelajaran tidak ditemukan", robots: { index: false } };

  return pageMetadata({
    // Nama mapel didahului kata yang dicari, bukan berdiri sendiri: yang diketik
    // orang tua adalah "soal TKA Matematika SD", bukan "Matematika SD".
    title: `Soal TKA ${subject.name} — Latihan & Tryout`,
    description:
      `Latihan soal TKA ${subject.name} dan tryout online sesuai kisi-kisi. ` +
      (subject.description || `Materi jenjang ${subject.level}, lengkap dengan pembahasan.`),
    path: `/mapel/${subject.slug}`,
    keywords: [
      `soal TKA ${subject.name}`,
      `latihan TKA ${subject.shortName}`,
      `tryout TKA ${subject.shortName}`,
      `soal TKA ${subject.level}`,
    ],
  });
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
  const theme = getSubjectTheme(subject);

  return (
    <div className="container-page py-10 sm:py-12">
      <JsonLd
        data={jsonLdGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            { name: subject.name, path: `/mapel/${subject.slug}` },
          ]),
          // Tiap paket dan tryout berdiri sendiri sebagai kursus daring, sehingga
          // masing-masing berpeluang muncul terpisah di hasil pencarian.
          ...subjectPackages.map((pkg) =>
            courseSchema({
              name: pkg.title,
              description: pkg.summary || pkg.description,
              path: `/latihan/${pkg.slug}`,
              minutes: pkg.estimatedMinutes,
            }),
          ),
          ...subjectTryouts.map((tryout) =>
            courseSchema({
              name: tryout.title,
              description: tryout.description,
              path: `/tryout/${tryout.slug}`,
              minutes: tryout.durationMinutes,
            }),
          ),
        )}
      />

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
        <p
          className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] ${toneLabel[theme.accent]}`}
        >
          <Icon name={theme.icon} className="h-4 w-4" />
          Jenjang {subject.level}
        </p>
        {/* Kata "Soal TKA" ikut di judul: itulah yang diketik orang di mesin telusur. */}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Soal TKA {subject.name}
        </h1>
        {subject.description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            {subject.description}
          </p>
        ) : null}
      </header>

      <section className="mt-10">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink-900">
          <IconBadge name="layers" tone={theme.accent} size="md" />
          Paket Soal Latihan
        </h2>
        {subjectPackages.length === 0 ? (
          <p className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 px-5 py-8 text-center text-sm leading-relaxed text-slate-600">
            <Icon name="hourglass" className="h-4 w-4 text-brand-500" />
            Paket latihan untuk mata pelajaran ini sedang disiapkan.
          </p>
        ) : (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjectPackages.map((pkg) => (
              <li key={pkg.id}>
                <PracticePackageCard pkg={pkg} theme={theme} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Tryout: warna kartu sengaja dibedakan dari paket latihan. */}
      <section className="mt-14">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink-900">
          <IconBadge name="flag" tone="rose" size="md" />
          Tryout {subject.shortName}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
          Dikerjakan dengan batas waktu seperti ujian sebenarnya. Hasilnya menunjukkan materi mana
          yang perlu dipelajari lebih dulu.
        </p>

        {subjectTryouts.length === 0 ? (
          <p className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-rose-300 bg-rose-50/60 px-5 py-8 text-center text-sm text-slate-600">
            <Icon name="hourglass" className="h-4 w-4 text-rose-500" />
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
