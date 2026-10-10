"use client";

import { useCallback, useEffect, useState } from "react";
import { getUnlockedPackageSlugs, syncStudent } from "@/services/entitlement-service";
import { subscribeToStorage } from "@/storage/local-storage";
import { readStudent } from "@/storage/student-storage";

/**
 * Membaca akses murid yang sedang masuk setelah komponen ter-mount, sehingga
 * hasil render server dan klien selalu sama pada render pertama. Semua paket
 * butuh akun; paket gratis terbuka begitu murid masuk, paket berbayar setelah
 * dibukakan admin.
 */
export function useEntitlements() {
  const [mounted, setMounted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [unlockedSlugs, setUnlockedSlugs] = useState<string[]>([]);

  useEffect(() => {
    // Menjaga identitas array tetap sama bila isinya tidak berubah, supaya efek
    // di komponen lain tidak ikut berjalan setiap kali storage disentuh.
    const sync = () => {
      setSignedIn(Boolean(readStudent()));
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
      signedIn && (Boolean(content.isFreeAccess) || unlockedSlugs.includes(content.slug)),
    [signedIn, unlockedSlugs],
  );

  return { mounted, signedIn, unlockedSlugs, isUnlocked };
}
