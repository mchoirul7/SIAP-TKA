/**
 * Menghasilkan seed SQL dari data statis yang sekarang ada di src/data.
 * Dijalankan sekali untuk memindahkan isi prototype ke Supabase.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src", "data");
const TMP = path.join(ROOT, ".seed-tmp");

// Salin data ke direktori sementara sambil menambahkan ekstensi .ts pada impor relatif,
// supaya bisa diimpor langsung oleh Node tanpa bundler.
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });
for (const file of fs.readdirSync(SRC)) {
  if (!file.endsWith(".ts")) continue;
  const body = fs
    .readFileSync(path.join(SRC, file), "utf8")
    .replace(/from "\.\/([A-Za-z0-9_-]+)"/g, 'from "./$1.ts"');
  fs.writeFileSync(path.join(TMP, file), body, "utf8");
}

const load = (name) => import(pathToFileURL(path.join(TMP, name)).href);

const { questionBank } = await load("questionBank.ts");
const { subjects, topics, subtopics } = await load("subjects.ts");
const { concepts } = await load("concepts.ts");
const { misconceptions } = await load("misconceptions.ts");
const { subtopicPrerequisites, conceptPrerequisites } = await load("prerequisites.ts");
const { practicePackages } = await load("practicePackages.ts");
const { tryouts } = await load("tryouts.ts");

// ---------------------------------------------------------------- helpers
const q = (value) => {
  if (value === undefined || value === null) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
};
const json = (value) =>
  value === undefined || value === null ? "null" : `${q(JSON.stringify(value))}::jsonb`;
const textArray = (value) =>
  value === undefined || value === null
    ? "null"
    : `array[${value.map((v) => q(v)).join(",")}]::text[]`;

const out = [];
const say = (line = "") => out.push(line);

say("-- Seed konten Siap TKA. Dihasilkan dari src/data oleh skrip konversi.");
say("-- Aman dijalankan ulang: setiap baris memakai ON CONFLICT DO UPDATE.");
say("begin;");
say();

// ------------------------------------------------------------- taksonomi
say("-- Mata pelajaran");
subjects.forEach((s, i) => {
  say(
    `insert into public.subjects (id, slug, name, short_name, level, description, sort_order) values (${q(s.id)}, ${q(s.slug)}, ${q(s.name)}, ${q(s.shortName)}, ${q(s.level)}, ${q(s.description)}, ${i}) on conflict (id) do update set slug = excluded.slug, name = excluded.name, short_name = excluded.short_name, level = excluded.level, description = excluded.description, sort_order = excluded.sort_order;`,
  );
});
say();

say("-- Topik");
topics.forEach((t, i) => {
  say(
    `insert into public.topics (id, subject_id, slug, name, sort_order) values (${q(t.id)}, ${q(t.subjectId)}, ${q(t.slug)}, ${q(t.name)}, ${i}) on conflict (id) do update set subject_id = excluded.subject_id, slug = excluded.slug, name = excluded.name, sort_order = excluded.sort_order;`,
  );
});
say();

say("-- Subtopik");
subtopics.forEach((s, i) => {
  say(
    `insert into public.subtopics (id, topic_id, slug, name, description, sort_order) values (${q(s.id)}, ${q(s.topicId)}, ${q(s.slug)}, ${q(s.name)}, ${q(s.description)}, ${i}) on conflict (id) do update set topic_id = excluded.topic_id, slug = excluded.slug, name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;`,
  );
});
say();

say("-- Konsep");
concepts.forEach((c, i) => {
  say(
    `insert into public.concepts (id, subtopic_id, name, description, sort_order) values (${q(c.id)}, ${q(c.subtopicId)}, ${q(c.name)}, ${q(c.description)}, ${i}) on conflict (id) do update set subtopic_id = excluded.subtopic_id, name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;`,
  );
});
say();

say("-- Miskonsepsi");
misconceptions.forEach((m) => {
  say(
    `insert into public.misconceptions (id, label, description, insight) values (${q(m.id)}, ${q(m.label)}, ${q(m.description)}, ${q(m.insight)}) on conflict (id) do update set label = excluded.label, description = excluded.description, insight = excluded.insight;`,
  );
});
say();

say("-- Prasyarat");
subtopicPrerequisites.forEach((p) => {
  say(
    `insert into public.subtopic_prerequisites (subtopic_id, requires_subtopic_id, reason) values (${q(p.subtopicId)}, ${q(p.requiresSubtopicId)}, ${q(p.reason)}) on conflict (subtopic_id, requires_subtopic_id) do update set reason = excluded.reason;`,
  );
});
(conceptPrerequisites ?? []).forEach((p) => {
  say(
    `insert into public.concept_prerequisites (concept_id, requires_concept_id) values (${q(p.conceptId)}, ${q(p.requiresConceptId)}) on conflict do nothing;`,
  );
});
say();

// ------------------------------------------------------------------ soal
say("-- Soal");
questionBank.forEach((question) => {
  const options = question.type === "category" ? null : question.options;
  const correctAnswer = question.type === "single" ? question.correctAnswer : null;
  const correctAnswers = question.type === "mcma" ? question.correctAnswers : null;
  const categories = question.type === "category" ? question.categories : null;
  const statements = question.type === "category" ? question.statements : null;

  say(
    `insert into public.questions (id, subject_id, topic_id, subtopic_id, concept_id, type, competency, difficulty, reasoning_type, content_format, stimulus, question_text, instruction, explanation, options, correct_answer, correct_answers, categories, statements, source_answer_key) values (${q(question.id)}, ${q(question.subjectId)}, ${q(question.topicId)}, ${q(question.subtopicId)}, ${q(question.conceptId)}, ${q(question.type)}, ${q(question.competency)}, ${q(question.difficulty)}, ${q(question.reasoningType)}, ${q(question.contentFormat ?? "text")}, ${q(question.stimulus)}, ${q(question.questionText)}, ${q(question.instruction)}, ${q(question.explanation)}, ${json(options)}, ${q(correctAnswer)}, ${textArray(correctAnswers)}, ${json(categories)}, ${json(statements)}, null) on conflict (id) do update set subject_id = excluded.subject_id, topic_id = excluded.topic_id, subtopic_id = excluded.subtopic_id, concept_id = excluded.concept_id, type = excluded.type, competency = excluded.competency, difficulty = excluded.difficulty, reasoning_type = excluded.reasoning_type, content_format = excluded.content_format, stimulus = excluded.stimulus, question_text = excluded.question_text, instruction = excluded.instruction, explanation = excluded.explanation, options = excluded.options, correct_answer = excluded.correct_answer, correct_answers = excluded.correct_answers, categories = excluded.categories, statements = excluded.statements, source_answer_key = excluded.source_answer_key;`,
  );
});
say();

// --------------------------------------------------------------- tryout
say("-- Paket: tryout dan latihan memakai satu tabel");

function emitPackage(pkg, kind, index) {
  say(
    `insert into public.packages (id, kind, slug, title, subject_id, level, description, summary, variant, variant_label, duration_minutes, estimated_minutes, difficulty_range, skills, instructions, is_premium, is_published, sort_order, source_id, source_file) values (${q(pkg.id)}, ${q(kind)}, ${q(pkg.slug)}, ${q(pkg.title)}, ${q(pkg.subjectId)}, ${q(pkg.level)}, ${q(pkg.description)}, ${q(pkg.summary)}, ${q(pkg.variant)}, ${q(pkg.variantLabel)}, ${pkg.durationMinutes ?? "null"}, ${pkg.estimatedMinutes ?? "null"}, ${q(pkg.difficultyRange)}, ${textArray(pkg.skills) === "null" ? "'{}'" : textArray(pkg.skills)}, ${textArray(pkg.instructions) === "null" ? "'{}'" : textArray(pkg.instructions)}, ${Boolean(pkg.isPremium)}, true, ${index}, ${q(pkg.id)}, 'src/data') on conflict (id) do update set kind = excluded.kind, slug = excluded.slug, title = excluded.title, subject_id = excluded.subject_id, level = excluded.level, description = excluded.description, summary = excluded.summary, variant = excluded.variant, variant_label = excluded.variant_label, duration_minutes = excluded.duration_minutes, estimated_minutes = excluded.estimated_minutes, difficulty_range = excluded.difficulty_range, skills = excluded.skills, instructions = excluded.instructions, is_premium = excluded.is_premium, is_published = excluded.is_published, sort_order = excluded.sort_order;`,
  );
  say(`delete from public.package_questions where package_id = ${q(pkg.id)};`);
  pkg.questionIds.forEach((questionId, position) => {
    say(
      `insert into public.package_questions (package_id, question_id, position) values (${q(pkg.id)}, ${q(questionId)}, ${position});`,
    );
  });
}

tryouts.forEach((t, i) => emitPackage(t, "tryout", i));
practicePackages.forEach((p, i) => emitPackage(p, "latihan", tryouts.length + i));
say();

// -------------------------------------------------------------- voucher
say("-- Voucher demo. Kodenya tidak lagi ikut terkirim di bundel JavaScript.");
say(
  `insert into public.vouchers (code, label, is_active, max_redemptions) values ('TKA-DEMO-2026', 'Kode demo prototype', true, null) on conflict (code) do update set label = excluded.label, is_active = excluded.is_active;`,
);
practicePackages
  .filter((p) => p.isPremium)
  .forEach((p) => {
    say(
      `insert into public.voucher_packages (code, package_id) values ('TKA-DEMO-2026', ${q(p.id)}) on conflict do nothing;`,
    );
  });
say();
say("commit;");
say();

const target = path.join(ROOT, "supabase", "seed", "0002_seed_content.sql");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, out.join("\n"), "utf8");
fs.rmSync(TMP, { recursive: true, force: true });

const bytes = Buffer.byteLength(out.join("\n"), "utf8");
console.log(`seed ditulis: ${target}`);
console.log(
  `baris SQL: ${out.length} | ukuran: ${(bytes / 1024).toFixed(1)} KB | soal: ${questionBank.length} | tryout: ${tryouts.length} | paket: ${practicePackages.length}`,
);
