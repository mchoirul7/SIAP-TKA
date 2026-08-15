import { readValue, writeValue } from "./local-storage";
import { storageKeys } from "./storage-keys";

export interface Entitlements {
  unlockedPackageSlugs: string[];
  voucherCode: string | null;
  redeemedAt: number | null;
}

const emptyEntitlements: Entitlements = {
  unlockedPackageSlugs: [],
  voucherCode: null,
  redeemedAt: null,
};

export function readEntitlements(): Entitlements {
  const stored = readValue<Entitlements>(storageKeys.entitlements);
  if (!stored || !Array.isArray(stored.unlockedPackageSlugs)) return emptyEntitlements;
  return {
    unlockedPackageSlugs: stored.unlockedPackageSlugs,
    voucherCode: stored.voucherCode ?? null,
    redeemedAt: stored.redeemedAt ?? null,
  };
}

export function writeEntitlements(entitlements: Entitlements): void {
  writeValue(storageKeys.entitlements, entitlements);
}

export function addUnlockedPackages(slugs: string[], voucherCode: string): Entitlements {
  const current = readEntitlements();
  const merged = Array.from(new Set([...current.unlockedPackageSlugs, ...slugs]));
  const next: Entitlements = {
    unlockedPackageSlugs: merged,
    voucherCode,
    redeemedAt: Date.now(),
  };
  writeEntitlements(next);
  return next;
}
