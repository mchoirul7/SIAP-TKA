"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ResultStatus } from "@/components/ResultStatus";
import { RichText } from "@/components/RichText";
import { ScoreRing } from "@/components/ScoreRing";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { useNavigate } from "@/components/NavigationProgress";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { PracticePackage, Question } from "@/data/types";
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
        <LoadingScreen message="Menyiapkan hasil..." />
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

  const { analysis } = result;
  const singleSubtopicId =
    pkg.subtopicIds && pkg.subtopicIds.length === 1 ? pkg.subtopicIds[0] : undefined;
  const materialName = singleSubtopicId
    ? catalog.subtopics?.find((item) => item.id === singleSubtopicId)?.name
    : undefined;
  const narrative = buildPracticeNarrative(analysis, {
    studentName,
    contextName: materialName,
  });

  return (
    <div className="container-reading py-10 sm:py-12">
      <p className="eyebrow flex items-center gap-1.5">
        <Icon name="sparkles" className="h-4 w-4" />
        Hasil Latihan
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{pkg.title}</h1>

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
                ? "Kerja bagus!"
                : analysis.score >= 60
                  ? "Sedikit lagi!"
                  : "Ayo coba lagi!"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/85">
              Skor akhir latihan ini {analysis.score} dari 100.
            </p>
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

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-3">
          <IconBadge name={narrative.isAllClear ? "trophy" : "compass"} tone="brand" size="md" />
          <h2 className="text-xl font-extrabold tracking-tight text-ink-900">
            Catatan untuk orang tua
          </h2>
        </div>
        <div className="mt-4 max-w-2xl space-y-2">
          {narrative.sentences.map((sentence) => (
            <p key={sentence} className="text-[16px] leading-[1.75] text-ink-900 sm:text-[17px]">
              <RichText as="span" inline html={sentence} />
            </p>
          ))}
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/latihan/${pkg.slug}/pembahasan`} size="lg">
          <Icon name="book" className="h-5 w-5" />
          Lihat Pembahasan
        </ButtonLink>
        <Button variant="secondary" size="lg" loading={isPending} onClick={handleRepeat}>
          {isPending ? null : <Icon name="refresh" className="h-5 w-5" />}
          Kerjakan Ulang
        </Button>
      </div>
    </div>
  );
}
