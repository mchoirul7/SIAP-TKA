"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConceptFocusList } from "@/components/ConceptFocusList";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PracticePackageCard } from "@/components/PracticePackageCard";
import { ResultStatus } from "@/components/ResultStatus";
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

  // Paket yang sedang dikerjakan tidak ikut disarankan; untuk itu sudah ada tombol "Ulangi".
  const recommendedPackages = analysis.recommendedPackageSlugs
    .filter((slug) => slug !== pkg.slug)
    .flatMap((slug) => {
      const found = catalog.practicePackages?.find((item) => item.slug === slug);
      return found ? [found] : [];
    });

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
                Dihitung per bagian, {analysis.partsCorrect} dari {analysis.partsTotal} pernyataan
                dan pilihan sudah tepat.
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

      {/* Ringkasan tiga kalimat: hasilnya bagaimana, lemahnya di mana, sebaiknya apa. */}
      <section className="mt-8">
        <div
          className={[
            "rounded-3xl border p-6 shadow-card sm:p-8",
            narrative.isAllClear
              ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
              : "border-brand-200 bg-gradient-to-br from-brand-50 to-white",
          ].join(" ")}
        >
          <div className="flex items-start gap-4">
            <IconBadge
              name={narrative.isAllClear ? "trophy" : "compass"}
              tone={narrative.isAllClear ? "emerald" : "violet"}
              size="lg"
            />
            <div className="min-w-0">
              <p
                className={`text-xs font-bold uppercase tracking-[0.12em] ${
                  narrative.isAllClear ? "text-emerald-700" : "text-brand-700"
                }`}
              >
                Catatan Hasil Latihan
              </p>
              {/* Tiap kalimat satu baris: capaian, kelemahan, lalu saran. */}
              <div className="mt-2 max-w-2xl space-y-2">
                {narrative.sentences.map((sentence) => (
                  <p key={sentence} className="text-[17px] leading-[1.7] text-ink-900 sm:text-lg">
                    {sentence}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Konsep yang masih lemah: angkanya, penjelasannya, dan pola kelirunya. */}
      {conceptCards.length > 0 ? (
        <section className="mt-10">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="book" tone="sky" size="md" />
            Konsep yang perlu diperkuat
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Diurutkan dari yang paling sedikit benar. Mulai dari nomor satu, ya.
          </p>
          <ConceptFocusList concepts={conceptCards} />
        </section>
      ) : null}

      {/* Konsep yang sudah kuat, supaya yang lemah terbaca sebagai sebagian — bukan semuanya. */}
      {analysis.strongConcepts.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
          <h2 className="flex items-center gap-2.5 text-base font-extrabold tracking-tight">
            <IconBadge name="check" tone="emerald" size="sm" />
            Konsep yang sudah dikuasai
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {analysis.strongConcepts.map((concept) => (
              <li
                key={concept.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200"
              >
                <Icon name="check" className="h-4 w-4 text-emerald-600" strokeWidth={2.4} />
                {concept.name}
                <span className="font-normal tabular-nums text-emerald-700">
                  {concept.correct}/{concept.total}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Pola keliru yang terbaca dari pengecoh yang dipilih, bukan sekadar benar-salah. */}
      {otherSignals.length > 0 ? (
        <section className="mt-10">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="alert" tone="amber" size="md" />
            Yang tadi masih keliru
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Terbaca dari pilihan jawaban yang tadi diambil, bukan hanya dari benar atau salahnya.
          </p>
          <ul className="mt-5 space-y-3">
            {otherSignals.map((signal) => (
              <li
                key={signal.id}
                className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5"
              >
                <p className="text-[15px] font-semibold leading-relaxed text-ink-900">
                  {misconceptionLabel(signal.label)}
                  {signal.count > 1 ? (
                    <span className="ml-1.5 font-normal text-amber-800">
                      (muncul {signal.count}×)
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{signal.insight}</p>
                {signal.questionNumbers.length > 0 ? (
                  <p className="mt-1.5 text-sm text-amber-900">
                    Terbaca pada soal nomor {signal.questionNumbers.join(", ")}.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Paket lanjutan untuk konsep yang masih lemah. */}
      {recommendedPackages.length > 0 ? (
        <section className="mt-10">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="target" tone="brand" size="md" />
            Paket yang perlu dicoba
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Paket ini melatih konsep yang tadi masih sering keliru.
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
        </section>
      ) : null}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/latihan/${pkg.slug}/pembahasan`} size="lg">
          <Icon name="book" className="h-5 w-5" />
          Lihat Pembahasan
        </ButtonLink>
        <Button variant="secondary" size="lg" loading={isPending} onClick={handleRepeat}>
          {isPending ? null : <Icon name="refresh" className="h-5 w-5" />}
          Ulangi Latihan
        </Button>
      </div>
    </div>
  );
}
