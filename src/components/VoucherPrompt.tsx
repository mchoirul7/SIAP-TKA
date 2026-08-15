"use client";

import { useVoucherDialog } from "@/components/VoucherDialog";

export function VoucherPrompt({
  title = "Sudah punya kode voucher?",
  description = "Masukkan kode untuk membuka latihan online dan pembahasan pada seluruh paket premium.",
  packageSlug,
  packageTitle,
  buttonLabel = "Masukkan Voucher",
}: {
  title?: string;
  description?: string;
  packageSlug?: string;
  packageTitle?: string;
  buttonLabel?: string;
}) {
  const { openVoucher } = useVoucherDialog();

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-600">{description}</p>
      <button
        type="button"
        onClick={() => openVoucher({ packageSlug, packageTitle })}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-brand-800 px-4 text-[15px] font-semibold text-white transition-colors hover:bg-brand-900"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
