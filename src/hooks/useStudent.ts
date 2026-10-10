"use client";

import { useCallback, useEffect, useState } from "react";
import { logoutStudent, syncStudent } from "@/services/entitlement-service";
import { subscribeToStorage } from "@/storage/local-storage";
import { readStudent, type StoredStudent } from "@/storage/student-storage";

/** Murid yang sedang masuk dengan kode muridnya di perangkat ini. */
export function useStudent() {
  const [student, setStudent] = useState<StoredStudent["student"] | null>(null);

  useEffect(() => {
    const sync = () => setStudent(readStudent()?.student ?? null);
    sync();
    const unsubscribe = subscribeToStorage(sync);
    void syncStudent();
    return unsubscribe;
  }, []);

  const logout = useCallback(() => logoutStudent(), []);

  return { student, logout };
}
