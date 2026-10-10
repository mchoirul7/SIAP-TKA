"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useNavigate } from "@/components/NavigationProgress";
import { useAccessDialog } from "@/components/AccessDialog";
import type { PracticePackage } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import { examPackagesHref } from "@/lib/assessment";
import { purchaseOptionsFor } from "@/lib/subject-catalog";
import { getPracticeAttempt } from "@/services/practice-service";
import { subscribeToStorage } from "@/storage/local-storage";

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
  const { openAccess } = useAccessDialog();
  const [hasFinishedAttempt, setHasFinishedAttempt] = useState(false);
  const [hasStartedAttempt, setHasStartedAttempt] = useState(false);
  const [secureModeEnabled, setSecureModeEnabled] = useState(false);
  const autoAccessOpenedRef = useRef(false);
  // Semua paket, termasuk yang gratis, dikerjakan dari akun supaya nilainya terekam.
  const unlocked = mounted && isUnlocked(pkg);
  const openAccessDialog = useCallback(() => {
    openAccess({
      packageSlug: pkg.slug,
      packageTitle: pkg.title,
      packageIsFree: pkg.isFreeAccess,
      purchase: purchaseOptionsFor(pkg, subjectName),
    });
  }, [openAccess, pkg, subjectName]);


  useEffect(() => {
    const sync = () => {
      const attempt = getPracticeAttempt(pkg.slug);
      setHasStartedAttempt(Boolean(attempt));
      setHasFinishedAttempt(Boolean(attempt?.finishedAt));
      if (attempt) setSecureModeEnabled(attempt.secureModeEnabled);
    };
    sync();
    return subscribeToStorage(sync);
  }, [pkg.slug]);

  const primaryActionLabel =
    hasStartedAttempt && !hasFinishedAttempt ? "Mulai Latihan" : "Mulai Latihan Online";

  // Nama di hasil diambil dari akun murid yang sedang masuk.
  const handleStartPractice = () => {
    navigate(`/latihan/${pkg.slug}/kerjakan?secure=${secureModeEnabled ? "1" : "0"}`);
  };

  useEffect(() => {
    if (!mounted || unlocked || autoAccessOpenedRef.current) return;
    if (typeof window === "undefined") return;

    const shouldOpen = new URLSearchParams(window.location.search).get("akses") === "1";
    if (!shouldOpen) return;

    autoAccessOpenedRef.current = true;
    openAccessDialog();
  }, [mounted, openAccessDialog, unlocked]);

  return (
    <div className="container-page py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <main>
          <Link
            href={examPackagesHref(pkg.assessmentType, pkg.semester, { slug: pkg.subjectSlug, level: pkg.level })}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-800"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Kembali ke daftar paket
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
          {!mounted ? (
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
                    Nilai latihan ini otomatis tersimpan di akun, jadi perkembangan ananda bisa dipantau.
                  </p>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <input
                  type="checkbox"
                  checked={secureModeEnabled}
                  onChange={(event) => setSecureModeEnabled(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
                    <Icon name="shield-check" className="h-4 w-4 text-brand-700" strokeWidth={2.2} />
                    Mode Ujian Fokus
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                    Layar dibuat penuh agar ananda fokus. Jika ananda membuka tab atau aplikasi lain,
                    akan muncul peringatan. Soal hanya bisa dikerjakan saat layar penuh menyala.
                  </span>
                </span>
              </label>

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
                  <p className="eyebrow">{pkg.isFreeAccess ? "Gratis, cukup daftar" : "Paket berbayar"}</p>
                  <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink-900">
                    {pkg.isFreeAccess ? "Daftar dulu untuk mulai" : "Buka latihan ini"}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {pkg.isFreeAccess
                      ? "Daftar akun cukup dengan nama dan PIN supaya nilai ananda terekam dan bisa dipantau orang tua."
                      : `Masuk atau daftar dengan PIN, lalu beli lewat WhatsApp. Setelah admin membukakannya, paket ${subjectName} langsung bisa dikerjakan.`}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {["Nilai tersimpan di akun", "Riwayat bisa dipantau dan diunduh", "Pembahasan setiap soal"].map((item) => (
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
                <Icon name="unlock" className="h-5 w-5" />
                {pkg.isFreeAccess ? "Daftar / Masuk untuk Mulai" : "Buka Akses"}
              </button>

            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
