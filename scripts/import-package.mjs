/**
 * Mengubah berkas JSON paket soal menjadi SQL yang siap dijalankan di Supabase.
 *
 *   node scripts/import-package.mjs
 *
 * Keluaran:
 *   supabase/seed/<slug>.sql        SQL insert untuk satu paket
 *   supabase/seed/<slug>.images.txt daftar gambar yang perlu diunduh
 *
 * Berkas sumber tidak memuat jenjang, nama mata pelajaran, judul, maupun durasi,
 * jadi keterangan itu diisi lewat daftar PACKAGES di bawah.
 */
import fs from "node:fs";
import path from "node:path";

const DOWNLOADS = process.env.SOAL_DIR ?? "C:/Users/mchoi/Downloads";
const IMAGE_BASE = "https://pusmendik.kemendikdasmen.go.id";
const OUT_DIR = path.join(process.cwd(), "supabase", "seed");

const DEFAULT_SERIES = {
  id: "ser-bulan-kemerdekaan",
  slug: "bulan-kemerdekaan",
  title: "Seri Bulan Kemerdekaan",
  description: "Seri soal tematik bulan kemerdekaan.",
};

/** Keterangan paket yang tidak ada di dalam berkas JSON. */
const PACKAGES = [
  {
    file: "soal_jawaban_matematika_standar.json",
    slug: "tka-matematika-sma",
    title: "Tryout TKA Matematika SMA",
    kind: "tryout",
    level: "SMA",
    subject: { slug: "matematika-sma", name: "Matematika SMA", shortName: "Matematika" },
    durationMinutes: 90,
    variant: "resmi",
    variantLabel: "Paket soal resmi",
  },
  {
    file: "soal_jawaban_bahasa_indonesia_dengan_bacaan.json",
    slug: "tka-bahasa-indonesia-sma",
    title: "Tryout TKA Bahasa Indonesia SMA",
    kind: "tryout",
    level: "SMA",
    subject: {
      slug: "bahasa-indonesia-sma",
      name: "Bahasa Indonesia SMA",
      shortName: "Bahasa Indonesia",
    },
    durationMinutes: 90,
    variant: "resmi",
    variantLabel: "Paket soal resmi",
  },
  {
    file: "paket_bahasa_inggris_standar_final.json",
    slug: "tka-bahasa-inggris-sma",
    title: "Tryout TKA Bahasa Inggris SMA",
    kind: "tryout",
    level: "SMA",
    subject: {
      slug: "bahasa-inggris-sma",
      name: "Bahasa Inggris SMA",
      shortName: "Bahasa Inggris",
    },
    durationMinutes: 90,
    variant: "resmi",
    variantLabel: "Paket soal resmi",
    optional: true, // belum tentu ada di folder unduhan
  },
];

const TYPE_MAP = {
  PG: "single",
  "Pilihan Ganda": "single",
  "PG MCMA": "mcma",
  "Pilihan Ganda Kompleks": "mcma",
  "PG Kategori": "category",
  "Benar/Salah Kompleks": "category",
};

// ------------------------------------------------------------------ teks

/** Memperbaiki UTF-8 yang terlanjur dibaca sebagai latin-1, bila terdeteksi. */
function fixMojibake(text) {
  if (!/[ÃâÂ]/.test(text)) return text;
  return text
    .replace(/â€œ|â€\u009d/g, '"')
    .replace(/â€™|â€˜/g, "'")
    .replace(/â€"|â€"/g, "—")
    .replace(/â€¦/g, "…")
    .replace(/Â/g, "");
}

const ALLOWED = new Set(["p", "br", "strong", "em", "sup", "sub", "ul", "ol", "li", "img"]);

/**
 * Membersihkan HTML hasil ekspor: membuang komentar, pembungkus <label>/<td>
 * bawaan CBT, atribut style, dan spasi tak terpisah.
 */
function cleanHtml(raw) {
  if (!raw) return "";
  let html = fixMojibake(String(raw))
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<![^>]*>/g, "")
    .replace(/\u00a0/g, " ");

  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (full, rawTag, attrs) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED.has(tag)) return "";
    if (full.startsWith("</")) return `</${tag}>`;
    if (tag === "img") {
      const src = /src="([^"]*)"/.exec(attrs)?.[1];
      if (!src) return "";
      const alt = /alt="([^"]*)"/.exec(attrs)?.[1] ?? "";
      return `<img src="/soal/${path.basename(src)}" alt="${alt}"/>`;
    }
    if (tag === "br") return "<br/>";
    return `<${tag}>`;
  });

  return html
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

function stripTags(html) {
  return cleanHtml(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(text) {
  return stripTags(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Rumusan kompetensi TKA biasanya berbentuk
 * "Memahami, mengaplikasikan, dan bernalar ... terkait <materi>".
 * Bagian setelah "terkait" itulah nama materi yang layak ditampilkan.
 */
function shortName(competency) {
  const text = stripTags(competency);
  const marker = " terkait ";
  const at = text.toLowerCase().lastIndexOf(marker);
  const picked = at >= 0 ? text.slice(at + marker.length) : text.split(":")[0];
  const trimmed = picked.replace(/\.$/, "").trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

// ------------------------------------------------------------------- SQL

const q = (v) => (v === undefined || v === null || v === "" ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const json = (v) => (v === undefined || v === null ? "null" : `${q(JSON.stringify(v))}::jsonb`);
const arr = (v) => (!v || v.length === 0 ? "'{}'" : `array[${v.map((x) => q(x)).join(",")}]::text[]`);

// --------------------------------------------------------------- konversi

function convert(config) {
  const source = path.join(DOWNLOADS, config.file);
  if (!fs.existsSync(source)) {
    if (config.optional) return { skipped: true, file: config.file };
    throw new Error(`Berkas tidak ditemukan: ${source}`);
  }

  const parsed = JSON.parse(fs.readFileSync(source, "utf8"));
  const doc = Array.isArray(parsed) ? parsed[0] : parsed;
  const soal = doc.soal ?? [];
  const bacaan = doc.bacaan ?? [];

  const subjectId = `sub-${config.subject.slug}`;
  const packageId = `pkg-${config.slug}`;
  const series = config.series ?? DEFAULT_SERIES;
  const productId = `prd-${config.subject.slug}-${series.slug}`;
  const warnings = [];
  const images = new Set();
  const out = [];
  const say = (line = "") => out.push(line);

  const collectImages = (value) => {
    for (const m of JSON.stringify(value ?? "").matchAll(/"?src\\?":\\?"([^"\\]+)/g)) {
      images.add(m[1]);
    }
    for (const m of String(value ?? "").matchAll(/src="([^"]+)"/g)) images.add(m[1]);
  };

  // --- taksonomi diturunkan dari kompetensi & subkompetensi tiap soal ---
  //
  // Rumusan kompetensi yang sama sering ditulis berbeda-beda: huruf besar di awal,
  // titik di akhir, atau terpotong di tengah. Pengelompokan memakai nama materi
  // yang sudah dinormalkan, dan nama yang terpotong digabungkan ke nama terpanjang
  // yang mengandunginya — kalau tidak, satu materi terpecah menjadi beberapa
  // capaian dan analisis hasilnya jadi tidak berarti.
  const norm = (text) => text.toLowerCase().replace(/[.,;]+$/, "").replace(/\s+/g, " ").trim();

  const canonical = new Map(); // kunci ternormalkan -> nama tampilan terpanjang
  for (const s of soal) {
    const competency = stripTags(s.kompetensi ?? "");
    if (!competency) continue;
    const name = shortName(competency);
    const key = norm(name);
    const existing = [...canonical.keys()].find((k) => k.startsWith(key) || key.startsWith(k));
    if (existing) {
      if (key.length > existing.length) {
        const merged = canonical.get(existing);
        canonical.delete(existing);
        canonical.set(key, name.length >= merged.length ? name : merged);
      }
      continue;
    }
    canonical.set(key, name);
  }

  /** Mengembalikan kunci capaian yang sudah disatukan untuk sebuah kompetensi. */
  const topicKeyOf = (competency) => {
    const key = norm(shortName(competency));
    return [...canonical.keys()].find((k) => k.startsWith(key) || key.startsWith(k)) ?? key;
  };

  const topics = new Map(); // kunci -> { id, name, description }
  const subtopics = new Map(); // "topicId::teks" -> { id, topicId, name }
  const usedSlugs = new Set();

  /** Slug wajib unik dalam satu mata pelajaran. */
  const uniqueSlug = (base) => {
    const root = base || "tanpa-nama";
    let slug = root;
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${root}-${n++}`;
    usedSlugs.add(slug);
    return slug;
  };

  for (const s of soal) {
    const competency = stripTags(s.kompetensi ?? "");
    if (!competency) {
      warnings.push(`Soal ${s.no}: kompetensi kosong, tidak dapat dikelompokkan.`);
      continue;
    }
    const key = topicKeyOf(competency);
    if (!topics.has(key)) {
      topics.set(key, {
        id: `top-${config.subject.slug}-${String(topics.size + 1).padStart(2, "0")}`,
        name: canonical.get(key) ?? shortName(competency),
        description: competency,
        slug: uniqueSlug(slugify(canonical.get(key) ?? shortName(competency))),
      });
    }
    const topic = topics.get(key);

    const sub = stripTags(s.subkompetensi ?? "");
    if (sub && sub !== competency) {
      const key = `${topic.id}::${sub}`;
      if (!subtopics.has(key)) {
        subtopics.set(key, {
          id: `st-${config.subject.slug}-${String(subtopics.size + 1).padStart(2, "0")}`,
          topicId: topic.id,
          name: shortName(sub),
          description: sub,
          slug: uniqueSlug(slugify(shortName(sub))),
        });
      }
    }
  }

  if (canonical.size < new Set(soal.map((s) => norm(shortName(stripTags(s.kompetensi ?? "")))).filter(Boolean)).size) {
    warnings.push(
      `Beberapa rumusan kompetensi digabungkan karena hanya berbeda huruf besar, titik, atau terpotong.`,
    );
  }

  say(`-- ${config.title}`);
  say(`-- Sumber: ${config.file}`);
  say(`-- Dihasilkan oleh scripts/import-package.mjs. Aman dijalankan ulang.`);
  say("begin;");
  say();

  say("-- Mata pelajaran");
  say(
    `insert into public.subjects (id, slug, name, short_name, level) values (${q(subjectId)}, ${q(config.subject.slug)}, ${q(config.subject.name)}, ${q(config.subject.shortName)}, ${q(config.level)}) on conflict (id) do update set slug = excluded.slug, name = excluded.name, short_name = excluded.short_name, level = excluded.level;`,
  );
  say(
    `insert into public.content_series (id, slug, title, description, is_active, sort_order) values (${q(series.id)}, ${q(series.slug)}, ${q(series.title)}, ${q(series.description)}, true, 0) on conflict (id) do update set slug = excluded.slug, title = excluded.title, description = excluded.description, is_active = excluded.is_active, sort_order = excluded.sort_order;`,
  );
  say(
    `insert into public.products (id, slug, title, subject_id, series_id, description, is_active, sort_order) values (${q(productId)}, ${q(`${config.subject.slug}-${series.slug}`)}, ${q(`${config.subject.shortName} - ${series.title}`)}, ${q(subjectId)}, ${q(series.id)}, ${q(`Membuka semua tryout dan latihan ${config.subject.shortName} dalam ${series.title}.`)}, true, 0) on conflict (id) do update set slug = excluded.slug, title = excluded.title, subject_id = excluded.subject_id, series_id = excluded.series_id, description = excluded.description, is_active = excluded.is_active, sort_order = excluded.sort_order;`,
  );
  say();

  say("-- Capaian (kompetensi)");
  [...topics.values()].forEach((t, i) => {
    say(
      `insert into public.topics (id, subject_id, slug, name, description, sort_order) values (${q(t.id)}, ${q(subjectId)}, ${q(t.slug)}, ${q(t.name)}, ${q(t.description)}, ${i}) on conflict (id) do update set subject_id = excluded.subject_id, slug = excluded.slug, name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;`,
    );
  });
  say();

  if (subtopics.size > 0) {
    say("-- Materi (subkompetensi)");
    [...subtopics.values()].forEach((s, i) => {
      say(
        `insert into public.subtopics (id, topic_id, slug, name, description, sort_order) values (${q(s.id)}, ${q(s.topicId)}, ${q(s.slug)}, ${q(s.name)}, ${q(s.description)}, ${i}) on conflict (id) do update set topic_id = excluded.topic_id, slug = excluded.slug, name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;`,
      );
    });
    say();
  }

  // --- bacaan ---
  const passageId = (id) => `psg-${config.slug}-${id}`;
  if (bacaan.length > 0) {
    say("-- Bacaan bersama");
    bacaan.forEach((b, i) => {
      const html = cleanHtml(b.isi?.html ?? b.html ?? b.isi?.text ?? "");
      collectImages(b.isi?.html ?? b.html ?? "");
      (b.isi?.images ?? b.gambar ?? []).forEach((img) => img?.src && images.add(img.src));
      say(
        `insert into public.passages (id, subject_id, label, body_html, sort_order) values (${q(passageId(b.id))}, ${q(subjectId)}, ${q(stripTags(b.label ?? ""))}, ${q(html)}, ${i}) on conflict (id) do update set subject_id = excluded.subject_id, label = excluded.label, body_html = excluded.body_html, sort_order = excluded.sort_order;`,
      );
    });
    say();
  }

  // --- soal ---
  say("-- Soal");
  const questionIds = [];
  for (const s of soal) {
    const type = TYPE_MAP[s.tipe] ?? TYPE_MAP[s.tipe_sumber];
    if (!type) {
      warnings.push(`Soal ${s.no}: tipe "${s.tipe}" tidak dikenali, dilewati.`);
      continue;
    }

    const id = `${config.slug}-${String(s.no).padStart(3, "0")}`;
    questionIds.push(id);

    const competency = stripTags(s.kompetensi ?? "");
    const topic = topics.get(topicKeyOf(competency));
    if (!topic) {
      warnings.push(`Soal ${s.no}: tanpa capaian, dilewati.`);
      questionIds.pop();
      continue;
    }
    const sub = stripTags(s.subkompetensi ?? "");
    const subtopic = sub && sub !== competency ? subtopics.get(`${topic.id}::${sub}`) : null;

    const questionHtml = cleanHtml(s.soal?.html ?? s.soal?.text ?? s.pertanyaan ?? "");
    collectImages(s.soal?.html ?? s.pertanyaan ?? "");
    (s.gambar ?? []).forEach((img) => img?.src && images.add(img.src));
    (s.soal?.images ?? []).forEach((img) => img?.src && images.add(img.src));

    let options = null;
    let correctAnswer = null;
    let correctAnswers = null;
    let categories = null;
    let statements = null;

    if (type === "category") {
      // Urutan kategori diambil dari urutan penyebutannya di dalam pertanyaan,
      // supaya kolom tidak terbalik. Bila tidak tersebut, dipakai urutan muncul.
      const labels = [...new Set((s.opsi ?? []).map((o) => o.jawaban).filter(Boolean))];
      const prompt = stripTags(s.soal?.html ?? s.soal?.text ?? "").toLowerCase();
      const positions = labels.map((l) => {
        // Harus utuh sebagai kata: tanpa ini, "salah" ikut cocok di dalam
        // "permasalahan" dan urutan kategorinya justru jadi terbalik.
        const escaped = l.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const at = prompt.search(new RegExp(`\\b${escaped}\\b`));
        return at < 0 ? Number.MAX_SAFE_INTEGER : at;
      });
      const ordered =
        positions.every((p) => p !== Number.MAX_SAFE_INTEGER)
          ? labels.slice().sort((a, b) => positions[labels.indexOf(a)] - positions[labels.indexOf(b)])
          : labels;
      if (ordered !== labels && JSON.stringify(ordered) !== JSON.stringify(labels)) {
        warnings.push(
          `Soal ${s.no}: urutan kategori dibetulkan mengikuti pertanyaan (${ordered.join(" / ")}).`,
        );
      }

      categories = ordered.map((label) => ({ key: slugify(label) || label, label }));
      const keyOf = (label) => categories.find((c) => c.label === label)?.key;
      statements = (s.opsi ?? []).map((o) => {
        collectImages(o.html);
        return {
          id: o.label,
          text: cleanHtml(o.html ?? o.text ?? ""),
          correctCategoryKey: keyOf(o.jawaban),
        };
      });
    } else {
      options = (s.opsi ?? []).map((o) => {
        collectImages(o.html);
        return { key: o.label, text: cleanHtml(o.html ?? o.text ?? "") };
      });
      const benar = (s.opsi ?? []).filter((o) => o.benar === true).map((o) => o.label);
      if (type === "single") {
        if (benar.length !== 1) warnings.push(`Soal ${s.no}: kunci PG ada ${benar.length}, harus 1.`);
        correctAnswer = benar[0] ?? null;
      } else {
        if (benar.length < 2) warnings.push(`Soal ${s.no}: kunci MCMA ada ${benar.length}, harus >= 2.`);
        correctAnswers = benar;
      }
    }

    say(
      `insert into public.questions (id, subject_id, topic_id, subtopic_id, type, competency, content_format, passage_id, question_text, explanation, options, correct_answer, correct_answers, categories, statements, source_answer_key) values (${q(id)}, ${q(subjectId)}, ${q(topic.id)}, ${q(subtopic?.id)}, ${q(type)}, ${q(competency)}, 'html', ${q(s.bacaan_id ? passageId(s.bacaan_id) : null)}, ${q(questionHtml)}, null, ${json(options)}, ${q(correctAnswer)}, ${correctAnswers ? arr(correctAnswers) : "null"}, ${json(categories)}, ${json(statements)}, ${q(s.kunci_sumber)}) on conflict (id) do update set subject_id = excluded.subject_id, topic_id = excluded.topic_id, subtopic_id = excluded.subtopic_id, type = excluded.type, competency = excluded.competency, content_format = excluded.content_format, passage_id = excluded.passage_id, question_text = excluded.question_text, options = excluded.options, correct_answer = excluded.correct_answer, correct_answers = excluded.correct_answers, categories = excluded.categories, statements = excluded.statements, source_answer_key = excluded.source_answer_key, updated_at = now();`,
    );
  }
  say();

  // --- paket ---
  say("-- Paket");
  say(
    `insert into public.packages (id, kind, slug, title, subject_id, series_id, level, description, variant, variant_label, duration_minutes, is_premium, is_published, sort_order, source_id, source_file) values (${q(packageId)}, ${q(config.kind)}, ${q(config.slug)}, ${q(config.title)}, ${q(subjectId)}, ${q(series.id)}, ${q(config.level)}, ${q(config.description ?? null)}, ${q(config.variant)}, ${q(config.variantLabel)}, ${config.durationMinutes ?? "null"}, true, true, 0, ${q(doc.sumber ?? config.file)}, ${q(config.file)}) on conflict (id) do update set kind = excluded.kind, slug = excluded.slug, title = excluded.title, subject_id = excluded.subject_id, series_id = excluded.series_id, level = excluded.level, description = excluded.description, variant = excluded.variant, variant_label = excluded.variant_label, duration_minutes = excluded.duration_minutes, is_premium = excluded.is_premium, is_published = excluded.is_published, source_id = excluded.source_id, source_file = excluded.source_file, imported_at = now();`,
  );
  say(`delete from public.package_questions where package_id = ${q(packageId)};`);
  questionIds.forEach((qid, i) => {
    say(
      `insert into public.package_questions (package_id, question_id, position) values (${q(packageId)}, ${q(qid)}, ${i});`,
    );
  });
  say();
  say("commit;");
  say();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const sqlPath = path.join(OUT_DIR, `${config.slug}.sql`);
  fs.writeFileSync(sqlPath, out.join("\n"), "utf8");

  const imageList = [...images].map((src) =>
    /^https?:/.test(src) ? src : `${IMAGE_BASE}${src.startsWith("/") ? "" : "/"}${src}`,
  );
  const imagePath = path.join(OUT_DIR, `${config.slug}.images.txt`);
  fs.writeFileSync(imagePath, imageList.join("\n") + "\n", "utf8");

  return {
    slug: config.slug,
    questions: questionIds.length,
    topics: topics.size,
    subtopics: subtopics.size,
    passages: bacaan.length,
    images: imageList.length,
    warnings,
    sqlPath,
    imagePath,
  };
}

// ------------------------------------------------------------------ jalan

let totalWarnings = 0;
for (const config of PACKAGES) {
  const result = convert(config);
  if (result.skipped) {
    console.log(`- ${result.file}: dilewati (tidak ada di ${DOWNLOADS})`);
    continue;
  }
  console.log(
    `- ${result.slug}: ${result.questions} soal, ${result.topics} capaian, ${result.subtopics} materi, ${result.passages} bacaan, ${result.images} gambar`,
  );
  for (const w of result.warnings) console.log(`    ! ${w}`);
  totalWarnings += result.warnings.length;
}
console.log(`\nSelesai. Peringatan: ${totalWarnings}. Keluaran di supabase/seed/`);
