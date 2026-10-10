"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { formatRupiah } from "@/lib/pricing";
import { buyAccessCodeHref, type PurchaseOptions } from "@/lib/subject-catalog";
import { redeemVoucher } from "@/services/entitlement-service";

interface OpenOptions {
  /** Paket yang sedang dilihat pengguna, dipakai untuk tautan setelah berhasil. */
  packageSlug?: string;
  packageTitle?: string;
  successHref?: string;
  requiredAccessKey?: string;
  requiredLabel?: string;
  /** Pilihan beli lewat WhatsApp; tanpa ini dialog memakai ajakan umum. */
  purchase?: PurchaseOptions;
}

interface VoucherContextValue {
  openVoucher: (options?: OpenOptions) => void;
}

const VoucherContext = createContext<VoucherContextValue | null>(null);

export function useVoucherDialog(): VoucherContextValue {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error("useVoucherDialog harus dipakai di dalam VoucherProvider.");
  }
  return context;
}

export function VoucherProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenOptions>({});
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [studentLogin, setStudentLogin] = useState<{ name: string; unlocksCurrent: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const openVoucher = useCallback((next?: OpenOptions) => {
    setOptions(next ?? {});
    setCode("");
    setError(null);
    setIsRedeemed(false);
    setStudentLogin(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    // Di layar sentuh, fokus otomatis memunculkan keyboard yang menutupi
    // pilihan beli; kursor hanya langsung diletakkan di perangkat bertetikus.
    const timer = window.matchMedia("(pointer: fine)").matches
      ? window.setTimeout(() => inputRef.current?.focus(), 20)
      : undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = await redeemVoucher(code);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    // Kode murid selalu berhasil masuk, walau paket yang sedang dilihat belum dibeli.
    if (result.studentName) {
      setStudentLogin({
        name: result.studentName,
        unlocksCurrent: !options.packageSlug || result.unlockedPackageSlugs.includes(options.packageSlug),
      });
      setError(null);
      setIsRedeemed(true);
      router.refresh();
      return;
    }

    const unlocksCurrentContent =
      !options.requiredAccessKey ||
      result.unlockedSeriesKeys.includes(options.requiredAccessKey) ||
      (options.packageSlug ? result.unlockedPackageSlugs.includes(options.packageSlug) : false);

    if (!unlocksCurrentContent) {
      setError(
        `Kode akses valid, tapi bukan untuk ${options.requiredLabel ?? "seri konten ini"}. Gunakan kode akses seri yang sesuai.`,
      );
      setIsRedeemed(false);
      return;
    }

    setError(null);
    setIsRedeemed(true);
    router.refresh();
  };

  const value = useMemo(() => ({ openVoucher }), [openVoucher]);
  const successHref =
    options.successHref ?? (options.packageSlug ? `/latihan/${options.packageSlug}` : "/#katalog-mapel");

  return (
    <VoucherContext.Provider value={value}>
      {children}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-brand-950/40"
            onClick={close}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[92vh] max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-2xl border border-slate-200 bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 shadow-raised sm:rounded-2xl sm:p-6"
          >
            {/* Penutup di pojok, bukan tombol "Batal" sebaris dengan tindakan
                utama: membatalkan bukan pilihan yang setara dengan menukarkan
                kode, dan tombol utamanya jadi memakai lebar penuh. */}
            <button
              type="button"
              onClick={close}
              aria-label="Tutup"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Icon name="close" className="h-5 w-5" strokeWidth={2.2} />
            </button>

            {isRedeemed && studentLogin ? (
              <div>
                <IconBadge name={studentLogin.unlocksCurrent ? "unlock" : "info"} tone={studentLogin.unlocksCurrent ? "emerald" : "brand"} size="lg" />
                <h2 id={titleId} className="mt-4 text-xl font-extrabold tracking-tight">
                  Selamat datang, {studentLogin.name}!
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  {studentLogin.unlocksCurrent
                    ? "Semua paket yang sudah dibeli terbuka di perangkat ini. Nanti cukup masukkan kode yang sama di perangkat lain."
                    : `Kode berhasil masuk, tapi ${options.packageTitle ?? "paket ini"} belum termasuk pembelian. Hubungi admin untuk menambahkannya ke kode ini.`}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                >
                  <Icon name={studentLogin.unlocksCurrent ? "play" : "layers"} className="h-5 w-5" />
                  {studentLogin.unlocksCurrent ? "Lanjutkan" : "Kembali"}
                </button>
              </div>
            ) : isRedeemed ? (
              <div>
                <IconBadge name="unlock" tone="emerald" size="lg" />
                <h2 id={titleId} className="mt-4 text-xl font-extrabold tracking-tight">
                  Kode akses berhasil digunakan.
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  {options.packageTitle
                    ? `Paket ${options.packageTitle} sudah terbuka bersama semua tryout dan latihan dalam seri mapel yang sama.`
                    : "Seri mapel dari kode akses ini sudah terbuka di perangkat ini."}
                </p>
                {/* "Tutup" tidak diulang di sini: silang di pojok sudah menutup dialog. */}
                <Link
                  href={successHref}
                  onClick={close}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                >
                  <Icon name="layers" className="h-5 w-5" />
                  Buka Konten
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Ikon disembunyikan di layar kecil supaya pilihan beli lebih cepat terlihat. */}
                <div className="hidden sm:block">
                  <IconBadge name="ticket" tone="brand" size="lg" />
                </div>
                <h2 id={titleId} className="pr-10 text-lg font-extrabold tracking-tight sm:mt-4 sm:pr-0 sm:text-xl">
                  Masukkan Kode Akses
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                  Kode akses membuka satu mata pelajaran dalam satu seri, termasuk tryout,
                  latihan online, hasil, dan pembahasan.
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="voucher-code"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Kode Akses
                  </label>
                  <input
                    id="voucher-code"
                    ref={inputRef}
                    value={code}
                    onChange={(event) => {
                      setCode(event.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Contoh: TKA-XXXX-2026"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? "voucher-error" : "voucher-help"}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-[15px] uppercase tracking-wide text-slate-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400"
                  />
                  {error ? (
                    <p id="voucher-error" role="alert" className="mt-2 text-sm text-rose-700">
                      {error}
                    </p>
                  ) : (
                    <p id="voucher-help" className="mt-2 text-sm text-slate-500">
                      Dapatkan kode akses melalui pembelian paket di bawah.
                    </p>
                  )}
                </div>

                <Button type="submit" className="mt-6 w-full" loading={isSubmitting}>
                  {isSubmitting ? null : <Icon name="unlock" className="h-5 w-5" />}
                  Gunakan Kode Akses
                </Button>

                {/* Jalan keluar bagi yang belum punya kode. Ditaruh di bawah kedua
                    tombol supaya tidak bersaing dengan tindakan utama dialog ini,
                    yaitu menukarkan kode yang sudah dipegang. */}
                <div className="mt-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  Belum punya kode?
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="mt-3 space-y-2.5">
                  {options.purchase ? (
                    <>
                      {options.purchase.fullHref && options.purchase.fullPrice !== null ? (
                        <PurchaseLink
                          href={options.purchase.fullHref}
                          variant="featured"
                          icon="layers"
                          badge="Paling Hemat"
                          label={`Paket Lengkap ${options.purchase.subjectName}`}
                          note="Semua latihan & tryout mapel ini"
                          price={formatRupiah(options.purchase.fullPrice)}
                        />
                      ) : null}
                      <PurchaseLink
                        href={options.purchase.singleHref}
                        variant="plain"
                        icon="list-check"
                        label={`Beli Paket Soal ${options.purchase.packageTitle}`}
                        note="Hanya membuka paket soal ini"
                        price={formatRupiah(options.purchase.singlePrice)}
                      />
                    </>
                  ) : (
                    <PurchaseLink
                      href={buyAccessCodeHref}
                      variant="featured"
                      icon="ticket"
                      label="Beli Kode Akses"
                      note="Dilayani admin lewat WhatsApp"
                    />
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </VoucherContext.Provider>
  );
}

/**
 * Pilihan beli lewat WhatsApp. Paket lengkap dibuat paling mencolok (kuning
 * keemasan "ONE") supaya pilihan yang lebih hemat yang pertama dilirik;
 * beli satuan memakai hijau WhatsApp yang lebih tenang.
 */
function PurchaseLink({
  href,
  variant,
  icon,
  label,
  note,
  price,
  badge,
}: {
  href: string;
  variant: "featured" | "plain";
  icon: IconName;
  label: string;
  note: string;
  price?: string;
  badge?: string;
}) {
  const featured = variant === "featured";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group relative flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-3.5 py-3.5 transition-all hover:-translate-y-0.5 active:translate-y-0 sm:px-4 ${
        featured
          ? "bg-gradient-to-r from-accent-300 via-accent-400 to-accent-600 text-ink-950 shadow-[0_8px_20px_-8px_rgba(253,145,1,0.7)] hover:shadow-[0_12px_24px_-8px_rgba(253,145,1,0.8)]"
          : "border border-emerald-200 bg-emerald-50 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100"
      }`}
    >
      {badge ? (
        <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-rose-500 to-brand-600 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm">
          {badge}
        </span>
      ) : null}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
          featured ? "bg-white/90 text-accent-700 shadow-sm" : "bg-emerald-500 text-white"
        }`}
      >
        <Icon name={icon} className="h-5 w-5" strokeWidth={2.1} />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block break-words text-[13px] font-extrabold leading-snug sm:text-sm">{label}</span>
        <span className={`mt-0.5 block text-[11px] font-semibold leading-snug sm:text-xs ${featured ? "text-ink-800/80" : "text-emerald-700"}`}>
          {note}
        </span>
      </span>
      {price ? (
        <span className={`shrink-0 text-[15px] font-black sm:text-base ${featured ? "text-ink-950" : "text-emerald-700"}`}>
          {price}
        </span>
      ) : null}
      <Icon
        name="arrow-right"
        className="hidden h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 min-[380px]:block"
        strokeWidth={2.4}
      />
    </a>
  );
}
