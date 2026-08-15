import type {
  EducationLevel,
  Question,
  QuestionOption,
  Subject,
  Tryout,
} from "@/data/types";
import { supabase } from "@/lib/supabase";

/**
 * Satu-satunya pintu masuk konten dari Supabase.
 *
 * SERVER SAJA. Berkas ini tidak boleh diimpor komponen client — kalau diimpor,
 * klien Supabase ikut masuk ke bundel peramban. Halaman mengambil datanya di
 * server lalu mengopernya sebagai props.
 *
 * Seluruh pembacaan terjadi saat `next build`, sehingga hasilnya ikut ter-render
 * statis dan tidak ada permintaan ke Supabase saat pengguna membuka halaman.
 */

// ------------------------------------------------------------- bentuk baris

interface SubjectRow {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  level: EducationLevel;
  description: string | null;
}

interface PackageRow {
  id: string;
  kind: "tryout" | "latihan";
  slug: string;
  title: string;
  subject_id: string;
  level: EducationLevel;
  description: string | null;
  variant: string | null;
  variant_label: string | null;
  duration_minutes: number | null;
  instructions: string[] | null;
  sort_order: number;
}

interface QuestionRow {
  id: string;
  subject_id: string;
  topic_id: string;
  subtopic_id: string | null;
  concept_id: string | null;
  type: "single" | "mcma" | "category";
  competency: string | null;
  difficulty: "dasar" | "menengah" | "lanjut" | null;
  reasoning_type: "pemahaman" | "penerapan" | "penalaran" | null;
  content_format: "text" | "html";
  passage_id: string | null;
  stimulus: string | null;
  question_text: string;
  instruction: string | null;
  explanation: string | null;
  options: QuestionOption[] | null;
  correct_answer: string | null;
  correct_answers: string[] | null;
  categories: { key: string; label: string }[] | null;
  statements:
    | { id: string; text: string; correctCategoryKey: string; misconceptionId?: string }[]
    | null;
}

// ------------------------------------------------------------------ helper

/** Melempar dengan pesan yang jelas supaya build gagal keras, bukan diam-diam kosong. */
function unwrap<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Gagal membaca ${what} dari Supabase: ${result.error.message}`);
  if (!result.data) throw new Error(`Tidak ada data ${what} dari Supabase.`);
  return result.data;
}

function toSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name ?? row.name,
    level: row.level,
    description: row.description ?? "",
  };
}

function toTryout(row: PackageRow, questionIds: string[]): Tryout {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subjectId: row.subject_id,
    level: row.level,
    variant: (row.variant as Tryout["variant"]) ?? "resmi",
    variantLabel: row.variant_label ?? "Paket soal",
    description: row.description ?? "",
    durationMinutes: row.duration_minutes ?? 90,
    questionIds,
    instructions: row.instructions ?? [],
  };
}

/**
 * Bacaan bersama dipetakan ke `stimulus` supaya layar ujian yang sudah ada dapat
 * menampilkannya tanpa perubahan. Konsekuensinya bacaan yang dipakai beberapa
 * soal ikut tampil berulang di tiap soal — dapat diperbaiki nanti dengan panel
 * bacaan yang menetap.
 */
function toQuestion(row: QuestionRow, passageHtml: Map<string, string>): Question {
  const base = {
    id: row.id,
    subjectId: row.subject_id,
    topicId: row.topic_id,
    // Materi boleh kosong pada sumbernya; capaian dipakai sebagai penggantinya
    // agar pengelompokan hasil tetap punya pegangan.
    subtopicId: row.subtopic_id ?? row.topic_id,
    conceptId: row.concept_id ?? row.subtopic_id ?? row.topic_id,
    competency: row.competency ?? "",
    difficulty: row.difficulty ?? "menengah",
    reasoningType: row.reasoning_type ?? "penerapan",
    contentFormat: row.content_format,
    stimulus: row.passage_id ? passageHtml.get(row.passage_id) : (row.stimulus ?? undefined),
    questionText: row.question_text,
    instruction: row.instruction ?? undefined,
    explanation: row.explanation ?? undefined,
  } as const;

  if (row.type === "category") {
    return {
      ...base,
      type: "category",
      categories: row.categories ?? [],
      statements: row.statements ?? [],
    };
  }
  if (row.type === "mcma") {
    return {
      ...base,
      type: "mcma",
      options: row.options ?? [],
      correctAnswers: row.correct_answers ?? [],
    };
  }
  return {
    ...base,
    type: "single",
    options: row.options ?? [],
    correctAnswer: row.correct_answer ?? "",
  };
}

// -------------------------------------------------------------------- baca

export async function getSubjects(): Promise<Subject[]> {
  const rows = unwrap(
    await supabase
      .from("subjects")
      .select("id, slug, name, short_name, level, description")
      .order("sort_order"),
    "mata pelajaran",
  ) as SubjectRow[];
  return rows.map(toSubject);
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find((subject) => subject.slug === slug) ?? null;
}

const PACKAGE_COLUMNS =
  "id, kind, slug, title, subject_id, level, description, variant, variant_label, duration_minutes, instructions, sort_order";

/** Urutan soal ikut `position`, karena urutan adalah bagian dari paketnya. */
async function questionIdsFor(packageIds: string[]): Promise<Map<string, string[]>> {
  if (packageIds.length === 0) return new Map();
  const rows = unwrap(
    await supabase
      .from("package_questions")
      .select("package_id, question_id, position")
      .in("package_id", packageIds)
      .order("position"),
    "urutan soal",
  ) as { package_id: string; question_id: string }[];

  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.package_id) ?? [];
    list.push(row.question_id);
    map.set(row.package_id, list);
  }
  return map;
}

export async function getTryouts(): Promise<Tryout[]> {
  const rows = unwrap(
    await supabase.from("packages").select(PACKAGE_COLUMNS).eq("kind", "tryout").order("sort_order"),
    "paket tryout",
  ) as PackageRow[];

  const ids = await questionIdsFor(rows.map((row) => row.id));
  return rows.map((row) => toTryout(row, ids.get(row.id) ?? []));
}

export async function getTryoutBySlug(slug: string): Promise<Tryout | null> {
  const tryouts = await getTryouts();
  return tryouts.find((tryout) => tryout.slug === slug) ?? null;
}

export async function getQuestionsForTryout(slug: string): Promise<Question[]> {
  const tryout = await getTryoutBySlug(slug);
  if (!tryout || tryout.questionIds.length === 0) return [];

  const rows = unwrap(
    await supabase.from("questions").select("*").in("id", tryout.questionIds),
    "soal",
  ) as QuestionRow[];

  const passageIds = [...new Set(rows.map((row) => row.passage_id).filter(Boolean))] as string[];
  const passageHtml = new Map<string, string>();
  if (passageIds.length > 0) {
    const passages = unwrap(
      await supabase.from("passages").select("id, body_html").in("id", passageIds),
      "bacaan",
    ) as { id: string; body_html: string }[];
    for (const passage of passages) passageHtml.set(passage.id, passage.body_html);
  }

  const byId = new Map(rows.map((row) => [row.id, toQuestion(row, passageHtml)]));
  // Urutan mengikuti paket, bukan urutan baris yang dikembalikan basis data.
  return tryout.questionIds.flatMap((id) => {
    const question = byId.get(id);
    return question ? [question] : [];
  });
}

export interface SubjectSummary {
  subject: Subject;
  packageCount: number;
  tryoutCount: number;
  isAvailable: boolean;
}

/** Ringkasan per mata pelajaran untuk kartu di halaman depan. */
export async function getSubjectSummaries(): Promise<SubjectSummary[]> {
  const [subjects, tryouts] = await Promise.all([getSubjects(), getTryouts()]);
  return subjects.map((subject) => {
    const tryoutCount = tryouts.filter((tryout) => tryout.subjectId === subject.id).length;
    return {
      subject,
      packageCount: 0,
      tryoutCount,
      isAvailable: tryoutCount > 0,
    };
  });
}
