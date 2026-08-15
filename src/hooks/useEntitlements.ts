"use client";

import { useCallback, useEffect, useState } from "react";
import { getUnlockedPackageSlugs } from "@/services/entitlement-service";
import { subscribeToStorage } from "@/storage/local-storage";

/**
 * Membaca hak akses paket dari localStorage setelah komponen ter-mount,
 * sehingga hasil render server dan klien selalu sama pada render pertama.
 */
export function useEntitlements() {
  const [mounted, setMounted] = useState(false);
  const [unlockedSlugs, setUnlockedSlugs] = useState<string[]>([]);

  useEffect(() => {
    // Menjaga identitas array tetap sama bila isinya tidak berubah, supaya efek
    // di komponen lain tidak ikut berjalan setiap kali storage disentuh.
    const sync = () =>
      setUnlockedSlugs((current) => {
        const next = getUnlockedPackageSlugs();
        if (current.length === next.length && current.every((slug, i) => slug === next[i])) {
          return current;
        }
        return next;
      });
    sync();
    setMounted(true);
    return subscribeToStorage(sync);
  }, []);

  const isUnlocked = useCallback(
    (slug: string, isPremium: boolean) => !isPremium || unlockedSlugs.includes(slug),
    [unlockedSlugs],
  );

  return { mounted, unlockedSlugs, isUnlocked };
}
