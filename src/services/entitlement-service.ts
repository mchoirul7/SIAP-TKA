import type { ContentEntitlement } from "@/data/types";
import { hasContentAccess } from "@/lib/entitlements";
import { normalizeVoucherCode, voucherErrorMessage } from "@/lib/voucher";
import { addUnlockedContent, readEntitlements } from "@/storage/entitlement-storage";
import { clearStudent, readStudent, writeStudent, type StoredStudent } from "@/storage/student-storage";

/**
 * Hak akses konten. Keputusan bisnisnya per mata pelajaran dalam satu seri.
 * Kode akses ditebus ke server, lalu hasil entitlement disimpan di perangkat untuk UI.
 */

/** Paket terbuka dari voucher ditambah paket milik murid yang sedang masuk. */
export function getUnlockedPackageSlugs(): string[] {
  const fromVouchers = readEntitlements().unlockedPackageSlugs;
  const fromStudent = readStudent()?.packageSlugs ?? [];
  return fromStudent.length === 0 ? fromVouchers : [...new Set([...fromVouchers, ...fromStudent])].sort();
}

export function getUnlockedSeriesKeys(): string[] {
  return readEntitlements().unlockedSeriesKeys;
}

export function isContentUnlocked(
  content: ContentEntitlement & { slug?: string; isFreeAccess?: boolean },
): boolean {
  const entitlements = readEntitlements();
  return (
    hasContentAccess(content, entitlements.unlockedSeriesKeys) ||
    (content.slug ? getUnlockedPackageSlugs().includes(content.slug) : false)
  );
}

export function isPackageUnlocked(slug: string, accessKey?: string): boolean {
  const entitlements = readEntitlements();
  return Boolean(
    (accessKey && entitlements.unlockedSeriesKeys.includes(accessKey)) ||
      getUnlockedPackageSlugs().includes(slug),
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
  /** Terisi bila yang dimasukkan kode murid, bukan voucher. */
  studentName?: string;
}

interface RedeemResponse {
  code: string;
  kind?: "student";
  message?: string;
  student?: StoredStudent["student"];
  unlockedSeriesKeys?: string[];
  unlockedPackageSlugs?: string[];
}

interface StudentMeResponse {
  student: StoredStudent["student"];
  unlockedPackageSlugs: string[];
}

let studentSync: Promise<void> | null = null;

/**
 * Menyegarkan akses murid dari server, sekali per muat halaman. Grant baru
 * dari admin ikut terbuka, dan sesi yang sudah dikeluarkan perangkat lain
 * dihapus dari perangkat ini.
 */
export function syncStudent(): Promise<void> {
  if (!readStudent()) return Promise.resolve();
  studentSync ??= (async () => {
    try {
      const response = await fetch("/api/student/me", { cache: "no-store" });
      if (response.status === 401) {
        clearStudent();
        return;
      }
      if (!response.ok) return;
      const payload = (await response.json()) as StudentMeResponse;
      writeStudent(payload.student, payload.unlockedPackageSlugs);
    } catch {
      // Sedang luring: pakai salinan terakhir.
    }
  })();
  return studentSync;
}

export async function logoutStudent(): Promise<void> {
  await fetch("/api/student/logout", { method: "POST" }).catch(() => undefined);
  clearStudent();
  studentSync = null;
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

    if (payload.kind === "student" && payload.student) {
      const packageSlugs = payload.unlockedPackageSlugs ?? [];
      writeStudent(payload.student, packageSlugs);
      studentSync = null;
      return {
        ok: true,
        message: payload.message ?? "Kode murid berhasil digunakan.",
        unlockedSeriesKeys: [],
        unlockedPackageSlugs: packageSlugs,
        studentName: payload.student.name,
      };
    }

    const entitlements = addUnlockedContent({
      packageSlugs: payload.unlockedPackageSlugs ?? [],
      seriesKeys: payload.unlockedSeriesKeys ?? [],
      voucherCode: payload.code,
    });

    return {
      ok: true,
      message: payload.message ?? "Kode akses berhasil digunakan.",
      unlockedSeriesKeys: entitlements.unlockedSeriesKeys,
      unlockedPackageSlugs: entitlements.unlockedPackageSlugs,
    };
  } catch {
    return {
      ok: false,
      message: "Kode akses belum dapat diproses. Coba lagi beberapa saat.",
      unlockedSeriesKeys: [],
      unlockedPackageSlugs: [],
    };
  }
}
