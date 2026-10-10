import { clearStudent, readStudent, writeStudent, type StoredStudent } from "@/storage/student-storage";

/**
 * Akun murid di perangkat. Orang tua daftar dengan nama + PIN 6 angka dan
 * masuk lagi dengan PIN itu. Paket yang dibeli dibukakan admin ke akun; daftar
 * paketnya disalin ke perangkat hanya untuk tampilan, karena halaman terkunci
 * tetap memeriksa ulang di server.
 */

/** Slug paket yang terbuka untuk murid yang sedang masuk. */
export function getUnlockedPackageSlugs(): string[] {
  return readStudent()?.packageSlugs ?? [];
}

export interface AuthResult {
  ok: boolean;
  message: string;
  unlockedPackageSlugs: string[];
  studentName?: string;
}

interface AuthResponse {
  code?: string;
  message?: string;
  student?: StoredStudent["student"];
  unlockedPackageSlugs?: string[];
}

interface StudentMeResponse {
  student: StoredStudent["student"];
  unlockedPackageSlugs: string[];
}

let studentSync: Promise<void> | null = null;

/**
 * Menyegarkan akses murid dari server, sekali per muat halaman. Paket yang
 * baru dibukakan admin ikut terbuka, dan sesi yang sudah dikeluarkan perangkat
 * lain dihapus dari perangkat ini.
 */
export function syncStudent(): Promise<void> {
  if (!readStudent()) return Promise.resolve();
  studentSync ??= (async () => {
    try {
      const response = await fetch("/api/student/me", { cache: "no-store" });
      if (response.status === 401) {
        clearStudent();
        return;
      }
      if (!response.ok) return;
      const payload = (await response.json()) as StudentMeResponse;
      writeStudent(payload.student, payload.unlockedPackageSlugs);
    } catch {
      // Sedang luring: pakai salinan terakhir.
    }
  })();
  return studentSync;
}

export async function logoutStudent(): Promise<void> {
  await fetch("/api/student/logout", { method: "POST" }).catch(() => undefined);
  clearStudent();
  studentSync = null;
}

async function authenticate(path: string, body: unknown, fallback: string): Promise<AuthResult> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json()) as AuthResponse;
    if (!response.ok || !payload.student) {
      return { ok: false, message: payload.message ?? fallback, unlockedPackageSlugs: [] };
    }
    const packageSlugs = payload.unlockedPackageSlugs ?? [];
    writeStudent(payload.student, packageSlugs);
    studentSync = null;
    return {
      ok: true,
      message: payload.message ?? "",
      unlockedPackageSlugs: packageSlugs,
      studentName: payload.student.name,
    };
  } catch {
    return { ok: false, message: "Belum dapat terhubung. Coba lagi beberapa saat.", unlockedPackageSlugs: [] };
  }
}

export function loginWithPin(pin: string): Promise<AuthResult> {
  return authenticate("/api/student/login", { pin }, "PIN tidak dikenali.");
}

/** Pendaftaran mandiri: nama murid + PIN 6 angka, lalu langsung masuk di perangkat ini. */
export function registerStudentAccount(input: {
  name: string;
  pin: string;
  level: string;
  gradeLevel: number;
}): Promise<AuthResult> {
  return authenticate("/api/student/register", input, "Pendaftaran gagal. Coba lagi.");
}
