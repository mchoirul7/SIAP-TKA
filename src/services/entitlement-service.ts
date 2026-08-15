import { practicePackages } from "@/data/practicePackages";
import { validateVoucherCode } from "@/lib/voucher";
import { addUnlockedPackages, readEntitlements } from "@/storage/entitlement-storage";

/**
 * Hak akses paket latihan. Untuk prototype seluruhnya di perangkat pengguna.
 * Nanti diganti tabel entitlement + redeem voucher di server.
 */

export function getUnlockedPackageSlugs(): string[] {
  return readEntitlements().unlockedPackageSlugs;
}

export function isPackageUnlocked(slug: string): boolean {
  const pkg = practicePackages.find((item) => item.slug === slug);
  if (!pkg) return false;
  if (!pkg.isPremium) return true;
  return readEntitlements().unlockedPackageSlugs.includes(slug);
}

export function getRedeemedVoucherCode(): string | null {
  return readEntitlements().voucherCode;
}

export interface RedeemResult {
  ok: boolean;
  message: string;
  unlockedPackageSlugs: string[];
}

export function redeemVoucher(code: string): RedeemResult {
  const validation = validateVoucherCode(code);

  if (!validation.valid) {
    return { ok: false, message: validation.message, unlockedPackageSlugs: [] };
  }

  const entitlements = addUnlockedPackages(validation.packageSlugs, validation.code);
  return {
    ok: true,
    message: validation.message,
    unlockedPackageSlugs: entitlements.unlockedPackageSlugs,
  };
}
