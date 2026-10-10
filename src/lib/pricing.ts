import type { AssessmentType, EducationLevel, PackageKind } from "@/data/types";

/**
 * Harga paket dan harga paket lengkap per mapel. Satu tempat supaya harga
 * satuan di kartu paket dan harga coret di kartu mapel selalu sejalan.
 */

/** Harga satu paket bila dibeli satuan. */
export function packagePrice(kind: PackageKind, assessmentType: AssessmentType): number {
  if (assessmentType === "tka") return kind === "tryout" ? 15000 : 7500;
  if (assessmentType === "ulangan_harian") return 14500;
  return kind === "tryout" ? 10000 : 5000;
}

/** Harga paket lengkap satu mapel ulangan harian di semua jenjang, berapa pun jumlah paketnya. */
const UH_PRICE_PER_SUBJECT = 15000;

interface SubjectPackages {
  /** Kosong bila mapel belum punya paket untuk lingkup ini. */
  subject: unknown;
  packageCount: number;
  tryoutCount: number;
}

/**
 * Harga paket lengkap satu mapel. Ulangan harian Rp15.000 di semua jenjang
 * berapa pun jumlah paketnya, dan tetap dihargai walau paketnya belum ada.
 * TKA Rp75.000 per mapel dan jenis lain Rp25.000, hanya untuk mapel yang
 * sudah punya paket.
 */
export function fullPackagePrice(
  assessmentType: AssessmentType,
  item: SubjectPackages,
): number | null {
  if (assessmentType === "ulangan_harian") return UH_PRICE_PER_SUBJECT;
  if (!item.subject) return null;
  if (assessmentType === "tka") return 75000;
  return 25000;
}

/**
 * Harga coret di kartu mapel: total bila semua paketnya dibeli satuan. Hanya
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
  return total > price ? total : null;
}

/**
 * Harga All-in Akses kelas 1-2, dicoret dari total harga per mapelnya dan
 * paling sedikit dari Rp175.000 supaya harga coretnya selalu tampil.
 */
const EARLY_GRADE_ALL_ACCESS_PRICE = 100000;
const EARLY_GRADE_MIN_ORIGINAL_PRICE = 175000;

/** Harga All-in Akses ulangan harian di semua jenjang. */
const UH_ALL_ACCESS_PRICE = 75000;

/** Harga coret All-in Akses kelas 3 SD. */
const GRADE_3_ORIGINAL_PRICE = 200000;

/** Harga All-in Akses yang dipatok per jenjang; kosong bila mengikuti total per mapel. */
function fixedAllAccessPrice(assessmentType: AssessmentType, level: EducationLevel): number | null {
  if (assessmentType === "tka") return level === "SMA" ? 165000 : 125000;
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
 * Kelas 1-2 SD selalu Rp100.000 untuk jenis ujian selain TKA, dengan harga
 * coret total harga per mapelnya. Ulangan harian Rp75.000 di semua jenjang
 * untuk seluruh mapel kelas itu, dicoret dari Rp15.000 dikali jumlah mapelnya,
 * dan tidak pernah lebih mahal daripada total itu.
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
  if (assessmentType === "ulangan_harian") {
    // All-in membuka semua mapel kelas itu, termasuk yang paketnya masih disusun,
    // jadi harga coretnya Rp15.000 dikali seluruh mapel di katalog.
    const total = items.length * UH_PRICE_PER_SUBJECT;
    const allIn = Math.min(UH_ALL_ACCESS_PRICE, total);
    return { price: allIn, originalPrice: total > allIn ? total : null, subjectCount: items.length };
  }
  if (level === "SD" && gradeLevel <= 2 && assessmentType !== "tka") {
    return {
      price: EARLY_GRADE_ALL_ACCESS_PRICE,
      originalPrice: Math.max(price, EARLY_GRADE_MIN_ORIGINAL_PRICE),
      subjectCount,
    };
  }
  const fixed = fixedAllAccessPrice(assessmentType, level);
  if (fixed !== null) price = Math.min(fixed, price);
  if (level === "SD" && gradeLevel === 3 && assessmentType !== "tka") original = GRADE_3_ORIGINAL_PRICE;
  return { price, originalPrice: original > price ? original : null, subjectCount };
}

export function formatRupiah(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}
