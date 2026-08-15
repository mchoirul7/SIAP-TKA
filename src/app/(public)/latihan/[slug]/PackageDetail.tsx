"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { useVoucherDialog } from "@/components/VoucherDialog";
import type { PracticePackage } from "@/data/types";
import { useEntitlements } from "@/hooks/useEntitlements";
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

  const unlocked = mounted && isUnlocked(pkg.slug, pkg.isPremium);

  return (
    <div className="container-page py-12 sm:py-14">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div>
          <Link href="/latihan" className="text-sm text-slate-500 hover:text-brand-800">
            ← Kembali ke paket latihan
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {pkg.isPremium ? (
              unlocked ? (
                <Badge tone="free">Terbuka</Badge>
              ) : (
                <Badge tone="premium">Premium</Badge>
              )
            ) : (
              <Badge tone="free">Gratis</Badge>
            )}
            <span className="text-sm text-slate-500">
              {subjectName} · {topicName}
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{pkg.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{pkg.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-slate-200 py-6 sm:grid-cols-4">
            <div>
              <dt className="text-sm text-slate-500">Jumlah soal</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink-900">
                {pkg.questionIds.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Perkiraan waktu</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink-900">
                ± {pkg.estimatedMinutes} menit
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Tingkat</dt>
              <dd className="mt-0.5 text-lg font-semibold text-ink-900">{pkg.difficultyRange}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Subtopik</dt>
              <dd className="mt-0.5 text-lg font-semibold text-ink-900">{subtopicName}</dd>
            </div>
          </dl>

          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">Yang akan dilatih</h2>
            <ul className="mt-4 space-y-2.5">
              {pkg.skills.map((skill) => (
                <li key={skill} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">Cara mengerjakan</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
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
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold tracking-tight">
                {pkg.isPremium ? "Paket sudah terbuka" : "Paket contoh gratis"}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                Latihan online dan pembahasan tersedia untuk paket ini.
              </p>

              <div className="mt-6 space-y-2">
                <ButtonLink href={`/latihan/${pkg.slug}/kerjakan`} size="lg" className="w-full">
                  {hasStartedAttempt && !hasFinishedAttempt ? "Lanjutkan Latihan" : "Mulai Latihan Online"}
                </ButtonLink>
                <ButtonLink
                  href={`/latihan/${pkg.slug}/pembahasan`}
                  variant="secondary"
                  className="w-full"
                >
                  Lihat Pembahasan
                </ButtonLink>
              </div>

              {hasFinishedAttempt ? (
                <p className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
                  Latihan ini pernah diselesaikan.{" "}
                  <Link href={`/latihan/${pkg.slug}/hasil`} className="link-underline font-semibold">
                    Lihat hasil terakhir
                  </Link>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-6">
              <p className="eyebrow">Paket Premium</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight">
                Masukkan voucher untuk membuka latihan ini.
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                Satu kode voucher membuka latihan online beserta pembahasannya.
              </p>

              <ul className="mt-5 space-y-2 text-[15px] text-slate-700">
                {["Latihan online", "Pembahasan setiap soal", "Dapat dikerjakan ulang"].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => openVoucher({ packageSlug: pkg.slug, packageTitle: pkg.title })}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand-800 px-4 text-base font-semibold text-white transition-colors hover:bg-brand-900"
              >
                Masukkan Voucher
              </button>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Belum punya voucher? Kerjakan{" "}
                <Link href="/tryout" className="link-underline">
                  simulasi gratis
                </Link>{" "}
                terlebih dahulu untuk melihat paket mana yang paling dibutuhkan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
