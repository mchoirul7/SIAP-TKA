"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useNavigate } from "@/components/NavigationProgress";
import { useVoucherDialog } from "@/components/VoucherDialog";
import type { PracticePackage } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getPracticeAttempt } from "@/services/practice-service";
import { subscribeToStorage } from "@/storage/local-storage";
import { readProfile, writeProfile } from "@/storage/profile-storage";

function DetailMetric({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-ink-700 ring-1 ring-inset ring-slate-200"
      >
        <Icon name={icon} className="h-4 w-4" strokeWidth={2.1} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </dt>
        <dd className="mt-0.5 break-words text-sm font-extrabold leading-snug text-ink-900">
          {value}
        </dd>
      </div>
    </div>
  );
}

export function PackageDetail({
  pkg,
  topicName,
  subtopicName,
  subjectName,
}: {
  pkg: PracticePackage;
  topicName: string;
  subtopicName: string;
  subjectName: string;
}) {
  const { navigate, isPending } = useNavigate();
  const { mounted, isUnlocked } = useEntitlements();
  const { openVoucher } = useVoucherDialog();
  const [hasFinishedAttempt, setHasFinishedAttempt] = useState(false);
  const [hasStartedAttempt, setHasStartedAttempt] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [studentNameError, setStudentNameError] = useState<string | null>(null);
  const autoVoucherOpenedRef = useRef(false);
  const unlocked = pkg.isFreeAccess || (mounted && isUnlocked(pkg));
  const openAccessDialog = useCallback(() => {
    openVoucher({
      packageSlug: pkg.slug,
      packageTitle: pkg.title,
      requiredAccessKey: pkg.accessKey,
      requiredLabel: `${subjectName} - ${pkg.seriesTitle}`,
    });
  }, [openVoucher, pkg.accessKey, pkg.seriesTitle, pkg.slug, pkg.title, subjectName]);

  useEffect(() => {
    const profile = readProfile();
    if (!profile) return;
    setStudentName(profile.name);
    setStudentGrade(profile.grade);
  }, []);

  useEffect(() => {
    const sync = () => {
      const attempt = getPracticeAttempt(pkg.slug);
      setHasStartedAttempt(Boolean(attempt));
      setHasFinishedAttempt(Boolean(attempt?.finishedAt));
    };
    sync();
    return subscribeToStorage(sync);
  }, [pkg.slug]);

  const primaryActionLabel =
    hasStartedAttempt && !hasFinishedAttempt ? "Lanjutkan Latihan" : "Mulai Latihan Online";

  const persistStudentProfile = useCallback((): boolean => {
    const name = studentName.trim();
    if (name.length < 2) {
      setStudentNameError("Isi nama siswa agar hasil analisis mudah dikenali.");
      return false;
    }

    writeProfile({ name, grade: studentGrade });
    return true;
  }, [studentGrade, studentName]);

  const handleStartPractice = () => {
    if (!persistStudentProfile()) return;
    navigate(`/latihan/${pkg.slug}/kerjakan`);
  };

  const handleResultClick = () => {
    if (studentName.trim().length >= 2) {
      writeProfile({ name: studentName.trim(), grade: studentGrade });
    }
  };

  useEffect(() => {
    if (!mounted || unlocked || autoVoucherOpenedRef.current) return;
    if (typeof window === "undefined") return;

    const shouldOpen = new URLSearchParams(window.location.search).get("akses") === "1";
    if (!shouldOpen) return;

    autoVoucherOpenedRef.current = true;
    openAccessDialog();
  }, [mounted, openAccessDialog, unlocked]);

  return (
    <div className="container-page py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <main>
          <Link
            href={`/mapel/${pkg.subjectSlug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-800"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Kembali ke mapel
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {pkg.isFreeAccess ? (
              <Badge tone="success">Gratis</Badge>
            ) : unlocked ? (
              <Badge tone="success">Terbuka</Badge>
            ) : (
              <Badge tone="voucher">Buka Akses</Badge>
            )}
            <span className="text-sm font-medium text-slate-500">
              {subjectName} / {pkg.seriesTitle}
            </span>
          </div>

          <h1 className="mt-3 max-w-3xl text-2xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            {pkg.title}
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600 sm:text-base">
            {pkg.description}
          </p>

          <section className="mt-7 rounded-lg border border-slate-200 bg-white p-4 shadow-card sm:p-5">
            <h2 className="text-base font-extrabold tracking-tight text-ink-900">
              Ringkasan paket
            </h2>
            <dl className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <DetailMetric icon="list-check" label="Jumlah soal" value={pkg.questionIds.length} />
              <DetailMetric
                icon="clock"
                label="Waktu"
                value={`+/- ${pkg.estimatedMinutes} menit`}
              />
            </dl>
          </section>

          <section className="mt-7">
            <h2 className="text-base font-extrabold tracking-tight text-ink-900">
              Yang akan dilatih
            </h2>
            <ul className="mt-3 space-y-2">
              {pkg.skills.map((skill) => (
                <li
                  key={skill}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-[15px] leading-relaxed text-slate-700 shadow-card"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
                  >
                    <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-7 rounded-lg border border-slate-200 bg-white p-4 shadow-card sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-ink-900">
              <Icon name="bulb" className="h-5 w-5 text-brand-700" strokeWidth={2.1} />
              Cara mengerjakan
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Latihan tidak memakai waktu ketat seperti simulasi. Kerjakan soal satu per satu,
              lalu lihat skor dan konsep yang perlu diulang di akhir. Pembahasan setiap soal dapat
              dibuka setelah latihan selesai.
            </p>
          </section>
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {!mounted && !pkg.isFreeAccess ? (
            <div className="h-56 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
          ) : unlocked ? (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                >
                  <Icon name="unlock" className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-ink-900">
                    {pkg.isFreeAccess ? "Paket gratis terbuka" : "Paket sudah terbuka"}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {pkg.isFreeAccess
                      ? "Latihan pertama per mapel bisa dicoba tanpa kode akses."
                      : "Kode akses seri ini membuka latihan, tryout, hasil, dan pembahasan."}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="practice-student-name" className="block text-sm font-semibold text-slate-800">
                  Nama siswa
                </label>
                <input
                  id="practice-student-name"
                  value={studentName}
                  onChange={(event) => {
                    setStudentName(event.target.value);
                    if (studentNameError) setStudentNameError(null);
                  }}
                  onBlur={() => {
                    if (studentName.trim().length >= 2) {
                      writeProfile({ name: studentName.trim(), grade: studentGrade });
                    }
                  }}
                  placeholder="Contoh: Afrizal"
                  autoComplete="name"
                  aria-invalid={studentNameError ? true : undefined}
                  aria-describedby={studentNameError ? "practice-student-name-error" : undefined}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-[15px] text-slate-900 placeholder:text-slate-400"
                />
                {studentNameError ? (
                  <p id="practice-student-name-error" role="alert" className="mt-2 text-sm text-rose-700">
                    {studentNameError}
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Akan tampil di hasil, misalnya Ananda Afrizal atau Ananda Anisa.
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-2">
                <Button size="lg" className="w-full" loading={isPending} onClick={handleStartPractice}>
                  {isPending ? null : <Icon name="play" className="h-5 w-5" />}
                  {primaryActionLabel}
                </Button>
                <ButtonLink
                  href={`/latihan/${pkg.slug}/pembahasan`}
                  variant="secondary"
                  className="w-full"
                >
                  <Icon name="book" className="h-5 w-5" />
                  Lihat Pembahasan
                </ButtonLink>
              </div>

              {hasFinishedAttempt ? (
                <p className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  <Link
                    href={`/latihan/${pkg.slug}/hasil`}
                    className="link-underline font-semibold"
                    onClick={handleResultClick}
                  >
                    Lihat hasil terakhir
                  </Link>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
                >
                  <Icon name="lock" className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <div>
                  <p className="eyebrow">Kode akses</p>
                  <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink-900">
                    Buka latihan ini
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Satu kode akses membuka semua latihan dan tryout {subjectName} dalam{" "}
                    {pkg.seriesTitle}.
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {["Latihan online", "Tryout seri ini", "Pembahasan setiap soal"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Icon
                      name="check"
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand-700"
                      strokeWidth={2.4}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={openAccessDialog}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                <Icon name="ticket" className="h-5 w-5" />
                Buka Akses
              </button>

            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
