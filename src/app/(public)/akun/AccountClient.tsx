"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccessDialog } from "@/components/AccessDialog";
import { Icon } from "@/components/ui/Icon";
import { useStudent } from "@/hooks/useStudent";
import { clearStudent } from "@/storage/student-storage";

/** Tombol masuk untuk tamu: membuka dialog Masuk / Daftar yang sama dengan halaman paket. */
export function SignInButton() {
  const { openAccess } = useAccessDialog();
  return (
    <button
      type="button"
      onClick={() => openAccess()}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-brand-500 to-brand-700 px-6 text-sm font-black text-white shadow-[0_12px_24px_-16px_rgba(80,1,218,0.9)] transition-opacity hover:opacity-90"
    >
      <Icon name="ticket" className="h-5 w-5" />
      Masuk / Daftar
    </button>
  );
}

/** Keluar dari akun di perangkat ini; `onDark` untuk dipasang di atas pita ungu. */
export function LogoutButton({ onDark = false, label = "Keluar dari perangkat ini" }: { onDark?: boolean; label?: string }) {
  const { logout } = useStudent();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await logout();
        router.push("/");
        router.refresh();
      }}
      className={`inline-flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[13px] font-black transition-colors ${
        onDark
          ? "bg-white/15 text-white ring-1 ring-inset ring-white/40 hover:bg-white/25"
          : "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
      }`}
    >
      <Icon name="close" className="h-4 w-4" strokeWidth={2.6} />
      {label}
    </button>
  );
}

/** Server sudah tidak mengenali sesi ini (dikeluarkan dari perangkat lain): bersihkan salinan di perangkat. */
export function ClearStaleStudent() {
  useEffect(() => clearStudent(), []);
  return null;
}
