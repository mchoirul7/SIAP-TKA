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
import { useStudent } from "@/hooks/useStudent";
import { useStudyContext } from "@/hooks/useStudyContext";
import { formatRupiah } from "@/lib/pricing";
import { studyContextShortLabel } from "@/lib/study-context";
import { buyAccessCodeHref, type PurchaseOptions } from "@/lib/subject-catalog";
import { loginWithPin, registerStudentAccount } from "@/services/entitlement-service";

/**
 * Dialog akses paket berbayar.
 *
 * - Belum masuk: tab "Sudah punya akun" (PIN) dan "Daftar baru" (nama + PIN).
 * - Sudah masuk tapi paketnya belum dibeli: pilihan beli lewat WhatsApp. Pesan
 *   WhatsApp menyebut nama akun, lalu admin membukakan paketnya ke akun itu
 *   dan paket muncul di Latihan Saya.
 */

interface OpenOptions {
  /** Paket yang sedang dilihat pengguna. */
  packageSlug?: string;
  packageTitle?: string;
  /** Tujuan tombol "Lanjutkan" setelah berhasil masuk. */
  successHref?: string;
  /** Pilihan beli lewat WhatsApp; tanpa ini dialog memakai ajakan umum. */
  purchase?: PurchaseOptions;
}

interface AccessContextValue {
  openAccess: (options?: OpenOptions) => void;
}

const AccessContext = createContext<AccessContextValue | null>(null);

export function useAccessDialog(): AccessContextValue {
  const context = useContext(AccessContext);
  if (!context) throw new Error("useAccessDialog harus dipakai di dalam AccessProvider.");
  return context;
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { student } = useStudent();
  const { context: studyContext } = useStudyContext();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenOptions>({});
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [pin, setPin] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPin, setRegisterPin] = useState("");
  const [registerPinRepeat, setRegisterPinRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [welcome, setWelcome] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const openAccess = useCallback((next?: OpenOptions) => {
    setOptions(next ?? {});
    setPin("");
    setRegisterPin("");
    setRegisterPinRepeat("");
    setError(null);
    setNotice(null);
    setWelcome(null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    // Di layar sentuh, fokus otomatis memunculkan keyboard yang menutupi isi
    // dialog; kursor hanya langsung diletakkan di perangkat bertetikus.
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

  /** Setelah masuk atau daftar: lanjut bila paketnya sudah dimiliki, atau tampilkan pilihan beli. */
  const finishSignIn = (name: string, unlocked: string[]) => {
    setError(null);
    router.refresh();
    if (options.packageSlug && !unlocked.includes(options.packageSlug)) {
      setNotice(`Berhasil masuk sebagai ${name}.`);
      return;
    }
    setWelcome(name);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(pin)) return setError("PIN harus 6 angka.");
    setIsSubmitting(true);
    const result = await loginWithPin(pin);
    setIsSubmitting(false);
    if (!result.ok) return setError(result.message);
    finishSignIn(result.studentName ?? "", result.unlockedPackageSlugs);
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (registerName.trim().length < 2) return setError("Isi nama murid terlebih dahulu.");
    if (!/^\d{6}$/.test(registerPin)) return setError("PIN harus 6 angka.");
    if (registerPin !== registerPinRepeat) return setError("Kedua PIN belum sama. Ketik ulang PIN yang sama.");
    if (!studyContext) return setError("Pilih jenjang dan kelas murid dulu di menu kelas bagian atas.");
    setIsSubmitting(true);
    const result = await registerStudentAccount({
      name: registerName.trim(),
      pin: registerPin,
      level: studyContext.level,
      gradeLevel: studyContext.grade,
    });
    setIsSubmitting(false);
    if (!result.ok) return setError(result.message);
    finishSignIn(result.studentName ?? registerName.trim(), result.unlockedPackageSlugs);
  };

  const value = useMemo(() => ({ openAccess }), [openAccess]);
  const title = welcome
    ? `Selamat datang, ${welcome}!`
    : student
      ? "Buka Paket Ini"
      : authMode === "register"
        ? "Daftar Akun Murid"
        : "Masuk Akun Murid";

  return (
    <AccessContext.Provider value={value}>
      {children}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-brand-950/40" onClick={close} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative max-h-[92vh] max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-2xl border border-slate-200 bg-white px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 shadow-raised sm:rounded-2xl sm:p-6"
          >
            {/* Penutup di pojok supaya tombol utama memakai lebar penuh. */}
            <button
              type="button"
              onClick={close}
              aria-label="Tutup"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <Icon name="close" className="h-5 w-5" strokeWidth={2.2} />
            </button>

            <div className="hidden sm:block">
              <IconBadge name={welcome ? "unlock" : student ? "layers" : "cap"} tone={welcome ? "emerald" : "brand"} size="lg" />
            </div>
            <h2 id={titleId} className="pr-10 text-lg font-extrabold tracking-tight sm:mt-4 sm:pr-0 sm:text-xl">
              {title}
            </h2>

            {welcome ? (
              <>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  Paket yang sudah dibeli ada di Latihan Saya. Di HP atau laptop lain cukup masuk dengan PIN yang sama.
                </p>
                <Link
                  href={options.successHref ?? "/latihan-saya"}
                  onClick={close}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                >
                  <Icon name="play" className="h-5 w-5" />
                  Lanjutkan
                </Link>
              </>
            ) : student ? (
              <>
                {notice ? (
                  <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
                    {notice}
                  </p>
                ) : null}
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                  {options.packageTitle ? `${options.packageTitle} belum ada di akun ${student.name}. ` : ""}
                  Beli lewat WhatsApp, lalu admin membukakan paketnya ke akun ini. Setelah itu paket muncul di Latihan Saya
                  dan bisa langsung dikerjakan.
                </p>
                <PurchaseChoices purchase={options.purchase} accountName={student.name} />
              </>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist">
                  {(["register", "login"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      role="tab"
                      aria-selected={authMode === mode}
                      onClick={() => {
                        setAuthMode(mode);
                        setError(null);
                      }}
                      className={`h-10 rounded-lg text-sm font-black transition-colors ${
                        authMode === mode ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {mode === "login" ? "Sudah punya akun" : "Daftar baru"}
                    </button>
                  ))}
                </div>

                {authMode === "login" ? (
                  <form onSubmit={handleLogin}>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      Masukkan PIN 6 angka yang dibuat saat mendaftar.
                    </p>
                    <PinInput
                      id="login-pin"
                      inputRef={inputRef}
                      label="PIN"
                      value={pin}
                      onChange={(next) => {
                        setPin(next);
                        if (error) setError(null);
                      }}
                    />
                    <FormError error={error} />
                    <Button type="submit" className="mt-5 w-full" loading={isSubmitting}>
                      {isSubmitting ? null : <Icon name="unlock" className="h-5 w-5" />}
                      Masuk
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister}>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">
                      Cukup nama murid dan PIN 6 angka. PIN dipakai untuk masuk lagi di HP atau laptop lain, jadi simpan
                      baik-baik dan jangan pakai angka mudah seperti 123456 atau tanggal lahir.
                    </p>
                    <label htmlFor="register-name" className="mt-4 block text-sm font-semibold text-slate-800">
                      Nama murid
                    </label>
                    <input
                      id="register-name"
                      ref={inputRef}
                      value={registerName}
                      onChange={(event) => {
                        setRegisterName(event.target.value);
                        if (error) setError(null);
                      }}
                      autoComplete="name"
                      placeholder="Nama lengkap murid"
                      className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-[15px] text-slate-900 placeholder:text-slate-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <PinInput
                        id="register-pin"
                        label="Buat PIN"
                        value={registerPin}
                        onChange={(next) => {
                          setRegisterPin(next);
                          if (error) setError(null);
                        }}
                      />
                      <PinInput
                        id="register-pin-repeat"
                        label="Ulangi PIN"
                        value={registerPinRepeat}
                        onChange={(next) => {
                          setRegisterPinRepeat(next);
                          if (error) setError(null);
                        }}
                      />
                    </div>
                    <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-[13px] font-semibold text-slate-600">
                      Kelas: {studyContext ? studyContextShortLabel(studyContext) : "belum dipilih"} (ikut kelas yang dipilih di
                      menu atas)
                    </p>
                    <FormError error={error} />
                    <Button type="submit" className="mt-5 w-full" loading={isSubmitting}>
                      {isSubmitting ? null : <Icon name="cap" className="h-5 w-5" />}
                      Daftar dan Masuk
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}
    </AccessContext.Provider>
  );
}

/** Pilihan beli: paket lengkap mapel (paling hemat) dan paket satuan, atau ajakan umum. */
function PurchaseChoices({ purchase, accountName }: { purchase?: PurchaseOptions; accountName: string }) {
  return (
    <div className="mt-5 space-y-2.5">
      {purchase ? (
        <>
          {purchase.fullHref && purchase.fullPrice !== null ? (
            <PurchaseLink
              href={withAccountName(purchase.fullHref, accountName)}
              variant="featured"
              icon="layers"
              badge="Paling Hemat"
              label={`Paket Lengkap ${purchase.subjectName}`}
              note="Semua latihan & tryout mapel ini"
              price={formatRupiah(purchase.fullPrice)}
            />
          ) : null}
          <PurchaseLink
            href={withAccountName(purchase.singleHref, accountName)}
            variant="plain"
            icon="list-check"
            label={`Beli Paket Soal ${purchase.packageTitle}`}
            note="Hanya membuka paket soal ini"
            price={formatRupiah(purchase.singlePrice)}
          />
        </>
      ) : (
        <PurchaseLink
          href={withAccountName(buyAccessCodeHref, accountName)}
          variant="featured"
          icon="whatsapp"
          label="Beli Paket"
          note="Dilayani admin lewat WhatsApp"
        />
      )}
    </div>
  );
}

function FormError({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="mt-2 text-sm text-rose-700">
      {error}
    </p>
  ) : null;
}

/** Isian PIN 6 angka: papan angka di HP, angka disembunyikan seperti kata sandi. */
function PinInput({
  id,
  label,
  value,
  onChange,
  inputRef,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div className="mt-4">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="••••••"
        className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 text-center text-[20px] tracking-[0.5em] text-slate-900 placeholder:text-slate-300"
      />
    </div>
  );
}

/** Pesan WhatsApp pembelian ikut menyebut nama akun, supaya admin tahu akun mana yang dibukakan. */
function withAccountName(href: string, name: string): string {
  try {
    const url = new URL(href);
    url.searchParams.set("text", `${url.searchParams.get("text") ?? ""}\nNama akun murid: ${name}`);
    return url.toString();
  } catch {
    return href;
  }
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
