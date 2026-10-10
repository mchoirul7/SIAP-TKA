import { NextResponse } from "next/server";
import { attemptHistoryCsv, studentAttemptHistory } from "@/lib/student-account";
import { getServerStudent } from "@/lib/student-session";

export const dynamic = "force-dynamic";

/** Unduhan riwayat nilai murid yang sedang masuk, sebagai CSV untuk Excel. */
export async function GET() {
  const student = await getServerStudent().catch(() => null);
  if (!student) return NextResponse.json({ code: "STUDENT_SIGNED_OUT" }, { status: 401 });

  const csv = attemptHistoryCsv(await studentAttemptHistory(student.id));
  // Nama berkas hanya huruf latin dan angka supaya header unduhan aman di semua peramban.
  const safeName = student.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "murid";
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="riwayat-nilai-${safeName}-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
