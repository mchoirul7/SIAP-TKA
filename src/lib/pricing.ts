import type { AssessmentType, EducationLevel, PackageKind } from "@/data/types";

/**
 * Harga paket dan harga paket lengkap per mapel. Satu tempat supaya harga
 * satuan di kartu paket dan harga coret di kartu mapel selalu sejalan.
 */

/** Harga satu paket bila dibeli satuan. */
export function packagePrice(kind: PackageKind, assessmentType: AssessmentType): number {
  if (assessmentType === "tka") return kind === "tryout" ? 15000 : 7500;
  if (assessmentType === "ulangan_harian") return 5000;
  return kind === "tryout" ? 10000 : 5000;
}

/** Harga paket lengkap satu mapel ulangan harian, berapa pun jumlah paketnya. */
const UH_PRICE_PER_SUBJECT = 25000;

/** Harga normal satu mapel ulangan harian, ditampilkan sebagai harga coret. */
const UH_NORMAL_PRICE_PER_SUBJECT = 50000;

interface SubjectPackages {
  /** Kosong bila mapel belum punya paket untuk lingkup ini. */
  subject: unknown;
  packageCount: number;
  tryoutCount: number;
}

/**
 * Harga paket lengkap satu mapel. Ulangan harian Rp25.000 berapa pun jumlah
 * paketnya, dan tetap dihargai walau paketnya belum ada. TKA Rp75.000 per mapel dan jenis lain Rp25.000, hanya untuk mapel yang
 * sudah punya paket.
 */
export function fullPackagePrice(
  assessmentType: AssessmentType,
  item: SubjectPackages,
): number | null {
  if (assessmentType === "ulangan_harian") {
    return UH_PRICE_PER_SUBJECT;
  }
  if (!item.subject) return null;
  if (assessmentType === "tka") return 75000;
  return 25000;
}

/**
 * Harga coret di kartu mapel: total bila semua paketnya dibeli satuan. Ulangan
 * harian paling sedikit memakai harga normalnya, jadi selalu bercoret. Hanya
 * dikembalikan bila memang lebih mahal daripada harga paket lengkap.
 */
export function separatePackagesPrice(
  assessmentType: AssessmentType,
  item: SubjectPackages,
): number | null {
  const price = fullPackagePrice(assessmentType, item);
  if (price === null) return null;
  const total =
    item.tryoutCount * packagePrice("tryout", assessmentType) +
    (item.packageCount - item.tryoutCount) * packagePrice("latihan", assessmentType);
  const strike = assessmentType === "ulangan_harian" ? Math.max(total, UH_NORMAL_PRICE_PER_SUBJECT) : total;
  return strike > price ? strike : null;
}

/**
 * Harga All-in Akses kelas 1-2, dicoret dari total harga per mapelnya dan
 * paling sedikit dari Rp175.000 supaya harga coretnya selalu tampil.
 */
const EARLY_GRADE_ALL_ACCESS_PRICE = 100000;
const EARLY_GRADE_MIN_ORIGINAL_PRICE = 175000;

/** Harga coret All-in Akses kelas 3 SD. */
const GRADE_3_ORIGINAL_PRICE = 200000;

/** Harga All-in Akses yang dipatok per jenjang; kosong bila mengikuti total per mapel. */
function fixedAllAccessPrice(assessmentType: AssessmentType, level: EducationLevel): number | null {
  if (assessmentType === "tka") return level === "SMA" ? 165000 : 125000;
  if (assessmentType === "ulangan_harian") return 150000;
  return null;
}

/** Lama akses setelah dibeli, untuk semua jenis pembelian. */
export const ACCESS_MONTHS = 6;

/**
 * Harga All-in Akses satu jenis ujian: jumlah harga paket lengkap semua mapel
 * yang sudah dijual pada lingkup itu. Harga coretnya jumlah harga paket
 * lengkap tiap mapel, yaitu harga bila mapelnya dibeli satu per satu; ulangan
 * harian memakai harga coret tiap mapelnya.
 * TKA dipatok Rp125.000 untuk SD/SMP dan Rp165.000 untuk SMA, berapa pun
 * jumlah mapelnya, tetapi tidak pernah lebih mahal daripada total per mapelnya.
 * Ulangan harian selalu Rp150.000. Kelas 1-2 SD selalu Rp100.000 untuk semua
 * jenis ujian, dengan harga coret total harga per mapelnya.
 */
export function allAccessPrice(
  assessmentType: AssessmentType,
  level: EducationLevel,
  gradeLevel: number,
  items: SubjectPackages[],
): { price: number; originalPrice: number | null; subjectCount: number } | null {
  let price = 0;
  let original = 0;
  let subjectCount = 0;
  for (const item of items) {
    const subjectPrice = item.subject ? fullPackagePrice(assessmentType, item) : null;
    if (!subjectPrice) continue;
    price += subjectPrice;
    original +=
      assessmentType === "ulangan_harian"
        ? (separatePackagesPrice(assessmentType, item) ?? subjectPrice)
        : subjectPrice;
    subjectCount += 1;
  }
  if (subjectCount === 0) return null;
  if (level === "SD" && gradeLevel <= 2 && assessmentType !== "tka") {
    return {
      price: EARLY_GRADE_ALL_ACCESS_PRICE,
      originalPrice: Math.max(price, EARLY_GRADE_MIN_ORIGINAL_PRICE),
      subjectCount,
    };
  }
  const fixed = fixedAllAccessPrice(assessmentType, level);
  if (fixed !== null) price = assessmentType === "ulangan_harian" ? fixed : Math.min(fixed, price);
  if (level === "SD" && gradeLevel === 3 && assessmentType !== "tka") original = GRADE_3_ORIGINAL_PRICE;
  return { price, originalPrice: original > price ? original : null, subjectCount };
}

export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}
