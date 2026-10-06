"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { SecureExamNotice, type SecureExamNoticeState } from "@/components/exam/SecureExamNotice";
import { LoadingScreen } from "@/components/LoadingScreen";
import { QuestionBody } from "@/components/QuestionBody";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import { Icon } from "@/components/ui/Icon";
import type { AnswerMap, AnswerValue, PracticePackage, Question } from "@/data/types";
import { isAnswered } from "@/lib/answers";
import { useEntitlements } from "@/hooks/useEntitlements";
import { usePrefetchQuestionImages } from "@/hooks/usePrefetchQuestionImages";
import { RichText } from "@/components/RichText";
import {
  getSecureExamDisplay,
  SECURE_EXAM_CONFIG,
  SECURE_EXAM_VIOLATION_TYPES,
  secureExamViolationMessage,
  secureExamViolationTitle,
  shouldRecordSecureExamViolation,
  type SecureExamViolationType,
} from "@/lib/secure-exam";
import {
  finishPractice,
  getPracticeAttempt,
  savePracticeAnswer,
  setPracticeSecureMode,
  startPracticeAttempt,
  togglePracticeMark,
} from "@/services/practice-service";
import type { PracticeAttempt } from "@/storage/attempt-storage";

/**
 * Layar latihan memakai rangka yang sama persis dengan layar ujian
 * (`ExamChrome`), supaya kebiasaan yang terbentuk saat berlatih terpakai lagi
 * saat ujian. Bedanya hanya dua: latihan tidak dibatasi waktu, dan tombol
 * keluar tersedia karena latihan boleh ditinggal kapan saja.
 */
export function PracticeRunner({
  pkg,
  questions,
}: {
  pkg: PracticePackage;
  questions: Question[];
}) {
  const router = useRouter();
  const { mounted, isUnlocked } = useEntitlements();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [secureNotice, setSecureNotice] = useState<SecureExamNoticeState | null>(null);
  const [secureViolationCount, setSecureViolationCount] = useState(0);
  const [fontSize, setFontSize] = useState<ExamFontSize>("sedang");
  const attemptRef = useRef<PracticeAttempt | null>(null);
  const lastViolationAtRef = useRef<number | null>(null);
  const secureViolationCountRef = useRef(0);
  const secureFinishedRef = useRef(false);

  usePrefetchQuestionImages(questions, currentIndex);

  useEffect(() => {
    if (!mounted) return;
    if (!isUnlocked(pkg)) {
      router.replace(`/latihan/${pkg.slug}`);
      return;
    }
    const secureParam =
      typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("secure");
    const requestedSecureMode =
      secureParam === "1" ? true : secureParam === "0" ? false : undefined;
    let attempt = getPracticeAttempt(pkg.slug);
    if (!attempt || attempt.finishedAt) {
      attempt = startPracticeAttempt(pkg.slug, requestedSecureMode ?? false);
    } else if (
      requestedSecureMode !== undefined &&
      attempt.secureModeEnabled !== requestedSecureMode
    ) {
      attempt = setPracticeSecureMode(pkg.slug, requestedSecureMode);
    }
    attemptRef.current = attempt;
    setAttempt(attempt);
    setAnswers(attempt?.answers ?? {});
    setMarkedIds(attempt?.markedQuestionIds ?? []);
    setReady(true);
  }, [mounted, isUnlocked, pkg, pkg.slug, router]);

  useEffect(() => {
    attemptRef.current = attempt;
  }, [attempt]);

  // Esc menutup jendela yang sedang terbuka, dimulai dari yang paling atas.
  useEffect(() => {
    if (!isFinishOpen && !isNavigatorOpen && !isInfoOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isFinishOpen) setIsFinishOpen(false);
      else if (isNavigatorOpen) setIsNavigatorOpen(false);
      else setIsInfoOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFinishOpen, isNavigatorOpen, isInfoOpen]);

  const requestFullscreen = useCallback((showPrompt = true) => {
    if (!SECURE_EXAM_CONFIG.enableFullscreen || typeof document === "undefined") return;
    if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;

    void document.documentElement.requestFullscreen().catch(() => {
      if (!showPrompt) return;
      setSecureNotice({
        title: "Aktifkan Secure Exam",
        message:
          "Browser belum mengizinkan mode layar penuh. Latihan tetap berjalan, tetapi aktifkan kembali layar penuh untuk menjaga mode aman.",
        fullscreenPrompt: true,
      });
    });
  }, []);

  const recordSecureViolation = useCallback(
    (type: SecureExamViolationType) => {
      const currentAttempt = attemptRef.current;
      const occurredAt = Date.now();
      if (!currentAttempt?.secureModeEnabled || currentAttempt.finishedAt || secureFinishedRef.current) {
        return;
      }
      if (
        !shouldRecordSecureExamViolation(
          lastViolationAtRef.current,
          occurredAt,
          SECURE_EXAM_CONFIG.dedupeWindowMs,
        )
      ) {
        return;
      }

      setIsFinishOpen(false);
      setIsNavigatorOpen(false);
      setIsInfoOpen(false);
      lastViolationAtRef.current = occurredAt;

      const violationCount = secureViolationCountRef.current + 1;
      secureViolationCountRef.current = violationCount;
      setSecureViolationCount(violationCount);
      const isFinal = violationCount >= SECURE_EXAM_CONFIG.maxViolations;
      setSecureNotice({
        title: secureExamViolationTitle(violationCount),
        message: secureExamViolationMessage(violationCount, type),
        final: isFinal,
      });

      if (isFinal) {
        secureFinishedRef.current = true;
        const finished = finishPractice(pkg.slug);
        if (finished) {
          attemptRef.current = finished;
          setAttempt(finished);
          setAnswers(finished.answers);
          setMarkedIds(finished.markedQuestionIds);
        }
      }
    },
    [pkg.slug],
  );

  useEffect(() => {
    if (!ready || !attempt?.secureModeEnabled || !SECURE_EXAM_CONFIG.enableFullscreen) return;
    requestFullscreen(true);
  }, [attempt?.secureModeEnabled, ready, requestFullscreen]);

  useEffect(() => {
    if (!ready || !attempt?.secureModeEnabled) return;

    const onVisibilityChange = () => {
      if (
        SECURE_EXAM_CONFIG.detectTabSwitch &&
        document.visibilityState === "hidden"
      ) {
        recordSecureViolation(SECURE_EXAM_VIOLATION_TYPES.tabSwitch);
      }
    };
    const onBlur = () => {
      if (!SECURE_EXAM_CONFIG.detectWindowBlur) return;
      recordSecureViolation(SECURE_EXAM_VIOLATION_TYPES.windowBlur);
    };
    const onFullscreenChange = () => {
      if (SECURE_EXAM_CONFIG.detectFullscreenExit && !document.fullscreenElement) {
        recordSecureViolation(SECURE_EXAM_VIOLATION_TYPES.exitFullscreen);
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
  }, [attempt?.secureModeEnabled, ready, recordSecureViolation]);

  const question = questions[currentIndex];
  const navigatorItems = questions.map((item) => ({
    questionId: item.id,
    answered: isAnswered(item, answers[item.id]),
    marked: markedIds.includes(item.id),
  }));
  const answeredCount = navigatorItems.filter((item) => item.answered).length;
  const markedCount = navigatorItems.filter((item) => item.marked).length;
  const secureDisplay = getSecureExamDisplay(secureViolationCount);

  const handleAnswer = (answer: AnswerValue) => {
    if (!question) return;
    const next = savePracticeAnswer(pkg.slug, question.id, answer);
    if (next) setAttempt(next);
    setAnswers(next?.answers ?? { ...answers, [question.id]: answer });
  };

  const handleToggleMark = () => {
    if (!question) return;
    const next = togglePracticeMark(pkg.slug, question.id);
    if (next) {
      setAttempt(next);
      setMarkedIds(next.markedQuestionIds);
    }
  };

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, index)));
    setIsNavigatorOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    const finished = finishPractice(pkg.slug);
    if (finished) setAttempt(finished);
    router.push(`/latihan/${pkg.slug}/hasil`);
  };

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      requestFullscreen(true);
    }
  };

  const closeSecureDialog = () => {
    if (!secureNotice) return;
    if (secureNotice.final) {
      router.push(`/latihan/${pkg.slug}/hasil`);
      return;
    }
    const shouldRequestFullscreen = secureNotice.fullscreenPrompt;
    setSecureNotice(null);
    if (shouldRequestFullscreen) requestFullscreen(true);
  };

  if (!ready || !question) {
    return (
      <div className="exam-shell flex min-h-screen items-center justify-center">
        <LoadingScreen tone="exam" message="Menyiapkan latihan…" />
      </div>
    );
  }

  const isMarked = markedIds.includes(question.id);
  const isLast = currentIndex === questions.length - 1;
  const stimulus = question.stimulus;

  return (
    <>
      <ExamShell
        tagline="Latihan Soal"
        headerRight={
          <div className="flex items-center gap-2">
            {attempt?.secureModeEnabled ? (
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden h-9 items-center rounded-md px-3 text-sm font-medium text-white/85 ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                {typeof document !== "undefined" && document.fullscreenElement
                  ? "Keluar layar penuh"
                  : "Layar penuh"}
              </button>
            ) : null}
            <Link
              href={`/latihan/${pkg.slug}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/85 ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon name="close" className="h-4 w-4" />
              Keluar
            </Link>
          </div>
        }
      >
        <ExamCardHead
          title={`Soal nomor ${currentIndex + 1}`}
          subtitle={pkg.title}
          status={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ExamStatusPill>
                {answeredCount}/{questions.length} terjawab
              </ExamStatusPill>
              {attempt?.secureModeEnabled ? (
                <PracticeSecureIndicator
                  display={secureDisplay}
                  violationCount={secureViolationCount}
                />
              ) : null}
            </div>
          }
          infoLabel="Informasi Latihan"
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
            namePrefix="practice"
            optionVariant="plain"
            className="mt-0"
            onChange={handleAnswer}
          />
        </ExamQuestionPanel>

        <ExamNavBar
          onPrev={() => goTo(currentIndex - 1)}
          prevDisabled={currentIndex === 0}
          marked={isMarked}
          onToggleMark={handleToggleMark}
          onNext={() => (isLast ? setIsFinishOpen(true) : goTo(currentIndex + 1))}
          nextLabel={isLast ? "Selesai latihan" : "Soal berikutnya"}
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
                setIsFinishOpen(true);
              }}
            >
              <Icon name="flag" className="h-5 w-5" strokeWidth={2.2} />
              Selesai latihan
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

      {/* Informasi latihan */}
      {isInfoOpen ? (
        <ExamDialog title="Informasi Latihan" onClose={() => setIsInfoOpen(false)}>
          <dl className="text-[15px]">
            <ExamInfoRow label="Paket" value={pkg.title} />
            <ExamInfoRow label="Jumlah soal" value={`${questions.length} soal`} />
            <ExamInfoRow label="Sudah dijawab" value={`${answeredCount} soal`} />
            <ExamInfoRow label="Perkiraan waktu" value={`${pkg.estimatedMinutes} menit`} />
            <ExamInfoRow label="Tingkat kesulitan" value={pkg.difficultyRange} />
          </dl>

          <p className="mt-4 flex items-start gap-2.5 rounded-md bg-aqua-50 p-3.5 text-sm leading-relaxed text-aqua-900">
            <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-aqua-600" />
            <span>
              Latihan tidak dibatasi waktu. Jawaban dan tanda ragu-ragu tersimpan otomatis, jadi
              latihan boleh dilanjutkan lain waktu.
            </span>
          </p>
        </ExamDialog>
      ) : null}

      {/* Konfirmasi selesai */}
      {isFinishOpen ? (
        <ExamDialog
          title="Selesaikan latihan?"
          onClose={() => setIsFinishOpen(false)}
          footer={
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <div className="sm:flex-1">
                <ExamDialogAction onClick={handleFinish}>
                  <Icon name="check" className="h-5 w-5" strokeWidth={2.4} />
                  Lihat hasil
                </ExamDialogAction>
              </div>
              <button
                type="button"
                onClick={() => setIsFinishOpen(false)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 px-5 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Icon name="arrow-left" className="h-5 w-5" />
                Kembali mengerjakan
              </button>
            </div>
          }
        >
          <p className="text-[15px] leading-relaxed text-slate-600">
            {answeredCount === questions.length
              ? "Semua soal sudah dijawab. Hasil dan pembahasan langsung ditampilkan."
              : `Masih ada ${questions.length - answeredCount} soal yang belum dijawab. Soal yang dilewati dihitung salah pada hasil.`}
          </p>
        </ExamDialog>
      ) : null}

      {secureNotice ? <SecureExamNotice notice={secureNotice} onClose={closeSecureDialog} /> : null}
    </>
  );
}

function PracticeSecureIndicator({
  display,
  violationCount,
}: {
  display: ReturnType<typeof getSecureExamDisplay>;
  violationCount: number;
}) {
  const toneClass = {
    emerald: "border-emerald-300 bg-emerald-50 text-emerald-800",
    amber: "border-amber-300 bg-amber-50 text-amber-800",
    orange: "border-orange-300 bg-orange-50 text-orange-800",
    rose: "border-rose-300 bg-rose-50 text-rose-800",
  }[display.tone];

  const dotClass = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    orange: "bg-orange-500",
    rose: "bg-rose-500",
  }[display.tone];

  return (
    <span
      className={[
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold tabular-nums sm:text-sm",
        toneClass,
      ].join(" ")}
    >
      <Icon name="lock" className="h-4 w-4" strokeWidth={2.2} />
      <span className="hidden sm:inline">Secure Exam</span>
      <span aria-hidden="true" className={["h-2 w-2 rounded-full", dotClass].join(" ")} />
      <span>{display.label}</span>
      <span className="text-current/70">Pelanggaran: {violationCount}</span>
    </span>
  );
}
