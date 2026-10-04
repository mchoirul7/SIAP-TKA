"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudyContext } from "@/lib/study-context";
import { normalizeStudyContext } from "@/lib/study-context";
import { subscribeToStorage } from "@/storage/local-storage";
import {
  readStudyContext,
  writeStudyContext,
  writeStudyContextCookie,
} from "@/storage/study-context-storage";

export function useStudyContext() {
  const [context, setContext] = useState<StudyContext | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(() => {
    const stored = readStudyContext();
    if (stored) writeStudyContextCookie(stored);
    setContext(stored);
    setIsReady(true);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToStorage(refresh);
  }, [refresh]);

  const saveContext = useCallback((nextContext: StudyContext) => {
    const normalized = normalizeStudyContext(nextContext);
    writeStudyContext(normalized);
    setContext(normalized);
    setIsReady(true);
  }, []);

  return { context, isReady, saveContext };
}
