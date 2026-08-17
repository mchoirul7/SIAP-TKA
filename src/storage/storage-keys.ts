export const STORAGE_PREFIX = "siaptka";

const PREFIX = STORAGE_PREFIX;

export const storageKeys = {
  profile: `${PREFIX}:profile`,
  level: `${PREFIX}:level`,
  entitlements: `${PREFIX}:entitlements`,
  authorMode: `${PREFIX}:mode-penyusun`,
  tryoutAttempt: (tryoutSlug: string) => `${PREFIX}:tryout-attempt:${tryoutSlug}`,
  practiceAttempt: (packageSlug: string) => `${PREFIX}:practice-attempt:${packageSlug}`,
} as const;

/** Dinaikkan bila bentuk data berubah, agar data lama diabaikan tanpa membuat halaman error. */
export const STORAGE_VERSION = 1;

/** Peristiwa internal supaya beberapa komponen dapat menyegarkan diri setelah storage berubah. */
export const STORAGE_EVENT = "siaptka:storage-changed";
