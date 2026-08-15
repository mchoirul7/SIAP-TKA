-- =============================================================================
-- Siap TKA — skema konten
--
-- Berisi HANYA bahan ajar: taksonomi materi, bacaan, soal, paket, dan voucher.
-- Tidak ada satu pun tabel untuk pengerjaan siswa: jawaban, skor, riwayat, dan
-- hak akses paket tetap tinggal di perangkat pengguna. Tidak ada kolom user_id.
--
-- Bentuk tabel mengikuti berkas JSON paket soal, supaya satu berkas dapat
-- diunggah apa adanya tanpa perlu dipecah manual lebih dulu:
--
--   paket      -> packages + package_questions
--   mapel      -> subjects
--   capaian    -> topics
--   materi     -> subtopics
--   submateri  -> concepts
--   bacaan     -> passages
--   soal       -> questions
--
-- Kolom yang tidak selalu ada di berkas sumber dibuat boleh kosong, supaya
-- paket tetap dapat diunggah lalu dilengkapi belakangan lewat SQL Editor.
--
-- Jalankan lewat SQL Editor pada dashboard Supabase. Aman diulang.
-- =============================================================================

-- --------------------------------------------------------------- taksonomi

create table if not exists public.subjects (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  -- Berkas sumber hanya memuat satu nama; sisanya dilengkapi belakangan.
  short_name  text,
  level       text not null check (level in ('SD', 'SMP', 'SMA')),
  description text,
  sort_order  int  not null default 0
);

-- capaian
create table if not exists public.topics (
  id          text primary key,
  subject_id  text not null references public.subjects (id) on delete cascade,
  slug        text,
  -- Nama pendek untuk tampilan, misalnya "Pemahaman Tekstual".
  name        text not null,
  -- Rumusan capaian selengkapnya, yang biasanya berupa satu kalimat panjang.
  description text,
  sort_order  int  not null default 0,
  unique (subject_id, slug)
);

-- materi
create table if not exists public.subtopics (
  id          text primary key,
  topic_id    text not null references public.topics (id) on delete cascade,
  slug        text,
  name        text not null,
  description text,
  sort_order  int  not null default 0,
  unique (topic_id, slug)
);

-- submateri
create table if not exists public.concepts (
  id          text primary key,
  subtopic_id text not null references public.subtopics (id) on delete cascade,
  name        text not null,
  description text,
  sort_order  int  not null default 0
);

create table if not exists public.misconceptions (
  id          text primary key,
  label       text not null,
  -- Catatan internal untuk tim konten, tidak ditampilkan mentah ke siswa.
  description text not null,
  -- Kalimat hati-hati yang boleh muncul di halaman hasil.
  insight     text not null
);

create table if not exists public.subtopic_prerequisites (
  subtopic_id          text not null references public.subtopics (id) on delete cascade,
  requires_subtopic_id text not null references public.subtopics (id) on delete cascade,
  reason               text not null,
  primary key (subtopic_id, requires_subtopic_id),
  check (subtopic_id <> requires_subtopic_id)
);

create table if not exists public.concept_prerequisites (
  concept_id          text not null references public.concepts (id) on delete cascade,
  requires_concept_id text not null references public.concepts (id) on delete cascade,
  primary key (concept_id, requires_concept_id),
  check (concept_id <> requires_concept_id)
);

-- ------------------------------------------------------------------ bacaan
--
-- Satu teks bacaan dipakai beberapa soal sekaligus (misalnya soal 1 s.d. 5).
-- Disimpan terpisah supaya tidak digandakan di setiap soal, dan supaya layar
-- ujian dapat menahan bacaan tetap terlihat saat pengguna berpindah antarsoal.

create table if not exists public.passages (
  id         text primary key,
  subject_id text not null references public.subjects (id) on delete cascade,
  label      text,
  body_html  text not null,
  sort_order int  not null default 0
);

-- -------------------------------------------------------------------- soal
--
-- Bentuk jawaban berbeda per tipe soal, jadi disimpan sebagai JSONB daripada
-- dipecah menjadi tabel opsi/pernyataan yang selalu setengah kosong. Batasan
-- questions_shape menjaga agar setiap tipe hanya berisi kolom yang relevan.

create table if not exists public.questions (
  id             text primary key,
  subject_id     text not null references public.subjects (id) on delete cascade,
  -- Capaian selalu ada pada berkas sumber, jadi wajib.
  topic_id       text not null references public.topics (id)   on delete cascade,
  -- Materi dan submateri sering kosong. Pada paket Matematika SMA, 18 dari 20
  -- soal tidak menyertakan subkompetensi sama sekali, jadi keduanya boleh kosong
  -- dan pengelompokan hasil jatuh kembali ke capaian.
  subtopic_id    text references public.subtopics (id) on delete set null,
  concept_id     text references public.concepts (id)  on delete set null,

  type           text not null check (type in ('single', 'mcma', 'category')),
  competency     text,
  -- Belum tentu ada di berkas sumber; dipakai hanya untuk pengelompokan.
  difficulty     text check (difficulty in ('dasar', 'menengah', 'lanjut')),
  reasoning_type text check (reasoning_type in ('pemahaman', 'penerapan', 'penalaran')),

  -- 'html' dipakai soal hasil impor yang memuat gambar, rumus, atau daftar.
  content_format text not null default 'html' check (content_format in ('text', 'html')),
  -- Bacaan bersama. Bila diisi, `stimulus` dibiarkan kosong.
  passage_id     text references public.passages (id) on delete set null,
  stimulus       text,
  question_text  text not null,
  instruction    text,
  -- Boleh kosong: sebagian bank soal impor belum menyertakan pembahasan.
  explanation    text,

  options         jsonb,   -- single & mcma: [{ key, text, misconceptionId? }]
  correct_answer  text,    -- single
  correct_answers text[],  -- mcma
  categories      jsonb,   -- category: [{ key, label }]
  statements      jsonb,   -- category: [{ id, text, correctCategoryKey, misconceptionId? }]

  -- Kunci apa adanya dari berkas sumber (`kunci_sumber`). Tidak dipakai untuk
  -- menilai, hanya untuk dibandingkan saat impor agar baris yang janggal
  -- ketahuan lebih awal.
  source_answer_key text,

  updated_at timestamptz not null default now(),

  constraint questions_shape check (
    (type = 'single'
      and options is not null and correct_answer is not null
      and correct_answers is null and categories is null and statements is null)
    or (type = 'mcma'
      and options is not null and correct_answers is not null
      and array_length(correct_answers, 1) >= 2
      and correct_answer is null and categories is null and statements is null)
    or (type = 'category'
      and categories is not null and statements is not null
      and options is null and correct_answer is null and correct_answers is null)
  )
);

create index if not exists questions_topic_idx    on public.questions (topic_id);
create index if not exists questions_subtopic_idx on public.questions (subtopic_id);
create index if not exists questions_subject_idx  on public.questions (subject_id);
create index if not exists questions_passage_idx  on public.questions (passage_id);

-- ------------------------------------------------------------------- paket
--
-- Tryout dan paket latihan memakai satu tabel karena berkas sumbernya memang
-- satu bentuk yang sama, dibedakan oleh `paket.tipe`. Memisahkannya menjadi dua
-- tabel hanya menggandakan kolom yang sama dan memaksa importer bercabang.
--
-- Kolom yang hanya relevan pada salah satu jenis dibiarkan kosong pada jenis
-- lainnya: `duration_minutes` dan `instructions` untuk tryout, `estimated_minutes`,
-- `skills`, dan `is_premium` untuk latihan.

create table if not exists public.packages (
  id                text primary key,
  kind              text not null check (kind in ('tryout', 'latihan')),
  slug              text not null unique,
  title             text not null,
  subject_id        text not null references public.subjects (id) on delete cascade,
  level             text not null check (level in ('SD', 'SMP', 'SMA')),

  description       text,
  summary           text,

  -- Pembeda antarjenis tryout pada satu mata pelajaran, misalnya paket resmi
  -- atau simulasi latihan. Boleh kosong.
  variant           text,
  variant_label     text,

  duration_minutes  int check (duration_minutes is null or duration_minutes > 0),
  estimated_minutes int check (estimated_minutes is null or estimated_minutes > 0),
  difficulty_range  text,
  skills            text[] not null default '{}',
  instructions      text[] not null default '{}',

  is_premium        boolean not null default false,
  is_published      boolean not null default false,
  sort_order        int not null default 0,

  -- Jejak asal-usul, supaya satu berkas dapat diunggah ulang tanpa menebak
  -- baris mana yang berasal dari mana.
  source_id         text,
  source_file       text,
  imported_at       timestamptz not null default now()
);

create index if not exists packages_subject_idx on public.packages (subject_id, kind);

create table if not exists public.package_questions (
  package_id  text not null references public.packages (id)  on delete cascade,
  question_id text not null references public.questions (id) on delete restrict,
  position    int  not null,
  primary key (package_id, question_id),
  unique (package_id, position)
);

-- ----------------------------------------------------------------- voucher
--
-- redemption_count hanya cacah agregat, bukan catatan siapa yang menukar.

create table if not exists public.vouchers (
  code             text primary key,
  label            text,
  is_active        boolean not null default true,
  valid_until      timestamptz,
  max_redemptions  int check (max_redemptions is null or max_redemptions > 0),
  redemption_count int not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.voucher_packages (
  code       text not null references public.vouchers (code)  on delete cascade,
  package_id text not null references public.packages (id)    on delete cascade,
  primary key (code, package_id)
);

-- =============================================================================
-- Row Level Security
--
-- Konten boleh dibaca siapa pun (anon), namun hanya yang sudah terbit.
-- Tidak ada kebijakan tulis sama sekali, jadi perubahan isi hanya bisa lewat
-- secret key / SQL Editor.
-- Tabel voucher TIDAK dapat dibaca anon — kalau bisa, seluruh kode voucher
-- tinggal diambil dengan satu permintaan. Penukaran hanya lewat fungsi di bawah.
-- =============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'subjects', 'topics', 'subtopics', 'concepts', 'misconceptions',
    'subtopic_prerequisites', 'concept_prerequisites', 'passages', 'questions',
    'packages', 'package_questions', 'vouchers', 'voucher_packages'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'subjects', 'topics', 'subtopics', 'concepts', 'misconceptions',
    'subtopic_prerequisites', 'concept_prerequisites', 'passages', 'questions',
    'package_questions'
  ] loop
    execute format('drop policy if exists %I on public.%I', t || '_read', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_read', t
    );
  end loop;
end $$;

-- Paket yang belum terbit tidak ikut terbaca, sehingga paket yang sedang
-- disusun boleh berada di basis data tanpa muncul di aplikasi.
drop policy if exists packages_read on public.packages;
create policy packages_read on public.packages
  for select to anon, authenticated
  using (is_published);

-- =============================================================================
-- Penukaran voucher
--
-- SECURITY DEFINER supaya anon dapat menukar kode tanpa bisa membaca tabelnya.
-- Yang dikembalikan hanya daftar slug paket; hasilnya disimpan di perangkat
-- pengguna, bukan di sini.
-- =============================================================================

create or replace function public.redeem_voucher(p_code text)
returns table (package_slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.vouchers%rowtype;
begin
  select * into v
  from public.vouchers
  where code = upper(btrim(p_code));

  if not found or not v.is_active then
    raise exception 'VOUCHER_INVALID';
  end if;

  if v.valid_until is not null and v.valid_until < now() then
    raise exception 'VOUCHER_EXPIRED';
  end if;

  if v.max_redemptions is not null and v.redemption_count >= v.max_redemptions then
    raise exception 'VOUCHER_EXHAUSTED';
  end if;

  update public.vouchers
  set redemption_count = redemption_count + 1
  where code = v.code;

  return query
  select p.slug
  from public.voucher_packages vp
  join public.packages p on p.id = vp.package_id
  where vp.code = v.code
  order by p.sort_order;
end $$;

revoke all on function public.redeem_voucher(text) from public;
grant execute on function public.redeem_voucher(text) to anon, authenticated;
