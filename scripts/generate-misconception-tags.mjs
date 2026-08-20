/**
 * Menandai pengecoh soal dengan miskonsepsi yang sesuai.
 *
 *   node scripts/generate-misconception-tags.mjs                     # seluruh mapel
 *   node scripts/generate-misconception-tags.mjs bahasa-inggris-sma  # satu mapel
 *
 * Masukan:
 *   supabase/seed/<mapel>-miskonsepsi.map.json          peta yang ditulis tim konten
 *   Supabase (SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)   isi soal yang berlaku sekarang
 *
 * Keluaran:
 *   supabase/seed/<mapel>-miskonsepsi.sql               aman dijalankan ulang
 *
 * Soal dibaca lebih dulu supaya teks pilihan tidak perlu ditulis ulang di peta:
 * skrip ini hanya menyisipkan `misconceptionId` ke dalam options/statements yang
 * sudah ada. Peta diperiksa terhadap isi basis data, dan skrip berhenti bila ada
 * soal, kunci pilihan, atau miskonsepsi yang tidak dikenali — lebih baik gagal
 * keras daripada menghasilkan SQL yang diam-diam melewatkan penandaan.
 *
 * Bentuk peta per paket:
 *
 *   {
 *     "slug": "...",                       keterangan saja, tidak dipakai skrip
 *     "questionPrefix": "tka-bi-serapan-auth-",
 *     "misGroup": "bi-serapan",            dipakai bila penandanya berupa angka
 *     "misconceptions": [                  opsional; bila ada, definisinya ikut ditulis
 *       { "n": 1, "label": "...", "description": "...", "insight": "..." }
 *     ],
 *     "questions": { "001": { "A": 6, "C": "mis-bi-serapan-005" } }
 *   }
 *
 * Penanda berupa angka menjadi `mis-<misGroup>-<angka tiga digit>`; penanda berupa
 * teks dipakai apa adanya. Bentuk kedua dipakai paket tryout, yang satu paketnya
 * mencakup banyak materi sehingga miskonsepsinya berasal dari beberapa kelompok.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const SEED_DIR = path.join(ROOT, "supabase", "seed");

/**
 * Mapel yang penandaannya sudah ditulis. Berkas SQL-nya dinamai mengikuti peta,
 * jadi menambah mapel baru cukup menambah satu entri di sini.
 */
const SUBJECTS = {
  "matematika-sma": {
    map: "tka-matematika-miskonsepsi.map.json",
    out: "tka-matematika-miskonsepsi.sql",
    title: "Matematika SMA",
  },
  "bahasa-indonesia-sma": {
    map: "tka-bahasa-indonesia-sma-miskonsepsi.map.json",
    out: "tka-bahasa-indonesia-sma-miskonsepsi.sql",
    title: "Bahasa Indonesia SMA",
  },
  "bahasa-inggris-sma": {
    map: "tka-bahasa-inggris-sma-miskonsepsi.map.json",
    out: "tka-bahasa-inggris-sma-miskonsepsi.sql",
    title: "Bahasa Inggris SMA",
  },
};

const requested = process.argv.slice(2);
for (const key of requested) {
  if (!SUBJECTS[key]) {
    throw new Error(`Mapel tidak dikenal: ${key}. Pilihan: ${Object.keys(SUBJECTS).join(", ")}`);
  }
}
const selected = requested.length > 0 ? requested : Object.keys(SUBJECTS);

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

const [questions, misconceptions] = await Promise.all([
  readAll("questions", "id, type, options, statements, correct_answer, correct_answers"),
  readAll("misconceptions", "id"),
]);

const questionById = new Map(questions.map((row) => [row.id, row]));
const knownMisconceptions = new Set(misconceptions.map((row) => row.id));

const quote = (text) => `'${String(text).replace(/'/g, "''")}'`;

/** Penanda boleh berupa nomor dalam kelompok paket, atau id utuh. */
function misconceptionIdOf(value, pkg) {
  if (typeof value === "number") {
    if (!pkg.misGroup) return null;
    return `mis-${pkg.misGroup}-${String(value).padStart(3, "0")}`;
  }
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function definitionIdOf(definition, pkg) {
  if (definition.id) return definition.id;
  if (typeof definition.n === "number" && pkg.misGroup) {
    return `mis-${pkg.misGroup}-${String(definition.n).padStart(3, "0")}`;
  }
  return null;
}

/** Satu mapel: memeriksa petanya, lalu menyusun pernyataan SQL-nya. */
function buildSubject(key) {
  const subject = SUBJECTS[key];
  const map = JSON.parse(fs.readFileSync(path.join(SEED_DIR, subject.map), "utf8"));

  const problems = [];
  const definitions = new Map();
  const updates = [];
  let taggedParts = 0;

  // Definisi dikumpulkan lebih dahulu supaya penanda yang menunjuk miskonsepsi
  // baru — yang belum ada di basis data — tidak dianggap tidak dikenal.
  for (const pkg of map.packages) {
    for (const definition of pkg.misconceptions ?? []) {
      const id = definitionIdOf(definition, pkg);
      if (!id) {
        problems.push(`${pkg.slug}: definisi tanpa id maupun nomor yang dapat dipakai.`);
        continue;
      }
      for (const field of ["label", "description", "insight"]) {
        if (!definition[field]?.trim()) problems.push(`${id}: ${field} kosong.`);
      }
      const existing = definitions.get(id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(definition)) {
        problems.push(`${id}: didefinisikan dua kali dengan isi berbeda.`);
      }
      definitions.set(id, definition);
    }
  }

  for (const pkg of map.packages) {
    for (const [number, assignments] of Object.entries(pkg.questions)) {
      const questionId = `${pkg.questionPrefix}${number}`;
      const question = questionById.get(questionId);
      if (!question) {
        problems.push(`Soal tidak ditemukan: ${questionId}`);
        continue;
      }

      const isCategory = question.type === "category";
      const parts = structuredClone(
        isCategory ? (question.statements ?? []) : (question.options ?? []),
      );
      const partById = new Map(parts.map((part) => [isCategory ? part.id : part.key, part]));

      let changed = false;
      for (const [partKey, value] of Object.entries(assignments)) {
        const part = partById.get(partKey);
        if (!part) {
          problems.push(`${questionId}: bagian "${partKey}" tidak ada pada soal.`);
          continue;
        }

        const misconceptionId = misconceptionIdOf(value, pkg);
        if (!misconceptionId) {
          problems.push(`${questionId}: penanda "${partKey}" tidak dapat dibaca.`);
          continue;
        }
        if (!knownMisconceptions.has(misconceptionId) && !definitions.has(misconceptionId)) {
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
    console.error(`Peta ${subject.map} bermasalah (${problems.length}):`);
    for (const problem of problems) console.error(`  - ${problem}`);
    return null;
  }

  const definitionRows = [...definitions.entries()].map(
    ([id, definition]) =>
      `  (${quote(id)}, ${quote(definition.label)}, ${quote(definition.description)}, ${quote(definition.insight)})`,
  );

  const sql = [
    `-- Penandaan miskonsepsi pada pengecoh soal ${subject.title}.`,
    `-- Sumber: supabase/seed/${subject.map}`,
    "-- Dihasilkan oleh scripts/generate-misconception-tags.mjs. Aman dijalankan ulang.",
    "--",
    `-- ${definitionRows.length} definisi miskonsepsi, ${updates.length} soal, ${taggedParts} pengecoh dan pernyataan ditandai.`,
    "begin;",
    "",
  ];

  if (definitionRows.length > 0) {
    sql.push(
      "insert into public.misconceptions (id, label, description, insight) values",
      `${definitionRows.join(",\n")}`,
      "on conflict (id) do update set",
      "  label = excluded.label,",
      "  description = excluded.description,",
      "  insight = excluded.insight;",
      "",
    );
  }

  sql.push(
    ...updates.map(
      ({ questionId, column, value }) =>
        `update public.questions set ${column} = ${quote(JSON.stringify(value))}::jsonb, updated_at = now() where id = ${quote(questionId)};`,
    ),
    "",
    "commit;",
    "",
  );

  fs.writeFileSync(path.join(SEED_DIR, subject.out), sql.join("\n"), "utf8");
  return { definitions: definitionRows.length, updates: updates.length, taggedParts };
}

let failed = false;
for (const key of selected) {
  const result = buildSubject(key);
  if (!result) {
    failed = true;
    continue;
  }
  console.log(
    `${SUBJECTS[key].out}: ${result.updates} soal, ${result.taggedParts} penanda, ${result.definitions} definisi.`,
  );
}
if (failed) process.exit(1);
