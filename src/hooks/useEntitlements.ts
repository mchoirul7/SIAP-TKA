"use client";

import { useCallback, useEffect, useState } from "react";
import { getUnlockedPackageSlugs, syncStudent } from "@/services/entitlement-service";
import { subscribeToStorage } from "@/storage/local-storage";

/**
 * Membaca paket yang terbuka untuk murid yang sedang masuk setelah komponen
 * ter-mount, sehingga hasil render server dan klien selalu sama pada render
 * pertama. Paket gratis selalu terbuka.
 */
export function useEntitlements() {
  const [mounted, setMounted] = useState(false);
  const [unlockedSlugs, setUnlockedSlugs] = useState<string[]>([]);

  useEffect(() => {
    // Menjaga identitas array tetap sama bila isinya tidak berubah, supaya efek
    // di komponen lain tidak ikut berjalan setiap kali storage disentuh.
    const sync = () => {
      setUnlockedSlugs((current) => {
        const next = getUnlockedPackageSlugs();
        if (current.length === next.length && current.every((slug, i) => slug === next[i])) {
          return current;
        }
        return next;
      });
    };
    sync();
    setMounted(true);
    const unsubscribe = subscribeToStorage(sync);
    // Akses murid disegarkan dari server; hasilnya masuk lewat peristiwa storage.
    void syncStudent();
    return unsubscribe;
  }, []);

  const isUnlocked = useCallback(
    (content: { slug: string; isFreeAccess?: boolean }) =>
      Boolean(content.isFreeAccess) || unlockedSlugs.includes(content.slug),
    [unlockedSlugs],
  );

  return { mounted, unlockedSlugs, isUnlocked };
}
