"use client";

import Link from "next/link";
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
import { site } from "@/lib/site";
import { redeemVoucher } from "@/services/entitlement-service";

interface OpenOptions {
  /** Paket yang sedang dilihat pengguna, dipakai untuk tautan setelah berhasil. */
  packageSlug?: string;
  packageTitle?: string;
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
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenOptions>({});
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = redeemVoucher(code);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    setIsRedeemed(true);
  };

  const value = useMemo(() => ({ openVoucher }), [openVoucher]);
  const successHref = options.packageSlug ? `/latihan/${options.packageSlug}` : "/latihan";

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
                <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                  Voucher berhasil digunakan.
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  {options.packageTitle
                    ? `Paket ${options.packageTitle} sudah terbuka, bersama paket latihan Matematika SD lainnya.`
                    : "Seluruh paket latihan Matematika SD kini terbuka di perangkat ini."}
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={successHref}
                    onClick={close}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-brand-800 px-4 text-[15px] font-semibold text-white transition-colors hover:bg-brand-900"
                  >
                    Buka Paket Latihan
                  </Link>
                  <Button variant="secondary" onClick={close} className="sm:w-auto">
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                  Masukkan Voucher
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  Kode voucher diberikan bersama paket latihan yang dibeli. Satu kode membuka
                  latihan online dan pembahasan.
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="voucher-code"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Kode Voucher
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
                      Untuk mencoba prototype ini, gunakan kode{" "}
                      <span className="font-semibold text-slate-700">{site.demoVoucherCode}</span>.
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                  <Button type="submit" className="sm:flex-1">
                    Gunakan Voucher
                  </Button>
                  <Button variant="secondary" onClick={close}>
                    Batal
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </VoucherContext.Provider>
  );
}
