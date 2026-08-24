"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedQuestionContent } from "@/components/ProtectedQuestionContent";
import { QuestionLabels } from "@/components/QuestionLabels";
import { QuestionReview } from "@/components/QuestionReview";
import { ButtonLink } from "@/components/ui/Button";
import type { QuestionLabel } from "@/lib/question-labels";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import type { AnswerMap, Misconception, PracticePackage, Question } from "@/data/types";
import {
  correctAnswerSummary,
  isAnswered,
  isCorrectAnswer,
  misconceptionIdsFor,
} from "@/lib/answers";
import { toneChip, type AccentTone } from "@/lib/tone";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getPracticeAttempt } from "@/services/practice-service";
import { RichText } from "@/components/RichText";

/** Tampilan tiap soal ditandai warna: hijau bila tepat, merah bila keliru, abu bila dilewati. */
const reviewTone: Record<"correct" | "wrong" | "skipped", {
  tone: AccentTone;
  icon: IconName;
  label: string;
  card: string;
}> = {
  correct: {
    tone: "emerald",
    icon: "check",
    label: "Jawaban kamu tepat",
    card: "border-emerald-200 bg-emerald-50/40",
  },
  wrong: {
    tone: "rose",
    icon: "close",
    label: "Jawaban kamu belum tepat",
    card: "border-rose-200 bg-rose-50/40",
  },
  skipped: {
    tone: "slate",
    icon: "minus",
    label: "Belum dijawab",
    card: "border-slate-200 bg-white",
  },
};

export function ExplanationView({
  pkg,
  questions,
  questionLabels,
  misconceptions = [],
}: {
  pkg: PracticePackage;
  questions: Question[];
  /** Penanda tiap soal. Baru disiapkan untuk paket Matematika. */
  questionLabels?: Record<string, QuestionLabel>;
  /** Katalog pola keliru, untuk menjelaskan pengecoh yang tadi dipilih. */
  misconceptions?: Misconception[];
}) {
  const misconceptionById = new Map(misconceptions.map((item) => [item.id, item]));
  const router = useRouter();
  const { mounted, isUnlocked } = useEntitlements();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (!isUnlocked(pkg)) {
      router.replace(`/latihan/${pkg.slug}`);
      return;
    }
    setAnswers(getPracticeAttempt(pkg.slug)?.answers ?? {});
    setReady(true);
  }, [mounted, isUnlocked, pkg, pkg.slug, router]);

  if (!ready) {
    return (
      <div className="container-reading py-16">
        <LoadingScreen message="Menyiapkan pembahasan…" />
      </div>
    );
  }

  const hasAnswers = Object.keys(answers).length > 0;

  return (
    <div className="container-reading py-10 sm:py-12">
      <Link
        href={`/latihan/${pkg.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-800"
      >
        <Icon name="arrow-left" className="h-4 w-4" />
        Kembali ke detail latihan
      </Link>

      <p className="eyebrow mt-5 flex items-center gap-1.5">
        <Icon name="book" className="h-4 w-4" />
        Pembahasan
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{pkg.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
        {hasAnswers
          ? "Jawabanmu ditandai berdampingan dengan jawaban yang benar, disertai langkah pengerjaannya."
          : "Latihan ini belum dikerjakan. Pembahasan tetap dapat dibaca sebagai bahan belajar."}
      </p>

      <ol className="mt-8 space-y-6">
        {questions.map((question, index) => {
          const userAnswer = answers[question.id];
          const answered = isAnswered(question, userAnswer);
          const isRight = isCorrectAnswer(question, userAnswer);
          const view = reviewTone[!answered ? "skipped" : isRight ? "correct" : "wrong"];
          const signals = misconceptionIdsFor(question, userAnswer).flatMap((id) => {
            const found = misconceptionById.get(id);
            return found ? [found] : [];
          });
          const uniqueSignals = signals.filter(
            (item, index) => signals.findIndex((other) => other.id === item.id) === index,
          );

          return (
            <li
              key={question.id}
              className={`rounded-3xl border p-5 shadow-card sm:p-6 ${view.card}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-ink-900">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold tabular-nums text-white shadow-card"
                  >
                    {index + 1}
                  </span>
                  Soal {index + 1}
                </p>
                <span className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${toneChip[view.tone]}`}
                  >
                    <Icon name={view.icon} className="h-4 w-4" strokeWidth={2.2} />
                    {view.label}
                  </span>
                </span>
              </div>

              <QuestionLabels label={questionLabels?.[question.id]} className="mt-3" />

              <ProtectedQuestionContent>
                {question.stimulus ? (
                  <div className="mt-4 rounded-2xl border border-aqua-200 bg-aqua-50/70 p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-aqua-700">
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

                {question.contentFormat === "html" ? (
                  <RichText html={question.questionText} className="question-text mt-4" />
                ) : (
                  <p className="question-text mt-4">{question.questionText}</p>
                )}

                <QuestionReview question={question} answer={userAnswer} />
              </ProtectedQuestionContent>

              <div className="mt-5 rounded-2xl border border-brand-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <IconBadge name="bulb" tone="violet" size="sm" />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-ink-900">
                      Pembahasan
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${toneChip.emerald}`}
                      >
                        <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.4} />
                        Kunci: {correctAnswerSummary(question)}
                      </span>
                    </p>
                    {/* Pembahasan hasil impor berbentuk HTML; dirender, bukan dicetak apa adanya. */}
                    {question.explanation ? (
                      question.contentFormat === "html" ? (
                        <RichText
                          html={question.explanation}
                          className="mt-2 text-[15px] leading-[1.75] text-slate-700"
                        />
                      ) : (
                        <p className="mt-2 text-[15px] leading-[1.75] text-slate-700">
                          {question.explanation}
                        </p>
                      )
                    ) : (
                      <p className="mt-2 text-[15px] leading-[1.75] text-slate-500">
                        Pembahasan untuk soal ini belum tersedia.
                      </p>
                    )}
                  </div>
                </div>

                {/* Pola keliru yang terbaca dari pengecoh yang tadi dipilih. */}
                {uniqueSignals.length > 0 ? (
                  <div className="mt-4 space-y-3 border-t border-brand-100 pt-4">
                    {uniqueSignals.map((signal) => (
                      <div key={signal.id} className="flex items-start gap-3">
                        <IconBadge name="alert" tone="amber" size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-800">
                            Pola yang terbaca dari jawabanmu
                          </p>
                          <p className="mt-1 text-[15px] font-semibold leading-relaxed text-ink-900">
                            {signal.label}
                          </p>
                          <p className="mt-1 text-[15px] leading-relaxed text-slate-700">
                            {signal.insight}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={`/latihan/${pkg.slug}/kerjakan`} size="lg">
          <Icon name="refresh" className="h-5 w-5" />
          Kerjakan Ulang
        </ButtonLink>
        <ButtonLink href={`/latihan/${pkg.slug}`} variant="secondary" size="lg">
          <Icon name="arrow-left" className="h-5 w-5" />
          Kembali ke Detail Latihan
        </ButtonLink>
      </div>
    </div>
  );
}
