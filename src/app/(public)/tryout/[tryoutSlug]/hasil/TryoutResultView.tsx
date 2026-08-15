"use client";

import { useEffect, useState } from "react";
import { PracticePackageCard } from "@/components/PracticePackageCard";
import { ResultStatus } from "@/components/ResultStatus";
import { ButtonLink } from "@/components/ui/Button";
import type { Question, Tryout } from "@/data/types";
import { formatDate, formatDuration } from "@/lib/format";
import { buildTryoutNarrative } from "@/lib/narrative";
import type { AnalysisCatalog } from "@/lib/scoring";
import { getTryoutResult, type TryoutResult } from "@/services/tryout-service";
import { readProfile } from "@/storage/profile-storage";

export function TryoutResultView({
  tryout,
  questions,
  catalog,
}: {
  tryout: Tryout;
  questions: Question[];
  catalog: AnalysisCatalog;
}) {
  const [state, setState] = useState<"loading" | "empty" | "ready">("loading");
  const [result, setResult] = useState<TryoutResult | null>(null);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const stored = getTryoutResult(tryout, questions, catalog);
    if (!stored) {
      setState("empty");
      return;
    }
    setResult(stored);
    setStudentName(readProfile()?.name ?? "");
    setState("ready");
  }, [tryout, questions, catalog]);

  if (state === "loading") {
    return (
      <div className="container-page py-20">
        <p className="text-sm text-slate-500">Menyiapkan hasil…</p>
      </div>
    );
  }

  if (state === "empty" || !result) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Belum ada hasil simulasi</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            Hasil akan muncul di halaman ini setelah simulasi dikerjakan dan dikirim. Hasil
            tersimpan di perangkat ini.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={`/tryout/${tryout.slug}`} size="lg">
              Mulai Simulasi
            </ButtonLink>
            <ButtonLink href="/latihan" variant="secondary" size="lg">
              Lihat Paket Latihan
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const { analysis, attempt, elapsedSeconds } = result;
  const leftPageCount = attempt.integrity.tabSwitchCount;
  const recommendedPackages = analysis.recommendedPackageSlugs.flatMap((slug) => {
    const pkg = catalog.practicePackages?.find((item) => item.slug === slug);
    return pkg ? [pkg] : [];
  });
  const narrative = buildTryoutNarrative(analysis, {
    hasRecommendedPackages: recommendedPackages.length > 0,
  });

  return (
    <div className="container-page py-12 sm:py-14">
      {/* Ringkasan utama */}
      <header>
        <p className="eyebrow">Hasil Simulasi TKA</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{tryout.title}</h1>
        <p className="mt-2 text-[15px] text-slate-600">
          {studentName ? `${studentName} · ` : ""}
          {attempt.submittedAt ? formatDate(attempt.submittedAt) : ""}
        </p>
      </header>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm text-slate-500">Skor</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tabular-nums text-ink-900 sm:text-6xl">
                {analysis.score}
              </span>
              <span className="text-lg text-slate-500">/ 100</span>
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-sm text-slate-500">Status keseluruhan</span>
            <ResultStatus status={analysis.status} className="px-3 py-1.5 text-sm" />
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-200 pt-6 sm:grid-cols-4">
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
            <dt className="text-sm text-slate-500">Waktu pengerjaan</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular-nums text-ink-900">
              {formatDuration(elapsedSeconds)}
            </dd>
          </div>
        </dl>

        {leftPageCount > 0 ? (
          <p className="mt-6 border-t border-slate-200 pt-5 text-sm leading-relaxed text-slate-500">
            Catatan: halaman ujian tercatat ditinggalkan {leftPageCount} kali. Hasil tetap dihitung
            penuh; catatan ini hanya membantu menilai seberapa mandiri simulasi dikerjakan.
          </p>
        ) : null}
      </section>

      {/* Satu narasi: materi apa yang harus dipelajari lebih dulu. */}
      <section className="mt-12">
        <div
          className={[
            "rounded-2xl border p-6 sm:p-8",
            narrative.isAllClear
              ? "border-emerald-200 bg-emerald-50"
              : "border-brand-200 bg-gradient-to-br from-brand-50 to-white",
          ].join(" ")}
        >
          <p className="eyebrow">Yang perlu dipelajari lebih dulu</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            {narrative.headline}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.75] text-slate-700">
            {narrative.body}
          </p>
        </div>
      </section>

      {recommendedPackages.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Latihan yang disarankan</h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedPackages.map((pkg, index) => (
              <li key={pkg.id}>
                <PracticePackageCard
                  pkg={pkg}
                  order={index + 1}
                  toneIndex={index}
                  note="Disarankan dari materi yang paling perlu diperkuat pada hasil simulasi ini."
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}


      {/* Langkah berikutnya */}
      <section className="mt-14 rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Langkah berikutnya</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
          Hasil ini tersimpan di perangkat ini dan dapat dibuka lagi lewat tautan yang sama.
          Simulasi boleh diulang kapan saja untuk melihat perubahan setelah latihan.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/latihan">Lihat Paket Latihan</ButtonLink>
          <ButtonLink href={`/tryout/${tryout.slug}`} variant="secondary">
            Ulangi Simulasi
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
