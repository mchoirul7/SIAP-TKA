"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useVoucherDialog } from "@/components/VoucherDialog";
import { Icon } from "@/components/ui/Icon";
import { useStudent } from "@/hooks/useStudent";
import { clearStudent } from "@/storage/student-storage";

/** Tombol masuk untuk tamu: membuka kotak kode akses yang sama dengan halaman paket. */
export function SignInButton() {
  const { openVoucher } = useVoucherDialog();
  return (
    <button
      type="button"
      onClick={() => openVoucher({ successHref: "/akun" })}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-brand-500 to-brand-700 px-6 text-sm font-black text-white shadow-[0_12px_24px_-16px_rgba(80,1,218,0.9)] transition-opacity hover:opacity-90"
    >
      <Icon name="ticket" className="h-5 w-5" />
      Masuk dengan Kode Murid
    </button>
  );
}

export function LogoutButton() {
  const { logout } = useStudent();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await logout();
        router.refresh();
      }}
      className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-rose-200 bg-white px-4 text-[13px] font-black text-rose-700 transition-colors hover:bg-rose-50"
    >
      <Icon name="close" className="h-4 w-4" strokeWidth={2.6} />
      Keluar dari perangkat ini
    </button>
  );
}

/** Server sudah tidak mengenali sesi ini (dikeluarkan dari perangkat lain): bersihkan salinan di perangkat. */
export function ClearStaleStudent() {
  useEffect(() => clearStudent(), []);
  return null;
}
