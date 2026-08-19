/**
 * Menyusun SQL seed paket latihan TKA Matematika SD dari berkas JSON per paket.
 *
 *   node scripts/build-matematika-sd.mjs
 *
 * Masukan:
 *   supabase/seed/matematika-sd/_taksonomi.json   mapel, seri, produk, capaian, materi
 *   supabase/seed/matematika-sd/NN-<key>.json     satu paket = satu submateri = 10 soal
 *
 * Keluaran:
 *   supabase/seed/tka-matematika-sd.sql           aman dijalankan ulang
 *
 * Berkas ditolak bila validasinya gagal, supaya kesalahan kunci jawaban atau id
 * yang menggantung tidak ikut masuk ke basis data. Aturan validasinya mengikuti
 * docs/format-soal-standar.md bagian 6.
 */
import fs from "node:fs";
import path from "node:path";

const SRC_DIR = path.join(process.cwd(), "supabase", "seed", "matematika-sd");
const OUT_FILE = path.join(process.cwd(), "supabase", "seed", "tka-matematika-sd.sql");

const DIFFICULTIES = new Set(["dasar", "menengah", "lanjut"]);
const REASONINGS = new Set(["pemahaman", "penerapan", "penalaran"]);
const VISUAL_TYPES = new Set(["svg", "image"]);
const SOAL_PER_PAKET = 10;

const errors = [];
const warnings = [];

function fail(where, message) {
  errors.push(`${where}: ${message}`);
}

// ------------------------------------------------------------------ pemuatan

const taxonomy = JSON.parse(fs.readFileSync(path.join(SRC_DIR, "_taksonomi.json"), "utf8"));

const packageFiles = fs
  .readdirSync(SRC_DIR)
  .filter((name) => name.endsWith(".json") && !name.startsWith("_"))
  .sort();

const packages = packageFiles.map((name) => ({
  file: name,
  ...JSON.parse(fs.readFileSync(path.join(SRC_DIR, name), "utf8")),
}));

// ------------------------------------------------------------------ validasi

const topicIds = new Set(taxonomy.capaian.map((t) => t.id));
const subtopicIds = new Set(taxonomy.materi.map((s) => s.id));

for (const materi of taxonomy.materi) {
  if (!topicIds.has(materi.topic_id)) {
    fail("_taksonomi.json", `materi ${materi.id} menunjuk capaian tak dikenal ${materi.topic_id}`);
  }
}

/** Nama capaian dan materi tidak boleh kembar setelah dinormalkan. */
function normalise(value) {
  return value.toLowerCase().replace(/[.,;:]+$/, "").trim();
}
for (const [label, rows] of [
  ["capaian", taxonomy.capaian],
  ["materi", taxonomy.materi],
]) {
  const seen = new Map();
  for (const row of rows) {
    const key = normalise(row.name);
    if (seen.has(key)) fail("_taksonomi.json", `${label} kembar: ${row.id} vs ${seen.get(key)}`);
    seen.set(key, row.id);
  }
}

const packageIds = new Set();
const packageSlugs = new Set();
const conceptIds = new Set();
const questionIds = new Set();
const misconceptionIds = new Set();
const concepts = [];
const misconceptions = [];

for (const pkg of packages) {
  const where = pkg.file;
  const p = pkg.paket;

  if (!p) {
    fail(where, "tidak ada blok `paket`");
    continue;
  }
  for (const field of ["id", "slug", "title", "description", "summary", "sort_order"]) {
    if (p[field] === undefined || p[field] === null || p[field] === "") {
      fail(where, `paket.${field} kosong`);
    }
  }
  if (packageIds.has(p.id)) fail(where, `paket.id ganda: ${p.id}`);
  if (packageSlugs.has(p.slug)) fail(where, `paket.slug ganda: ${p.slug}`);
  packageIds.add(p.id);
  packageSlugs.add(p.slug);

  if (!topicIds.has(p.topic_id)) fail(where, `paket.topic_id tak dikenal: ${p.topic_id}`);
  if (!subtopicIds.has(p.subtopic_id)) fail(where, `paket.subtopic_id tak dikenal: ${p.subtopic_id}`);

  // Submateri dideklarasikan di dalam berkas paketnya, satu per paket.
  const c = pkg.submateri;
  if (!c) {
    fail(where, "tidak ada blok `submateri`");
  } else {
    if (conceptIds.has(c.id)) fail(where, `submateri.id ganda: ${c.id}`);
    conceptIds.add(c.id);
    concepts.push({ ...c, subtopic_id: p.subtopic_id, sort_order: p.sort_order });
  }

  for (const mis of pkg.miskonsepsi ?? []) {
    if (misconceptionIds.has(mis.id)) fail(where, `miskonsepsi.id ganda: ${mis.id}`);
    for (const field of ["id", "label", "description", "insight"]) {
      if (!mis[field]) fail(where, `miskonsepsi ${mis.id ?? "?"} kolom ${field} kosong`);
    }
    misconceptionIds.add(mis.id);
    misconceptions.push(mis);
  }

  const soal = pkg.soal ?? [];
  if (soal.length !== SOAL_PER_PAKET) {
    fail(where, `jumlah soal ${soal.length}, seharusnya ${SOAL_PER_PAKET}`);
  }

  const localMis = new Set((pkg.miskonsepsi ?? []).map((m) => m.id));
  const tally = { tipe: {}, kesulitan: {}, penalaran: {} };

  soal.forEach((q, index) => {
    const at = `${where} soal ${q.no ?? index + 1}`;

    if (!q.id) fail(at, "id kosong");
    else if (questionIds.has(q.id)) fail(at, `id ganda: ${q.id}`);
    else questionIds.add(q.id);

    if (q.no !== index + 1) fail(at, `nomor tidak berurutan (tertulis ${q.no})`);
    if (!q.kompetensi) fail(at, "kompetensi kosong");
    if (!q.pertanyaan) fail(at, "pertanyaan kosong");
    if (!q.pembahasan) fail(at, "pembahasan kosong");
    if (!DIFFICULTIES.has(q.kesulitan)) fail(at, `kesulitan tak dikenal: ${q.kesulitan}`);
    if (!REASONINGS.has(q.penalaran)) fail(at, `penalaran tak dikenal: ${q.penalaran}`);

    if (q.visual) {
      if (!q.visual.prompt) fail(at, "visual.prompt kosong");
      if (!VISUAL_TYPES.has(q.visual.type)) fail(at, `visual.type tak dikenal: ${q.visual.type}`);
    }

    const refs = [];

    if (q.tipe === "single" || q.tipe === "mcma") {
      const opsi = q.opsi ?? [];
      const codes = opsi.map((o) => o.kode);
      if (new Set(codes).size !== codes.length) fail(at, "kode opsi ganda");
      if (q.tipe === "single" && opsi.length !== 4) {
        fail(at, `PG TKA SD memakai 4 opsi, ditemukan ${opsi.length}`);
      }
      if (q.tipe === "mcma" && opsi.length < 4) {
        fail(at, `MCMA minimal 4 opsi, ditemukan ${opsi.length}`);
      }
      for (const o of opsi) {
        if (!o.teks) fail(at, `opsi ${o.kode} teks kosong`);
        if (o.mis) refs.push(o.mis);
      }

      if (q.tipe === "single") {
        if (!codes.includes(q.kunci)) fail(at, `kunci ${q.kunci} tidak ada di opsi`);
        if (q.kunci_ganda) fail(at, "PG tidak boleh punya kunci_ganda");
        const keyed = opsi.find((o) => o.kode === q.kunci);
        if (keyed?.mis) fail(at, `opsi kunci ${q.kunci} tidak boleh punya miskonsepsi`);
      } else {
        const keys = q.kunci_ganda ?? [];
        if (keys.length < 2) fail(at, "MCMA butuh minimal dua kunci");
        if (keys.length >= opsi.length) fail(at, "MCMA tidak boleh semua opsi benar");
        for (const k of keys) {
          if (!codes.includes(k)) fail(at, `kunci ${k} tidak ada di opsi`);
          const keyed = opsi.find((o) => o.kode === k);
          if (keyed?.mis) fail(at, `opsi kunci ${k} tidak boleh punya miskonsepsi`);
        }
        if (q.kunci) fail(at, "MCMA tidak boleh punya kunci tunggal");
      }
    } else if (q.tipe === "category") {
      const kategori = q.kategori ?? [];
      const pernyataan = q.pernyataan ?? [];
      if (kategori.length < 2) fail(at, "kategori minimal dua");
      if (pernyataan.length < 3) fail(at, "pernyataan minimal tiga");
      const kodeKategori = new Set(kategori.map((k) => k.kode));
      for (const k of kategori) if (!k.label) fail(at, `kategori ${k.kode} label kosong`);
      const idPernyataan = new Set();
      for (const s of pernyataan) {
        if (!s.id) fail(at, "pernyataan tanpa id");
        if (idPernyataan.has(s.id)) fail(at, `id pernyataan ganda: ${s.id}`);
        idPernyataan.add(s.id);
        if (!s.teks) fail(at, `pernyataan ${s.id} teks kosong`);
        if (!kodeKategori.has(s.kategori)) {
          fail(at, `pernyataan ${s.id} kategori tak terdaftar: ${s.kategori}`);
        }
        if (s.mis) refs.push(s.mis);
      }
      // Semua pernyataan jatuh di satu kategori membuat soalnya tidak mendiskriminasi.
      const used = new Set(pernyataan.map((s) => s.kategori));
      if (used.size < 2) warnings.push(`${at}: semua pernyataan masuk satu kategori`);
      if (q.opsi || q.kunci || q.kunci_ganda) fail(at, "soal kategori tidak boleh punya opsi/kunci");
    } else {
      fail(at, `tipe tak dikenal: ${q.tipe}`);
    }

    for (const ref of refs) {
      if (!localMis.has(ref)) fail(at, `miskonsepsi tak terdaftar di paket ini: ${ref}`);
    }

    tally.tipe[q.tipe] = (tally.tipe[q.tipe] ?? 0) + 1;
    tally.kesulitan[q.kesulitan] = (tally.kesulitan[q.kesulitan] ?? 0) + 1;
    tally.penalaran[q.penalaran] = (tally.penalaran[q.penalaran] ?? 0) + 1;
  });

  // Matriks TKA menuntut porsi penalaran yang nyata, bukan sekadar hafalan.
  const bernalar = (tally.penalaran.penerapan ?? 0) + (tally.penalaran.penalaran ?? 0);
  if (soal.length === SOAL_PER_PAKET && bernalar < 7) {
    warnings.push(`${where}: hanya ${bernalar}/10 soal penerapan+penalaran`);
  }
  if (soal.length === SOAL_PER_PAKET && (tally.tipe.single ?? 0) === SOAL_PER_PAKET) {
    warnings.push(`${where}: seluruh soal bertipe PG, tidak ada MCMA/kategori`);
  }

  pkg._tally = tally;
}

if (errors.length) {
  console.error(`\n${errors.length} kesalahan — SQL tidak ditulis:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

// ------------------------------------------------------------------- penulis

const q = (value) => {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
};
const jsonb = (value) =>
  value === null || value === undefined ? "null" : `${q(JSON.stringify(value))}::jsonb`;
const textArray = (values) =>
  !values || values.length === 0 ? "'{}'" : `array[${values.map(q).join(", ")}]`;
const bool = (value) => (value ? "true" : "false");
const num = (value) => (value === null || value === undefined ? "null" : String(value));

/** `insert ... on conflict (id) do update set` untuk seluruh kolom non-kunci. */
function upsert(table, columns, rows, conflict = "id") {
  const assignments = columns
    .filter((c) => c !== conflict)
    .map((c) => `${c} = excluded.${c}`)
    .join(", ");
  const values = rows.map((r) => `  (${r.join(", ")})`).join(",\n");
  return (
    `insert into public.${table} (${columns.join(", ")}) values\n${values}\n` +
    `on conflict (${conflict}) do update set ${assignments};`
  );
}

const out = [];
const total = packages.reduce((sum, p) => sum + p.soal.length, 0);

out.push("-- Latihan TKA Matematika SD");
out.push(`-- ${packages.length} paket, ${total} soal. Satu paket untuk satu bullet kompetensi`);
out.push("-- pada matriks asesmen TKA SD (Pusmendik), mata pelajaran wajib Matematika.");
out.push("--");
out.push("-- Dihasilkan oleh scripts/build-matematika-sd.mjs dari");
out.push("-- supabase/seed/matematika-sd/*.json. Jangan disunting langsung: ubah JSON-nya");
out.push("-- lalu jalankan ulang skripnya. Aman dijalankan berulang di SQL Editor.");
out.push("");
out.push("begin;");
out.push("");

// mapel, seri, produk
const m = taxonomy.mapel;
out.push("-- Mata pelajaran");
out.push(
  upsert(
    "subjects",
    ["id", "slug", "name", "short_name", "level", "description", "sort_order"],
    [[q(m.id), q(m.slug), q(m.name), q(m.short_name), q(m.level), q(m.description), num(m.sort_order)]],
  ),
);
out.push("");

const s = taxonomy.seri;
out.push("-- Seri dan produk");
out.push(
  upsert(
    "content_series",
    ["id", "slug", "title", "description", "is_active", "sort_order"],
    [[q(s.id), q(s.slug), q(s.title), q(s.description), "true", num(s.sort_order)]],
  ),
);
const pr = taxonomy.produk;
out.push(
  upsert(
    "products",
    ["id", "slug", "title", "subject_id", "series_id", "description", "is_active", "sort_order"],
    [[q(pr.id), q(pr.slug), q(pr.title), q(m.id), q(s.id), q(pr.description), "true", num(pr.sort_order)]],
  ),
);
out.push("");

// capaian, materi, submateri
out.push("-- Capaian (elemen)");
out.push(
  upsert(
    "topics",
    ["id", "subject_id", "slug", "name", "description", "sort_order"],
    taxonomy.capaian.map((t) => [
      q(t.id),
      q(m.id),
      q(t.slug),
      q(t.name),
      q(t.description),
      num(t.sort_order),
    ]),
  ),
);
out.push("");
out.push("-- Materi (sub-elemen)");
out.push(
  upsert(
    "subtopics",
    ["id", "topic_id", "slug", "name", "description", "sort_order"],
    taxonomy.materi.map((st) => [
      q(st.id),
      q(st.topic_id),
      q(st.slug),
      q(st.name),
      q(st.description),
      num(st.sort_order),
    ]),
  ),
);
out.push("");
out.push("-- Submateri (satu per bullet kompetensi)");
out.push(
  upsert(
    "concepts",
    ["id", "subtopic_id", "name", "description", "sort_order"],
    concepts.map((c) => [q(c.id), q(c.subtopic_id), q(c.name), q(c.description), num(c.sort_order)]),
  ),
);
out.push("");

// miskonsepsi
out.push("-- Miskonsepsi yang dilacak pengecoh");
out.push(
  upsert(
    "misconceptions",
    ["id", "label", "description", "insight"],
    misconceptions.map((mis) => [q(mis.id), q(mis.label), q(mis.description), q(mis.insight)]),
  ),
);
out.push("");

// soal
const questionColumns = [
  "id",
  "subject_id",
  "topic_id",
  "subtopic_id",
  "concept_id",
  "type",
  "competency",
  "difficulty",
  "reasoning_type",
  "content_format",
  "stimulus",
  "question_text",
  "instruction",
  "explanation",
  "options",
  "correct_answer",
  "correct_answers",
  "categories",
  "statements",
  "source_answer_key",
  "requires_visual",
  "visual_prompt",
  "visual_type",
];

const DEFAULT_INSTRUCTION = {
  single: "Pilih satu jawaban.",
  mcma: "Pilih semua jawaban yang benar.",
  category: "Tentukan kategori setiap pernyataan.",
};

function questionRow(pkg, item) {
  const p = pkg.paket;
  const isChoice = item.tipe === "single" || item.tipe === "mcma";
  const options = isChoice
    ? item.opsi.map((o) => (o.mis ? { key: o.kode, text: o.teks, misconceptionId: o.mis } : { key: o.kode, text: o.teks }))
    : null;
  const categories = item.tipe === "category" ? item.kategori.map((k) => ({ key: k.kode, label: k.label })) : null;
  const statements =
    item.tipe === "category"
      ? item.pernyataan.map((st) =>
          st.mis
            ? { id: st.id, text: st.teks, correctCategoryKey: st.kategori, misconceptionId: st.mis }
            : { id: st.id, text: st.teks, correctCategoryKey: st.kategori },
        )
      : null;

  const sourceKey =
    item.tipe === "single"
      ? item.kunci
      : item.tipe === "mcma"
        ? item.kunci_ganda.join(", ")
        : item.pernyataan.map((st) => `${st.id}: ${st.kategori}`).join("; ");

  return [
    q(item.id),
    q(m.id),
    q(p.topic_id),
    q(p.subtopic_id),
    q(pkg.submateri.id),
    q(item.tipe),
    q(item.kompetensi),
    q(item.kesulitan),
    q(item.penalaran),
    q("html"),
    q(item.stimulus ?? null),
    q(item.pertanyaan),
    q(item.perintah ?? DEFAULT_INSTRUCTION[item.tipe]),
    q(item.pembahasan),
    jsonb(options),
    item.tipe === "single" ? q(item.kunci) : "null",
    item.tipe === "mcma" ? textArray(item.kunci_ganda) : "null",
    jsonb(categories),
    jsonb(statements),
    q(sourceKey),
    bool(Boolean(item.visual)),
    q(item.visual?.prompt ?? null),
    q(item.visual?.type ?? null),
  ];
}

out.push("-- Soal");
out.push(
  upsert(
    "questions",
    questionColumns,
    packages.flatMap((pkg) => pkg.soal.map((item) => questionRow(pkg, item))),
  ),
);
out.push("");

// paket
out.push("-- Paket latihan");
out.push(
  upsert(
    "packages",
    [
      "id",
      "kind",
      "slug",
      "title",
      "subject_id",
      "series_id",
      "level",
      "description",
      "summary",
      "variant",
      "variant_label",
      "estimated_minutes",
      "difficulty_range",
      "skills",
      "instructions",
      "is_premium",
      "is_published",
      "sort_order",
      "source_id",
      "source_file",
    ],
    packages.map((pkg) => {
      const p = pkg.paket;
      return [
        q(p.id),
        q("latihan"),
        q(p.slug),
        q(p.title),
        q(m.id),
        q(s.id),
        q("SD"),
        q(p.description),
        q(p.summary),
        q("adaptif"),
        q("Latihan TKA"),
        num(p.estimated_minutes ?? 25),
        q(p.difficulty_range ?? "dasar–lanjut"),
        textArray(p.skills),
        textArray(
          p.instructions ?? [
            "Baca stimulus dengan teliti.",
            "Perhatikan satuan dan bentuk bilangan yang diminta.",
            "Periksa kembali hasil hitunganmu sebelum lanjut.",
          ],
        ),
        bool(false),
        bool(true),
        num(p.sort_order),
        q(`authored-tka-matematika-sd-${p.slug}`),
        q(pkg.file),
      ];
    }),
  ),
);
out.push("");

out.push("-- Urutan soal di dalam paket");
out.push(
  upsert(
    "package_questions",
    ["package_id", "question_id", "position"],
    packages.flatMap((pkg) => pkg.soal.map((item) => [q(pkg.paket.id), q(item.id), num(item.no)])),
    "package_id, question_id",
  ),
);
out.push("");
out.push("commit;");
out.push("");

fs.writeFileSync(OUT_FILE, out.join("\n"), "utf8");

// -------------------------------------------------------------------- laporan

const agg = { tipe: {}, kesulitan: {}, penalaran: {} };
for (const pkg of packages) {
  for (const dim of Object.keys(agg)) {
    for (const [k, v] of Object.entries(pkg._tally[dim])) {
      agg[dim][k] = (agg[dim][k] ?? 0) + v;
    }
  }
}
const visual = packages.reduce((n, p) => n + p.soal.filter((it) => it.visual).length, 0);

console.log(`\n${path.relative(process.cwd(), OUT_FILE)}`);
console.log(`  paket        ${packages.length}`);
console.log(`  soal         ${total}`);
console.log(`  submateri    ${concepts.length}`);
console.log(`  miskonsepsi  ${misconceptions.length}`);
console.log(`  butuh gambar ${visual}`);
for (const [dim, counts] of Object.entries(agg)) {
  const line = Object.entries(counts)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  console.log(`  ${dim.padEnd(12)} ${line}`);
}
if (warnings.length) {
  console.log(`\n${warnings.length} catatan:`);
  for (const w of warnings) console.log(`  - ${w}`);
}
console.log("");
