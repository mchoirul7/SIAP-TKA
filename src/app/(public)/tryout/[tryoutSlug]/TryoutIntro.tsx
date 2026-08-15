"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "@/components/NavigationProgress";
import type { Tryout } from "@/data/types";
import { formatDate } from "@/lib/format";
import { startAttempt } from "@/services/tryout-service";
import { getAttempt } from "@/services/tryout-service";
import type { TryoutAttempt } from "@/storage/attempt-storage";
import { readProfile, writeProfile } from "@/storage/profile-storage";

const gradeOptions = ["Kelas 4", "Kelas 5", "Kelas 6", "Lainnya"];

export function TryoutIntro({ tryout, subjectName }: { tryout: Tryout; subjectName: string }) {
  const { navigate, isPending } = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(gradeOptions[1]);
  const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const profile = readProfile();
    if (profile) {
      setName(profile.name);
      if (profile.grade) setGrade(profile.grade);
    }
    setAttempt(getAttempt(tryout.slug));
    setMounted(true);
  }, [tryout.slug]);

  const hasUnfinishedAttempt = Boolean(attempt && !attempt.submittedAt);
  const hasFinishedAttempt = Boolean(attempt?.submittedAt);

  const persistProfile = () => writeProfile({ name: name.trim(), grade });

  const handleStart = () => {
    if (name.trim().length < 2) {
      setNameError("Isi nama terlebih dahulu agar hasil mudah dikenali.");
      return;
    }
    persistProfile();
    startAttempt(tryout);
    navigate(`/tryout/${tryout.slug}/attempt`);
  };

  const handleContinue = () => {
    navigate(`/tryout/${tryout.slug}/attempt`);
  };

  const handleRestart = () => {
    persistProfile();
    startAttempt(tryout);
    navigate(`/tryout/${tryout.slug}/attempt`);
  };

  return (
    <div className="container-page py-12 sm:py-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div>
          <Link href="/tryout" className="text-sm text-slate-500 hover:text-brand-800">
            ← Kembali ke daftar tryout
          </Link>

          <div className="mt-5 flex items-center gap-3">
            <Badge tone="free">Gratis</Badge>
            <span className="text-sm text-slate-500">
              {subjectName} · Jenjang {tryout.level}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tryout.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            {tryout.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-slate-200 py-6 sm:grid-cols-4">
            <div>
              <dt className="text-sm text-slate-500">Jumlah soal</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink-900">
                {tryout.questionIds.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Durasi</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink-900">
                {tryout.durationMinutes} menit
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Bentuk soal</dt>
              <dd className="mt-0.5 text-lg font-semibold text-ink-900">Pilihan ganda</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Biaya</dt>
              <dd className="mt-0.5 text-lg font-semibold text-ink-900">Gratis</dd>
            </div>
          </dl>

          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">Petunjuk pengerjaan</h2>
            <ol className="mt-4 space-y-3">
              {tryout.instructions.map((instruction, index) => (
                <li key={instruction} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-300 text-xs font-semibold tabular-nums text-slate-600">
                    {index + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed text-slate-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </section>

          <p className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 lg:hidden">
            Untuk pengalaman simulasi terbaik, gunakan laptop atau komputer. Simulasi tetap dapat
            dikerjakan dari ponsel.
          </p>
        </div>

        {/* Panel mulai */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            {!mounted ? (
              <div className="h-64 animate-pulse rounded bg-slate-100" aria-hidden="true" />
            ) : hasUnfinishedAttempt ? (
              <>
                <h2 className="text-lg font-semibold tracking-tight">Simulasi belum selesai</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  Ada pengerjaan yang belum diselesaikan. Waktu tetap berjalan sejak simulasi
                  dimulai.
                </p>
                <div className="mt-6 space-y-2">
                  <Button size="lg" className="w-full" loading={isPending} onClick={handleContinue}>
                    Lanjutkan Tryout
                  </Button>
                  <Button variant="secondary" className="w-full" loading={isPending} onClick={handleRestart}>
                    Mulai Ulang dari Awal
                  </Button>
                </div>
              </>
            ) : hasFinishedAttempt ? (
              <>
                <h2 className="text-lg font-semibold tracking-tight">Simulasi sudah dikerjakan</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  Terakhir dikerjakan{" "}
                  {attempt?.submittedAt ? formatDate(attempt.submittedAt) : ""}. Hasilnya masih
                  dapat dibuka kapan saja.
                </p>
                <div className="mt-6 space-y-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate(`/tryout/${tryout.slug}/hasil`)}
                    loading={isPending}
                  >
                    Lihat Hasil
                  </Button>
                  <Button variant="secondary" className="w-full" loading={isPending} onClick={handleRestart}>
                    Ulangi Simulasi
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold tracking-tight">Sebelum mulai</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  Nama dan kelas dipakai untuk menandai hasil di perangkat ini saja.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="student-name" className="block text-sm font-semibold text-slate-800">
                      Nama
                    </label>
                    <input
                      id="student-name"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        if (nameError) setNameError(null);
                      }}
                      placeholder="Nama siswa"
                      autoComplete="name"
                      aria-invalid={nameError ? true : undefined}
                      aria-describedby={nameError ? "student-name-error" : undefined}
                      className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-[15px] text-slate-900 placeholder:text-slate-400"
                    />
                    {nameError ? (
                      <p id="student-name-error" role="alert" className="mt-2 text-sm text-rose-700">
                        {nameError}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="student-grade" className="block text-sm font-semibold text-slate-800">
                      Kelas
                    </label>
                    <select
                      id="student-grade"
                      value={grade}
                      onChange={(event) => setGrade(event.target.value)}
                      className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-[15px] text-slate-900"
                    >
                      {gradeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button size="lg" className="mt-6 w-full" loading={isPending} onClick={handleStart}>
                  Mulai Tryout
                </Button>
                <p className="mt-3 text-center text-sm text-slate-500">
                  Waktu mulai berjalan setelah tombol ditekan.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
