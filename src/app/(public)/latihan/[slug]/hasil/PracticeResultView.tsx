"use client";

import { useEffect, useState } from "react";
import { ResultStatus } from "@/components/ResultStatus";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useNavigate } from "@/components/NavigationProgress";
import type { PracticePackage, Question } from "@/data/types";
import { formatDuration } from "@/lib/format";
import { buildPracticeNarrative } from "@/lib/narrative";
import type { AnalysisCatalog } from "@/lib/scoring";
import {
  getPracticeResult,
  resetPractice,
  startPracticeAttempt,
  type PracticeResult,
} from "@/services/practice-service";

export function PracticeResultView({
  pkg,
  questions,
  catalog,
}: {
  pkg: PracticePackage;
  questions: Question[];
  catalog: AnalysisCatalog;
}) {
  const { navigate, isPending } = useNavigate();
  const [state, setState] = useState<"loading" | "empty" | "ready">("loading");
  const [result, setResult] = useState<PracticeResult | null>(null);

  useEffect(() => {
    const stored = getPracticeResult(pkg, questions, catalog);
    if (!stored) {
      setState("empty");
      return;
    }
    setResult(stored);
    setState("ready");
  }, [pkg, questions, catalog]);

  const handleRepeat = () => {
    resetPractice(pkg.slug);
    startPracticeAttempt(pkg.slug);
    navigate(`/latihan/${pkg.slug}/kerjakan`);
  };

  if (state === "loading") {
    return (
      <div className="container-reading py-20">
        <p className="text-sm text-slate-500">Menyiapkan hasil…</p>
      </div>
    );
  }

  if (state === "empty" || !result) {
    return (
      <div className="container-reading py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Belum ada hasil latihan</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Hasil akan muncul setelah latihan {pkg.title} diselesaikan.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={`/latihan/${pkg.slug}/kerjakan`} size="lg">
            Mulai Latihan
          </ButtonLink>
          <ButtonLink href={`/latihan/${pkg.slug}`} variant="secondary" size="lg">
            Kembali ke Paket
          </ButtonLink>
        </div>
      </div>
    );
  }

  const { analysis, elapsedSeconds } = result;
  const narrative = buildPracticeNarrative(analysis);

  return (
    <div className="container-reading py-12 sm:py-14">
      <p className="eyebrow">Hasil Latihan</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{pkg.title}</h1>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm text-slate-500">Skor</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tabular-nums text-ink-900">
                {analysis.score}
              </span>
              <span className="text-lg text-slate-500">/ 100</span>
            </p>
          </div>
          <ResultStatus status={analysis.status} className="px-3 py-1.5 text-sm" />
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-200 pt-6 sm:grid-cols-4">
          <div>
            <dt className="text-sm text-slate-500">Benar</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums text-ink-900">
              {analysis.correctCount}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Salah</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums text-ink-900">
              {analysis.wrongCount}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Tidak dijawab</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums text-ink-900">
              {analysis.unansweredCount}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Waktu</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums text-ink-900">
              {formatDuration(elapsedSeconds)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Satu narasi, bukan daftar rincian. */}
      <section className="mt-10">
        <div
          className={[
            "rounded-2xl border p-6 sm:p-7",
            narrative.isAllClear
              ? "border-emerald-200 bg-emerald-50"
              : "border-brand-200 bg-gradient-to-br from-brand-50 to-white",
          ].join(" ")}
        >
          <p className="eyebrow">Langkah berikutnya</p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
            {narrative.headline}
          </h2>
          <p className="mt-3 text-[15px] leading-[1.75] text-slate-700">{narrative.body}</p>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/latihan/${pkg.slug}/pembahasan`} size="lg">
          Lihat Pembahasan
        </ButtonLink>
        <Button variant="secondary" size="lg" loading={isPending} onClick={handleRepeat}>
          Ulangi Latihan
        </Button>
      </div>
    </div>
  );
}
