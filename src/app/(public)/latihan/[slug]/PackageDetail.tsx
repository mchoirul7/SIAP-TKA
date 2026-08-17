"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { StatCard } from "@/components/ui/StatCard";
import { useVoucherDialog } from "@/components/VoucherDialog";
import type { PracticePackage } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
import { accessCodePhoneDisplay, accessCodeWhatsappUrl } from "@/lib/access-code";
import { getPracticeAttempt } from "@/services/practice-service";
import { subscribeToStorage } from "@/storage/local-storage";

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
  const { mounted, isUnlocked } = useEntitlements();
  const { openVoucher } = useVoucherDialog();
  const [hasFinishedAttempt, setHasFinishedAttempt] = useState(false);
  const [hasStartedAttempt, setHasStartedAttempt] = useState(false);

  useEffect(() => {
    const sync = () => {
      const attempt = getPracticeAttempt(pkg.slug);
      setHasStartedAttempt(Boolean(attempt));
      setHasFinishedAttempt(Boolean(attempt?.finishedAt));
    };
    sync();
    return subscribeToStorage(sync);
  }, [pkg.slug]);

  const unlocked = mounted && isUnlocked(pkg);

  return (
    <div className="container-page py-12 sm:py-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div>
          <Link
            href="/latihan"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-800"
          >
            <Icon name="arrow-left" className="h-4 w-4" />
            Kembali ke paket latihan
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {unlocked ? <Badge tone="success">Terbuka</Badge> : <Badge tone="voucher">Kode Akses</Badge>}
            <span className="text-sm text-slate-500">
              {subjectName} · {pkg.seriesTitle} · {topicName}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{pkg.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{pkg.description}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              icon="list-check"
              tone="brand"
              label="Jumlah soal"
              value={pkg.questionIds.length}
            />
            <StatCard
              icon="clock"
              tone="sky"
              label="Perkiraan waktu"
              value={`± ${pkg.estimatedMinutes} menit`}
              valueClassName="text-lg"
            />
            <StatCard
              icon="chart"
              tone="violet"
              label="Tingkat"
              value={pkg.difficultyRange}
              valueClassName="text-lg"
            />
            <StatCard
              icon="compass"
              tone="amber"
              label="Subtopik"
              value={subtopicName}
              valueClassName="text-base leading-snug"
            />
          </div>

          <section className="mt-10">
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
              <IconBadge name="target" tone="emerald" size="sm" />
              Yang akan dilatih
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {pkg.skills.map((skill) => (
                <li
                  key={skill}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-[15px] leading-relaxed text-slate-700"
                >
                  <Icon
                    name="check"
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                    strokeWidth={2.4}
                  />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
              <IconBadge name="bulb" tone="violet" size="sm" />
              Cara mengerjakan
            </h2>
            <p className="mt-4 max-w-2xl rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-[15px] leading-relaxed text-slate-700">
              Latihan tidak memakai waktu ketat seperti simulasi. Kerjakan soal satu per satu,
              lalu lihat skor dan konsep yang perlu diulang di akhir. Pembahasan setiap soal dapat
              dibuka setelah latihan selesai.
            </p>
          </section>
        </div>

        {/* Panel aksi */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {!mounted ? (
            <div className="h-56 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
          ) : unlocked ? (
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-card">
              <IconBadge name="unlock" tone="emerald" size="lg" />
              <h2 className="mt-4 text-lg font-extrabold tracking-tight">Paket sudah terbuka</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                Kode akses seri {pkg.seriesTitle} membuka latihan, tryout, hasil, dan pembahasan
                untuk mapel ini.
              </p>

              <div className="mt-6 space-y-2">
                <ButtonLink href={`/latihan/${pkg.slug}/kerjakan`} size="lg" className="w-full">
                  <Icon name="play" className="h-5 w-5" />
                  {hasStartedAttempt && !hasFinishedAttempt ? "Lanjutkan Latihan" : "Mulai Latihan Online"}
                </ButtonLink>
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
                <p className="mt-5 flex items-center gap-2 border-t border-emerald-200 pt-4 text-sm text-slate-600">
                  <Icon name="chart" className="h-4 w-4 shrink-0 text-emerald-600" />
                  <Link href={`/latihan/${pkg.slug}/hasil`} className="link-underline font-semibold">
                    Lihat hasil terakhir
                  </Link>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-card">
              <IconBadge name="lock" tone="brand" size="lg" />
              <p className="eyebrow mt-4">Konten Kode Akses</p>
              <h2 className="mt-1.5 text-lg font-extrabold tracking-tight">
                Masukkan kode akses seri untuk membuka latihan ini.
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                Satu kode akses membuka semua latihan dan tryout {subjectName} dalam{" "}
                {pkg.seriesTitle}.
              </p>

              <ul className="mt-5 space-y-2 text-[15px] text-slate-700">
                {["Latihan online", "Tryout seri ini", "Pembahasan setiap soal"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Icon
                      name="check"
                      className="mt-0.5 h-5 w-5 shrink-0 text-brand-600"
                      strokeWidth={2.4}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() =>
                  openVoucher({
                    packageSlug: pkg.slug,
                    packageTitle: pkg.title,
                    requiredAccessKey: pkg.accessKey,
                    requiredLabel: `${subjectName} - ${pkg.seriesTitle}`,
                  })
                }
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-800 px-4 text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                <Icon name="ticket" className="h-5 w-5" />
                Masukkan Kode Akses
              </button>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Belum punya kode akses? Hubungi {accessCodePhoneDisplay} untuk mendapatkan akses
                layanan.
              </p>
              <a
                href={accessCodeWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                <Icon name="info" className="h-4 w-4" strokeWidth={2.2} />
                Hubungi WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
