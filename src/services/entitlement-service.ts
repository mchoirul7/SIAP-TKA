import type { ContentEntitlement } from "@/data/types";
import { hasContentAccess } from "@/lib/entitlements";
import { normalizeVoucherCode, voucherErrorMessage } from "@/lib/voucher";
import { addUnlockedContent, readEntitlements } from "@/storage/entitlement-storage";

/**
 * Hak akses konten. Keputusan bisnisnya per mata pelajaran dalam satu seri.
 * Voucher ditebus ke server, lalu hasil entitlement disimpan di perangkat untuk UI.
 */

export function getUnlockedPackageSlugs(): string[] {
  return readEntitlements().unlockedPackageSlugs;
}

export function getUnlockedSeriesKeys(): string[] {
  return readEntitlements().unlockedSeriesKeys;
}

export function isContentUnlocked(content: ContentEntitlement & { slug?: string }): boolean {
  const entitlements = readEntitlements();
  return (
    hasContentAccess(content, entitlements.unlockedSeriesKeys) ||
    (content.slug ? entitlements.unlockedPackageSlugs.includes(content.slug) : false)
  );
}

export function isPackageUnlocked(slug: string, accessKey?: string): boolean {
  const entitlements = readEntitlements();
  return Boolean(
    (accessKey && entitlements.unlockedSeriesKeys.includes(accessKey)) ||
      entitlements.unlockedPackageSlugs.includes(slug),
  );
}

export function getRedeemedVoucherCode(): string | null {
  return readEntitlements().voucherCode;
}

export interface RedeemResult {
  ok: boolean;
  message: string;
  unlockedSeriesKeys: string[];
  unlockedPackageSlugs: string[];
}

interface RedeemResponse {
  code: string;
  message?: string;
  unlockedSeriesKeys?: string[];
  unlockedPackageSlugs?: string[];
}

export async function redeemVoucher(input: string): Promise<RedeemResult> {
  const code = normalizeVoucherCode(input);
  if (!code) {
    return {
      ok: false,
      message: voucherErrorMessage("VOUCHER_EMPTY"),
      unlockedSeriesKeys: [],
      unlockedPackageSlugs: [],
    };
  }

  try {
    const response = await fetch("/api/voucher/redeem", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const payload = (await response.json()) as RedeemResponse;

    if (!response.ok) {
      return {
        ok: false,
        message: payload.message ?? voucherErrorMessage(payload.code),
        unlockedSeriesKeys: [],
        unlockedPackageSlugs: [],
      };
    }

    const entitlements = addUnlockedContent({
      packageSlugs: payload.unlockedPackageSlugs ?? [],
      seriesKeys: payload.unlockedSeriesKeys ?? [],
      voucherCode: payload.code,
    });

    return {
      ok: true,
      message: payload.message ?? "Voucher berhasil digunakan.",
      unlockedSeriesKeys: entitlements.unlockedSeriesKeys,
      unlockedPackageSlugs: entitlements.unlockedPackageSlugs,
    };
  } catch {
    return {
      ok: false,
      message: "Voucher belum dapat diproses. Coba lagi beberapa saat.",
      unlockedSeriesKeys: [],
      unlockedPackageSlugs: [],
    };
  }
}
