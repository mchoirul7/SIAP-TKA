import { NextResponse } from "next/server";
import { getServerStudent, studentAccess } from "@/lib/student-session";

export const dynamic = "force-dynamic";

/**
 * Murid yang sedang masuk beserta paket yang terbuka. Dipanggil perangkat untuk
 * menyegarkan aksesnya: grant baru dari admin ikut terbuka, grant kedaluwarsa
 * tertutup, dan sesi yang dikeluarkan perangkat lain dibalas 401.
 */
export async function GET() {
  try {
    const student = await getServerStudent();
    if (!student) return NextResponse.json({ code: "STUDENT_SIGNED_OUT" }, { status: 401 });
    const access = await studentAccess(student);
    return NextResponse.json({
      student: access.student,
      grants: access.grants,
      unlockedPackageSlugs: access.packageSlugs,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ code: "STUDENT_UNAVAILABLE" }, { status: 503 });
  }
}
