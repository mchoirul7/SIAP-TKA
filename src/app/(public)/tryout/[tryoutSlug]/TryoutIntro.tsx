"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatCard } from "@/components/ui/StatCard";
import { useVoucherDialog } from "@/components/VoucherDialog";
import { useNavigate } from "@/components/NavigationProgress";
import type { Tryout } from "@/data/types";
import { formatDate } from "@/lib/format";
import { gradeOptionsFor, resolveGrade } from "@/lib/grade";
import { useEntitlements } from "@/hooks/useEntitlements";
import { startAttempt } from "@/services/tryout-service";
import { getAttempt } from "@/services/tryout-service";
import type { TryoutAttempt } from "@/storage/attempt-storage";
import { readProfile, writeProfile } from "@/storage/profile-storage";

export function TryoutIntro({ tryout, subjectName }: { tryout: Tryout; subjectName: string }) {
  const { navigate, isPending } = useNavigate();
  const { openVoucher } = useVoucherDialog();
  const { mounted: entitlementsMounted, isUnlocked } = useEntitlements();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  // Daftar kelas mengikuti jenjang paket, bukan daftar tetap.
  const gradeOptions = gradeOptionsFor(tryout.level);
  const [grade, setGrade] = useState(() => resolveGrade(tryout.level, undefined));
  const [attempt, setAttempt] = useState<TryoutAttempt | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const profile = readProfile();
    if (profile) {
      setName(profile.name);
      setGrade(resolveGrade(tryout.level, profile.grade));
    }
    setAttempt(getAttempt(tryout.slug));
    setMounted(true);
  }, [tryout.slug, tryout.level]);

  const hasUnfinishedAttempt = Boolean(attempt && !attempt.submittedAt);
  const hasFinishedAttempt = Boolean(attempt?.submittedAt);
  const unlocked = entitlementsMounted && isUnlocked(tryout);
  const voucherOptions = {
    packageTitle: tryout.title,
    successHref: `/tryout/${tryout.slug}`,
    requiredAccessKey: tryout.accessKey,
    requiredLabel: `${subjectName} - ${tryout.seriesTitle}`,
  };

  const persistProfile = () => writeProfile({ name: name.trim(), grade });

  const handleStart = () => {
    if (!unlocked) {
      openVoucher(voucherOptions);
      return;
    }
    if (name.trim().length < 2) {
      setNameError("Isi nama terlebih dahulu agar hasil mudah dikenali.");
      return;
    }
    persistProfile();
    startAttempt(tryout);
    navigate(`/tryout/${tryout.slug}/attempt`);
  };

  const handleContinue = () => {
    if (!unlocked) {
      openVoucher(voucherOptions);
      return;
    }
    navigate(`/tryout/${tryout.slug}/attempt`);
  };

  const handleRestart = () => {
    if (!unlocked) {
      openVoucher(voucherOptions);
      return;
    }
    persistProfile();
    startAttempt(tryout);
    navigate(`/tryout/${tryout.slug}/attempt`);
  };

  return (
    <div className="container-page py-12 sm:py-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div>
          <Link
            href="/tryout"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-800"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Kembali ke daftar tryout
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {unlocked ? <Badge tone="success">Terbuka</Badge> : <Badge tone="voucher">Kode Akses</Badge>}
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Icon name="cap" className="h-4 w-4 text-brand-600" />
              {subjectName} · {tryout.seriesTitle} · Jenjang {tryout.level}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{tryout.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            {tryout.description}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              icon="list-check"
              tone="brand"
              label="Jumlah soal"
              value={tryout.questionIds.length}
            />
            <StatCard
              icon="hourglass"
              tone="rose"
              label="Durasi"
              value={`${tryout.durationMinutes} menit`}
              valueClassName="text-lg"
            />
            <StatCard
              icon="note"
              tone="violet"
              label="Bentuk soal"
              value="Pilihan ganda"
              valueClassName="text-lg"
            />
            <StatCard
              icon="star"
              tone="emerald"
              label="Akses"
              value={unlocked ? "Terbuka" : "Kode Akses"}
              valueClassName="text-lg"
            />
          </div>

          <section className="mt-10">
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
              <IconBadge name="list-check" tone="sky" size="sm" />
              Petunjuk pengerjaan
            </h2>
            <ol className="mt-4 space-y-2.5">
              {tryout.instructions.map((instruction, index) => (
                <li
                  key={instruction}
                  className="flex gap-3 rounded-2xl border border-aqua-200 bg-aqua-50/50 p-3.5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aqua-400 to-aqua-600 text-xs font-extrabold tabular-nums text-white"
                  >
                    {index + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed text-slate-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </section>

          <p className="mt-8 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 lg:hidden">
            <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <span>
              Untuk pengalaman simulasi terbaik, gunakan laptop atau komputer. Simulasi tetap dapat
              dikerjakan dari ponsel.
            </span>
          </p>
        </div>

        {/* Panel mulai */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-card">
            {!mounted || !entitlementsMounted ? (
              <div className="h-64 animate-pulse rounded-2xl bg-brand-100/70" aria-hidden="true" />
            ) : !unlocked ? (
              <>
                <IconBadge name="lock" tone="brand" size="lg" />
                <p className="eyebrow mt-4">Konten Kode Akses</p>
                <h2 className="mt-1.5 text-lg font-extrabold tracking-tight">
                  Masukkan kode akses seri untuk membuka tryout ini.
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  Satu kode akses membuka semua tryout dan latihan {subjectName} dalam{" "}
                  {tryout.seriesTitle}.
                </p>
                <Button
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => openVoucher(voucherOptions)}
                >
                  <Icon name="ticket" className="h-5 w-5" />
                  Masukkan Kode Akses
                </Button>
              </>
            ) : hasUnfinishedAttempt ? (
              <>
                <IconBadge name="hourglass" tone="amber" size="lg" />
                <h2 className="mt-4 text-lg font-extrabold tracking-tight">
                  Simulasi belum selesai
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  Ada pengerjaan yang belum diselesaikan. Waktu tetap berjalan sejak simulasi
                  dimulai.
                </p>
                <div className="mt-6 space-y-2">
                  <Button size="lg" className="w-full" loading={isPending} onClick={handleContinue}>
                    {isPending ? null : <Icon name="play" className="h-5 w-5" />}
                    Lanjutkan Tryout
                  </Button>
                  <Button variant="secondary" className="w-full" loading={isPending} onClick={handleRestart}>
                    {isPending ? null : <Icon name="refresh" className="h-5 w-5" />}
                    Mulai Ulang dari Awal
                  </Button>
                </div>
              </>
            ) : hasFinishedAttempt ? (
              <>
                <IconBadge name="medal" tone="emerald" size="lg" />
                <h2 className="mt-4 text-lg font-extrabold tracking-tight">
                  Simulasi sudah dikerjakan
                </h2>
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
                    {isPending ? null : <Icon name="chart" className="h-5 w-5" />}
                    Lihat Hasil
                  </Button>
                  <Button variant="secondary" className="w-full" loading={isPending} onClick={handleRestart}>
                    {isPending ? null : <Icon name="refresh" className="h-5 w-5" />}
                    Ulangi Simulasi
                  </Button>
                </div>
              </>
            ) : (
              <>
                <IconBadge name="cap" tone="brand" size="lg" />
                <h2 className="mt-4 text-lg font-extrabold tracking-tight">Sebelum mulai</h2>
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
                  {isPending ? null : <Icon name="play" className="h-5 w-5" />}
                  Mulai Tryout
                </Button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm text-slate-500">
                  <Icon name="clock" className="h-4 w-4 text-brand-500" />
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
