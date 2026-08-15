"use client";

import { useRouter } from "next/navigation";
import { useLinkStatus } from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

/**
 * Umpan balik saat berpindah halaman.
 *
 * Tanpa ini, satu-satunya tanda bahwa aplikasi sedang bekerja adalah indikator
 * kecil bawaan Next.js di pojok layar — mudah terlewat, sehingga halaman terasa
 * lambat dan tombol sering ditekan berulang kali.
 *
 * Yang ditambahkan: bilah kemajuan di tepi atas, dan lapisan tak terlihat yang
 * menahan klik selama perpindahan berlangsung supaya tidak ada aksi kedua yang
 * menumpuk sebelum yang pertama selesai.
 */

interface NavigationState {
  isNavigating: boolean;
  begin: () => void;
  end: () => void;
}

const NavigationContext = createContext<NavigationState>({
  isNavigating: false,
  begin: () => undefined,
  end: () => undefined,
});

export function useNavigationState(): NavigationState {
  return useContext(NavigationContext);
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  // Dihitung, bukan boolean: beberapa tautan dapat tertunda bersamaan.
  const [pending, setPending] = useState(0);

  const begin = useCallback(() => setPending((n) => n + 1), []);
  const end = useCallback(() => setPending((n) => Math.max(0, n - 1)), []);

  const value = useMemo(
    () => ({ isNavigating: pending > 0, begin, end }),
    [pending, begin, end],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
      {pending > 0 ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 overflow-hidden bg-brand-100"
          >
            <div className="nav-progress-bar h-full w-1/3 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-400" />
          </div>
          {/* Menahan klik berikutnya sampai perpindahan selesai. */}
          <div className="fixed inset-0 z-[55] cursor-wait" aria-hidden="true" />
        </>
      ) : null}
      <span role="status" aria-live="polite" className="sr-only">
        {pending > 0 ? "Memuat halaman" : ""}
      </span>
    </NavigationContext.Provider>
  );
}

/**
 * Melaporkan status tertunda sebuah `<Link>` ke provider, sekaligus menampilkan
 * pemutar kecil di dalam tombolnya. Harus dirender sebagai anak dari `<Link>`.
 */
export function LinkPending({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  const { begin, end } = useNavigationState();

  useEffect(() => {
    if (!pending) return;
    begin();
    return end;
  }, [pending, begin, end]);

  if (!pending) return null;
  return <Spinner className={className} />;
}

/** Perpindahan halaman lewat kode, dengan status tertunda yang sama. */
export function useNavigate() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { begin, end } = useNavigationState();

  useEffect(() => {
    if (!isPending) return;
    begin();
    return end;
  }, [isPending, begin, end]);

  const navigate = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      startTransition(() => {
        if (options?.replace) router.replace(href);
        else router.push(href);
      });
    },
    [router],
  );

  return { navigate, isPending };
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={["h-4 w-4 shrink-0 animate-spin", className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
