"use client";

import { useEffect, useState } from "react";
import { ConceptFocusList } from "@/components/ConceptFocusList";
import { PracticePackageCard } from "@/components/PracticePackageCard";
import { QuestionLabels } from "@/components/QuestionLabels";
import { isAnswered, isCorrectAnswer } from "@/lib/answers";
import type { QuestionLabel } from "@/lib/question-labels";
import { ResultStatus } from "@/components/ResultStatus";
import { ScoreRing } from "@/components/ScoreRing";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatCard } from "@/components/ui/StatCard";
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
  questionLabels,
}: {
  tryout: Tryout;
  questions: Question[];
  catalog: AnalysisCatalog;
  /** Penanda tiap soal. Baru disiapkan untuk simulasi Matematika. */
  questionLabels?: Record<string, QuestionLabel>;
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
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Icon name="hourglass" className="h-4 w-4" />
          Menyiapkan hasil…
        </p>
      </div>
    );
  }

  if (state === "empty" || !result) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-lg text-center">
          <IconBadge name="flag" tone="brand" size="lg" className="mx-auto" />
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight">Belum ada hasil simulasi</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            Hasil akan muncul di halaman ini setelah simulasi dikerjakan dan dikirim. Hasil
            tersimpan di perangkat ini.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={`/tryout/${tryout.slug}`} size="lg">
              <Icon name="play" className="h-5 w-5" />
              Mulai Simulasi
            </ButtonLink>
            <ButtonLink href="/latihan" variant="secondary" size="lg">
              <Icon name="layers" className="h-5 w-5" />
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
  const total = questions.length || 1;
  const accuracy = Math.round((analysis.correctCount / total) * 100);

  return (
    <div className="container-page py-10 sm:py-12">
      <header>
        <p className="eyebrow flex items-center gap-1.5">
          <Icon name="medal" className="h-4 w-4" />
          Hasil Simulasi TKA
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{tryout.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-slate-600">
          {studentName ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="cap" className="h-4 w-4 text-brand-600" />
              {studentName}
            </span>
          ) : null}
          {attempt.submittedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" className="h-4 w-4 text-brand-600" />
              {formatDate(attempt.submittedAt)}
            </span>
          ) : null}
        </p>
      </header>

      {/* Kartu skor: warna gelap agar jelas berbeda dari kartu hasil latihan. */}
      <section className="relative isolate mt-7 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-700 via-ink-900 to-brand-900 p-6 shadow-float sm:p-8">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-white/10"
          viewBox="0 0 400 96"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0 46c60-34 120 26 200 8s140-44 200-14v56H0z" />
        </svg>

        <div className="relative z-10 flex flex-wrap items-center gap-6 sm:gap-8">
          <ScoreRing value={analysis.score} />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
              Skor simulasi
            </p>
            <p className="mt-1 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {analysis.score >= 80
                ? "Hasil yang keren! 🏆"
                : analysis.score >= 60
                  ? "Sudah di jalur yang tepat 💪"
                  : "Masih banyak yang bisa dikejar 🚀"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {analysis.correctCount} dari {questions.length} soal dijawab benar — ketepatan{" "}
              {accuracy}%.
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

      {leftPageCount > 0 ? (
        <p className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <span>
            Halaman ujian tercatat ditinggalkan {leftPageCount} kali. Hasil tetap dihitung penuh;
            catatan ini hanya membantu menilai seberapa mandiri simulasi dikerjakan.
          </span>
        </p>
      ) : null}

      {/* Satu narasi: materi apa yang harus dipelajari lebih dulu. */}
      <section className="mt-8">
        <div
          className={[
            "rounded-3xl border p-6 shadow-card sm:p-8",
            narrative.isAllClear
              ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
              : "border-violet-200 bg-gradient-to-br from-violet-50 to-white",
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
                  narrative.isAllClear ? "text-emerald-700" : "text-violet-700"
                }`}
              >
                Yang perlu dipelajari lebih dulu
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                {narrative.headline}
              </h2>
              <p className="mt-2.5 max-w-2xl text-[15px] leading-[1.75] text-slate-700">
                {narrative.body}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rincian: konsep apa yang perlu dipelajari, lengkap dengan pola kelirunya. */}
      {analysis.conceptFocus.length > 0 ? (
        <section className="mt-12">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="book" tone="sky" size="md" />
            Yang perlu kamu pelajari
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Diurutkan dari yang paling sedikit benar. Mulai dari nomor satu, ya.
          </p>
          <ConceptFocusList concepts={analysis.conceptFocus} />
        </section>
      ) : null}

      {/* Rincian per soal: penanda soal ditampilkan apa adanya agar pola kelemahan terbaca. */}
      {questionLabels ? (
        <section className="mt-12">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="list-check" tone="violet" size="md" />
            Rincian tiap soal
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Penanda tiap soal ditampilkan agar terlihat pola kelemahannya — bukan hanya soal mana
            yang keliru, tetapi soal seperti apa.
          </p>

          <ol className="mt-5 space-y-3">
            {questions.map((question, index) => {
              const userAnswer = attempt.answers[question.id];
              const answered = isAnswered(question, userAnswer);
              const correct = isCorrectAnswer(question, userAnswer);
              const mark = !answered
                ? { icon: "minus" as const, tone: "bg-slate-100 text-slate-600", text: "Kosong" }
                : correct
                  ? { icon: "check" as const, tone: "bg-emerald-100 text-emerald-800", text: "Benar" }
                  : { icon: "close" as const, tone: "bg-rose-100 text-rose-800", text: "Salah" };

              return (
                <li
                  key={question.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold tabular-nums text-slate-700"
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${mark.tone}`}
                    >
                      <Icon name={mark.icon} className="h-4 w-4" strokeWidth={2.2} />
                      {mark.text}
                    </span>
                  </div>
                  <QuestionLabels
                    label={questionLabels[question.id]}
                    className="mt-3"
                    showCompetency={false}
                  />
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {recommendedPackages.length > 0 ? (
        <section className="mt-12">
          <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
            <IconBadge name="target" tone="brand" size="md" />
            Paket yang perlu dicoba
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            Paket ini melatih materi yang tadi paling sering keliru. Kerjakan dari yang paling atas.
          </p>
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
      <section className="mt-14 rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-card sm:p-8">
        <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
          <IconBadge name="bolt" tone="brand" size="sm" />
          Langkah berikutnya
        </h2>
        <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-slate-600">
          Hasil ini tersimpan di perangkat ini dan dapat dibuka lagi lewat tautan yang sama.
          Simulasi boleh diulang kapan saja untuk melihat perubahan setelah latihan.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/latihan">
            <Icon name="layers" className="h-5 w-5" />
            Lihat Paket Latihan
          </ButtonLink>
          <ButtonLink href={`/tryout/${tryout.slug}`} variant="secondary">
            <Icon name="refresh" className="h-5 w-5" />
            Ulangi Simulasi
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
