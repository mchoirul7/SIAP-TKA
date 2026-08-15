"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { QuestionBody } from "@/components/QuestionBody";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { AnswerMap, AnswerValue, PracticePackage, Question } from "@/data/types";
import { isAnswered } from "@/lib/answers";
import { useEntitlements } from "@/hooks/useEntitlements";
import { RichText } from "@/components/RichText";
import {
  finishPractice,
  getPracticeAttempt,
  savePracticeAnswer,
  startPracticeAttempt,
} from "@/services/practice-service";

export function PracticeRunner({
  pkg,
  questions,
}: {
  pkg: PracticePackage;
  questions: Question[];
}) {
  const router = useRouter();
  const { mounted, isUnlocked } = useEntitlements();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (!isUnlocked(pkg)) {
      router.replace(`/latihan/${pkg.slug}`);
      return;
    }
    let attempt = getPracticeAttempt(pkg.slug);
    if (!attempt || attempt.finishedAt) {
      attempt = startPracticeAttempt(pkg.slug);
    }
    setAnswers(attempt?.answers ?? {});
    setReady(true);
  }, [mounted, isUnlocked, pkg, pkg.slug, router]);

  const question = questions[currentIndex];
  const answeredCount = questions.filter((item) => isAnswered(item, answers[item.id])).length;

  const handleAnswer = (answer: AnswerValue) => {
    if (!question) return;
    const next = savePracticeAnswer(pkg.slug, question.id, answer);
    setAnswers(next?.answers ?? { ...answers, [question.id]: answer });
  };

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, index)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    finishPractice(pkg.slug);
    router.push(`/latihan/${pkg.slug}/hasil`);
  };

  if (!ready || !question) {
    return (
      <div className="container-page py-20">
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Icon name="hourglass" className="h-4 w-4" />
          Menyiapkan latihan…
        </p>
      </div>
    );
  }

  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="container-reading py-10 sm:py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-1.5">
            <Icon name="pencil" className="h-4 w-4" />
            Latihan
          </p>
          <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight sm:text-2xl">
            {pkg.title}
          </h1>
        </div>
        <Link
          href={`/latihan/${pkg.slug}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm text-slate-500 hover:text-brand-800"
        >
          <Icon name="close" className="h-4 w-4" />
          Keluar
        </Link>
      </div>

      {/* Bilah kemajuan: dibuat berwarna agar sisa soal terlihat sekilas. */}
      <div className="mt-5 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 font-bold tabular-nums text-brand-800">
            <Icon name="flag" className="h-4 w-4" />
            Soal {currentIndex + 1} dari {questions.length}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
            <Icon name="check" className="h-4 w-4" strokeWidth={2.2} />
            {answeredCount} terjawab
          </span>
        </div>
        <ProgressBar
          className="mt-3"
          barClassName="bg-gradient-to-r from-brand-400 to-brand-600"
          value={((currentIndex + 1) / questions.length) * 100}
          label="Kemajuan latihan"
        />
      </div>

      <article className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
        <p className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-ink-900">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold tabular-nums text-white shadow-card"
          >
            {currentIndex + 1}
          </span>
          Soal {currentIndex + 1}
        </p>

        {question.stimulus ? (
          <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-sky-700">
              <Icon name="note" className="h-4 w-4" />
              Bacaan
            </p>
            {question.contentFormat === "html" ? (
              <RichText html={question.stimulus} className="stimulus-text" />
            ) : (
              <p className="stimulus-text">{question.stimulus}</p>
            )}
          </div>
        ) : null}

        <QuestionBody
          question={question}
          answer={answers[question.id]}
          namePrefix="practice"
          onChange={handleAnswer}
        />
      </article>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <Button
          variant="secondary"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Icon name="arrow-left" className="h-5 w-5" />
          Sebelumnya
        </Button>
        <div className="ml-auto">
          {isLast ? (
            <Button onClick={handleFinish}>
              <Icon name="flag" className="h-5 w-5" />
              Selesai Latihan
            </Button>
          ) : (
            <Button onClick={() => goTo(currentIndex + 1)}>
              Selanjutnya
              <Icon name="arrow-right" className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      <p className="mt-6 flex items-start gap-2.5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed text-sky-900">
        <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
        <span>
          Latihan tidak dibatasi waktu. Jawaban tersimpan otomatis, jadi latihan boleh dilanjutkan
          lain waktu.
        </span>
      </p>
    </div>
  );
}
