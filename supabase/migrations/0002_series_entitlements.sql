-- =============================================================================
-- Siap TKA - entitlement seri per mata pelajaran
--
-- Model bisnis: satu kode voucher membuka satu mata pelajaran dalam satu seri.
-- Seluruh package, baik tryout maupun latihan, menempel ke subject_id + series_id.
-- =============================================================================

begin;

-- --------------------------------------------------------------------- seri

create table if not exists public.content_series (
  id          text primary key,
  slug        text not null unique,
  title       text not null,
  description text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.content_series (id, slug, title, description, is_active, sort_order)
values (
  'ser-bulan-kemerdekaan',
  'bulan-kemerdekaan',
  'Seri Bulan Kemerdekaan',
  'Seri soal tematik bulan kemerdekaan. Satu voucher membuka satu mapel dalam seri ini.',
  true,
  0
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

alter table public.packages
  add column if not exists series_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'packages_series_id_fkey'
      and conrelid = 'public.packages'::regclass
  ) then
    alter table public.packages
      add constraint packages_series_id_fkey
      foreign key (series_id) references public.content_series (id) on delete restrict;
  end if;
end $$;

update public.packages
set series_id = 'ser-bulan-kemerdekaan'
where series_id is null;

alter table public.packages
  alter column series_id set not null;

update public.packages
set is_premium = true
where is_published = true;

alter table public.packages
  alter column is_premium set default true;

create index if not exists packages_series_idx on public.packages (series_id, subject_id, kind);

-- ------------------------------------------------------------------- produk

create table if not exists public.products (
  id          text primary key,
  slug        text not null unique,
  title       text not null,
  subject_id  text not null references public.subjects (id) on delete cascade,
  series_id   text not null references public.content_series (id) on delete cascade,
  description text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  unique (subject_id, series_id)
);

insert into public.products (id, slug, title, subject_id, series_id, description, is_active, sort_order)
select
  'prd-' || s.slug || '-' || cs.slug,
  s.slug || '-' || cs.slug,
  coalesce(s.short_name, s.name) || ' - ' || cs.title,
  s.id,
  cs.id,
  'Membuka semua tryout dan latihan ' || coalesce(s.short_name, s.name) || ' dalam ' || cs.title || '.',
  true,
  min(p.sort_order)
from public.packages p
join public.subjects s on s.id = p.subject_id
join public.content_series cs on cs.id = p.series_id
where p.is_published
group by s.id, s.slug, s.name, s.short_name, cs.id, cs.slug, cs.title
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  subject_id = excluded.subject_id,
  series_id = excluded.series_id,
  description = excluded.description,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

create table if not exists public.voucher_products (
  code       text not null references public.vouchers (code) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  primary key (code, product_id)
);

-- Migrasi voucher lama yang menunjuk package langsung ke product seri/mapel.
insert into public.voucher_products (code, product_id)
select distinct vp.code, pr.id
from public.voucher_packages vp
join public.packages p on p.id = vp.package_id
join public.products pr on pr.subject_id = p.subject_id and pr.series_id = p.series_id
on conflict do nothing;

-- =============================================================================
-- RLS dan akses Data API
-- =============================================================================

alter table public.content_series enable row level security;
alter table public.products enable row level security;
alter table public.voucher_products enable row level security;

drop policy if exists content_series_read on public.content_series;
create policy content_series_read on public.content_series
  for select to anon, authenticated
  using (is_active);

drop policy if exists products_read on public.products;
create policy products_read on public.products
  for select to anon, authenticated
  using (is_active);

grant select on public.content_series, public.products to anon, authenticated;

-- voucher_products sengaja tanpa SELECT policy untuk anon/authenticated.

-- =============================================================================
-- Penukaran voucher
-- =============================================================================

drop function if exists public.redeem_voucher(text);

create function public.redeem_voucher(p_code text)
returns table (
  product_slug text,
  subject_slug text,
  series_slug  text,
  package_slug text
)
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
  select
    pr.slug as product_slug,
    s.slug as subject_slug,
    cs.slug as series_slug,
    p.slug as package_slug
  from public.voucher_products vp
  join public.products pr on pr.id = vp.product_id
  join public.subjects s on s.id = pr.subject_id
  join public.content_series cs on cs.id = pr.series_id
  left join public.packages p
    on p.subject_id = pr.subject_id
   and p.series_id = pr.series_id
   and p.is_published
  where vp.code = v.code
    and pr.is_active
    and cs.is_active
  order by pr.sort_order, p.sort_order, p.slug;
end $$;

revoke all on function public.redeem_voucher(text) from public;
grant execute on function public.redeem_voucher(text) to anon, authenticated;

commit;
