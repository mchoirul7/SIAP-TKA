/**
 * Menandai pengecoh soal dengan miskonsepsi yang sesuai.
 *
 *   node scripts/generate-misconception-tags.mjs
 *
 * Masukan:
 *   supabase/seed/tka-matematika-miskonsepsi.map.json  peta yang ditulis tim konten
 *   Supabase (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)  isi soal yang berlaku sekarang
 *
 * Keluaran:
 *   supabase/seed/tka-matematika-miskonsepsi.sql       update yang aman dijalankan ulang
 *
 * Soal dibaca lebih dulu supaya teks pilihan tidak perlu ditulis ulang di peta:
 * skrip ini hanya menyisipkan `misconceptionId` ke dalam options/statements yang
 * sudah ada. Peta diperiksa terhadap isi basis data, dan skrip berhenti bila ada
 * soal, kunci pilihan, atau miskonsepsi yang tidak dikenali — lebih baik gagal
 * keras daripada menghasilkan SQL yang diam-diam melewatkan penandaan.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const MAP_FILE = path.join(ROOT, "supabase", "seed", "tka-matematika-miskonsepsi.map.json");
const OUT_FILE = path.join(ROOT, "supabase", "seed", "tka-matematika-miskonsepsi.sql");

function readEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return process.env;
  const parsed = Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.startsWith("#"))
      .map((line) => {
        const at = line.indexOf("=");
        return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
      }),
  );
  return { ...parsed, ...process.env };
}

const env = readEnv();
if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY belum diatur.");
}
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);

async function readAll(table, columns) {
  const rows = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + 499);
    if (error) throw new Error(`Gagal membaca ${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 500) break;
  }
  return rows;
}

const map = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
const [questions, misconceptions] = await Promise.all([
  readAll("questions", "id, type, options, statements, correct_answer, correct_answers"),
  readAll("misconceptions", "id"),
]);

const questionById = new Map(questions.map((row) => [row.id, row]));
const knownMisconceptions = new Set(misconceptions.map((row) => row.id));

const problems = [];
const updates = [];
let taggedParts = 0;

for (const pkg of map.packages) {
  for (const [number, assignments] of Object.entries(pkg.questions)) {
    const questionId = `${pkg.questionPrefix}${number}`;
    const question = questionById.get(questionId);
    if (!question) {
      problems.push(`Soal tidak ditemukan: ${questionId}`);
      continue;
    }

    const isCategory = question.type === "category";
    const parts = structuredClone(isCategory ? (question.statements ?? []) : (question.options ?? []));
    const partById = new Map(parts.map((part) => [isCategory ? part.id : part.key, part]));

    let changed = false;
    for (const [partKey, misNumber] of Object.entries(assignments)) {
      const part = partById.get(partKey);
      if (!part) {
        problems.push(`${questionId}: bagian "${partKey}" tidak ada pada soal.`);
        continue;
      }

      const misconceptionId = `mis-${pkg.misGroup}-${String(misNumber).padStart(3, "0")}`;
      if (!knownMisconceptions.has(misconceptionId)) {
        problems.push(`${questionId}: miskonsepsi "${misconceptionId}" tidak ada di katalog.`);
        continue;
      }

      // Kunci jawaban tidak ditandai: penanda hanya bermakna pada pengecoh.
      if (!isCategory) {
        const isKey =
          question.type === "mcma"
            ? (question.correct_answers ?? []).includes(partKey)
            : question.correct_answer === partKey;
        if (isKey) {
          problems.push(`${questionId}: "${partKey}" adalah kunci jawaban, tidak boleh ditandai.`);
          continue;
        }
      }

      part.misconceptionId = misconceptionId;
      taggedParts += 1;
      changed = true;
    }

    if (!changed) continue;
    updates.push({ questionId, column: isCategory ? "statements" : "options", value: parts });
  }
}

if (problems.length > 0) {
  console.error(`Peta miskonsepsi bermasalah (${problems.length}):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const quote = (text) => `'${String(text).replace(/'/g, "''")}'`;

const sql = [
  "-- Penandaan miskonsepsi pada pengecoh soal Matematika SMA.",
  "-- Sumber: supabase/seed/tka-matematika-miskonsepsi.map.json",
  "-- Dihasilkan oleh scripts/generate-misconception-tags.mjs. Aman dijalankan ulang.",
  "--",
  `-- ${updates.length} soal, ${taggedParts} pengecoh dan pernyataan ditandai.`,
  "begin;",
  "",
  ...updates.map(
    ({ questionId, column, value }) =>
      `update public.questions set ${column} = ${quote(JSON.stringify(value))}::jsonb, updated_at = now() where id = ${quote(questionId)};`,
  ),
  "",
  "commit;",
  "",
].join("\n");

fs.writeFileSync(OUT_FILE, sql, "utf8");
console.log(`${updates.length} soal ditulis ke ${path.relative(ROOT, OUT_FILE)} (${taggedParts} penanda).`);
