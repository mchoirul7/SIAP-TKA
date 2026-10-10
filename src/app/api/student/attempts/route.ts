import { NextResponse } from "next/server";
import type { AnswerMap } from "@/data/types";
import { isCorrectAnswer } from "@/lib/answers";
import { hasServerContentAccess } from "@/lib/server-entitlements";
import { getServerStudent } from "@/lib/student-session";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getPracticePackageBySlug,
  getQuestionsForPackage,
  getQuestionsForTryout,
  getTryoutBySlug,
} from "@/services/content-service";

interface AttemptBody {
  kind?: unknown;
  slug?: unknown;
  startedAt?: unknown;
  finishedAt?: unknown;
  answers?: unknown;
  violations?: unknown;
}

function timestamp(value: unknown): string | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? new Date(value).toISOString() : null;
}

/**
 * Merekam satu pengerjaan murid yang sedang masuk. Nilainya dihitung ulang di
 * server dari kunci jawaban, jadi nilai dari perangkat tidak dipercaya mentah.
 * Pengiriman ulang hasil yang sama (waktu mulai sama) tidak membuat baris baru.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as AttemptBody | null;
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const kind = body?.kind === "tryout" ? "tryout" : body?.kind === "latihan" ? "latihan" : null;
  const startedAt = timestamp(body?.startedAt);
  const finishedAt = timestamp(body?.finishedAt);
  if (!slug || !kind || !startedAt || !finishedAt) {
    return NextResponse.json({ code: "ATTEMPT_INVALID" }, { status: 400 });
  }

  try {
    const student = await getServerStudent();
    if (!student) return NextResponse.json({ code: "STUDENT_SIGNED_OUT" }, { status: 401 });

    const content = kind === "tryout" ? await getTryoutBySlug(slug) : await getPracticePackageBySlug(slug);
    if (!content) return NextResponse.json({ code: "ATTEMPT_INVALID" }, { status: 404 });
    if (!(await hasServerContentAccess(content))) {
      return NextResponse.json({ code: "ATTEMPT_FORBIDDEN" }, { status: 403 });
    }

    const db = supabaseAdmin();
    const { data: existing } = await db
      .from("attempts")
      .select("id")
      .eq("student_id", student.id)
      .eq("package_id", content.id)
      .eq("started_at", startedAt)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true, id: existing.id, duplicate: true });

    const questions = kind === "tryout" ? await getQuestionsForTryout(slug) : await getQuestionsForPackage(slug);
    const answers = (body?.answers && typeof body.answers === "object" ? body.answers : {}) as AnswerMap;
    const correctCount = questions.filter((question) => isCorrectAnswer(question, answers[question.id])).length;
    const totalCount = questions.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 1000) / 10 : 0;

    const { data, error } = await db
      .from("attempts")
      .insert({
        student_id: student.id,
        package_id: content.id,
        started_at: startedAt,
        finished_at: finishedAt,
        score,
        correct_count: correctCount,
        total_count: totalCount,
        answers,
        violations: typeof body?.violations === "number" ? Math.max(0, Math.round(body.violations)) : 0,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, id: data.id, score, correctCount, totalCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ code: "ATTEMPT_UNAVAILABLE" }, { status: 503 });
  }
}
