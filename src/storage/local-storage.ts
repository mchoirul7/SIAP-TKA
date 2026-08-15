import { STORAGE_EVENT, STORAGE_VERSION } from "./storage-keys";

/**
 * Pembungkus tipis untuk localStorage.
 *
 * Semua akses storage pada aplikasi ini melewati file ini agar:
 * - aman saat dirender di server (tidak ada window),
 * - tidak pernah melempar error bila storage penuh atau diblokir peramban,
 * - punya nomor versi sehingga data lama bisa diabaikan dengan rapi.
 */

interface Envelope<T> {
  version: number;
  data: T;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readValue<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (!parsed || typeof parsed !== "object" || parsed.version !== STORAGE_VERSION) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeValue<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    const envelope: Envelope<T> = { version: STORAGE_VERSION, data };
    window.localStorage.setItem(key, JSON.stringify(envelope));
    notifyStorageChanged();
  } catch {
    // Storage penuh atau ditolak peramban: prototype tetap berjalan tanpa menyimpan.
  }
}

export function removeValue(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
    notifyStorageChanged();
  } catch {
    // diabaikan dengan sengaja
  }
}

/** Menghapus seluruh data prototype milik pengguna di perangkat ini. */
export function clearAllValues(prefix: string): number {
  if (!isBrowser()) return 0;
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    notifyStorageChanged();
    return keys.length;
  } catch {
    return 0;
  }
}

function notifyStorageChanged(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

export function subscribeToStorage(listener: () => void): () => void {
  if (!isBrowser()) return () => undefined;
  window.addEventListener(STORAGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(STORAGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
