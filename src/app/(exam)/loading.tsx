import { LoadingScreen } from "@/components/LoadingScreen";

/** Layar tunggu pengerjaan — ujian maupun latihan — dengan latar biru yang sama. */
export default function ExamLoading() {
  return (
    <div className="exam-shell flex min-h-screen items-center justify-center">
      <LoadingScreen tone="exam" message="Menyiapkan soal…" />
    </div>
  );
}
