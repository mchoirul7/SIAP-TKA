"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuestionReview } from "@/components/QuestionReview";
import { ButtonLink } from "@/components/ui/Button";
import type { AnswerMap, PracticePackage, Question } from "@/data/types";
import { correctAnswerSummary, isAnswered, isCorrectAnswer } from "@/lib/answers";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getPracticeAttempt } from "@/services/practice-service";
import { RichText } from "@/components/RichText";

export function ExplanationView({
  pkg,
  questions,
}: {
  pkg: PracticePackage;
  questions: Question[];
}) {
  const router = useRouter();
  const { mounted, isUnlocked } = useEntitlements();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (!isUnlocked(pkg.slug, pkg.isPremium)) {
      router.replace(`/latihan/${pkg.slug}`);
      return;
    }
    setAnswers(getPracticeAttempt(pkg.slug)?.answers ?? {});
    setReady(true);
  }, [mounted, isUnlocked, pkg.slug, pkg.isPremium, router]);

  if (!ready) {
    return (
      <div className="container-reading py-20">
        <p className="text-sm text-slate-500">Menyiapkan pembahasan…</p>
      </div>
    );
  }

  const hasAnswers = Object.keys(answers).length > 0;

  return (
    <div className="container-reading py-12 sm:py-14">
      <Link href={`/latihan/${pkg.slug}`} className="text-sm text-slate-500 hover:text-brand-800">
        ← Kembali ke paket
      </Link>

      <p className="eyebrow mt-5">Pembahasan</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{pkg.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
        {hasAnswers
          ? "Jawabanmu ditandai berdampingan dengan jawaban yang benar, disertai langkah pengerjaannya."
          : "Latihan ini belum dikerjakan. Pembahasan tetap dapat dibaca sebagai bahan belajar."}
      </p>

      <ol className="mt-10 space-y-10">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const answered = isAnswered(question, userAnswer);
          const isRight = isCorrectAnswer(question, userAnswer);

          return (
            <li key={question.id} className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Soal {index + 1}
                </p>
                {answered ? (
                  <span
                    className={[
                      "inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold",
                      isRight
                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
                        : "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200",
                    ].join(" ")}
                  >
                    {isRight ? "Jawaban kamu tepat" : "Jawaban kamu belum tepat"}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Belum dijawab
                  </span>
                )}
              </div>

              {question.stimulus ? (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                  {question.contentFormat === "html" ? (
                    <RichText html={question.stimulus} className="stimulus-text" />
                  ) : (
                    <p className="stimulus-text">{question.stimulus}</p>
                  )}
                </div>
              ) : null}

              {question.contentFormat === "html" ? (
                <RichText html={question.questionText} className="question-text mt-4" />
              ) : (
                <p className="question-text mt-4">{question.questionText}</p>
              )}

              <QuestionReview question={question} answer={userAnswer} />

              <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-ink-900">
                  Pembahasan
                  <span className="ml-2 font-normal text-slate-500">
                    Kunci: {correctAnswerSummary(question)}
                  </span>
                </p>
                <p className="mt-2 text-[15px] leading-[1.75] text-slate-700">
                  {question.explanation ?? "Pembahasan untuk soal ini belum tersedia."}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/latihan/${pkg.slug}/kerjakan`} size="lg">
          Kerjakan Ulang
        </ButtonLink>
        <ButtonLink href="/latihan" variant="secondary" size="lg">
          Paket Latihan Lain
        </ButtonLink>
      </div>
    </div>
  );
}
