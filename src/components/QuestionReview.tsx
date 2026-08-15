"use client";

import { QuestionOption } from "@/components/QuestionOption";
import { RichText } from "@/components/RichText";
import type { AnswerValue, Question } from "@/data/types";
import { categoryAssignments, selectedKeys } from "@/lib/answers";

/**
 * Tampilan sebuah soal pada halaman pembahasan: jawaban yang benar
 * ditandai berdampingan dengan pilihan pengguna, untuk ketiga bentuk soal.
 */
export function QuestionReview({
  question,
  answer,
}: {
  question: Question;
  answer: AnswerValue | undefined;
}) {
  if (question.type === "category") {
    return <CategoryReview question={question} assignments={categoryAssignments(answer)} />;
  }

  const isHtml = question.contentFormat === "html";

  const chosen = selectedKeys(answer);
  const correctKeys =
    question.type === "mcma" ? question.correctAnswers : [question.correctAnswer];

  return (
    <div className="mt-5 space-y-2.5">
      {question.options.map((option) => {
        const isCorrectOption = correctKeys.includes(option.key);
        const isChosen = chosen.includes(option.key);
        const state = isCorrectOption ? "correct" : isChosen ? "chosen-wrong" : "muted";

        const note = isCorrectOption
          ? isChosen
            ? "Jawaban benar · pilihanmu"
            : chosen.length > 0
              ? "Jawaban benar · terlewat"
              : "Jawaban benar"
          : isChosen
            ? "Pilihanmu"
            : undefined;

        return (
          <QuestionOption
            key={option.key}
            name={`review-${question.id}`}
            optionKey={option.key}
            text={option.text}
            isHtml={isHtml}
            checked={isChosen}
            disabled
            inputType={question.type === "mcma" ? "checkbox" : "radio"}
            state={state}
            note={note}
          />
        );
      })}
    </div>
  );
}

function CategoryReview({
  question,
  assignments,
}: {
  question: Extract<Question, { type: "category" }>;
  assignments: Record<string, string>;
}) {
  const labelOf = (key: string | undefined) =>
    question.categories.find((category) => category.key === key)?.label;

  return (
    <ul className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
      {question.statements.map((statement, index) => {
        const chosen = assignments[statement.id];
        const isRight = chosen === statement.correctCategoryKey;

        return (
          <li
            key={statement.id}
            className={[
              "p-4",
              !chosen ? "bg-white" : isRight ? "bg-emerald-50" : "bg-rose-50",
            ].join(" ")}
          >
            <div className="text-[15.5px] leading-relaxed text-slate-800">
              <span className="mr-1.5 tabular-nums text-slate-400">{index + 1}.</span>
              {question.contentFormat === "html" ? (
                <RichText as="span" html={statement.text} className="inline" />
              ) : (
                statement.text
              )}
            </div>

            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-emerald-800">
                Jawaban benar: {labelOf(statement.correctCategoryKey)}
              </span>
              {chosen ? (
                <span className={isRight ? "text-emerald-700" : "text-rose-700"}>
                  Jawabanmu: {labelOf(chosen)}
                </span>
              ) : (
                <span className="text-slate-500">Belum dijawab</span>
              )}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
