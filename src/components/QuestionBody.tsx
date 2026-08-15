"use client";

import { QuestionOption } from "@/components/QuestionOption";
import { RichText } from "@/components/RichText";
import type { AnswerValue, Question } from "@/data/types";
import {
  categoryAssignments,
  instructionFor,
  questionTypeLabel,
  selectedKeys,
  setCategoryAssignment,
  toggleMcmaKey,
} from "@/lib/answers";

/**
 * Bagian isian sebuah soal, untuk ketiga bentuk yang didukung.
 * Dipakai bersama oleh layar ujian dan layar latihan supaya keduanya
 * berperilaku sama persis.
 */
export function QuestionBody({
  question,
  answer,
  onChange,
  namePrefix,
}: {
  question: Question;
  answer: AnswerValue | undefined;
  onChange: (answer: AnswerValue) => void;
  namePrefix: string;
}) {
  const chosen = selectedKeys(answer);
  const isHtml = question.contentFormat === "html";

  return (
    <fieldset className="mt-5">
      <legend className="question-text max-w-prose">
        {isHtml ? <RichText html={question.questionText} /> : question.questionText}
      </legend>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {questionTypeLabel[question.type]}
        </span>
        <span>{instructionFor(question)}</span>
      </p>

      {question.type === "category" ? (
        <CategoryInput
          question={question}
          assignments={categoryAssignments(answer)}
          onAssign={(statementId, categoryKey) =>
            onChange(setCategoryAssignment(answer, statementId, categoryKey))
          }
          namePrefix={namePrefix}
        />
      ) : (
        <div className="mt-5 space-y-2.5">
          {question.options.map((option) => (
            <QuestionOption
              key={option.key}
              name={`${namePrefix}-${question.id}`}
              optionKey={option.key}
              text={option.text}
              isHtml={isHtml}
              checked={chosen.includes(option.key)}
              inputType={question.type === "mcma" ? "checkbox" : "radio"}
              onSelect={(key) =>
                onChange(
                  question.type === "mcma"
                    ? toggleMcmaKey(answer, key)
                    : { type: "single", key },
                )
              }
            />
          ))}
        </div>
      )}
    </fieldset>
  );
}

/**
 * Soal kategori: setiap pernyataan dipasangkan ke satu kolom kategori.
 * Di layar sempit kolom berubah menjadi tombol yang ditumpuk di bawah pernyataan.
 */
function CategoryInput({
  question,
  assignments,
  onAssign,
  namePrefix,
}: {
  question: Extract<Question, { type: "category" }>;
  assignments: Record<string, string>;
  onAssign: (statementId: string, categoryKey: string) => void;
  namePrefix: string;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
      {/* Kepala kolom hanya relevan pada tata letak lebar. */}
      <div className="hidden bg-slate-50 sm:flex">
        <div className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Pernyataan
        </div>
        {question.categories.map((category) => (
          <div
            key={category.key}
            className="w-28 shrink-0 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
          >
            {category.label}
          </div>
        ))}
      </div>

      <ul className="divide-y divide-slate-200">
        {question.statements.map((statement, index) => (
          <li key={statement.id} className="bg-white sm:flex sm:items-center">
            <div className="flex-1 px-4 py-3.5 text-[15.5px] leading-relaxed text-slate-800">
              <span className="mr-1.5 tabular-nums text-slate-400">{index + 1}.</span>
              {question.contentFormat === "html" ? (
                <RichText as="span" html={statement.text} className="inline" />
              ) : (
                statement.text
              )}
            </div>

            <div className="flex gap-2 px-4 pb-3.5 sm:contents sm:px-0 sm:pb-0">
              {question.categories.map((category) => {
                const isChosen = assignments[statement.id] === category.key;
                return (
                  <label
                    key={category.key}
                    className={[
                      "flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                      "sm:w-28 sm:flex-none sm:shrink-0 sm:rounded-none sm:border-0 sm:border-l sm:border-slate-200 sm:py-4",
                      isChosen
                        ? "border-brand-600 bg-brand-50 text-brand-800 sm:bg-brand-50"
                        : "border-slate-300 text-slate-600 hover:border-brand-400 hover:bg-brand-50/50",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name={`${namePrefix}-${question.id}-${statement.id}`}
                      value={category.key}
                      checked={isChosen}
                      onChange={() => onAssign(statement.id, category.key)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={[
                        "mr-2 h-4 w-4 shrink-0 rounded-full border-[5px] transition-colors sm:mr-0",
                        isChosen ? "border-brand-600" : "border-slate-300",
                      ].join(" ")}
                    />
                    <span className="sm:sr-only">{category.label}</span>
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
