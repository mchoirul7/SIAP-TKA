"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentEntitlement } from "@/data/types";
import { contentAccessKey, hasContentAccess } from "@/lib/entitlements";
import { getUnlockedPackageSlugs, getUnlockedSeriesKeys } from "@/services/entitlement-service";
import { subscribeToStorage } from "@/storage/local-storage";

/**
 * Membaca hak akses paket dari localStorage setelah komponen ter-mount,
 * sehingga hasil render server dan klien selalu sama pada render pertama.
 */
export function useEntitlements() {
  const [mounted, setMounted] = useState(false);
  const [unlockedSeriesKeys, setUnlockedSeriesKeys] = useState<string[]>([]);
  const [unlockedSlugs, setUnlockedSlugs] = useState<string[]>([]);

  useEffect(() => {
    // Menjaga identitas array tetap sama bila isinya tidak berubah, supaya efek
    // di komponen lain tidak ikut berjalan setiap kali storage disentuh.
    const sync = () => {
      setUnlockedSeriesKeys((current) => {
        const next = getUnlockedSeriesKeys();
        if (current.length === next.length && current.every((key, i) => key === next[i])) {
          return current;
        }
        return next;
      });
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
    return subscribeToStorage(sync);
  }, []);

  const isUnlocked = useCallback(
    (content: ContentEntitlement & { slug: string; isFreeAccess?: boolean }) =>
      hasContentAccess(content, unlockedSeriesKeys) || unlockedSlugs.includes(content.slug),
    [unlockedSeriesKeys, unlockedSlugs],
  );

  const isSeriesUnlocked = useCallback(
    (content: ContentEntitlement) => unlockedSeriesKeys.includes(contentAccessKey(content)),
    [unlockedSeriesKeys],
  );

  return { mounted, unlockedSeriesKeys, unlockedSlugs, isUnlocked, isSeriesUnlocked };
}
