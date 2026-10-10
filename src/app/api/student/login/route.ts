import { NextResponse } from "next/server";
import { clientIp, isLockedOut, isValidPin, LOCKOUT_MESSAGE, recordLoginFailure } from "@/lib/login-guard";
import { findStudentByCode, studentSignInResponse } from "@/lib/student-session";

function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ code, message }, { status });
}

/**
 * Masuk dengan PIN 6 angka. PIN yang salah dicatat per IP supaya tidak bisa
 * ditebak beruntun.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { pin?: unknown } | null;
  const pin = typeof body?.pin === "string" ? body.pin.replace(/\s+/g, "") : "";
  if (!isValidPin(pin)) return fail("PIN_INVALID", "PIN harus 6 angka.");

  try {
    const ip = clientIp(request);
    if (await isLockedOut(ip)) return fail("LOCKED_OUT", LOCKOUT_MESSAGE, 429);

    const student = await findStudentByCode(pin);
    if (!student) {
      await recordLoginFailure(ip);
      return fail("PIN_UNKNOWN", "PIN tidak dikenali. Periksa lagi, atau daftar akun baru.", 401);
    }
    return studentSignInResponse(student, request.headers.get("user-agent"), `Selamat datang, ${student.name}.`);
  } catch (error) {
    console.error(error);
    return fail("LOGIN_UNAVAILABLE", "Belum dapat masuk. Coba lagi beberapa saat.", 503);
  }
}
