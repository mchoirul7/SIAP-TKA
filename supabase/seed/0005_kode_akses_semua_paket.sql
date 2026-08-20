-- =============================================================================
-- Kode akses semua paket, masing-masing dapat ditukar 1000 kali
--
--   SEMUA01 .. SEMUA05
--
-- Berbeda dari `0004_kode_akses_per_mapel.sql` yang membuat kode sekali pakai
-- per mata pelajaran, kelima kode di sini membuka seluruh paket — tryout maupun
-- latihan, jenjang SD maupun SMA — dan setiap kodenya berlaku untuk 1000
-- penukaran.
--
-- Hak akses dikunci per pasangan mapel+seri (lihat `redeem_voucher`), dan
-- pasangan itu hanya dapat dijangkau voucher bila ada barisnya di `products`.
-- Karena itu berkas ini melengkapi katalog product lebih dahulu: setiap pasangan
-- mapel+seri yang punya paket terbit tetapi belum punya product akan dibuatkan.
-- Saat berkas ini ditulis, satu pasangan memang belum ada — Bahasa Inggris SMA
-- pada seri Latihan TKA Bahasa Inggris SMA, 9 paket latihan — sehingga tanpa
-- langkah tersebut kesembilan paket itu tetap terkunci.
--
-- Jalankan ulang berkas ini setiap kali ada seri atau paket baru: productnya
-- ikut dilengkapi dan kelima kode ikut menjangkaunya. Aman dijalankan berulang —
-- voucher di-upsert tanpa mereset cacah pemakaian, dan relasi product untuk
-- kelima kode ini dibangun ulang.
--
-- Mengubah jumlah kode: ubah angka pada `generate_series(1, 5)`.
-- Mengubah kuota penukaran: ubah angka 1000 pada `insert into public.vouchers`.
-- =============================================================================

begin;

-- --------------------------------------------------------------- 1. product
--
-- Nama id mengikuti pola yang sudah dipakai katalog: slug seri sudah menyebut
-- mapelnya pada seri latihan dan tryout SD ("latihan-tka-matematika-sd"),
-- sehingga cukup dipakai apa adanya; seri lintas mapel ("sukses-tka-sma-vol-1")
-- diawali slug mapelnya supaya tetap unik.

insert into public.products (id, slug, title, subject_id, series_id, description, is_active, sort_order)
select
  'prd-' || pair.product_slug,
  pair.product_slug,
  pair.subject_name || ' - ' || pair.series_title,
  pair.subject_id,
  pair.series_id,
  'Membuka semua tryout dan latihan ' || pair.subject_name || ' dalam ' || pair.series_title || '.',
  true,
  pair.sort_order
from (
  select
    p.subject_id,
    p.series_id,
    case
      when cs.slug like 'latihan-tka-%' or cs.slug like 'tryout-tka-%' then cs.slug
      else s.slug || '-' || cs.slug
    end as product_slug,
    coalesce(s.short_name, s.name) as subject_name,
    cs.title as series_title,
    min(p.sort_order) as sort_order
  from public.packages p
  join public.subjects s on s.id = p.subject_id
  join public.content_series cs on cs.id = p.series_id
  where p.is_published
    and not exists (
      select 1
      from public.products pr
      where pr.subject_id = p.subject_id
        and pr.series_id = p.series_id
    )
  group by p.subject_id, p.series_id, s.slug, s.name, s.short_name, cs.slug, cs.title
) as pair
on conflict (id) do update set
  is_active = true;

-- --------------------------------------------------------------- 2. voucher

create temporary table tmp_all_access (
  code  text primary key,
  label text not null
) on commit drop;

insert into tmp_all_access (code, label)
select
  'SEMUA' || to_char(n, 'FM00'),
  'Kode Akses Semua Paket #' || to_char(n, 'FM00')
from generate_series(1, 5) as n;

insert into public.vouchers (code, label, is_active, valid_until, max_redemptions)
select code, label, true, null, 1000
from tmp_all_access
on conflict (code) do update set
  label           = excluded.label,
  is_active       = excluded.is_active,
  valid_until     = excluded.valid_until,
  max_redemptions = excluded.max_redemptions;

-- Dibangun ulang, bukan ditambah, supaya product yang sudah dinonaktifkan
-- tidak tertinggal menempel pada kode.
delete from public.voucher_products
where code in (select code from tmp_all_access);

insert into public.voucher_products (code, product_id)
select c.code, pr.id
from tmp_all_access c
join public.products pr on pr.is_active
join public.content_series cs on cs.id = pr.series_id and cs.is_active
on conflict do nothing;

commit;

-- =============================================================================
-- Pemeriksaan
-- =============================================================================

-- 1. Kelima kode beserta jumlah product dan paket yang dibukanya.
select
  v.code,
  v.max_redemptions,
  v.redemption_count,
  count(distinct pr.id) as jumlah_product,
  count(distinct p.id)  as jumlah_paket
from public.vouchers v
join public.voucher_products vp on vp.code = v.code
join public.products pr on pr.id = vp.product_id
left join public.packages p
  on p.subject_id = pr.subject_id
 and p.series_id = pr.series_id
 and p.is_published
where v.code ~ '^SEMUA[0-9]{2}$'
group by v.code, v.max_redemptions, v.redemption_count
order by v.code;

-- 2. Harus kosong: paket terbit yang tidak terjangkau kode SEMUA01.
select s.slug as mapel, cs.slug as seri, count(*) as paket_tidak_terjangkau
from public.packages p
join public.subjects s on s.id = p.subject_id
join public.content_series cs on cs.id = p.series_id
where p.is_published
  and not exists (
    select 1
    from public.voucher_products vp
    join public.products pr on pr.id = vp.product_id
    where vp.code = 'SEMUA01'
      and pr.subject_id = p.subject_id
      and pr.series_id = p.series_id
  )
group by s.slug, cs.slug
order by s.slug, cs.slug;
