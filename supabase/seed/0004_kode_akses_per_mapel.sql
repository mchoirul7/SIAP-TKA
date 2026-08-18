-- =============================================================================
-- Kode akses per mata pelajaran
--
-- Awalan kode menyatakan isinya, jadi kode dapat dibaca tanpa membuka basis data:
--
--   MAT..   Matematika SMA
--   BIN..   Bahasa Indonesia SMA
--   BING..  Bahasa Inggris SMA
--   ALL..   seluruh mata pelajaran yang aktif
--
-- Kode ditukar lewat pencocokan persis (lihat `redeem_voucher`), bukan awalan,
-- sehingga BIN dan BING tidak saling menyerobot meski awalannya beririsan.
--
-- Satu mata pelajaran dapat tersebar di lebih dari satu seri — Bahasa Indonesia
-- SMA punya tryout di seri Sukses TKA SMA Vol.1 dan latihannya di seri Latihan
-- TKA Bahasa Indonesia SMA. Karena hak akses dikunci per pasangan
-- mapel+seri, kode di sini sengaja dipetakan lewat *slug mapel*, bukan lewat id
-- product tertentu: setiap product aktif milik mapel itu ikut terbuka, termasuk
-- seri yang ditambahkan belakangan. Jalankan ulang berkas ini setiap kali ada
-- seri atau product baru, supaya kode lama ikut menjangkaunya.
--
-- Aman dijalankan berulang: voucher di-upsert (cacah pemakaian tidak direset),
-- dan relasi product untuk kode-kode ini dibangun ulang.
-- =============================================================================

begin;

-- Daftar kode yang dibuat. `subject_slug` null berarti seluruh mapel aktif.
create temporary table tmp_access_codes (
  code         text primary key,
  label        text not null,
  subject_slug text
) on commit drop;

insert into tmp_access_codes (code, label, subject_slug)
select
  t.prefix || to_char(n, 'FM00'),
  t.label || ' #' || to_char(n, 'FM00'),
  t.subject_slug
from (values
  ('MAT',  'Kode Akses Matematika SMA',       'matematika-sma'::text),
  ('BIN',  'Kode Akses Bahasa Indonesia SMA', 'bahasa-indonesia-sma'::text),
  ('BING', 'Kode Akses Bahasa Inggris SMA',   'bahasa-inggris-sma'::text),
  ('ALL',  'Kode Akses Semua Mapel',          null::text)
) as t (prefix, label, subject_slug)
cross join generate_series(1, 10) as n;

-- Menjaga agar salah ketik slug tidak diam-diam menghasilkan kode kosong.
do $$
declare missing text;
begin
  select string_agg(distinct c.subject_slug, ', ')
  into missing
  from tmp_access_codes c
  where c.subject_slug is not null
    and not exists (select 1 from public.subjects s where s.slug = c.subject_slug);

  if missing is not null then
    raise exception 'Mapel tidak ditemukan: %', missing;
  end if;
end $$;

insert into public.vouchers (code, label, is_active, valid_until, max_redemptions)
select code, label, true, null, 1
from tmp_access_codes
on conflict (code) do update set
  label           = excluded.label,
  is_active       = excluded.is_active,
  valid_until     = excluded.valid_until,
  max_redemptions = excluded.max_redemptions;

delete from public.voucher_products
where code in (select code from tmp_access_codes);

insert into public.voucher_products (code, product_id)
select c.code, p.id
from tmp_access_codes c
join public.products p on p.is_active
join public.subjects s on s.id = p.subject_id
join public.content_series cs on cs.id = p.series_id and cs.is_active
where c.subject_slug is null
   or s.slug = c.subject_slug
on conflict do nothing;

commit;

-- Pemeriksaan: setiap kode harus menunjuk sedikitnya satu product.
select
  v.code,
  v.label,
  v.max_redemptions,
  v.redemption_count,
  count(vp.product_id) as jumlah_product,
  string_agg(pr.slug, ', ' order by pr.slug) as product
from public.vouchers v
left join public.voucher_products vp on vp.code = v.code
left join public.products pr on pr.id = vp.product_id
where v.code ~ '^(MAT|BING|BIN|ALL)[0-9]{2}$'
group by v.code, v.label, v.max_redemptions, v.redemption_count
order by v.code;
