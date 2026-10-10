import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { deleteStudentSession, isStudentLoginConfigured, STUDENT_COOKIE_NAME } from "@/lib/student-session";

/** Keluar dari perangkat ini: sesinya dihapus supaya slot perangkat kembali kosong. */
export async function POST() {
  const store = await cookies();
  const sessionId = store.get(STUDENT_COOKIE_NAME)?.value;
  if (sessionId && isStudentLoginConfigured()) {
    await deleteStudentSession(sessionId).catch((error) => console.error(error));
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(STUDENT_COOKIE_NAME);
  return response;
}
