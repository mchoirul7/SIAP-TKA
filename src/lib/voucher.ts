export function normalizeVoucherCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function voucherErrorMessage(code: string): string {
  if (code === "VOUCHER_EXPIRED") return "Kode akses sudah kedaluwarsa.";
  if (code === "VOUCHER_EXHAUSTED") return "Kuota penggunaan kode akses sudah habis.";
  if (code === "VOUCHER_EMPTY") return "Masukkan kode akses terlebih dahulu.";
  return "Kode akses tidak valid. Periksa kembali kode yang diberikan.";
}
