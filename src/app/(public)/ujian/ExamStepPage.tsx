import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import type { ExamCrumb } from "@/components/ujian/ExamBreadcrumb";
import { ExamContextSync } from "@/components/ujian/ExamContextSync";
import { ExamEmptyState } from "@/components/ujian/ExamEmptyState";
import { ExamPageHeader } from "@/components/ujian/ExamPageHeader";
import { CustomRequestCard, TrialCard } from "@/components/ujian/ExamExtraCards";
import { ExamTypeCard } from "@/components/ujian/ExamTypeCard";
import { PackageCard } from "@/components/ujian/PackageCard";
import { SubjectCard } from "@/components/ujian/SubjectCard";
import { Icon } from "@/components/ui/Icon";
import {
  assessmentConfigBySlug,
  assessmentNeedsSemester,
  examPackagesHref,
  examScopeFor,
  examSubjectsHref,
  examTypeHref,
  SEMESTERS,
  semesterFromSegment,
  semesterLabel,
  semesterSegment,
  subjectSlugCandidates,
  type AssessmentConfig,
  type ExamScope,
} from "@/lib/assessment";
import { breadcrumbSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";
import { getServerStudyContext } from "@/lib/server-study-context";
import { scopeOwnership, subjectOwnership } from "@/lib/student-ownership";
import { ACCESS_MONTHS, allAccessPrice, formatRupiah, fullPackagePrice, separatePackagesPrice } from "@/lib/pricing";
import {
  buildSubjectCatalog,
  buyAllAccessHref,
  buyPackageHref,
  customRequestHref,
  groupSubjectCatalog,
} from "@/lib/subject-catalog";
import { levelOptionFor, serializeStudyContext, type StudyContext } from "@/lib/study-context";
import {
  getExamPackages,
  getExamSubjects,
  getSubjectForLevel,
  type ExamPackage,
} from "@/services/content-service";

/**
 * Satu penyaji untuk seluruh langkah setelah /ujian:
 *
 *   /ujian/{jenis}                          → pilih mapel (TKA, UH) atau semester (STS, SAS)
 *   /ujian/{jenis}/semester-{n}             → pilih mapel (STS, SAS)
 *   /ujian/{jenis}/{mapel}                  → daftar paket (TKA, UH)
 *   /ujian/{jenis}/semester-{n}/{mapel}     → daftar paket (STS, SAS)
 *
 * Tiap langkah adalah route sendiri sehingga URL-nya bisa dibagikan dan
 * dimuat ulang. Jenjang dan kelas datang dari kelas aktif (cookie).
 */

type ExamStep =
  | { kind: "semesters"; config: AssessmentConfig }
  | { kind: "subjects"; config: AssessmentConfig; semester: number | null }
  | { kind: "packages"; config: AssessmentConfig; semester: number | null; subjectSegment: string };

function resolveExamStep(segments: string[]): ExamStep | null {
  const [typeSlug, ...rest] = segments.map((segment) => decodeURIComponent(segment));
  const config = assessmentConfigBySlug(typeSlug);
  if (!config) return null;

  if (!assessmentNeedsSemester(config.key)) {
    if (rest.length === 0) return { kind: "subjects", config, semester: null };
    if (rest.length === 1) return { kind: "packages", config, semester: null, subjectSegment: rest[0] };
    return null;
  }

  if (rest.length === 0) return { kind: "semesters", config };
  const semester = semesterFromSegment(rest[0]);
  if (!semester) return null;
  if (rest.length === 1) return { kind: "subjects", config, semester };
  if (rest.length === 2) return { kind: "packages", config, semester, subjectSegment: rest[1] };
  return null;
}

/** `seni-rupa` → `Seni Rupa`, dipakai bila mapelnya tidak ditemukan. */
function humanizeSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function scopeLabel(scope: ExamScope): string {
  return [
    levelOptionFor(scope.level).label,
    `Kelas ${scope.gradeLevel}`,
    ...(scope.semester ? [semesterLabel(scope.semester)] : []),
  ].join(" • ");
}

/** Untuk kalimat: `SD Kelas 3`, `SD Kelas 3 Semester 1`. */
function scopeShortLabel(scope: ExamScope): string {
  return [scope.level, `Kelas ${scope.gradeLevel}`, ...(scope.semester ? [semesterLabel(scope.semester)] : [])].join(" ");
}

function stepPath(step: ExamStep): string {
  if (step.kind === "semesters") return examTypeHref(step.config.key);
  const subjects = examSubjectsHref(step.config.key, step.semester);
  return step.kind === "subjects" ? subjects : `${subjects}/${step.subjectSegment}`;
}

function breadcrumbFor(step: ExamStep, subjectName?: string): ExamCrumb[] {
  const crumbs: ExamCrumb[] = [
    { label: "Beranda", href: "/" },
    { label: "Jenis Ujian", href: "/ujian" },
    { label: step.config.title, href: examTypeHref(step.config.key) },
  ];
  if (step.kind !== "semesters" && step.semester) {
    crumbs.push({ label: semesterLabel(step.semester), href: examSubjectsHref(step.config.key, step.semester) });
  }
  if (step.kind === "packages") crumbs.push({ label: subjectName ?? humanizeSegment(step.subjectSegment) });
  // Posisi saat ini tidak ditautkan.
  const last = crumbs[crumbs.length - 1];
  crumbs[crumbs.length - 1] = { label: last.label };
  return crumbs;
}

function BreadcrumbJsonLd({ crumbs, path }: { crumbs: ExamCrumb[]; path: string }) {
  return (
    <JsonLd
      data={jsonLdGraph(
        breadcrumbSchema(crumbs.map((crumb) => ({ name: crumb.label, path: crumb.href ?? path }))),
      )}
    />
  );
}

export function examStepMetadata(segments: string[]): Metadata {
  const step = resolveExamStep(segments);
  if (!step) return { title: "Halaman tidak ditemukan", robots: { index: false } };

  const semester = step.kind !== "semesters" && step.semester ? ` ${semesterLabel(step.semester)}` : "";
  const subject = step.kind === "packages" ? ` ${humanizeSegment(step.subjectSegment)}` : "";
  const title = `${step.config.title}${semester}${subject}`;
  return pageMetadata({
    title: `Latihan ${title}`,
    description: `${step.config.description} Pilih paket latihan ${title} sesuai jenjang dan kelasmu.`,
    path: stepPath(step),
  });
}

export async function ExamStepPage({ segments }: { segments: string[] }) {
  const step = resolveExamStep(segments);
  if (!step) notFound();

  const context = await getServerStudyContext();
  const contextKey = context ? serializeStudyContext(context) : null;

  return (
    // Kunci kelas aktif memasang ulang isinya, jadi kartu bergerak lagi setiap jenjang diganti.
    <div key={contextKey ?? "none"} className="container-page anim-page py-10 sm:py-12">
      <ExamContextSync serverContextKey={contextKey} />
      {step.kind === "semesters" ? (
        <SemesterStep config={step.config} />
      ) : !context ? (
        <ContextPending step={step} />
      ) : step.kind === "subjects" ? (
        <SubjectStep step={step} context={context} />
      ) : (
        <PackageStep step={step} context={context} />
      )}
    </div>
  );
}

function SemesterStep({ config }: { config: AssessmentConfig }) {
  const step: ExamStep = { kind: "semesters", config };
  const crumbs = breadcrumbFor(step);
  return (
    <>
      <BreadcrumbJsonLd crumbs={crumbs} path={stepPath(step)} />
      <ExamPageHeader
        breadcrumb={crumbs}
        back={{ href: "/ujian", label: "Kembali ke Jenis Ujian" }}
        title={config.title}
        subtitle="Pilih semester terlebih dahulu."
      />
      <ul className="anim-stagger mt-7 grid gap-4 md:grid-cols-2">
        {SEMESTERS.map((semester) => (
          <li key={semester}>
            <ExamTypeCard
              href={`${examTypeHref(config.key)}/${semesterSegment(semester)}`}
              badge={String(semester)}
              title={semesterLabel(semester)}
              description={`${config.title} untuk materi ${semesterLabel(semester).toLowerCase()}.`}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function subjectsBack(config: AssessmentConfig, semester: number | null) {
  return semester
    ? { href: examTypeHref(config.key), label: "Kembali ke Pilih Semester" }
    : { href: "/ujian", label: "Kembali ke Jenis Ujian" };
}

/** Server belum tahu kelasnya; dialog pemilihan kelas sudah terbuka di atas halaman ini. */
function ContextPending({ step }: { step: Exclude<ExamStep, { kind: "semesters" }> }) {
  return (
    <>
      <ExamPageHeader
        breadcrumb={breadcrumbFor(step)}
        title={step.config.title}
        subtitle="Pilih jenjang dan kelas dulu agar daftar yang muncul sesuai."
      />
      <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-[112px] animate-pulse rounded-[12px] bg-white/80 ring-1 ring-sky-100" />
        ))}
      </div>
    </>
  );
}

const typeTone: Record<AssessmentConfig["key"], string> = {
  tka: "bg-[#efe5ff] text-[#6617f4]",
  ulangan_harian: "bg-[#fff0d5] text-[#ec7d00]",
  sumatif_tengah_semester: "bg-[#e0f2ff] text-[#1787e8]",
  sumatif_akhir_semester: "bg-[#e5f9e9] text-[#15963c]",
};

async function SubjectStep({
  step,
  context,
}: {
  step: Extract<ExamStep, { kind: "subjects" }>;
  context: StudyContext;
}) {
  const { config, semester } = step;
  const scope = examScopeFor(config.key, context, semester);
  const catalog = buildSubjectCatalog(scope.level, scope.gradeLevel, config.key, await getExamSubjects(scope));
  const sections = groupSubjectCatalog(catalog);
  // TKA dan ulangan harian diapit kartu ujicoba gratis dan kartu custom request.
  const withExtras = config.key === "tka" || config.key === "ulangan_harian";
  const math = withExtras ? catalog.find((item) => item.key === "matematika" && item.subject) : undefined;
  const trial = math?.subject
    ? (await getExamPackages(scope, math.subject)).find((pkg) => pkg.kind === "latihan" && pkg.isFreeAccess)
    : undefined;
  const crumbs = breadcrumbFor(step);
  const back = subjectsBack(config, semester);
  // Paket yang sudah dimiliki murid: All-in yang sudah dibeli tidak ditawarkan lagi.
  const ownership = await scopeOwnership(scope);
  const allAccess = ownership?.allIn ? null : allAccessPrice(config.key, scope.level, scope.gradeLevel, catalog);

  return (
    <>
      <BreadcrumbJsonLd crumbs={crumbs} path={stepPath(step)} />
      <section className="relative">
        {/* Ilustrasi dipotong dari mockup halaman pilih mapel. */}
        <div className="pointer-events-none absolute right-[-1%] top-[-1.5rem] hidden aspect-[704/202] w-[55%] lg:block hero-float">
          <Image src="/beranda/mapel-hero.png" alt="" fill sizes="55vw" className="object-contain object-right" priority />
        </div>
        <div className="relative z-10 max-w-[38rem] pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={back.href}
              aria-label={back.label}
              className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-brand-100 bg-white px-4 text-sm font-black text-brand-700 shadow-[0_8px_18px_-14px_rgba(18,21,58,0.5)] hover:border-brand-300"
            >
              <Icon name="arrow-left" className="h-4 w-4" strokeWidth={2.6} />
              Kembali
            </Link>
            <span className={`inline-flex h-14 items-center gap-3 rounded-[16px] pl-2 pr-5 ${typeTone[config.key]}`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/70">
                <Icon name={config.icon} className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="leading-tight">
                <span className="block text-[15px] font-black text-ink-900">{config.title}</span>
                <span className="block text-[13px] font-semibold text-slate-600">{scopeShortLabel(scope)}</span>
              </span>
            </span>
          </div>
          <h1 className="mt-5 text-[clamp(2.1rem,4.4vw,3.4rem)] font-black leading-[1.05] tracking-[-0.02em] text-[#080d3f]">
            Pilih{" "}
            <span className="bg-gradient-to-r from-[#6818f1] to-[#8e35ff] bg-clip-text text-transparent">
              Mata Pelajaran
            </span>
          </h1>
          <p className="mt-3 text-[clamp(1rem,1.3vw,1.15rem)] font-medium text-[#56627c]">
            {config.key === "tka" && context.grade !== scope.gradeLevel
              ? `Pilih pelajaran yang ingin ananda latih hari ini. TKA ${context.level} mengikuti materi kelas ${scope.gradeLevel}.`
              : "Pilih pelajaran yang ingin ananda latih hari ini."}
          </p>
        </div>
      </section>
      {/* All-in Akses: semua mapel jenis ujian ini sekaligus, seharga total paket lengkapnya. */}
      {allAccess ? (
        <div className="mb-8">
          <PriceOffer
            {...(config.key === "ulangan_harian"
              ? {
                  // Ulangan harian tidak dibagi per semester, jadi tegaskan bahwa isinya setahun penuh.
                  eyebrow: "All-in Akses Seluruh Materi 2 Semester",
                  title: `Semua Mapel ${config.title} Semester 1 & 2`,
                  description: `Seluruh materi ${allAccess.subjectCount} mapel untuk ${scopeShortLabel(scope)}, Semester 1 dan Semester 2 sekaligus. Akses ${ACCESS_MONTHS} bulan.`,
                }
              : {
                  eyebrow: `All-in Akses ${ACCESS_MONTHS} Bulan`,
                  title: `Semua Mapel ${config.title}`,
                  description: `Paket lengkap ${allAccess.subjectCount} mapel sekaligus untuk ${scopeShortLabel(scope)}`,
                })}
            price={allAccess.price}
            originalPrice={allAccess.originalPrice}
            buyHref={buyAllAccessHref({
              context: scopeShortLabel(scope),
              assessment: config.title,
              price: formatRupiah(allAccess.price),
            })}
            buyLabel="Beli All-in Akses"
          />
        </div>
      ) : null}
      {/* Section judul hanya muncul bila ada lebih dari satu kelompok, misalnya SMA/SMK. */}
      <div className="space-y-10">
      {sections.map((section, sectionIndex) => (
        <section key={section.group}>
          {sections.length > 1 ? (
            <div className="mb-4 flex items-center gap-3">
              <h2 className="shrink-0 text-[20px] font-black text-ink-900">
                {section.title}{" "}
                <span className="text-[15px] font-bold text-slate-400">({section.items.length})</span>
              </h2>
              <span className="h-px flex-1 bg-gradient-to-r from-brand-200 to-transparent" />
            </div>
          ) : null}
          <ul className="anim-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {sectionIndex === 0 && trial ? (
              <li>
                <TrialCard href={`/latihan/${trial.slug}`} />
              </li>
            ) : null}
            {section.items.map((item) => {
              const price = fullPackagePrice(config.key, item);
              return (
              <li key={item.key}>
                <SubjectCard
                  href={item.subject ? examPackagesHref(config.key, semester, item.subject) : null}
                  buyHref={
                    item.subject && price
                      ? buyPackageHref({
                          context: scopeShortLabel(scope),
                          assessment: config.title,
                          subject: item.name,
                          price: formatRupiah(price),
                        })
                      : null
                  }
                  name={item.name}
                  description={item.description}
                  art={item.art}
                  tone={item.tone}
                  packageCount={item.packageCount}
                  price={price}
                  originalPrice={separatePackagesPrice(config.key, item)}
                  tryoutCount={config.key === "tka" ? item.tryoutCount : null}
                  owned={subjectOwnership(ownership, item.subject?.id, item.packageCount)}
                />
              </li>
              );
            })}
            {/* Custom request menutup daftar utama, tidak ikut ke section mapel lainnya. */}
            {withExtras && sectionIndex === 0 ? (
              <li>
                <CustomRequestCard
                  href={customRequestHref({ context: scopeShortLabel(scope), assessment: config.title })}
                />
              </li>
            ) : null}
          </ul>
        </section>
      ))}
      </div>
    </>
  );
}

async function PackageStep({
  step,
  context,
}: {
  step: Extract<ExamStep, { kind: "packages" }>;
  context: StudyContext;
}) {
  const { config, semester, subjectSegment } = step;
  const scope = examScopeFor(config.key, context, semester);
  const subject = await getSubjectForLevel(subjectSlugCandidates(subjectSegment, scope.level), scope.level);
  const packages = subject ? await getExamPackages(scope, subject) : [];
  const subjectName = subject?.shortName ?? humanizeSegment(subjectSegment);
  const crumbs = breadcrumbFor(step, subjectName);
  const backHref = examSubjectsHref(config.key, semester);

  const practice = packages.filter((pkg) => pkg.kind === "latihan");
  const tryouts = packages.filter((pkg) => pkg.kind === "tryout");
  const counts = { subject, packageCount: packages.length, tryoutCount: tryouts.length };
  // Mapel yang sudah dimiliki penuh tidak ditawari paket lengkap lagi; yang baru
  // sebagian tetap ditawari untuk dilengkapi.
  const owned = subjectOwnership(await scopeOwnership(scope), subject?.id, packages.length);
  const fullPrice = packages.length > 0 && !owned?.full ? fullPackagePrice(config.key, counts) : null;
  const originalPrice = fullPrice !== null ? separatePackagesPrice(config.key, counts) : null;

  return (
    <>
      <BreadcrumbJsonLd crumbs={crumbs} path={stepPath(step)} />
      <ExamPageHeader
        breadcrumb={crumbs}
        back={{ href: backHref, label: "Kembali ke Mata Pelajaran" }}
        eyebrow={scopeLabel(scope)}
        title={`${config.title} ${subjectName}`}
      />
      {packages.length > 0 ? (
        <>
          {fullPrice !== null ? (
            <FullPackageOffer
              subjectName={subjectName}
              ownedCount={owned?.count ?? 0}
              practiceCount={practice.length}
              tryoutCount={tryouts.length}
              price={fullPrice}
              originalPrice={originalPrice}
              buyHref={buyPackageHref({
                context: scopeShortLabel(scope),
                assessment: config.title,
                subject: subjectName,
                price: formatRupiah(fullPrice),
              })}
            />
          ) : null}
          <PackageSection title="Latihan yang tersedia" packages={practice} />
          <PackageSection title="Tryout yang tersedia" packages={tryouts} />
        </>
      ) : (
        <ExamEmptyState
          message={`Belum ada latihan ${config.title} untuk ${subjectName} Kelas ${scope.gradeLevel}${
            scope.semester ? ` ${semesterLabel(scope.semester)}` : ""
          }.`}
          backHref={backHref}
          backLabel="Kembali ke Mata Pelajaran"
        />
      )}
    </>
  );
}

/** Penawaran paket lengkap satu mapel: harga coret, harga paket, dan hematnya. */
function FullPackageOffer({
  subjectName,
  ownedCount,
  practiceCount,
  tryoutCount,
  price,
  originalPrice,
  buyHref,
}: {
  subjectName: string;
  /** Paket mapel ini yang sudah dimiliki; bila ada, tawarannya menjadi "lengkapi". */
  ownedCount: number;
  practiceCount: number;
  tryoutCount: number;
  price: number;
  originalPrice: number | null;
  buyHref: string;
}) {
  const contents = [
    ...(practiceCount ? [`${practiceCount} latihan`] : []),
    ...(tryoutCount ? [`${tryoutCount} tryout`] : []),
  ].join(" + ");
  return (
    <PriceOffer
      eyebrow={ownedCount > 0 ? `${ownedCount} paket sudah terbuka` : "Beli per mapel lebih hemat"}
      title={ownedCount > 0 ? `Lengkapi Paket ${subjectName}` : `Paket Lengkap ${subjectName}`}
      description={`Semua paket sekaligus: ${contents}`}
      price={price}
      originalPrice={originalPrice}
      buyHref={buyHref}
      buyLabel="Beli Paket Lengkap"
    />
  );
}

/** Banner harga beserta harga coret, hemat, dan tombol beli lewat WhatsApp. */
function PriceOffer({
  eyebrow,
  title,
  description,
  price,
  originalPrice,
  buyHref,
  buyLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  buyHref: string;
  buyLabel: string;
}) {
  return (
    <section className="anim-pop mt-6 rounded-[16px] bg-gradient-to-r from-[#5b0fd6] to-[#8e35ff] p-5 text-white shadow-[0_18px_34px_-22px_rgba(80,1,218,0.9)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-white/70">{eyebrow}</p>
          <h2 className="mt-1 text-[20px] font-black leading-tight text-white">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-white/80">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:justify-end">
          <div className="text-left sm:text-right">
            {originalPrice !== null ? (
              <p className="flex items-baseline gap-2 sm:justify-end">
                <s className="text-sm font-bold text-white/60">{formatRupiah(originalPrice)}</s>
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[12px] font-black text-[#2a1460]">
                  Hemat {formatRupiah(originalPrice - price)}
                </span>
              </p>
            ) : null}
            <p className="text-[28px] font-black leading-none text-white">{formatRupiah(price)}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[12px] font-black text-white">
              Akses {ACCESS_MONTHS} bulan
            </p>
          </div>
          <a
            href={buyHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-white px-6 text-sm font-black text-brand-700 shadow-[0_12px_24px_-16px_rgba(0,0,0,0.6)] transition-opacity hover:opacity-90"
          >
            <Icon name="whatsapp" className="h-5 w-5" />
            {buyLabel}
          </a>
        </div>
      </div>
      <PriceTerms />
    </section>
  );
}

/** Syarat dan ketentuan harga, sama untuk paket satuan, paket lengkap, dan All-in Akses. */
const PRICE_TERMS = [
  "Harga berlaku untuk 1 murid (1 akun) per akses.",
  `Masa akses ${ACCESS_MONTHS} bulan sejak akses diaktifkan. Setelah itu akses berakhir.`,
  "Satu akses hanya untuk kelas dan jenis ujian yang dibeli, termasuk semesternya bila ada.",
  "Akses tidak dapat dipindahtangankan atau dipakai bersama oleh murid lain.",
  "Pembelian dan aktivasi akses dilayani admin lewat WhatsApp.",
];

function PriceTerms() {
  return (
    <details className="mt-4 rounded-[12px] bg-white/10 px-4 py-3 text-white/85">
      <summary className="cursor-pointer text-[13px] font-black text-white">Syarat dan ketentuan harga</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] font-semibold">
        {PRICE_TERMS.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </details>
  );
}

function PackageSection({ title, packages }: { title: string; packages: ExamPackage[] }) {
  if (packages.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-[22px] font-black text-ink-900">
        {title} <span className="text-slate-400">({packages.length})</span>
      </h2>
      <ul className="anim-stagger mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {packages.map((pkg) => (
          <li key={pkg.id}>
            <PackageCard pkg={pkg} />
          </li>
        ))}
      </ul>
    </section>
  );
}
