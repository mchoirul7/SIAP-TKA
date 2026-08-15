import { readValue, writeValue } from "./local-storage";
import { storageKeys } from "./storage-keys";

export interface Entitlements {
  unlockedSeriesKeys: string[];
  unlockedPackageSlugs: string[];
  voucherCodes: string[];
  voucherCode: string | null;
  redeemedAt: number | null;
}

const emptyEntitlements: Entitlements = {
  unlockedSeriesKeys: [],
  unlockedPackageSlugs: [],
  voucherCodes: [],
  voucherCode: null,
  redeemedAt: null,
};

export function readEntitlements(): Entitlements {
  const stored = readValue<Entitlements>(storageKeys.entitlements);
  if (!stored || !Array.isArray(stored.unlockedPackageSlugs)) return emptyEntitlements;
  const voucherCodes = Array.isArray(stored.voucherCodes)
    ? stored.voucherCodes
    : stored.voucherCode
      ? [stored.voucherCode]
      : [];
  return {
    unlockedSeriesKeys: Array.isArray(stored.unlockedSeriesKeys) ? stored.unlockedSeriesKeys : [],
    unlockedPackageSlugs: stored.unlockedPackageSlugs,
    voucherCodes,
    voucherCode: stored.voucherCode ?? null,
    redeemedAt: stored.redeemedAt ?? null,
  };
}

export function writeEntitlements(entitlements: Entitlements): void {
  writeValue(storageKeys.entitlements, entitlements);
}

export function addUnlockedContent({
  packageSlugs,
  seriesKeys,
  voucherCode,
}: {
  packageSlugs: string[];
  seriesKeys: string[];
  voucherCode: string;
}): Entitlements {
  const current = readEntitlements();
  const mergedPackages = Array.from(new Set([...current.unlockedPackageSlugs, ...packageSlugs]));
  const mergedSeries = Array.from(new Set([...current.unlockedSeriesKeys, ...seriesKeys]));
  const voucherCodes = Array.from(new Set([...current.voucherCodes, voucherCode]));
  const next: Entitlements = {
    unlockedSeriesKeys: mergedSeries,
    unlockedPackageSlugs: mergedPackages,
    voucherCodes,
    voucherCode,
    redeemedAt: Date.now(),
  };
  writeEntitlements(next);
  return next;
}

export function addUnlockedPackages(slugs: string[], voucherCode: string): Entitlements {
  return addUnlockedContent({ packageSlugs: slugs, seriesKeys: [], voucherCode });
}
