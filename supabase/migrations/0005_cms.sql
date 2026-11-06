-- Wishtale CMS: Produkte, Aktionen, Instagram-Posts, Google-Ads-Pläne.
-- Öffentlich lesbar sind nur aktive Produkte und laufende Aktionen. Alles andere sehen und ändern nur Admins (public.is_admin()).
-- Die Policies für Besucher (anon) und Admins sind getrennt, weil anon is_admin() nicht aufrufen darf.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  brand text not null default '' check (char_length(brand) <= 80),
  category text not null default 'wohnen',
  partner text not null default 'amazon' check (partner ~ '^[a-z0-9-]{1,30}$'),
  url text not null check (url ~* '^https://' and char_length(url) <= 800),
  price numeric(10,2) check (price is null or price > 0),
  image_url text not null default '' check (image_url = '' or image_url ~* '^https://'),
  note text not null default '' check (char_length(note) <= 300),
  active boolean not null default true,
  featured boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  headline text not null default '' check (char_length(headline) <= 120),
  body text not null default '' check (char_length(body) <= 400),
  cta_label text not null default '' check (char_length(cta_label) <= 40),
  cta_url text not null default '' check (cta_url = '' or cta_url ~* '^(https://|/)'),
  placement text[] not null default '{app}',
  product_ids uuid[] not null default '{}',
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '7 days'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create trigger campaigns_touch before update on public.campaigns for each row execute function public.touch_updated_at();

create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  status text not null default 'draft' check (status in ('draft','ready','posted')),
  caption text not null default '' check (char_length(caption) <= 2200),
  slides jsonb not null default '[]' check (jsonb_typeof(slides) = 'array' and pg_column_size(slides) < 200000),
  scheduled_for timestamptz,
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger social_posts_touch before update on public.social_posts for each row execute function public.touch_updated_at();

create table public.ad_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  status text not null default 'draft' check (status in ('draft','live','paused')),
  budget_daily numeric(8,2) check (budget_daily is null or budget_daily > 0),
  final_url text not null default '' check (final_url = '' or final_url ~* '^https://'),
  keywords text[] not null default '{}',
  headlines text[] not null default '{}',
  descriptions text[] not null default '{}',
  utm_campaign text not null default '' check (utm_campaign ~ '^[a-z0-9_-]{0,60}$'),
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger ad_plans_touch before update on public.ad_plans for each row execute function public.touch_updated_at();

alter table public.products enable row level security;
alter table public.campaigns enable row level security;
alter table public.social_posts enable row level security;
alter table public.ad_plans enable row level security;

create policy products_public on public.products for select to anon, authenticated using (active);
create policy products_admin on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy campaigns_public on public.campaigns for select to anon, authenticated using (active and now() between starts_at and ends_at);
create policy campaigns_admin on public.campaigns for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy social_admin on public.social_posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy ads_admin on public.ad_plans for all to authenticated using (public.is_admin()) with check (public.is_admin());
