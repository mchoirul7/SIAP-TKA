"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuestionBody } from "@/components/QuestionBody";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { useNavigate } from "@/components/NavigationProgress";
import type { AnswerValue, Question, Tryout } from "@/data/types";
import { isAnswered } from "@/lib/answers";
import { usePrefetchQuestionImages } from "@/hooks/usePrefetchQuestionImages";
import { formatClock } from "@/lib/format";
import {
  getAttempt,
  recordIntegrityEvent,
  saveAnswer,
  submitTryout,
  toggleMark,
} from "@/services/tryout-service";
import type { TryoutAttempt } from "@/storage/attempt-storage";
import { readProfile } from "@/storage/profile-storage";
import { RichText } from "@/components/RichText";

const LEAVE_MESSAGE =
  "Anda meninggalkan halaman ujian. Untuk hasil yang lebih akurat, kerjakan simulasi secara mandiri.";

export function ExamRunner({ tryout, questions }: { tryout: Tryout; questions: Question[] }) {
  const { navigate, isPending } = useNavigate();
  const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "redirecting">("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const hasSubmittedRef = useRef(false);

  const totalSeconds = tryout.durationMinutes * 60;

  usePrefetchQuestionImages(questions, currentIndex);

  // ------------------------------------------------------ memuat attempt
  useEffect(() => {
    const existing = getAttempt(tryout.slug);
    if (!existing) {
      setStatus("redirecting");
      navigate(`/tryout/${tryout.slug}`, { replace: true });
      return;
    }
    if (existing.submittedAt) {
      setStatus("redirecting");
      navigate(`/tryout/${tryout.slug}/hasil`, { replace: true });
      return;
    }
    setAttempt(existing);
    setStudentName(readProfile()?.name ?? "");
    setStatus("ready");
  }, [navigate, tryout.slug]);

  const finish = useCallback(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    submitTryout(tryout.slug);
    navigate(`/tryout/${tryout.slug}/hasil`, { replace: true });
  }, [navigate, tryout.slug]);

  // -------------------------------------------------------------- timer
  useEffect(() => {
    if (status !== "ready") return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  const elapsedSeconds = attempt ? Math.floor((now - attempt.startedAt) / 1000) : 0;
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

  useEffect(() => {
    if (status !== "ready" || !attempt) return;
    if (remainingSeconds <= 0) finish();
  }, [remainingSeconds, status, attempt, finish]);

  // ------------------------------------------------ integritas ringan
  useEffect(() => {
    if (status !== "ready") return;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordIntegrityEvent(tryout.slug, "tabSwitch");
      } else {
        setToastMessage(LEAVE_MESSAGE);
      }
    };
    const onBlur = () => recordIntegrityEvent(tryout.slug, "blur");
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordIntegrityEvent(tryout.slug, "fullscreenExit");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [status, tryout.slug]);

  // ------------------------------------------------------------ aksi
  const handleAnswer = (questionId: string, answer: AnswerValue) => {
    const next = saveAnswer(tryout.slug, questionId, answer);
    if (next) setAttempt(next);
  };

  const handleToggleMark = (questionId: string) => {
    const next = toggleMark(tryout.slug, questionId);
    if (next) setAttempt(next);
  };

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, index)));
    setIsNavigatorOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  };

  // --------------------------------------------------------- turunan
  const answers = attempt?.answers ?? {};
  const markedIds = useMemo(
    () => new Set(attempt?.markedQuestionIds ?? []),
    [attempt?.markedQuestionIds],
  );

  const navigatorItems = questions.map((item) => ({
    questionId: item.id,
    answered: isAnswered(item, answers[item.id]),
    marked: markedIds.has(item.id),
  }));

  const answeredCount = navigatorItems.filter((item) => item.answered).length;
  const markedCount = navigatorItems.filter((item) => item.marked).length;
  const question = questions[currentIndex];
  const isLowTime = remainingSeconds <= 300;

  if (status !== "ready" || !attempt || !question) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-slate-500">Menyiapkan simulasi…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar ujian: tanpa navigasi pemasaran apa pun */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4 sm:h-16 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-900 sm:text-[15px]">
              {tryout.title}
            </p>
            <p className="truncate text-xs text-slate-500">
              {studentName ? `${studentName} · ` : ""}
              Soal {currentIndex + 1} dari {questions.length} · {answeredCount} terjawab
            </p>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden h-9 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-brand-800 lg:inline-flex"
          >
            Layar penuh
          </button>

          <div
            className={[
              "flex h-9 items-center rounded-lg border px-3 text-[15px] font-semibold tabular-nums",
              isLowTime
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-slate-50 text-ink-900",
            ].join(" ")}
            role="timer"
            aria-live="off"
          >
            <Icon name="clock" className="mr-1.5 h-4 w-4" />
            <span className="sr-only">Sisa waktu </span>
            {formatClock(remainingSeconds)}
          </div>

          <Button size="sm" onClick={() => setIsSubmitOpen(true)} className="shrink-0">
            <Icon name="flag" className="h-4 w-4" />
            Selesai
          </Button>
        </div>

        <div className="h-1.5 w-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:gap-10">
        {/* Area soal */}
        <main className="min-w-0 flex-1">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <h1 className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-ink-900">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-extrabold tabular-nums text-white shadow-card"
                >
                  {currentIndex + 1}
                </span>
                Soal {currentIndex + 1}
              </h1>
              {markedIds.has(question.id) ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-200">
                  <Icon name="flag" className="h-4 w-4" strokeWidth={2.2} />
                  Ditandai ragu-ragu
                </span>
              ) : null}
            </div>

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
              namePrefix="question"
              onChange={(answer) => handleAnswer(question.id, answer)}
            />
          </article>

          {/* Kendali navigasi */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <Icon name="arrow-left" className="h-5 w-5" />
              Sebelumnya
            </Button>
            <Button
              variant={markedIds.has(question.id) ? "primary" : "secondary"}
              onClick={() => handleToggleMark(question.id)}
            >
              <Icon name="flag" className="h-5 w-5" />
              {markedIds.has(question.id) ? "Hapus Tanda Ragu" : "Tandai Ragu-ragu"}
            </Button>
            <div className="ml-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsNavigatorOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-[15px] font-semibold text-brand-800 lg:hidden"
              >
                <Icon name="list-check" className="h-5 w-5" />
                Daftar Soal
              </button>
              {currentIndex === questions.length - 1 ? (
                <Button onClick={() => setIsSubmitOpen(true)}>
                  <Icon name="flag" className="h-5 w-5" />
                  Selesai Ujian
                </Button>
              ) : (
                <Button onClick={() => goTo(currentIndex + 1)}>
                  Selanjutnya
                  <Icon name="arrow-right" className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Navigator desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
              <Icon name="list-check" className="h-4 w-4 text-brand-600" strokeWidth={2.2} />
              Daftar Soal
            </h2>
            <p className="mt-1 text-xs tabular-nums text-slate-500">
              {answeredCount} dijawab · {markedCount} ditandai
            </p>
            <div className="mt-4">
              <QuestionNavigator
                items={navigatorItems}
                currentIndex={currentIndex}
                onJump={goTo}
              />
            </div>
            <Button
              variant="secondary"
              className="mt-5 w-full"
              onClick={() => setIsSubmitOpen(true)}
            >
              <Icon name="flag" className="h-5 w-5" />
              Selesai Ujian
            </Button>
          </div>
        </aside>
      </div>

      {/* Navigator mobile */}
      {isNavigatorOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-950/40"
            onClick={() => setIsNavigatorOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Daftar soal"
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-xl border-t border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink-900">
                <Icon name="list-check" className="h-5 w-5 text-brand-600" strokeWidth={2.2} />
                Daftar Soal
              </h2>
              <button
                type="button"
                onClick={() => setIsNavigatorOpen(false)}
                className="rounded px-2 py-1 text-sm font-semibold text-brand-700"
              >
                Tutup
              </button>
            </div>
            <p className="mt-1 text-xs tabular-nums text-slate-500">
              {answeredCount} dijawab · {markedCount} ditandai
            </p>
            <div className="mt-4">
              <QuestionNavigator items={navigatorItems} currentIndex={currentIndex} onJump={goTo} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Konfirmasi selesai */}
      {isSubmitOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-brand-950/40"
            onClick={() => setIsSubmitOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-title"
            className="relative w-full max-w-md rounded-t-xl border border-slate-200 bg-white p-6 shadow-raised sm:rounded-xl"
          >
            <IconBadge name="flag" tone="brand" size="lg" />
            <h2 id="submit-title" className="mt-4 text-xl font-extrabold tracking-tight">
              Selesaikan Tryout?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              Setelah dikirim, jawaban tidak dapat diubah dan hasil langsung ditampilkan.
            </p>

            <dl className="mt-5 space-y-2 text-[15px]">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
                <dt className="flex items-center gap-2 text-slate-600">
                  <Icon name="list-check" className="h-4 w-4 text-slate-500" />
                  Jumlah soal
                </dt>
                <dd className="font-bold tabular-nums text-ink-900">{questions.length} soal</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2.5">
                <dt className="flex items-center gap-2 text-emerald-800">
                  <Icon name="check" className="h-4 w-4 text-emerald-600" strokeWidth={2.2} />
                  Sudah dijawab
                </dt>
                <dd className="font-bold tabular-nums text-emerald-800">{answeredCount} soal</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-rose-50 px-3.5 py-2.5">
                <dt className="flex items-center gap-2 text-rose-800">
                  <Icon name="minus" className="h-4 w-4 text-rose-600" strokeWidth={2.2} />
                  Belum dijawab
                </dt>
                <dd className="font-bold tabular-nums text-rose-800">
                  {questions.length - answeredCount} soal
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3.5 py-2.5">
                <dt className="flex items-center gap-2 text-amber-900">
                  <Icon name="flag" className="h-4 w-4 text-amber-600" strokeWidth={2.2} />
                  Ditandai ragu-ragu
                </dt>
                <dd className="font-bold tabular-nums text-amber-900">{markedCount} soal</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <Button className="sm:flex-1" loading={isPending} onClick={finish}>
                {isPending ? null : <Icon name="check" className="h-5 w-5" strokeWidth={2.2} />}
                Submit Tryout
              </Button>
              <Button variant="secondary" onClick={() => setIsSubmitOpen(false)}>
                <Icon name="arrow-left" className="h-5 w-5" />
                Kembali Mengerjakan
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
