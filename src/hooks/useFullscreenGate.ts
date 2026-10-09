"use client";

import { useCallback, useEffect, useState } from "react";
import { SECURE_EXAM_CONFIG } from "@/lib/secure-exam";

function fullscreenSupported(): boolean {
  return (
    typeof document !== "undefined" &&
    Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen)
  );
}

/**
 * Selama Mode Ujian Fokus aktif, soal hanya bisa dikerjakan dalam layar penuh.
 * `blocked` bernilai true bila layar penuh sedang mati. Peramban yang tidak
 * mendukung layar penuh (misalnya Safari di iPhone) tidak pernah diblokir.
 */
export function useFullscreenGate(enabled: boolean) {
  const [isFullscreen, setIsFullscreen] = useState(true);
  const active = enabled && SECURE_EXAM_CONFIG.enableFullscreen;

  useEffect(() => {
    if (!active || !fullscreenSupported()) return;
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [active]);

  const enter = useCallback(() => {
    if (!fullscreenSupported() || document.fullscreenElement) return;
    // Peramban bisa menolak bila tidak dipicu klik; layar blokir tetap tampil.
    void document.documentElement.requestFullscreen().catch(() => undefined);
  }, []);

  // Coba langsung saat mulai; bila ditolak, siswa menekan tombol di layar blokir.
  useEffect(() => {
    if (active) enter();
  }, [active, enter]);

  return { blocked: active && !isFullscreen, enter };
}
