import { cookies } from "next/headers";
import { parseStudyContext, STUDY_CONTEXT_COOKIE, type StudyContext } from "@/lib/study-context";

/** Kelas aktif menurut cookie. Null bila pengguna belum memilih kelas di perangkat ini. */
export async function getServerStudyContext(): Promise<StudyContext | null> {
  const store = await cookies();
  return parseStudyContext(store.get(STUDY_CONTEXT_COOKIE)?.value);
}
