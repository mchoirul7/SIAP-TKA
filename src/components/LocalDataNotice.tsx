"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconBadge } from "@/components/ui/IconBadge";
import { clearLocalData } from "@/services/local-data-service";

/**
 * Menyatakan secara terbuka apa yang disimpan dan memberi jalan keluar untuk menghapusnya.
 * Tidak ada riwayat pengerjaan yang dikumpulkan dan tidak ada data yang dikirim ke server.
 */
export function LocalDataNotice() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCleared, setIsCleared] = useState(false);

  const handleClear = () => {
    clearLocalData();
    setIsConfirming(false);
    setIsCleared(true);
  };

  return (
    <section className="mt-14 border-t border-slate-200 pt-8">
      <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
        <IconBadge name="shield-check" tone="sky" size="sm" />
        Data di perangkat ini
      </h2>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">
        Pengerjaan tidak disimpan sebagai riwayat dan tidak dikirim ke mana pun. Yang tersimpan
        hanya keadaan yang sedang berjalan di peramban ini: nama dan kelas, jawaban simulasi yang
        belum selesai, hasil terakhir, serta paket yang sudah dibuka. Semuanya dapat dihapus kapan
        saja.
      </p>

      {isCleared ? (
        <p role="status" className="mt-4 text-[15px] font-semibold text-brand-800">
          Data di perangkat ini sudah dihapus.
        </p>
      ) : isConfirming ? (
        <div className="mt-4">
          <p className="text-[15px] text-slate-700">
            Hapus nama, jawaban, hasil, dan paket yang terbuka di perangkat ini? Tindakan ini tidak
            dapat dibatalkan.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button variant="danger" onClick={handleClear}>
              Ya, Hapus Data
            </Button>
            <Button variant="secondary" onClick={() => setIsConfirming(false)}>
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" className="mt-4" onClick={() => setIsConfirming(true)}>
          Hapus Data di Perangkat Ini
        </Button>
      )}
    </section>
  );
}
