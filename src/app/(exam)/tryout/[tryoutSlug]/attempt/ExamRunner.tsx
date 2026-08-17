"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ExamCardHead,
  ExamDialog,
  ExamDialogAction,
  ExamInfoRow,
  ExamNavBar,
  ExamQuestionPanel,
  ExamShell,
  ExamStatusPill,
  type ExamFontSize,
} from "@/components/exam/ExamChrome";
import { LoadingScreen } from "@/components/LoadingScreen";
import { QuestionBody } from "@/components/QuestionBody";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import { Toast } from "@/components/Toast";
import { Icon } from "@/components/ui/Icon";
import { useNavigate } from "@/components/NavigationProgress";
import type { AnswerValue, Question, Tryout } from "@/data/types";
import { isAnswered } from "@/lib/answers";
import { useEntitlements } from "@/hooks/useEntitlements";
import { usePrefetchQuestionImages } from "@/hooks/usePrefetchQuestionImages";
import { formatExamClock } from "@/lib/format";
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

export function ExamRunner({
  tryout,
  questions,
  subjectName,
}: {
  tryout: Tryout;
  questions: Question[];
  subjectName: string;
}) {
  const { navigate, isPending } = useNavigate();
  const { mounted, isUnlocked } = useEntitlements();
  const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "redirecting">("loading");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [fontSize, setFontSize] = useState<ExamFontSize>("sedang");
  const [studentName, setStudentName] = useState("");
  const hasSubmittedRef = useRef(false);

  const totalSeconds = tryout.durationMinutes * 60;

  usePrefetchQuestionImages(questions, currentIndex);

  // ------------------------------------------------------ memuat attempt
  useEffect(() => {
    if (!mounted) return;
    if (!isUnlocked(tryout)) {
      setStatus("redirecting");
      navigate(`/tryout/${tryout.slug}`, { replace: true });
      return;
    }
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
  }, [mounted, isUnlocked, navigate, tryout, tryout.slug]);

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

  // Esc menutup jendela yang sedang terbuka, dimulai dari yang paling atas.
  useEffect(() => {
    if (!isSubmitOpen && !isNavigatorOpen && !isInfoOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isSubmitOpen) setIsSubmitOpen(false);
      else if (isNavigatorOpen) setIsNavigatorOpen(false);
      else setIsInfoOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSubmitOpen, isNavigatorOpen, isInfoOpen]);

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

  if (status !== "ready" || !attempt || !question) {
    return (
      <div className="exam-shell flex min-h-screen items-center justify-center">
        <LoadingScreen tone="exam" message="Menyiapkan simulasi…" />
      </div>
    );
  }

  const isMarked = markedIds.has(question.id);
  const isLast = currentIndex === questions.length - 1;
  const stimulus = question.stimulus;

  return (
    <>
      <ExamShell
        tagline="Simulasi TKA"
        headerRight={
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-white/85 ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10 hover:text-white"
            >
              Layar penuh
            </button>
            <span className="inline-flex h-9 items-center gap-2 rounded-md bg-white/10 px-3 text-sm text-white ring-1 ring-inset ring-white/25">
              {studentName || "Peserta"}
              <Icon name="cap" className="h-4 w-4" strokeWidth={2} />
            </span>
          </div>
        }
      >
        <ExamCardHead
          title={`Soal nomor ${currentIndex + 1}`}
          subtitle={subjectName}
          status={
            <ExamStatusPill alert={remainingSeconds <= 300}>
              <span className="sr-only">Sisa waktu </span>
              <span aria-hidden="true">Sisa Waktu : </span>
              {formatExamClock(remainingSeconds)}
            </ExamStatusPill>
          }
          infoLabel="Informasi Soal"
          onOpenInfo={() => setIsInfoOpen(true)}
          onOpenList={() => setIsNavigatorOpen(true)}
          fontSize={fontSize}
          onFontSize={setFontSize}
        />

        <ExamQuestionPanel
          fontSize={fontSize}
          stimulus={
            stimulus ? (
              question.contentFormat === "html" ? (
                <RichText html={stimulus} className="stimulus-text" />
              ) : (
                <p className="stimulus-text">{stimulus}</p>
              )
            ) : null
          }
        >
          {isMarked ? (
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-300">
              <Icon name="flag" className="h-4 w-4" strokeWidth={2.2} />
              Ditandai ragu-ragu
            </p>
          ) : null}

          <QuestionBody
            question={question}
            answer={answers[question.id]}
            namePrefix="question"
            optionVariant="plain"
            className="mt-0"
            onChange={(answer) => handleAnswer(question.id, answer)}
          />
        </ExamQuestionPanel>

        <ExamNavBar
          onPrev={() => goTo(currentIndex - 1)}
          prevDisabled={currentIndex === 0}
          marked={isMarked}
          onToggleMark={() => handleToggleMark(question.id)}
          onNext={() => (isLast ? setIsSubmitOpen(true) : goTo(currentIndex + 1))}
          nextLabel={isLast ? "Selesai ujian" : "Soal berikutnya"}
          isFinish={isLast}
        />
      </ExamShell>

      {/* Daftar soal */}
      {isNavigatorOpen ? (
        <ExamDialog
          title="Daftar Soal"
          onClose={() => setIsNavigatorOpen(false)}
          footer={
            <ExamDialogAction
              onClick={() => {
                setIsNavigatorOpen(false);
                setIsSubmitOpen(true);
              }}
            >
              <Icon name="flag" className="h-5 w-5" strokeWidth={2.2} />
              Selesai ujian
            </ExamDialogAction>
          }
        >
          <p className="mb-3 text-sm tabular-nums text-slate-500">
            {answeredCount} dijawab · {questions.length - answeredCount} belum · {markedCount}{" "}
            ragu-ragu
          </p>
          <QuestionNavigator items={navigatorItems} currentIndex={currentIndex} onJump={goTo} />
        </ExamDialog>
      ) : null}

      {/* Informasi soal */}
      {isInfoOpen ? (
        <ExamDialog title="Informasi Soal" onClose={() => setIsInfoOpen(false)}>
          <dl className="text-[15px]">
            <ExamInfoRow label="Peserta" value={studentName || "Peserta"} />
            <ExamInfoRow label="Mata pelajaran" value={subjectName} />
            <ExamInfoRow label="Paket" value={tryout.title} />
            <ExamInfoRow label="Jumlah soal" value={`${questions.length} soal`} />
            <ExamInfoRow label="Alokasi waktu" value={`${tryout.durationMinutes} menit`} />
            <ExamInfoRow label="Sisa waktu" value={formatExamClock(remainingSeconds)} />
          </dl>

          {tryout.instructions.length > 0 ? (
            <>
              <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-slate-500">
                Petunjuk pengerjaan
              </h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-700">
                {tryout.instructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ul>
            </>
          ) : null}
        </ExamDialog>
      ) : null}

      {/* Konfirmasi selesai */}
      {isSubmitOpen ? (
        <ExamDialog
          title="Selesaikan ujian?"
          onClose={() => setIsSubmitOpen(false)}
          footer={
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <div className="sm:flex-1">
                <ExamDialogAction onClick={finish} disabled={isPending}>
                  <Icon name="check" className="h-5 w-5" strokeWidth={2.4} />
                  Kirim jawaban
                </ExamDialogAction>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitOpen(false)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-5 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Icon name="arrow-left" className="h-5 w-5" />
                Kembali mengerjakan
              </button>
            </div>
          }
        >
          <p className="text-[15px] leading-relaxed text-slate-600">
            Setelah dikirim, jawaban tidak dapat diubah dan hasil langsung ditampilkan.
          </p>

          <dl className="mt-4 space-y-2 text-[15px]">
            <SummaryRow
              icon="list-check"
              label="Jumlah soal"
              value={`${questions.length} soal`}
              className="bg-slate-50 text-slate-700"
            />
            <SummaryRow
              icon="check"
              label="Sudah dijawab"
              value={`${answeredCount} soal`}
              className="bg-aqua-50 text-aqua-900"
            />
            <SummaryRow
              icon="minus"
              label="Belum dijawab"
              value={`${questions.length - answeredCount} soal`}
              className="bg-rose-50 text-rose-800"
            />
            <SummaryRow
              icon="flag"
              label="Ditandai ragu-ragu"
              value={`${markedCount} soal`}
              className="bg-amber-50 text-amber-900"
            />
          </dl>
        </ExamDialog>
      ) : null}

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  className,
}: {
  icon: "list-check" | "check" | "minus" | "flag";
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div
      className={["flex items-center justify-between rounded-md px-3.5 py-2.5", className].join(" ")}
    >
      <dt className="flex items-center gap-2">
        <Icon name={icon} className="h-4 w-4" strokeWidth={2.2} />
        {label}
      </dt>
      <dd className="font-bold tabular-nums">{value}</dd>
    </div>
  );
}
