"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConceptFocusList } from "@/components/ConceptFocusList";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PracticePackageCard } from "@/components/PracticePackageCard";
import { ResultStatus } from "@/components/ResultStatus";
import { RichText } from "@/components/RichText";
import { ScoreRing } from "@/components/ScoreRing";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatCard } from "@/components/ui/StatCard";
import { useNavigate } from "@/components/NavigationProgress";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { PracticePackage, Question } from "@/data/types";
import { formatDuration, misconceptionLabel } from "@/lib/format";
import { buildPracticeNarrative } from "@/lib/narrative";
import type { AnalysisCatalog } from "@/lib/scoring";
import {
  getPracticeResult,
  resetPractice,
  startPracticeAttempt,
  type PracticeResult,
} from "@/services/practice-service";
import { readProfile } from "@/storage/profile-storage";

function packageCoverage(pkg: PracticePackage): string[] {
  return pkg.subtopicIds?.length ? pkg.subtopicIds : [pkg.subtopicId];
}

function packageTitleKey(pkg: PracticePackage): string {
  return (pkg.title || pkg.slug).toLowerCase().replace(/\s+/g, " ").trim();
}

function ResultDropdown({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle: string;
  icon: Parameters<typeof Icon>[0]["name"];
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 marker:content-none sm:px-5">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
        >
          <Icon name={icon} className="h-5 w-5" strokeWidth={2.1} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold leading-snug text-ink-900">
            {title}
          </span>
          <span className="mt-0.5 block text-sm leading-relaxed text-slate-500">
            {subtitle}
          </span>
        </span>
        <Icon
          name="arrow-right"
          className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-90"
          strokeWidth={2.2}
        />
      </summary>
      <div className="border-t border-slate-200 px-4 py-4 sm:px-5 sm:py-5">{children}</div>
    </details>
  );
}

export function PracticeResultView({
  pkg,
  questions,
  catalog,
}: {
  pkg: PracticePackage;
  questions: Question[];
  catalog: AnalysisCatalog;
}) {
  const router = useRouter();
  const { navigate, isPending } = useNavigate();
  const { mounted, isUnlocked } = useEntitlements();
  const [state, setState] = useState<"loading" | "empty" | "ready">("loading");
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    if (!mounted) return;
    if (!isUnlocked(pkg)) {
      router.replace(`/latihan/${pkg.slug}`);
      return;
    }
    const stored = getPracticeResult(pkg, questions, catalog);
    if (!stored) {
      setState("empty");
      return;
    }
    setResult(stored);
    setStudentName(readProfile()?.name ?? "");
    setState("ready");
  }, [mounted, isUnlocked, pkg, pkg.slug, questions, catalog, router]);

  const handleRepeat = () => {
    resetPractice(pkg.slug);
    startPracticeAttempt(pkg.slug);
    navigate(`/latihan/${pkg.slug}/kerjakan`);
  };

  if (state === "loading") {
    return (
      <div className="container-reading py-16">
        <LoadingScreen message="Menyiapkan hasil…" />
      </div>
    );
  }

  if (state === "empty" || !result) {
    return (
      <div className="container-reading py-16 text-center">
        <IconBadge name="flag" tone="brand" size="lg" className="mx-auto" />
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Belum ada hasil latihan</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Hasil akan muncul setelah latihan {pkg.title} diselesaikan.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={`/latihan/${pkg.slug}/kerjakan`} size="lg">
            <Icon name="play" className="h-5 w-5" />
            Mulai Latihan
          </ButtonLink>
          <ButtonLink href={`/latihan/${pkg.slug}`} variant="secondary" size="lg">
            <Icon name="arrow-left" className="h-5 w-5" />
            Kembali ke Paket
          </ButtonLink>
        </div>
      </div>
    );
  }

  const { analysis, elapsedSeconds } = result;
  const total = questions.length || 1;
  const accuracy = Math.round((analysis.correctCount / total) * 100);

  const weakSubtopicIds = new Set(
    analysis.conceptsToReview.map((concept) => concept.subtopicId).filter(Boolean),
  );
  const seenRecommendationKeys = new Set<string>();
  // Rekomendasi hanya tampil bila datanya benar-benar menutup submateri lemah
  // pada mapel dan jenjang yang sama. Paket saat ini tidak ikut disarankan
  // karena sudah ada tombol "Ulangi Latihan".
  const recommendedPackages = analysis.recommendedPackageSlugs
    .filter((slug) => slug !== pkg.slug)
    .flatMap((slug) => {
      const found = catalog.practicePackages?.find((item) => item.slug === slug);
      return found ? [found] : [];
    })
    .filter((item) => item.subjectId === pkg.subjectId && item.level === pkg.level)
    .filter((item) => packageCoverage(item).some((subtopicId) => weakSubtopicIds.has(subtopicId)))
    .filter((item) => {
      const key = packageTitleKey(item);
      if (seenRecommendationKeys.has(key)) return false;
      seenRecommendationKeys.add(key);
      return true;
    })
    .slice(0, 6);

  // Nama materi hanya disebut bila seluruh soal paket ini memang satu materi.
  // `pkg.subtopicId` sendiri mewakili soal pertama saja, dan enam paket Bahasa
  // Inggris menyentuh beberapa materi sekaligus — menyebut materi soal pertama
  // pada paket seperti itu justru salah menunjuk. Bila lebih dari satu, kalimat
  // pertamanya memakai "materi ini" dan rincian per konsepnya yang menjelaskan.
  const singleSubtopicId =
    pkg.subtopicIds && pkg.subtopicIds.length === 1 ? pkg.subtopicIds[0] : undefined;
  const materialName = singleSubtopicId
    ? catalog.subtopics?.find((item) => item.id === singleSubtopicId)?.name
    : undefined;
  const narrative = buildPracticeNarrative(analysis, {
    studentName,
    contextName: materialName,
    nextPackageTitle: recommendedPackages[0]?.title,
  });

  // Seluruh konsep yang penguasaannya masih rendah ditampilkan, walaupun paketnya
  // hanya menyentuh satu konsep: justru di kartu itulah angka per konsep, penjelasan
  // materinya, dan pola keliru beserta nomor soalnya berkumpul jadi satu.
  const conceptCards = analysis.conceptsToReview;
  // Pola keliru yang sudah tampil di kartu konsep tidak diulang di bawahnya.
  const shownInConceptCards = new Set(
    conceptCards.flatMap((concept) => concept.misconceptions.map((item) => item.id)),
  );
  const otherSignals = analysis.misconceptionSignals.filter(
    (signal) => !shownInConceptCards.has(signal.id),
  );

  return (
    <div className="container-reading py-10 sm:py-12">
      <p className="eyebrow flex items-center gap-1.5">
        <Icon name="sparkles" className="h-4 w-4" />
        Hasil Latihan
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{pkg.title}</h1>

      {/* Kartu skor: bidang warna dengan cincin nilai, supaya hasil terbaca sekilas. */}
      <section className="relative isolate mt-7 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-6 shadow-float sm:p-8">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-white/10"
          viewBox="0 0 400 96"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0 50c70-38 130 24 210 6s130-40 190-12v52H0z" />
        </svg>

        <div className="relative z-10 flex flex-wrap items-center gap-6 sm:gap-8">
          <ScoreRing value={analysis.score} />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">
              Skor latihan
            </p>
            <p className="mt-1 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {analysis.score >= 80
                ? "Kerja bagus! 🎉"
                : analysis.score >= 60
                  ? "Sedikit lagi! 💪"
                  : "Ayo coba lagi! 🚀"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              {analysis.correctCount} dari {questions.length} soal dijawab benar — ketepatan{" "}
              {accuracy}%.
            </p>
            {/* Nilai soal tetap utuh; bagian yang sudah tepat disebut terpisah supaya
                pekerjaan yang benar sebagian tidak hilang dari pandangan. */}
            {analysis.hasPartialCredit ? (
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                Penguasaan per bagian {analysis.partsScore}%: {analysis.partsCorrect} dari{" "}
                {analysis.partsTotal} bagian jawaban sudah tepat — tiap soal pilihan ganda satu
                bagian, tiap pernyataan Benar/Salah satu bagian. Nilai soalnya utuh, jadi soal yang
                baru benar sebagian belum menambah skor.
              </p>
            ) : null}
            <div className="mt-4">
              <ResultStatus
                status={analysis.status}
                appearance="solid"
                className="px-3 py-1.5 text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rincian jawaban */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon="check" tone="emerald" label="Benar" value={analysis.correctCount} />
        <StatCard icon="close" tone="rose" label="Salah" value={analysis.wrongCount} />
        <StatCard icon="minus" tone="slate" label="Kosong" value={analysis.unansweredCount} />
        <StatCard
          icon="clock"
          tone="sky"
          label="Waktu"
          value={formatDuration(elapsedSeconds)}
          valueClassName="text-xl"
        />
      </section>

      <div className="mt-8 space-y-3">
        <ResultDropdown
          title="Ringkasan untuk orang tua"
          subtitle="Hasil utama dan langkah belajar berikutnya."
          icon={narrative.isAllClear ? "trophy" : "compass"}
          defaultOpen
        >
          <div className="max-w-2xl space-y-2">
            {narrative.sentences.map((sentence) => (
              <p key={sentence} className="text-[16px] leading-[1.75] text-ink-900 sm:text-[17px]">
                <RichText as="span" inline html={sentence} />
              </p>
            ))}
          </div>
        </ResultDropdown>

        {conceptCards.length > 0 ? (
          <ResultDropdown
            title="Bagian yang perlu dibantu lagi"
            subtitle="Urutan dari bagian yang paling butuh perhatian."
            icon="book"
          >
            <p className="text-[15px] leading-relaxed text-slate-600">
              Mulai dampingi dari nomor pertama, karena bagian itu yang paling banyak belum tepat.
            </p>
            <ConceptFocusList concepts={conceptCards} />
          </ResultDropdown>
        ) : null}

      {/* Konsep yang sudah kuat, supaya yang lemah terbaca sebagai sebagian — bukan semuanya. */}
      {analysis.strongConcepts.length > 0 ? (
        <ResultDropdown
          title="Bagian yang sudah cukup aman"
          subtitle="Materi ini tidak perlu jadi fokus utama sekarang."
          icon="check"
        >
          <ul className="flex flex-wrap gap-2">
            {analysis.strongConcepts.map((concept) => (
              <li
                key={concept.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200"
              >
                <Icon name="check" className="h-4 w-4 text-emerald-600" strokeWidth={2.4} />
                <RichText as="span" inline html={concept.name} />
                {/* Penguasaan, bukan jumlah soal benar: yang menentukan konsep ini masuk
                    daftar "sudah dikuasai" memang angka per bagian itu. Menampilkan
                    "0/2" di sebelah kata "dikuasai" justru saling bertentangan. */}
                <span className="font-normal tabular-nums text-emerald-700">
                  {concept.mastery}%
                </span>
              </li>
            ))}
          </ul>
        </ResultDropdown>
      ) : null}

      {/* Pola keliru yang terbaca dari pengecoh yang dipilih, bukan sekadar benar-salah. */}
      {otherSignals.length > 0 ? (
        <ResultDropdown
          title="Pola jawaban yang perlu dibenahi"
          subtitle="Kesalahan yang berulang dari pilihan jawaban anak."
          icon="alert"
        >
          <p className="text-[15px] leading-relaxed text-slate-600">
            Terbaca dari pilihan jawaban yang tadi diambil, bukan hanya dari benar atau salahnya.
          </p>
          <ul className="mt-5 space-y-3">
            {otherSignals.map((signal) => (
              <li
                key={signal.id}
                className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5"
              >
                {/* <div>, bukan <p>: label yang terbawa markup dapat berisi <p> sendiri. */}
                <div className="text-[15px] font-semibold leading-relaxed text-ink-900">
                  <RichText as="span" inline html={misconceptionLabel(signal.label)} />
                  {signal.count > 1 ? (
                    <span className="ml-1.5 font-normal text-amber-800">
                      (muncul {signal.count}×)
                    </span>
                  ) : null}
                </div>
                <RichText
                  className="mt-1 text-[15px] leading-relaxed text-slate-700"
                  html={signal.insight}
                />
                {signal.questionNumbers.length > 0 ? (
                  <p className="mt-1.5 text-sm text-amber-900">
                    Terbaca pada soal nomor {signal.questionNumbers.join(", ")}.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </ResultDropdown>
      ) : null}

      {/* Paket lanjutan untuk konsep yang masih lemah. */}
      {recommendedPackages.length > 0 ? (
        <ResultDropdown
          title="Latihan berikutnya yang cocok"
          subtitle="Paket ini sesuai dengan bagian yang tadi masih lemah."
          icon="target"
        >
          <p className="text-[15px] leading-relaxed text-slate-600">
            Mulai dari paket pertama agar latihan berikutnya lebih terarah.
          </p>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {recommendedPackages.map((item, index) => (
              <li key={item.id}>
                <PracticePackageCard
                  pkg={item}
                  order={index + 1}
                  toneIndex={index}
                  note="Disarankan dari konsep yang paling perlu diperkuat pada latihan ini."
                />
              </li>
            ))}
          </ul>
        </ResultDropdown>
      ) : null}

        <ResultDropdown
          title="Pembahasan soal"
          subtitle="Buka penjelasan jawaban atau ulangi latihan dari awal."
          icon="book"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/latihan/${pkg.slug}/pembahasan`} size="lg">
              <Icon name="book" className="h-5 w-5" />
              Lihat Pembahasan
            </ButtonLink>
            <Button variant="secondary" size="lg" loading={isPending} onClick={handleRepeat}>
              {isPending ? null : <Icon name="refresh" className="h-5 w-5" />}
              Ulangi Latihan
            </Button>
          </div>
        </ResultDropdown>
      </div>
    </div>
  );
}
