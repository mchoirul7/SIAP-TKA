"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useStudyContext } from "@/hooks/useStudyContext";
import { serializeStudyContext } from "@/lib/study-context";

/**
 * Halaman /ujian disaring di server memakai kelas dari cookie. Bila kelas di
 * perangkat berbeda dengan yang dipakai server — kelas baru dipilih, diganti
 * lewat header, atau data lama belum punya cookie — halamannya dimuat ulang.
 *
 * Satu kelas hanya memicu satu kali muat ulang, supaya peramban yang menolak
 * cookie tidak terjebak memuat ulang terus-menerus.
 */
export function ExamContextSync({ serverContextKey }: { serverContextKey: string | null }) {
  const router = useRouter();
  const { context } = useStudyContext();
  const refreshedFor = useRef<string | null>(null);
  const clientKey = context ? serializeStudyContext(context) : null;

  useEffect(() => {
    if (!clientKey || clientKey === serverContextKey || refreshedFor.current === clientKey) return;
    refreshedFor.current = clientKey;
    router.refresh();
  }, [clientKey, router, serverContextKey]);

  return null;
}
