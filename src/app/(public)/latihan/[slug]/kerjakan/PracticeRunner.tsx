"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { QuestionBody } from "@/components/QuestionBody";
import { Button } from "@/components/ui/Button";
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
    if (!isUnlocked(pkg.slug, pkg.isPremium)) {
      router.replace(`/latihan/${pkg.slug}`);
      return;
    }
    let attempt = getPracticeAttempt(pkg.slug);
    if (!attempt || attempt.finishedAt) {
      attempt = startPracticeAttempt(pkg.slug);
    }
    setAnswers(attempt?.answers ?? {});
    setReady(true);
  }, [mounted, isUnlocked, pkg.slug, pkg.isPremium, router]);

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
        <p className="text-sm text-slate-500">Menyiapkan latihan…</p>
      </div>
    );
  }

  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="container-reading py-10 sm:py-12">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Latihan</p>
          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {pkg.title}
          </h1>
        </div>
        <Link href={`/latihan/${pkg.slug}`} className="shrink-0 text-sm text-slate-500 hover:text-brand-800">
          Keluar
        </Link>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-sm text-slate-600">
          <span className="tabular-nums">
            Soal {currentIndex + 1} dari {questions.length}
          </span>
          <span className="tabular-nums">{answeredCount} terjawab</span>
        </div>
        <ProgressBar
          className="mt-2"
          value={((currentIndex + 1) / questions.length) * 100}
          label="Kemajuan latihan"
        />
      </div>

      <article className="mt-7 rounded-lg border border-slate-200 bg-white p-5 sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
          Soal {currentIndex + 1}
        </p>

        {question.stimulus ? (
          <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
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
          Sebelumnya
        </Button>
        <div className="ml-auto">
          {isLast ? (
            <Button onClick={handleFinish}>Selesai Latihan</Button>
          ) : (
            <Button onClick={() => goTo(currentIndex + 1)}>Selanjutnya</Button>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-slate-500">
        Latihan tidak dibatasi waktu. Jawaban tersimpan otomatis, jadi latihan boleh dilanjutkan
        lain waktu.
      </p>
    </div>
  );
}
