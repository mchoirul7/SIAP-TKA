export function normalizeVoucherCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function voucherErrorMessage(code: string): string {
  if (code === "VOUCHER_EXPIRED") return "Kode voucher sudah kedaluwarsa.";
  if (code === "VOUCHER_EXHAUSTED") return "Kuota penggunaan kode voucher sudah habis.";
  if (code === "VOUCHER_EMPTY") return "Masukkan kode voucher terlebih dahulu.";
  return "Kode voucher tidak valid. Periksa kembali kode yang diberikan.";
}
