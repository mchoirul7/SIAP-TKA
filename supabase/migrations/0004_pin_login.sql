-- =============================================================================
-- Siap TKA - akun murid dengan PIN
--
-- Orang tua mendaftarkan murid sendiri dengan nama dan PIN 6 angka; PIN itu
-- menjadi kode masuk (students.access_code). Paket yang dibeli lewat WhatsApp
-- dibukakan admin langsung ke akun (student_grants), jadi voucher tidak dipakai
-- lagi dan penukaran voucher lama ditutup dari kunci publik.
-- Aman dijalankan berulang.
-- =============================================================================

begin;

-- Percobaan PIN yang salah, per alamat IP, untuk membatasi tebak-tebakan PIN.
-- Baris lama boleh dihapus kapan saja; yang dihitung hanya 15 menit terakhir.
create table if not exists public.login_failures (
  id         bigint generated always as identity primary key,
  ip         text not null,
  created_at timestamptz not null default now()
);

create index if not exists login_failures_ip_idx on public.login_failures (ip, created_at desc);

alter table public.login_failures enable row level security;
revoke all on public.login_failures from anon, authenticated;

-- PIN murid wajib 6 angka untuk akun baru. Akun lama berformat lain tetap
-- tersimpan, jadi pemeriksaan ini dibuat NOT VALID.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'students_access_code_pin') then
    alter table public.students
      add constraint students_access_code_pin check (access_code ~ '^[0-9]{6}$') not valid;
  end if;
end $$;

-- Voucher tidak dipakai lagi: penukaran lama ditutup dari kunci publik.
revoke execute on function public.redeem_voucher(text) from anon, authenticated;

commit;
