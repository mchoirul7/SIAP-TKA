import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import {
  LearningPathList,
  LearningTryoutCompactCard,
} from "@/components/LearningPathCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import type { PracticePackage, Subject, Subtopic, Topic } from "@/data/types";
import { breadcrumbSchema, courseSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";
import { getSubjectTheme } from "@/lib/subject-theme";
import { toneLabel, toneSurface } from "@/lib/tone";
import {
  getPracticePackages,
  getSubjectBySlug,
  getSubjects,
  getSubtopics,
  getTopics,
  getTryouts,
} from "@/services/content-service";

type CurriculumSubtopic = {
  id: string;
  name: string;
  icon: IconName;
  match: RegExp[];
};

type CurriculumMaterial = {
  id: string;
  name: string;
  icon: IconName;
  subtopics: CurriculumSubtopic[];
};

type CapabilityGroup = {
  id: string;
  name: string;
  description?: string;
  icon: IconName;
  packages: PracticePackage[];
};

type LearningSubtopicGroup = {
  id: string;
  name: string;
  description?: string;
  icon: IconName;
  capabilities: CapabilityGroup[];
};

type LearningMaterialGroup = {
  id: string;
  name: string;
  icon: IconName;
  subtopics: LearningSubtopicGroup[];
};

const MATH_SMA_CURRICULUM: CurriculumMaterial[] = [
  {
    id: "bilangan",
    name: "Bilangan",
    icon: "sigma",
    subtopics: [
      {
        id: "bilangan-real",
        name: "Bilangan Real",
        icon: "sigma",
        match: [/bilangan/, /real/, /pecahan/, /desimal/, /persen/],
      },
    ],
  },
  {
    id: "aljabar",
    name: "Aljabar",
    icon: "function",
    subtopics: [
      {
        id: "persamaan-pertidaksamaan-linear",
        name: "Persamaan dan Pertidaksamaan Linear",
        icon: "target",
        match: [/persamaan/, /pertidaksamaan/, /program-linear/],
      },
      {
        id: "fungsi",
        name: "Fungsi",
        icon: "function",
        match: [/fungsi/, /domain/, /kodomain/, /range/, /representasi-fungsi/],
      },
      {
        id: "barisan-deret",
        name: "Barisan dan Deret",
        icon: "layers",
        match: [/barisan/, /deret/],
      },
    ],
  },
  {
    id: "geometri-pengukuran",
    name: "Geometri dan Pengukuran",
    icon: "triangle",
    subtopics: [
      {
        id: "objek-geometri",
        name: "Objek Geometri",
        icon: "cube",
        match: [/objek-geometri/, /hubungan-dua-sudut/, /dua-garis/, /dua-bidang/],
      },
      {
        id: "transformasi-geometri",
        name: "Transformasi Geometri",
        icon: "compass",
        match: [/transformasi/, /translasi/, /refleksi/, /rotasi/, /dilatasi/],
      },
      {
        id: "pengukuran",
        name: "Pengukuran",
        icon: "ruler",
        match: [/pengukuran/, /keliling/, /luas/, /volume/, /panjang/, /berat/, /sudut/],
      },
    ],
  },
  {
    id: "trigonometri",
    name: "Trigonometri",
    icon: "trig",
    subtopics: [
      {
        id: "perbandingan-trigonometri",
        name: "Perbandingan Trigonometri",
        icon: "trig",
        match: [/trigonometri/, /sinus/, /kosinus/, /tangen/, /sekan/, /kosekan/],
      },
    ],
  },
  {
    id: "data-peluang",
    name: "Data dan Peluang",
    icon: "data",
    subtopics: [
      {
        id: "data",
        name: "Data",
        icon: "data",
        match: [
          /data/,
          /diagram/,
          /grafik/,
          /tabel/,
          /pemusatan/,
          /penyebaran/,
          /peluang/,
          /pencacahan/,
          /permutasi/,
          /kombinasi/,
        ],
      },
    ],
  },
];

const ICON_BY_TEXT: { match: RegExp; icon: IconName }[] = [
  { match: /bilangan|pecahan|desimal|persen|kpk|fpb/, icon: "sigma" },
  { match: /fungsi|aljabar|linear|persamaan|pertidaksamaan/, icon: "function" },
  { match: /geometri|bangun|sudut|segitiga|ruang/, icon: "triangle" },
  { match: /ukur|panjang|berat|volume|luas|keliling|waktu|kecepatan/, icon: "ruler" },
  { match: /trigonometri|sinus|kosinus|tangen/, icon: "trig" },
  { match: /data|diagram|grafik|tabel|peluang/, icon: "data" },
];

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
    title: `Soal TKA ${subject.name} - Latihan & Tryout`,
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

  const [tryouts, packages, topics, subtopics] = await Promise.all([
    getTryouts(),
    getPracticePackages(),
    getTopics(),
    getSubtopics(),
  ]);
  const subjectTryouts = tryouts.filter((tryout) => tryout.subjectId === subject.id);
  const subjectPackages = packages.filter((pkg) => pkg.subjectId === subject.id);
  const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
  const subjectTopicIds = new Set(subjectTopics.map((topic) => topic.id));
  const subjectSubtopics = subtopics.filter((subtopic) => subjectTopicIds.has(subtopic.topicId));
  const learningGroups = buildLearningGroups(subject, subjectTopics, subjectSubtopics, subjectPackages);
  const theme = getSubjectTheme(subject);

  return (
    <div className="container-page py-10 sm:py-12">
      <JsonLd
        data={jsonLdGraph(
          breadcrumbSchema([
            { name: "Beranda", path: "/" },
            { name: subject.name, path: `/mapel/${subject.slug}` },
          ]),
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
        <h2 className="mt-2 flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink-900">
          <IconBadge name="flag" tone={theme.accent} size="md" className="rounded-lg" />
          Latihan {subject.shortName}
        </h2>

        {subjectPackages.length === 0 ? (
          <p className={`mt-5 flex items-center justify-center gap-2 rounded-lg border border-dashed px-5 py-8 text-center text-sm leading-relaxed text-slate-600 ${toneSurface[theme.accent]}`}>
            <Icon name="hourglass" className={`h-4 w-4 ${toneLabel[theme.accent]}`} />
            Paket latihan untuk mata pelajaran ini sedang disiapkan.
          </p>
        ) : (
          <LearningPathList
            groups={learningGroups}
            initialPackageId={subjectPackages[0]?.id}
            accent={theme.accent}
          />
        )}
      </section>

      <section className="mt-14">
        <h2 className="mt-2 flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink-900">
          <IconBadge name="flag" tone={theme.accent} size="md" className="rounded-lg" />
          Tryout {subject.shortName}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
          Dikerjakan dengan batas waktu seperti ujian sebenarnya. Hasilnya menunjukkan materi mana
          yang perlu dipelajari lebih dulu.
        </p>

        {subjectTryouts.length === 0 ? (
          <p className={`mt-5 flex items-center justify-center gap-2 rounded-lg border border-dashed px-5 py-8 text-center text-sm text-slate-600 ${toneSurface[theme.accent]}`}>
            <Icon name="hourglass" className={`h-4 w-4 ${toneLabel[theme.accent]}`} />
            Tryout untuk mata pelajaran ini sedang disiapkan.
          </p>
        ) : (
          <ul className="mt-5 w-full space-y-2">
            {subjectTryouts.map((tryout) => (
              <li key={tryout.id}>
                <LearningTryoutCompactCard tryout={tryout} accent={theme.accent} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function isMathSmaSubject(subject: Subject): boolean {
  return subject.level === "SMA" && /matematika|math/.test(`${subject.slug} ${subject.name}`.toLowerCase());
}

function topicText(topic: Topic, subtopicsByTopic: Map<string, Subtopic[]>): string {
  const subtopicText = (subtopicsByTopic.get(topic.id) ?? [])
    .map((subtopic) => `${subtopic.name} ${subtopic.slug}`)
    .join(" ");
  return `${topic.name} ${topic.slug} ${subtopicText}`.toLowerCase();
}

function capabilityNameForTopic(topic: Topic, subtopicsByTopic: Map<string, Subtopic[]>): string {
  const subtopicNames = (subtopicsByTopic.get(topic.id) ?? []).map((subtopic) => subtopic.name);
  return subtopicNames.length > 0 ? `${topic.name}: ${subtopicNames.join(", ")}` : topic.name;
}

function iconForName(name: string): IconName {
  const text = name.toLowerCase();
  return ICON_BY_TEXT.find((entry) => entry.match.test(text))?.icon ?? "layers";
}

function packagesForTopic(packages: PracticePackage[], topicId: string): PracticePackage[] {
  return packages.filter(
    (pkg) => pkg.topicId === topicId || pkg.subtopicId === topicId || pkg.subtopicIds?.includes(topicId),
  );
}

function packagesForSubtopic(packages: PracticePackage[], subtopicId: string): PracticePackage[] {
  return packages.filter((pkg) => pkg.subtopicId === subtopicId || pkg.subtopicIds?.includes(subtopicId));
}

function buildLearningGroups(
  subject: Subject,
  topics: Topic[],
  subtopics: Subtopic[],
  packages: PracticePackage[],
): LearningMaterialGroup[] {
  if (isMathSmaSubject(subject)) return buildMathSmaLearningGroups(topics, subtopics, packages);
  return buildDefaultLearningGroups(topics, subtopics, packages);
}

function buildMathSmaLearningGroups(
  topics: Topic[],
  subtopics: Subtopic[],
  packages: PracticePackage[],
): LearningMaterialGroup[] {
  const matchedTopicIds = new Set<string>();
  const subtopicsByTopic = new Map<string, Subtopic[]>();
  for (const subtopic of subtopics) {
    const list = subtopicsByTopic.get(subtopic.topicId) ?? [];
    list.push(subtopic);
    subtopicsByTopic.set(subtopic.topicId, list);
  }

  const groups = MATH_SMA_CURRICULUM.map((material) => {
    const subtopicGroups = material.subtopics.map((subtopic) => {
      const matchedTopics = topics.filter((topic) =>
        !matchedTopicIds.has(topic.id) &&
        subtopic.match.some((pattern) => pattern.test(topicText(topic, subtopicsByTopic))),
      );
      const capabilities =
        matchedTopics.length > 0
          ? matchedTopics.map((topic) => {
              matchedTopicIds.add(topic.id);
              return {
                id: topic.id,
                name: capabilityNameForTopic(topic, subtopicsByTopic),
                icon: subtopic.icon,
                packages: packagesForTopic(packages, topic.id),
              };
            })
          : [
              {
                id: `${subtopic.id}-empty`,
                name: subtopic.name,
                description: "Paket latihan untuk submateri ini sedang disiapkan.",
                icon: subtopic.icon,
                packages: [],
              },
            ];

      return {
        id: subtopic.id,
        name: subtopic.name,
        icon: subtopic.icon,
        capabilities,
      };
    });

    return {
      id: material.id,
      name: material.name,
      icon: material.icon,
      subtopics: subtopicGroups,
    };
  });

  const unmatchedTopics = topics.filter((topic) => !matchedTopicIds.has(topic.id));
  if (unmatchedTopics.length > 0) {
    groups.push(
      {
        id: "materi-lainnya",
        name: "Materi Lainnya",
        icon: "layers",
        subtopics: [
          {
            id: "capaian-lainnya",
            name: "Capaian Lainnya",
            icon: "layers",
            capabilities: unmatchedTopics.map((topic) => ({
              id: topic.id,
              name: capabilityNameForTopic(topic, subtopicsByTopic),
              icon: iconForName(topic.name),
              packages: packagesForTopic(packages, topic.id),
            })),
          },
        ],
      },
    );
  }

  return groups;
}

function buildDefaultLearningGroups(
  topics: Topic[],
  subtopics: Subtopic[],
  packages: PracticePackage[],
): LearningMaterialGroup[] {
  const subtopicsByTopic = new Map<string, Subtopic[]>();
  for (const subtopic of subtopics) {
    const list = subtopicsByTopic.get(subtopic.topicId) ?? [];
    list.push(subtopic);
    subtopicsByTopic.set(subtopic.topicId, list);
  }

  const usedPackageIds = new Set<string>();
  const groups = topics.map((topic) => {
    const topicSubtopics = subtopicsByTopic.get(topic.id) ?? [];
    const subtopicGroups: LearningSubtopicGroup[] =
      topicSubtopics.length > 0
        ? topicSubtopics.map((subtopic) => {
            const subtopicPackages = packagesForSubtopic(packages, subtopic.id);
            for (const pkg of subtopicPackages) usedPackageIds.add(pkg.id);

            return {
              id: subtopic.id,
              name: subtopic.name,
              description: subtopic.description,
              icon: iconForName(subtopic.name),
              capabilities: [
                {
                  id: `${subtopic.id}-capability`,
                  name: subtopic.name,
                  description: subtopic.description,
                  icon: iconForName(subtopic.name),
                  packages: subtopicPackages,
                },
              ],
            };
          })
        : [
            {
              id: `${topic.id}-subtopic`,
              name: topic.name,
              icon: iconForName(topic.name),
              capabilities: [
                {
                  id: topic.id,
                  name: topic.name,
                  icon: iconForName(topic.name),
                  packages: packagesForTopic(packages, topic.id),
                },
              ],
            },
          ];

    for (const pkg of packagesForTopic(packages, topic.id)) usedPackageIds.add(pkg.id);

    return {
      id: topic.id,
      name: topic.name,
      icon: iconForName(topic.name),
      subtopics: subtopicGroups,
    };
  });

  const unmatchedPackages = packages.filter((pkg) => !usedPackageIds.has(pkg.id));
  if (unmatchedPackages.length > 0) {
    groups.push(
      {
        id: "materi-lainnya",
        name: "Materi Lainnya",
        icon: "layers",
        subtopics: [
          {
            id: "paket-lainnya",
            name: "Paket Lainnya",
            icon: "layers",
            capabilities: [
              {
                id: "paket-lainnya-capability",
                name: "Paket Lainnya",
                icon: "layers",
                packages: unmatchedPackages,
              },
            ],
          },
        ],
      },
    );
  }

  return groups;
}
