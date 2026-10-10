import { getServerStudent, studentCanAccess } from "@/lib/student-session";

/**
 * Akses konten di server: murid wajib masuk dengan PIN akunnya, lalu paket
 * gratis langsung terbuka dan paket berbayar butuh grant aktif. Tidak ada lagi akses yang hanya
 * tersimpan di perangkat; paket yang dibeli dibukakan admin menjadi grant di akun.
 */
export async function hasServerContentAccess(content: { id: string; isFreeAccess?: boolean }): Promise<boolean> {
  try {
    // Semua paket, termasuk yang gratis, dikerjakan dari akun supaya nilainya terekam.
    const student = await getServerStudent();
    if (!student) return false;
    return content.isFreeAccess ? true : await studentCanAccess(student.id, content.id);
  } catch {
    // Basis data murid tidak terjangkau: tetap tertutup, jangan sampai halaman error.
    return false;
  }
}
