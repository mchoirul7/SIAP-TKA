"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { Icon } from "@/components/ui/Icon";
import type { AnswerMap, AnswerValue, PracticePackage, Question } from "@/data/types";
import { isAnswered } from "@/lib/answers";
import { useEntitlements } from "@/hooks/useEntitlements";
import { usePrefetchQuestionImages } from "@/hooks/usePrefetchQuestionImages";
import { RichText } from "@/components/RichText";
import {
  finishPractice,
  getPracticeAttempt,
  savePracticeAnswer,
  startPracticeAttempt,
  togglePracticeMark,
} from "@/services/practice-service";

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
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isFinishOpen, setIsFinishOpen] = useState(false);
  const [fontSize, setFontSize] = useState<ExamFontSize>("sedang");

  usePrefetchQuestionImages(questions, currentIndex);

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
    setMarkedIds(attempt?.markedQuestionIds ?? []);
    setReady(true);
  }, [mounted, isUnlocked, pkg, pkg.slug, router]);

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

  const question = questions[currentIndex];
  const navigatorItems = questions.map((item) => ({
    questionId: item.id,
    answered: isAnswered(item, answers[item.id]),
    marked: markedIds.includes(item.id),
  }));
  const answeredCount = navigatorItems.filter((item) => item.answered).length;
  const markedCount = navigatorItems.filter((item) => item.marked).length;

  const handleAnswer = (answer: AnswerValue) => {
    if (!question) return;
    const next = savePracticeAnswer(pkg.slug, question.id, answer);
    setAnswers(next?.answers ?? { ...answers, [question.id]: answer });
  };

  const handleToggleMark = () => {
    if (!question) return;
    const next = togglePracticeMark(pkg.slug, question.id);
    if (next) setMarkedIds(next.markedQuestionIds);
  };

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(questions.length - 1, index)));
    setIsNavigatorOpen(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinish = () => {
    finishPractice(pkg.slug);
    router.push(`/latihan/${pkg.slug}/hasil`);
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
          <Link
            href={`/latihan/${pkg.slug}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-white/85 ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon name="close" className="h-4 w-4" />
            Keluar
          </Link>
        }
      >
        <ExamCardHead
          title={`Soal nomor ${currentIndex + 1}`}
          subtitle={pkg.title}
          status={
            <ExamStatusPill>
              {answeredCount}/{questions.length} terjawab
            </ExamStatusPill>
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
    </>
  );
}
