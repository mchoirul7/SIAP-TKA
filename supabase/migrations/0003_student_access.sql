-- =============================================================================
-- Siap TKA - satu kode untuk satu murid
--
-- Tabel students, student_grants, student_sessions, dan attempts dibuat lewat
-- SQL Editor. Berkas ini mengunci keempatnya dan menambah fungsi cek akses.
-- Aman dijalankan berulang.
--
-- Keempat tabel sengaja tanpa policy untuk anon/authenticated: kalau bisa
-- dibaca, kode murid tinggal diambil, dan kalau bisa ditulis, siapa pun bisa
-- memberi dirinya akses. Semua akses lewat route server dengan secret key.
-- =============================================================================

begin;

do $$
declare t text;
begin
  foreach t in array array['students', 'student_grants', 'student_sessions', 'attempts'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

create index if not exists student_grants_student_idx on public.student_grants (student_id, expires_at);
create index if not exists student_sessions_student_idx on public.student_sessions (student_id, last_seen);
create index if not exists attempts_student_idx on public.attempts (student_id, finished_at desc);

-- Murid boleh membuka paket bila punya grant aktif yang cocok. Paket mapel dan
-- All-in dicocokkan menurut lingkupnya, jadi paket yang terbit belakangan ikut
-- terbuka tanpa perlu menambah grant.
create or replace function public.student_can_access(p_student uuid, p_package text)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.student_grants g
    join public.packages p on p.id = p_package
    join public.students s on s.id = g.student_id
    where g.student_id = p_student
      and s.is_active
      and now() between g.starts_at and g.expires_at
      and g.assessment_type = p.assessment_type
      and g.level = p.level
      and g.grade_level = p.grade_level
      and (g.semester is null or g.semester = p.semester)
      and (
        g.scope = 'all_in'
        or (g.scope = 'subject' and g.subject_id = p.subject_id)
        or (g.scope = 'package' and g.package_id = p.id)
      )
  );
$$;

revoke all on function public.student_can_access(uuid, text) from public, anon, authenticated;

commit;
