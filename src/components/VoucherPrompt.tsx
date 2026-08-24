"use client";

import { Icon } from "@/components/ui/Icon";
import { IconBadge } from "@/components/ui/IconBadge";
import { useVoucherDialog } from "@/components/VoucherDialog";

export function VoucherPrompt({
  title = "Sudah punya kode akses?",
  description = "Masukkan kode untuk membuka tryout, latihan online, hasil, dan pembahasan.",
  packageSlug,
  packageTitle,
  buttonLabel = "Masukkan Kode Akses",
}: {
  title?: string;
  description?: string;
  packageSlug?: string;
  packageTitle?: string;
  buttonLabel?: string;
}) {
  const { openVoucher } = useVoucherDialog();

  return (
    <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-4">
        <IconBadge name="ticket" tone="brand" size="lg" />
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-600">{description}</p>
          <button
            type="button"
            onClick={() => openVoucher({ packageSlug, packageTitle })}
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-800 px-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
          >
            <Icon name="unlock" className="h-4 w-4" strokeWidth={2.2} />
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
