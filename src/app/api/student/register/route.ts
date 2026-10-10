import { NextResponse } from "next/server";
import type { EducationLevel } from "@/data/types";
import { isValidGradeForLevel } from "@/lib/assessment";
import { clientIp, isLockedOut, isValidPin, LOCKOUT_MESSAGE, recordLoginFailure } from "@/lib/login-guard";
import { registerStudent, studentSignInResponse } from "@/lib/student-session";

const LEVELS: EducationLevel[] = ["SD", "SMP", "SMA"];

function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ code, message }, { status });
}

/**
 * Pendaftaran mandiri: orang tua mengisi nama murid dan PIN 6 angka. PIN itu
 * langsung menjadi kode masuk, lalu murid otomatis masuk di perangkat ini.
 * PIN yang sudah dipakai dihitung sebagai percobaan salah supaya pendaftaran
 * tidak bisa dipakai untuk mencari PIN milik akun lain.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; pin?: unknown; level?: unknown; gradeLevel?: unknown }
    | null;
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  const level = LEVELS.find((value) => value === body?.level);
  const gradeLevel = typeof body?.gradeLevel === "number" ? body.gradeLevel : Number.NaN;

  if (name.length < 2 || name.length > 60) return fail("NAME_INVALID", "Isi nama murid (2-60 huruf).");
  if (!isValidPin(pin)) return fail("PIN_INVALID", "PIN harus 6 angka.");
  if (!level || !isValidGradeForLevel(level, gradeLevel)) {
    return fail("GRADE_INVALID", "Pilih jenjang dan kelas murid terlebih dahulu.");
  }

  try {
    const ip = clientIp(request);
    if (await isLockedOut(ip)) return fail("LOCKED_OUT", LOCKOUT_MESSAGE, 429);

    const student = await registerStudent({ name, pin, level, gradeLevel });
    if (!student) {
      await recordLoginFailure(ip);
      return fail("PIN_TAKEN", "PIN ini sudah dipakai. Pilih PIN lain yang lebih sulit ditebak.", 409);
    }
    return studentSignInResponse(student, request.headers.get("user-agent"), `Akun ${student.name} berhasil dibuat.`);
  } catch (error) {
    console.error(error);
    return fail("REGISTER_UNAVAILABLE", "Pendaftaran belum dapat diproses. Coba lagi beberapa saat.", 503);
  }
}
