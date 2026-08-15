import { practicePackages } from "@/data/practicePackages";
import { site } from "./site";

/**
 * Validasi voucher versi prototype: satu kode contoh, dicek di sisi klien.
 * Ketika backend tersedia, isi fungsi ini diganti panggilan server action /
 * tabel voucher; bentuk masukan dan keluarannya tetap sama.
 */

export interface VoucherValidationSuccess {
  valid: true;
  code: string;
  /** Slug paket yang dibuka voucher ini. */
  packageSlugs: string[];
  message: string;
}

export interface VoucherValidationFailure {
  valid: false;
  message: string;
}

export type VoucherValidation = VoucherValidationSuccess | VoucherValidationFailure;

export function normalizeVoucherCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function validateVoucherCode(input: string): VoucherValidation {
  const code = normalizeVoucherCode(input);

  if (code.length === 0) {
    return { valid: false, message: "Masukkan kode voucher terlebih dahulu." };
  }

  if (code !== site.demoVoucherCode) {
    return {
      valid: false,
      message: "Kode voucher tidak valid. Periksa kembali kode yang diberikan.",
    };
  }

  return {
    valid: true,
    code,
    packageSlugs: practicePackages.filter((p) => p.isPremium).map((p) => p.slug),
    message: "Voucher berhasil digunakan.",
  };
}
