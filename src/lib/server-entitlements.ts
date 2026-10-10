import { getServerStudent, studentCanAccess } from "@/lib/student-session";

/**
 * Akses konten terkunci di server: paket gratis, atau grant aktif milik murid
 * yang sedang masuk dengan kode muridnya. Tidak ada lagi akses yang hanya
 * tersimpan di perangkat; paket yang dibeli dibukakan admin menjadi grant di akun.
 */
export async function hasServerContentAccess(content: { id: string; isFreeAccess?: boolean }): Promise<boolean> {
  if (content.isFreeAccess) return true;
  try {
    const student = await getServerStudent();
    return student ? await studentCanAccess(student.id, content.id) : false;
  } catch {
    // Basis data murid tidak terjangkau: tetap tertutup, jangan sampai halaman error.
    return false;
  }
}
