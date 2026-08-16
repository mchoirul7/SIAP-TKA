-- Menggabungkan seluruh paket SMA ke satu seri dan membuat 10 voucher one-use.
-- Aman dijalankan ulang: data seri/product/voucher memakai upsert, sedangkan
-- relasi voucher product untuk kode ini dibangun ulang.

begin;

insert into public.content_series (id, slug, title, description, is_active, sort_order)
values (
  'ser-sukses-tka-sma-vol-1',
  'sukses-tka-sma-vol-1',
  'Seri Sukses TKA SMA Vol.1',
  'Seri persiapan TKA SMA Vol.1.',
  true,
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

update public.packages
set series_id = 'ser-sukses-tka-sma-vol-1'
where level = 'SMA';

update public.products
set is_active = false
where series_id <> 'ser-sukses-tka-sma-vol-1'
  and subject_id in (
    select distinct subject_id
    from public.packages
    where level = 'SMA'
  );

insert into public.products (id, slug, title, subject_id, series_id, description, is_active, sort_order)
select
  'prd-' || s.slug || '-sukses-tka-sma-vol-1',
  s.slug || '-sukses-tka-sma-vol-1',
  coalesce(s.short_name, s.name) || ' - Seri Sukses TKA SMA Vol.1',
  s.id,
  'ser-sukses-tka-sma-vol-1',
  'Membuka semua tryout dan latihan ' || coalesce(s.short_name, s.name) || ' dalam Seri Sukses TKA SMA Vol.1.',
  true,
  min(p.sort_order)
from public.packages p
join public.subjects s on s.id = p.subject_id
where p.level = 'SMA'
  and p.is_published
group by s.id, s.slug, s.name, s.short_name
on conflict (subject_id, series_id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

with new_vouchers (code, label) as (
  values
    ('SUKSESTKA01', 'Seri Sukses TKA SMA Vol.1 #01'),
    ('SUKSESTKA02', 'Seri Sukses TKA SMA Vol.1 #02'),
    ('SUKSESTKA03', 'Seri Sukses TKA SMA Vol.1 #03'),
    ('SUKSESTKA04', 'Seri Sukses TKA SMA Vol.1 #04'),
    ('SUKSESTKA05', 'Seri Sukses TKA SMA Vol.1 #05'),
    ('SUKSESTKA06', 'Seri Sukses TKA SMA Vol.1 #06'),
    ('SUKSESTKA07', 'Seri Sukses TKA SMA Vol.1 #07'),
    ('SUKSESTKA08', 'Seri Sukses TKA SMA Vol.1 #08'),
    ('SUKSESTKA09', 'Seri Sukses TKA SMA Vol.1 #09'),
    ('SUKSESTKA10', 'Seri Sukses TKA SMA Vol.1 #10')
)
insert into public.vouchers (code, label, is_active, valid_until, max_redemptions)
select code, label, true, null, 1
from new_vouchers
on conflict (code) do update set
  label = excluded.label,
  is_active = excluded.is_active,
  valid_until = excluded.valid_until,
  max_redemptions = excluded.max_redemptions;

with new_vouchers (code) as (
  values
    ('SUKSESTKA01'),
    ('SUKSESTKA02'),
    ('SUKSESTKA03'),
    ('SUKSESTKA04'),
    ('SUKSESTKA05'),
    ('SUKSESTKA06'),
    ('SUKSESTKA07'),
    ('SUKSESTKA08'),
    ('SUKSESTKA09'),
    ('SUKSESTKA10')
)
delete from public.voucher_products
where code in (select code from new_vouchers);

with new_vouchers (code) as (
  values
    ('SUKSESTKA01'),
    ('SUKSESTKA02'),
    ('SUKSESTKA03'),
    ('SUKSESTKA04'),
    ('SUKSESTKA05'),
    ('SUKSESTKA06'),
    ('SUKSESTKA07'),
    ('SUKSESTKA08'),
    ('SUKSESTKA09'),
    ('SUKSESTKA10')
)
insert into public.voucher_products (code, product_id)
select v.code, p.id
from new_vouchers v
cross join public.products p
where p.series_id = 'ser-sukses-tka-sma-vol-1'
  and p.is_active
on conflict do nothing;

commit;
