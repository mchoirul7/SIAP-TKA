-- =============================================================================
-- Sinkron akses paket terbit
--
-- Jalankan ulang berkas ini setiap kali ada paket baru yang sudah is_published,
-- terutama mapel pilihan SMA/SMP yang ditambahkan setelah seed voucher awal.
--
-- Yang dilakukan:
--   1. memastikan setiap pasangan mapel + seri yang punya paket terbit memiliki
--      product aktif;
--   2. membangun ulang relasi kode global ALL.. dan SEMUA.. ke seluruh product
--      aktif, supaya kode lama ikut membuka paket baru.
--
-- Aman dijalankan berulang. Cacah pemakaian voucher tidak direset.
-- =============================================================================

begin;

-- --------------------------------------------------------------- 1. product

with published_pairs as (
  select
    p.subject_id,
    p.series_id,
    case
      when cs.slug like 'latihan-tka-%'
        or cs.slug like 'tryout-tka-%'
        or cs.slug like 'tka-%'
      then cs.slug
      else s.slug || '-' || cs.slug
    end as product_slug,
    coalesce(s.short_name, s.name) as subject_name,
    cs.title as series_title,
    min(p.sort_order) as sort_order
  from public.packages p
  join public.subjects s on s.id = p.subject_id
  join public.content_series cs on cs.id = p.series_id
  where p.is_published
    and cs.is_active
  group by p.subject_id, p.series_id, s.slug, s.name, s.short_name, cs.slug, cs.title
)
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
from published_pairs pair
on conflict (subject_id, series_id) do update set
  title       = excluded.title,
  description = excluded.description,
  is_active   = true,
  sort_order  = least(public.products.sort_order, excluded.sort_order);

-- --------------------------------------------------------------- 2. voucher

create temporary table tmp_global_access_codes (
  code text primary key
) on commit drop;

insert into tmp_global_access_codes (code)
select v.code
from public.vouchers v
where v.is_active
  and v.code ~ '^(ALL|SEMUA)[0-9]{2}$';

delete from public.voucher_products
where code in (select code from tmp_global_access_codes);

insert into public.voucher_products (code, product_id)
select c.code, pr.id
from tmp_global_access_codes c
join public.products pr on pr.is_active
join public.content_series cs on cs.id = pr.series_id and cs.is_active
on conflict do nothing;

commit;

-- =============================================================================
-- Pemeriksaan
-- =============================================================================

-- 1. Harus kosong: paket terbit yang belum memiliki product aktif.
select
  s.level,
  s.slug as mapel,
  cs.slug as seri,
  count(*) as jumlah_paket
from public.packages p
join public.subjects s on s.id = p.subject_id
join public.content_series cs on cs.id = p.series_id
where p.is_published
  and not exists (
    select 1
    from public.products pr
    where pr.subject_id = p.subject_id
      and pr.series_id = p.series_id
      and pr.is_active
  )
group by s.level, s.slug, cs.slug
order by s.level, s.slug, cs.slug;

-- 2. Ringkasan kode global setelah relasi product dibangun ulang.
select
  v.code,
  v.max_redemptions,
  v.redemption_count,
  count(distinct pr.id) as jumlah_product,
  count(distinct p.id) as jumlah_paket
from public.vouchers v
join public.voucher_products vp on vp.code = v.code
join public.products pr on pr.id = vp.product_id
left join public.packages p
  on p.subject_id = pr.subject_id
 and p.series_id = pr.series_id
 and p.is_published
where v.code ~ '^(ALL|SEMUA)[0-9]{2}$'
group by v.code, v.max_redemptions, v.redemption_count
order by v.code;

-- 3. Harus kosong untuk kode contoh yang ada: paket terbit yang belum terbuka
--    oleh ALL01 atau SEMUA01.
with sample_codes(code) as (
  values ('ALL01'), ('SEMUA01')
)
select
  sc.code,
  s.level,
  s.slug as mapel,
  cs.slug as seri,
  count(*) as paket_tidak_terjangkau
from sample_codes sc
join public.vouchers v on v.code = sc.code
join public.packages p on p.is_published
join public.subjects s on s.id = p.subject_id
join public.content_series cs on cs.id = p.series_id and cs.is_active
where not exists (
  select 1
  from public.voucher_products vp
  join public.products pr on pr.id = vp.product_id
  where vp.code = sc.code
    and pr.subject_id = p.subject_id
    and pr.series_id = p.series_id
    and pr.is_active
)
group by sc.code, s.level, s.slug, cs.slug
order by sc.code, s.level, s.slug, cs.slug;
