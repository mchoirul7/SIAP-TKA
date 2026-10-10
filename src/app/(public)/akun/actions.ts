"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { removeStudentDevice } from "@/lib/student-account";
import { getServerStudent, STUDENT_COOKIE_NAME } from "@/lib/student-session";

/** Mengeluarkan satu perangkat dari akun murid yang sedang masuk. */
export async function removeDeviceAction(formData: FormData): Promise<void> {
  const sessionId = String(formData.get("sessionId") ?? "");
  const student = await getServerStudent();
  if (!student || !sessionId) return;
  await removeStudentDevice(student.id, sessionId);
  if (sessionId === student.sessionId) (await cookies()).delete(STUDENT_COOKIE_NAME);
  revalidatePath("/akun");
}
