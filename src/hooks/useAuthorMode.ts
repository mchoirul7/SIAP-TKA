"use client";

import { useEffect, useState } from "react";
import { resolveAuthorMode } from "@/storage/author-mode";

/**
 * Mode penyusun dibaca setelah komponen terpasang, bukan saat render pertama,
 * supaya markah dari server dan dari peramban tetap sama dan React tidak
 * mengeluh soal hidrasi. Akibatnya alat bantunya muncul sesaat setelah halaman
 * tampil — tidak masalah, karena hanya penyusun soal yang melihatnya.
 */
export function useAuthorMode(): boolean {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    setIsOn(resolveAuthorMode(window.location.search));
  }, []);

  return isOn;
}
