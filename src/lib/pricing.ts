import type { AssessmentType, PackageKind } from "@/data/types";

/**
 * Harga paket dan harga paket lengkap per mapel. Satu tempat supaya harga
 * satuan di kartu paket dan harga coret di kartu mapel selalu sejalan.
 */

/** Harga satu paket bila dibeli satuan. */
export function packagePrice(kind: PackageKind, assessmentType: AssessmentType): number {
  if (kind === "tryout") return 10000;
  return assessmentType === "tka" ? 5000 : 2500;
}

interface SubjectPackages {
  /** Kosong bila mapel belum punya paket untuk lingkup ini. */
  subject: unknown;
  packageCount: number;
  tryoutCount: number;
}

/**
 * Harga paket lengkap satu mapel. Ulangan harian Rp2.500 per paket, dipotong
 * Rp10.000 bila paketnya lebih dari 5, dan tetap dihargai walau paketnya belum
 * ada. Jenis lain, termasuk TKA, Rp25.000 dan hanya untuk mapel yang sudah
 * punya paket.
 */
export function fullPackagePrice(assessmentType: AssessmentType, item: SubjectPackages): number | null {
  if (assessmentType === "ulangan_harian") {
    const total = 2500 * item.packageCount;
    return item.packageCount > 5 ? total - 10000 : total;
  }
  return item.subject ? 25000 : null;
}

/**
 * Harga coret di kartu mapel: total bila semua paketnya dibeli satuan. Hanya
 * dikembalikan bila memang lebih mahal daripada harga paket lengkap.
 */
export function separatePackagesPrice(assessmentType: AssessmentType, item: SubjectPackages): number | null {
  const price = fullPackagePrice(assessmentType, item);
  if (price === null) return null;
  const total =
    item.tryoutCount * packagePrice("tryout", assessmentType) +
    (item.packageCount - item.tryoutCount) * packagePrice("latihan", assessmentType);
  return total > price ? total : null;
}

export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}
