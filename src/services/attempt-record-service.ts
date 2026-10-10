import type { AnswerMap } from "@/data/types";
import { readStudent } from "@/storage/student-storage";

const sent = new Set<string>();

/**
 * Mengirim hasil pengerjaan ke riwayat akun murid. Hanya berjalan bila murid
 * masuk dengan kodenya; tanpa itu hasil tetap tersimpan di perangkat saja.
 * Server menilai ulang dan mengabaikan kiriman ganda, jadi aman dipanggil
 * setiap kali halaman hasil dibuka.
 */
export function recordAttempt(attempt: {
  kind: "latihan" | "tryout";
  slug: string;
  startedAt: number;
  finishedAt: number;
  answers: AnswerMap;
  violations: number;
}): void {
  if (!readStudent()) return;
  const key = `${attempt.kind}:${attempt.slug}:${attempt.startedAt}`;
  if (sent.has(key)) return;
  sent.add(key);
  void fetch("/api/student/attempts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(attempt),
    keepalive: true,
  })
    .then((response) => {
      // Gagal karena server sibuk boleh dicoba lagi saat halaman dibuka ulang.
      if (response.status >= 500) sent.delete(key);
    })
    .catch(() => sent.delete(key));
}
