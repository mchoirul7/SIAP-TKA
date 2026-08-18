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
import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { shopeeVoucherUrl } from "@/lib/site";
import { redeemVoucher } from "@/services/entitlement-service";

interface OpenOptions {
  /** Paket yang sedang dilihat pengguna, dipakai untuk tautan setelah berhasil. */
  packageSlug?: string;
  packageTitle?: string;
  successHref?: string;
  requiredAccessKey?: string;
  requiredLabel?: string;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const openVoucher = useCallback((next?: OpenOptions) => {
    setOptions(next ?? {});
    setCode("");
    setError(null);
    setIsRedeemed(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
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
  const successHref = options.successHref ?? (options.packageSlug ? `/latihan/${options.packageSlug}` : "/latihan");

  return (
    <VoucherContext.Provider value={value}>
      {children}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-brand-950/40"
            onClick={close}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-md rounded-t-xl border border-slate-200 bg-white p-6 shadow-raised sm:rounded-xl"
          >
            {isRedeemed ? (
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
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={successHref}
                    onClick={close}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <Icon name="layers" className="h-5 w-5" />
                  Buka Konten
                  </Link>
                  <Button variant="secondary" onClick={close} className="sm:w-auto">
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <IconBadge name="ticket" tone="brand" size="lg" />
                <h2 id={titleId} className="mt-4 text-xl font-extrabold tracking-tight">
                  Masukkan Kode Akses
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
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
                      Kode akses dibeli lewat Shopee.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                  <Button type="submit" className="sm:flex-1" loading={isSubmitting}>
                    {isSubmitting ? null : <Icon name="unlock" className="h-5 w-5" />}
                    Gunakan Kode Akses
                  </Button>
                  <Button variant="secondary" onClick={close}>
                    Batal
                  </Button>
                </div>

                {/* Jalan keluar bagi yang belum punya kode. Ditaruh di bawah kedua
                    tombol supaya tidak bersaing dengan tindakan utama dialog ini,
                    yaitu menukarkan kode yang sudah dipegang. */}
                <a
                  href={shopeeVoucherUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent-300 bg-accent-50 px-4 py-3 text-sm font-bold text-accent-900 transition-colors hover:bg-accent-100"
                >
                  <Icon name="ticket" className="h-4 w-4" strokeWidth={2.2} />
                  Dapatkan Kode
                  <Icon name="arrow-right" className="h-4 w-4" strokeWidth={2.2} />
                </a>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </VoucherContext.Provider>
  );
}
