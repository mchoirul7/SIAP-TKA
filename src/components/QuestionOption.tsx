"use client";

import { Icon } from "@/components/ui/Icon";
import { RichText } from "@/components/RichText";

export type OptionState = "default" | "correct" | "chosen-wrong" | "muted";

const stateStyles: Record<OptionState, string> = {
  default:
    "border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/60 has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50 has-[:checked]:ring-1 has-[:checked]:ring-brand-700",
  correct: "border-emerald-300 bg-emerald-50",
  "chosen-wrong": "border-rose-300 bg-rose-50",
  muted: "border-slate-200 bg-white",
};

const keyStyles: Record<OptionState, string> = {
  default:
    "border-slate-300 text-slate-600 peer-checked:border-brand-700 peer-checked:bg-brand-800 peer-checked:text-white",
  correct: "border-emerald-500 bg-emerald-600 text-white",
  "chosen-wrong": "border-rose-500 bg-rose-600 text-white",
  muted: "border-slate-300 text-slate-500",
};

/**
 * Soal berjawaban ganda memakai kotak centang, bukan huruf A/B/C/D, supaya
 * langsung terbaca bahwa pilihannya boleh lebih dari satu.
 * Kotak terisi bila dipilih; warnanya mengikuti status pada halaman pembahasan.
 */
const checkboxStyles: Record<OptionState, { on: string; off: string }> = {
  default: {
    on: "border-brand-600 bg-brand-600 text-white",
    off: "border-slate-300 bg-white group-hover:border-brand-400",
  },
  correct: { on: "border-emerald-600 bg-emerald-600 text-white", off: "border-emerald-500 bg-white" },
  "chosen-wrong": { on: "border-rose-600 bg-rose-600 text-white", off: "border-rose-300 bg-white" },
  muted: { on: "border-slate-400 bg-slate-400 text-white", off: "border-slate-300 bg-white" },
};

/**
 * Bentuk penanda pilihan pada tampilan `plain`: lingkaran radio polos tanpa
 * huruf, seperti lembar ujian ANBK. Warna tetap mengikuti status agar bisa
 * dipakai ulang di luar layar ujian.
 */
const radioStyles: Record<OptionState, { on: string; off: string }> = {
  default: {
    on: "border-[6px] border-[#1877d2]",
    off: "border-2 border-slate-400 bg-white group-hover:border-slate-500",
  },
  correct: { on: "border-[6px] border-emerald-600", off: "border-2 border-emerald-500 bg-white" },
  "chosen-wrong": { on: "border-[6px] border-rose-600", off: "border-2 border-rose-300 bg-white" },
  muted: { on: "border-[6px] border-slate-400", off: "border-2 border-slate-300 bg-white" },
};

export function QuestionOption({
  name,
  optionKey,
  text,
  checked,
  onSelect,
  disabled = false,
  state = "default",
  note,
  inputType = "radio",
  isHtml = false,
  variant = "card",
}: {
  name: string;
  optionKey: string;
  text: string;
  /** Isi pilihan berupa HTML terbatas (soal hasil impor). */
  isHtml?: boolean;
  checked: boolean;
  onSelect?: (optionKey: string) => void;
  disabled?: boolean;
  state?: OptionState;
  note?: string;
  /** `checkbox` dipakai soal berjawaban ganda, agar pilihan dapat dinyalakan lebih dari satu. */
  inputType?: "radio" | "checkbox";
  /**
   * `card` memberi kotak berbingkai dengan huruf pilihan — dipakai pembahasan.
   * `plain` hanya menampilkan lingkaran pilihan, mengikuti tampilan ujian ANBK.
   */
  variant?: "card" | "plain";
}) {
  const isPlain = variant === "plain";

  return (
    <label
      className={[
        "group flex cursor-pointer items-start gap-3 transition-colors",
        isPlain
          ? "rounded-lg px-1 py-2 hover:bg-slate-50"
          : ["rounded-lg border p-3.5 sm:p-4", stateStyles[state]].join(" "),
        disabled ? "cursor-default" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type={inputType}
        name={name}
        value={optionKey}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect?.(optionKey)}
        className="peer sr-only"
      />
      {inputType === "checkbox" ? (
        <span
          aria-hidden="true"
          className={[
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
            checked ? checkboxStyles[state].on : checkboxStyles[state].off,
          ].join(" ")}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path
              d="M4.5 10.5l3.5 3.5 7.5-8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={checked ? "opacity-100" : "opacity-0"}
            />
          </svg>
        </span>
      ) : isPlain ? (
        <span
          aria-hidden="true"
          className={[
            "mt-1 h-5 w-5 shrink-0 rounded-full transition-colors",
            checked ? radioStyles[state].on : radioStyles[state].off,
          ].join(" ")}
        />
      ) : (
        <span
          aria-hidden="true"
          className={[
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-sm font-semibold transition-colors",
            keyStyles[state],
          ].join(" ")}
        >
          {optionKey}
        </span>
      )}
      <span className="min-w-0 flex-1">
        {isHtml ? (
          <RichText
            as="span"
            html={text}
            className="option-text block text-[15.5px] leading-relaxed text-slate-800 sm:text-base"
          />
        ) : (
          <span className="option-text block text-[15.5px] leading-relaxed text-slate-800 sm:text-base">
            {text}
          </span>
        )}
        {note ? (
          <span
            className={[
              "mt-1 block text-sm font-medium",
              state === "correct"
                ? "text-emerald-700"
                : state === "chosen-wrong"
                  ? "text-rose-700"
                  : "text-slate-600",
            ].join(" ")}
          >
            {note}
          </span>
        ) : null}
      </span>

      {/* Penanda hasil di ujung baris: warna saja tidak cukup, bentuknya ikut membedakan. */}
      {state === "correct" || state === "chosen-wrong" ? (
        <Icon
          name={state === "correct" ? "check" : "close"}
          className={[
            "mt-0.5 h-5 w-5 shrink-0",
            state === "correct" ? "text-emerald-600" : "text-rose-600",
          ].join(" ")}
          strokeWidth={2.4}
        />
      ) : null}
    </label>
  );
}
