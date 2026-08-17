import type {
  Concept,
  ConceptPrerequisite,
  ContentSeries,
  EducationLevel,
  Misconception,
  PracticePackage,
  Question,
  QuestionOption,
  Subject,
  Subtopic,
  SubtopicPrerequisite,
  Tryout,
  Topic,
} from "@/data/types";
import type { AnalysisCatalog } from "@/lib/scoring";
import { sortBySubject } from "@/lib/subject-order";
import { supabase } from "@/lib/supabase";

/**
 * Satu-satunya pintu masuk konten dari Supabase.
 *
 * SERVER SAJA. Berkas ini tidak boleh diimpor komponen client — kalau diimpor,
 * klien Supabase ikut masuk ke bundel peramban. Halaman mengambil datanya di
 * server lalu mengopernya sebagai props.
 *
 * Halaman katalog/detail membaca konten saat `next build`. Route yang berisi
 * konten terkunci sengaja dynamic agar bisa memeriksa cookie voucher di server.
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

interface ContentSeriesRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
}

interface TopicRow {
  id: string;
  subject_id: string;
  slug: string | null;
  name: string;
}

interface SubtopicRow {
  id: string;
  topic_id: string;
  slug: string | null;
  name: string;
  description: string | null;
}

interface ConceptRow {
  id: string;
  subtopic_id: string;
  name: string;
  description: string | null;
}

interface MisconceptionRow {
  id: string;
  label: string;
  description: string;
  insight: string;
}

interface SubtopicPrerequisiteRow {
  subtopic_id: string;
  requires_subtopic_id: string;
  reason: string;
}

interface ConceptPrerequisiteRow {
  concept_id: string;
  requires_concept_id: string;
}

interface PackageRow {
  id: string;
  kind: "tryout" | "latihan";
  slug: string;
  title: string;
  subject_id: string;
  series_id: string | null;
  level: EducationLevel;
  description: string | null;
  summary: string | null;
  variant: string | null;
  variant_label: string | null;
  duration_minutes: number | null;
  estimated_minutes: number | null;
  difficulty_range: string | null;
  skills: string[] | null;
  instructions: string[] | null;
  sort_order: number;
}

interface QuestionTaxonomyRow {
  id: string;
  topic_id: string;
  subtopic_id: string | null;
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

interface PackageAccess {
  subjectSlug: string;
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  accessKey: string;
}

// ------------------------------------------------------------------ helper

const SUPABASE_PAGE_SIZE = 500;
const FILTER_CHUNK_SIZE = 100;

type SupabaseListResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
  count?: number | null;
};

/** Melempar dengan pesan yang jelas supaya build gagal keras, bukan diam-diam kosong. */
function unwrap<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Gagal membaca ${what} dari Supabase: ${result.error.message}`);
  if (!result.data) throw new Error(`Tidak ada data ${what} dari Supabase.`);
  return result.data;
}

async function readAllRows<T>(
  what: string,
  queryPage: (from: number, to: number) => PromiseLike<SupabaseListResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const result = await queryPage(from, to);
    const page = unwrap(result, `${what} halaman ${Math.floor(from / SUPABASE_PAGE_SIZE) + 1}`);
    rows.push(...page);

    if (typeof result.count === "number" && rows.length >= result.count) return rows;
    if (page.length < SUPABASE_PAGE_SIZE) return rows;
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

async function readAllRowsForChunks<T, U>(
  what: string,
  values: U[],
  queryPage: (values: U[], from: number, to: number) => PromiseLike<SupabaseListResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  for (const valuesChunk of chunk(values, FILTER_CHUNK_SIZE)) {
    rows.push(...await readAllRows(what, (from, to) => queryPage(valuesChunk, from, to)));
  }
  return rows;
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

function toSeries(row: ContentSeriesRow): ContentSeries {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
  };
}

function toTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    subjectId: row.subject_id,
    slug: row.slug ?? row.id,
    name: row.name,
  };
}

function toSubtopic(row: SubtopicRow): Subtopic {
  return {
    id: row.id,
    topicId: row.topic_id,
    slug: row.slug ?? row.id,
    name: row.name,
    description: row.description ?? "",
  };
}

function toConcept(row: ConceptRow): Concept {
  return {
    id: row.id,
    subtopicId: row.subtopic_id,
    name: row.name,
    description: row.description ?? "",
  };
}

function toMisconception(row: MisconceptionRow): Misconception {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    insight: row.insight,
  };
}

function toTryout(row: PackageRow, questionIds: string[], access: PackageAccess): Tryout {
  return {
    ...access,
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

function toPracticePackage(
  row: PackageRow,
  questionIds: string[],
  questionTaxonomy: Map<string, QuestionTaxonomyRow>,
  access: PackageAccess,
): PracticePackage {
  const taxonomy = questionIds
    .map((questionId) => questionTaxonomy.get(questionId))
    .filter((question): question is QuestionTaxonomyRow => Boolean(question));
  const firstQuestion = taxonomy[0];
  // Satu paket bisa menyentuh beberapa subtopik; semuanya dicatat agar halaman
  // hasil dapat menyarankan paket ini untuk materi mana pun yang masih lemah.
  const subtopicIds = [...new Set(taxonomy.flatMap((item) => (item.subtopic_id ? [item.subtopic_id] : [])))];

  return {
    ...access,
    id: row.id,
    slug: row.slug,
    title: row.title,
    subjectId: row.subject_id,
    topicId: firstQuestion?.topic_id ?? row.subject_id,
    subtopicId: firstQuestion?.subtopic_id ?? firstQuestion?.topic_id ?? row.subject_id,
    subtopicIds,
    summary: row.summary ?? row.description ?? "",
    description: row.description ?? row.summary ?? "",
    level: row.level,
    difficultyRange: row.difficulty_range ?? "campuran",
    estimatedMinutes: row.estimated_minutes ?? row.duration_minutes ?? Math.max(1, questionIds.length * 2),
    skills: row.skills ?? [],
    questionIds,
  };
}

function packageAccess(
  row: PackageRow,
  subjects: Map<string, Subject>,
  series: Map<string, ContentSeries>,
): PackageAccess {
  const subject = subjects.get(row.subject_id);
  const foundSeries = row.series_id ? series.get(row.series_id) : undefined;
  const fallbackSeries = foundSeries ?? {
    id: row.series_id ?? "ser-sukses-tka-sma-vol-1",
    slug: "sukses-tka-sma-vol-1",
    title: "Seri Sukses TKA SMA Vol.1",
    description: "",
  };
  const subjectSlug = subject?.slug ?? row.subject_id;
  return {
    subjectSlug,
    seriesId: fallbackSeries.id,
    seriesSlug: fallbackSeries.slug,
    seriesTitle: fallbackSeries.title,
    accessKey: `${subjectSlug}:${fallbackSeries.slug}`,
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
  const rows = await readAllRows<SubjectRow>("mata pelajaran", (from, to) =>
    supabase
      .from("subjects")
      .select("id, slug, name, short_name, level, description", { count: "exact" })
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return sortBySubject(rows.map(toSubject), (subject) => subject.slug);
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find((subject) => subject.slug === slug) ?? null;
}

export async function getSeries(): Promise<ContentSeries[]> {
  const rows = await readAllRows<ContentSeriesRow>("seri konten", (from, to) =>
    supabase
      .from("content_series")
      .select("id, slug, title, description", { count: "exact" })
      .eq("is_active", true)
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return rows.map(toSeries);
}

export async function getTopics(): Promise<Topic[]> {
  const rows = await readAllRows<TopicRow>("topik", (from, to) =>
    supabase
      .from("topics")
      .select("id, subject_id, slug, name", { count: "exact" })
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return rows.map(toTopic);
}

export async function getSubtopics(): Promise<Subtopic[]> {
  const rows = await readAllRows<SubtopicRow>("subtopik", (from, to) =>
    supabase
      .from("subtopics")
      .select("id, topic_id, slug, name, description", { count: "exact" })
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return rows.map(toSubtopic);
}

export async function getConcepts(): Promise<Concept[]> {
  const rows = await readAllRows<ConceptRow>("konsep", (from, to) =>
    supabase
      .from("concepts")
      .select("id, subtopic_id, name, description", { count: "exact" })
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return rows.map(toConcept);
}

export async function getMisconceptions(): Promise<Misconception[]> {
  const rows = await readAllRows<MisconceptionRow>("miskonsepsi", (from, to) =>
    supabase
      .from("misconceptions")
      .select("id, label, description, insight", { count: "exact" })
      .order("id")
      .range(from, to),
  );
  return rows.map(toMisconception);
}

export async function getSubtopicPrerequisites(): Promise<SubtopicPrerequisite[]> {
  const rows = await readAllRows<SubtopicPrerequisiteRow>("prasyarat subtopik", (from, to) =>
    supabase
      .from("subtopic_prerequisites")
      .select("subtopic_id, requires_subtopic_id, reason", { count: "exact" })
      .order("subtopic_id")
      .order("requires_subtopic_id")
      .range(from, to),
  );

  return rows.map((row) => ({
    subtopicId: row.subtopic_id,
    requiresSubtopicId: row.requires_subtopic_id,
    reason: row.reason,
  }));
}

export async function getConceptPrerequisites(): Promise<ConceptPrerequisite[]> {
  const rows = await readAllRows<ConceptPrerequisiteRow>("prasyarat konsep", (from, to) =>
    supabase
      .from("concept_prerequisites")
      .select("concept_id, requires_concept_id", { count: "exact" })
      .order("concept_id")
      .order("requires_concept_id")
      .range(from, to),
  );

  return rows.map((row) => ({
    conceptId: row.concept_id,
    requiresConceptId: row.requires_concept_id,
  }));
}

const PACKAGE_COLUMNS =
  "id, kind, slug, title, subject_id, series_id, level, description, summary, variant, variant_label, duration_minutes, estimated_minutes, difficulty_range, skills, instructions, sort_order";

/** Urutan soal ikut `position`, karena urutan adalah bagian dari paketnya. */
async function questionIdsFor(packageIds: string[]): Promise<Map<string, string[]>> {
  if (packageIds.length === 0) return new Map();
  const rows = await readAllRowsForChunks<{ package_id: string; question_id: string }, string>(
    "urutan soal",
    packageIds,
    (ids, from, to) =>
      supabase
        .from("package_questions")
        .select("package_id, question_id, position", { count: "exact" })
        .in("package_id", ids)
        .order("package_id")
        .order("position")
        .range(from, to),
  );

  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.package_id) ?? [];
    list.push(row.question_id);
    map.set(row.package_id, list);
  }
  return map;
}

async function questionTaxonomyFor(questionIds: string[]): Promise<Map<string, QuestionTaxonomyRow>> {
  if (questionIds.length === 0) return new Map();

  const rows = await readAllRowsForChunks<QuestionTaxonomyRow, string>(
    "taksonomi soal",
    questionIds,
    (ids, from, to) =>
      supabase
        .from("questions")
        .select("id, topic_id, subtopic_id", { count: "exact" })
        .in("id", ids)
        .order("id")
        .range(from, to),
  );

  return new Map(rows.map((row) => [row.id, row]));
}

async function questionsForIds(questionIds: string[]): Promise<Question[]> {
  if (questionIds.length === 0) return [];

  const rows = await readAllRowsForChunks<QuestionRow, string>("soal", questionIds, (ids, from, to) =>
    supabase
      .from("questions")
      .select("*", { count: "exact" })
      .in("id", ids)
      .order("id")
      .range(from, to),
  );

  const passageIds = [...new Set(rows.map((row) => row.passage_id).filter(Boolean))] as string[];
  const passageHtml = new Map<string, string>();
  if (passageIds.length > 0) {
    const passages = await readAllRowsForChunks<{ id: string; body_html: string }, string>(
      "bacaan",
      passageIds,
      (ids, from, to) =>
        supabase
          .from("passages")
          .select("id, body_html", { count: "exact" })
          .in("id", ids)
          .order("id")
          .range(from, to),
    );
    for (const passage of passages) passageHtml.set(passage.id, passage.body_html);
  }

  const byId = new Map(rows.map((row) => [row.id, toQuestion(row, passageHtml)]));
  // Urutan mengikuti paket, bukan urutan baris yang dikembalikan basis data.
  return questionIds.flatMap((id) => {
    const question = byId.get(id);
    return question ? [question] : [];
  });
}

export async function getTryouts(): Promise<Tryout[]> {
  const [rows, subjects, series] = await Promise.all([
    readAllRows<PackageRow>("paket tryout", (from, to) =>
      supabase
        .from("packages")
        .select(PACKAGE_COLUMNS, { count: "exact" })
        .eq("kind", "tryout")
        .eq("is_published", true)
        .order("sort_order")
        .order("id")
        .range(from, to),
    ),
    getSubjects(),
    getSeries(),
  ]);
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const seriesById = new Map(series.map((item) => [item.id, item]));

  const ids = await questionIdsFor(rows.map((row) => row.id));
  const tryouts = rows.map((row) =>
    toTryout(row, ids.get(row.id) ?? [], packageAccess(row, subjectById, seriesById)),
  );
  return sortBySubject(tryouts, (tryout) => tryout.subjectSlug);
}

export async function getTryoutBySlug(slug: string): Promise<Tryout | null> {
  const tryouts = await getTryouts();
  return tryouts.find((tryout) => tryout.slug === slug) ?? null;
}

export async function getQuestionsForTryout(slug: string): Promise<Question[]> {
  const tryout = await getTryoutBySlug(slug);
  if (!tryout) return [];

  return questionsForIds(tryout.questionIds);
}

export async function getPracticePackages(): Promise<PracticePackage[]> {
  const [rows, subjects, series] = await Promise.all([
    readAllRows<PackageRow>("paket latihan", (from, to) =>
      supabase
        .from("packages")
        .select(PACKAGE_COLUMNS, { count: "exact" })
        .eq("kind", "latihan")
        .eq("is_published", true)
        .order("sort_order")
        .order("id")
        .range(from, to),
    ),
    getSubjects(),
    getSeries(),
  ]);
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const seriesById = new Map(series.map((item) => [item.id, item]));

  const idsByPackage = await questionIdsFor(rows.map((row) => row.id));
  const allQuestionIds = [...new Set([...idsByPackage.values()].flat())];
  const questionTaxonomy = await questionTaxonomyFor(allQuestionIds);

  const packages = rows.map((row) =>
    toPracticePackage(
      row,
      idsByPackage.get(row.id) ?? [],
      questionTaxonomy,
      packageAccess(row, subjectById, seriesById),
    ),
  );
  return sortBySubject(packages, (pkg) => pkg.subjectSlug);
}

export async function getAnalysisCatalog(): Promise<AnalysisCatalog> {
  const [
    topicRows,
    subtopicRows,
    conceptRows,
    misconceptionRows,
    subtopicPrerequisiteRows,
    conceptPrerequisiteRows,
    packages,
  ] = await Promise.all([
    getTopics(),
    getSubtopics(),
    getConcepts(),
    getMisconceptions(),
    getSubtopicPrerequisites(),
    getConceptPrerequisites(),
    getPracticePackages(),
  ]);

  return {
    topics: topicRows,
    subtopics: subtopicRows,
    concepts: conceptRows,
    misconceptions: misconceptionRows,
    subtopicPrerequisites: subtopicPrerequisiteRows,
    conceptPrerequisites: conceptPrerequisiteRows,
    practicePackages: packages,
  };
}

export async function getPracticePackageBySlug(slug: string): Promise<PracticePackage | null> {
  const packages = await getPracticePackages();
  return packages.find((pkg) => pkg.slug === slug) ?? null;
}

export async function getQuestionsForPackage(slug: string): Promise<Question[]> {
  const pkg = await getPracticePackageBySlug(slug);
  if (!pkg) return [];

  return questionsForIds(pkg.questionIds);
}

export interface PracticeTopicGroup {
  topic: Topic;
  packages: PracticePackage[];
}

export async function getPracticePackagesGroupedByTopic(): Promise<PracticeTopicGroup[]> {
  const [topics, packages] = await Promise.all([getTopics(), getPracticePackages()]);
  const subjectSlugByTopic = new Map(packages.map((pkg) => [pkg.topicId, pkg.subjectSlug]));
  const groups = topics
    .map((topic) => ({
      topic,
      packages: packages.filter((pkg) => pkg.topicId === topic.id),
    }))
    .filter((group) => group.packages.length > 0);

  const groupedTopicIds = new Set(groups.map((group) => group.topic.id));
  for (const pkg of packages) {
    if (groupedTopicIds.has(pkg.topicId)) continue;
    groups.push({
      topic: {
        id: pkg.topicId,
        subjectId: pkg.subjectId,
        slug: pkg.topicId,
        name: pkg.topicId,
      },
      packages: packages.filter((item) => item.topicId === pkg.topicId),
    });
    groupedTopicIds.add(pkg.topicId);
  }

  // Topik dari mapel yang sama dikumpulkan berdekatan, mengikuti urutan mapel.
  return sortBySubject(groups, (group) => subjectSlugByTopic.get(group.topic.id));
}

export interface SubjectSummary {
  subject: Subject;
  packageCount: number;
  tryoutCount: number;
  isAvailable: boolean;
}

/** Ringkasan per mata pelajaran untuk kartu di halaman depan. */
export async function getSubjectSummaries(): Promise<SubjectSummary[]> {
  const [subjects, tryouts, packages] = await Promise.all([
    getSubjects(),
    getTryouts(),
    getPracticePackages(),
  ]);
  return subjects.map((subject) => {
    const tryoutCount = tryouts.filter((tryout) => tryout.subjectId === subject.id).length;
    const packageCount = packages.filter((pkg) => pkg.subjectId === subject.id).length;
    return {
      subject,
      packageCount,
      tryoutCount,
      isAvailable: tryoutCount > 0 || packageCount > 0,
    };
  });
}
