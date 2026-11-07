-- Wishtale: Nutzung auswerten, ohne Cookies und ohne personenbezogene Kennungen.
-- Ereignisse schreibt nur die Server-Funktion api/event.js (Dienstschlüssel). Gelesen wird nur über admin_usage() für Admins.
-- Gespeichert werden: Ereignis, Seite, Herkunft (nur Domain), UTM-Kürzel, Gerätegruppe, Land und ein täglich wechselnder Hash.
-- Eine IP-Adresse oder ein User-Agent wird nie gespeichert. Der Hash lässt sich nicht über Tage verknüpfen.

create table public.events (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  name text not null check (name ~ '^[a-z_]{2,30}$'),
  path text check (char_length(path) <= 120),
  label text check (char_length(label) <= 40),
  ref text check (char_length(ref) <= 80),
  utm_source text check (char_length(utm_source) <= 60),
  utm_medium text check (char_length(utm_medium) <= 60),
  utm_campaign text check (char_length(utm_campaign) <= 60),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  country text check (country ~ '^[A-Z]{2}$'),
  visitor text check (char_length(visitor) <= 16)
);
create index events_ts_idx on public.events (ts);
create index events_name_ts_idx on public.events (name, ts);
alter table public.events enable row level security;  -- bewusst ohne Policies: von außen weder les- noch schreibbar

create or replace function public.admin_usage(p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  d int := least(greatest(coalesce(p_days, 30), 1), 365);
  since timestamptz := date_trunc('day', now() at time zone 'Europe/Berlin') at time zone 'Europe/Berlin' - make_interval(days => d - 1);
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return jsonb_build_object(
    'days', d,
    'daily', (
      select coalesce(jsonb_agg(row order by row->>'d'), '[]'::jsonb) from (
        select jsonb_build_object(
          'd', to_char(g, 'YYYY-MM-DD'),
          'visitors', (select count(distinct e.visitor) from public.events e where e.name = 'view' and (e.ts at time zone 'Europe/Berlin')::date = g),
          'signups', (select count(*) from auth.users u where (u.created_at at time zone 'Europe/Berlin')::date = g),
          'wishes', (select count(*) from public.wishes w where (w.created_at at time zone 'Europe/Berlin')::date = g)
        ) as row
        from generate_series((since at time zone 'Europe/Berlin')::date, (now() at time zone 'Europe/Berlin')::date, interval '1 day') as g
      ) s),
    'funnel', jsonb_build_object(
      'visitors',  (select count(distinct visitor) from public.events where name = 'view' and ts >= since),
      'cta',       (select count(distinct visitor) from public.events where name = 'cta' and ts >= since),
      'start',     (select count(distinct visitor) from public.events where name = 'start' and ts >= since),
      'quick',     (select count(distinct visitor) from public.events where name = 'choice' and label = 'quick' and ts >= since),
      'profile',   (select count(distinct visitor) from public.events where name = 'choice' and label = 'profile' and ts >= since),
      'submit',    (select count(distinct visitor) from public.events where name = 'signup_submit' and ts >= since),
      'accounts',  (select count(*) from auth.users where created_at >= since),
      'with_wish', (select count(distinct p.owner_id) from public.profiles p join auth.users u on u.id = p.owner_id join public.wishes w on w.profile_id = p.id where u.created_at >= since)
    ),
    'sources', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
      select coalesce(nullif(utm_source, ''), nullif(ref, ''), 'direkt') as source, count(distinct visitor) as visitors
      from public.events where name = 'view' and ts >= since group by 1 order by 2 desc limit 8) x),
    'campaigns', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
      select e.utm_campaign as campaign, count(distinct e.visitor) as visitors,
        (select count(*) from auth.users u where u.raw_user_meta_data->'utm'->>'campaign' = e.utm_campaign and u.created_at >= since) as accounts
      from public.events e where e.name = 'view' and e.ts >= since and coalesce(e.utm_campaign, '') <> ''
      group by e.utm_campaign order by 2 desc limit 8) x),
    'account_sources', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
      select coalesce(nullif(u.raw_user_meta_data->'utm'->>'source', ''), 'direkt oder unbekannt') as source, count(*) as accounts
      from auth.users u where u.created_at >= since group by 1 order by 2 desc limit 8) x),
    'devices', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
      select coalesce(device, 'unbekannt') as device, count(distinct visitor) as visitors from public.events where name = 'view' and ts >= since group by 1 order by 2 desc) x),
    'countries', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
      select coalesce(country, '??') as country, count(distinct visitor) as visitors from public.events where name = 'view' and ts >= since group by 1 order by 2 desc limit 6) x),
    'totals', jsonb_build_object(
      'accounts', (select count(*) from auth.users),
      'accounts_with_wish', (select count(distinct p.owner_id) from public.profiles p join public.wishes w on w.profile_id = p.id where p.owner_id is not null),
      'wishes', (select count(*) from public.wishes w join public.profiles p on p.id = w.profile_id where p.owner_id is not null and not p.is_demo),
      'wishes_period', (select count(*) from public.wishes where created_at >= since),
      'guest_views', (select count(*) from public.events where name = 'guest_view' and ts >= since),
      'reserved', (select count(*) from public.reservations where created_at >= since),
      'bought', (select count(*) from public.reservations where state = 'bought' and created_at >= since),
      'demo', (select count(distinct visitor) from public.events where name = 'demo' and ts >= since)
    )
  );
end $$;
revoke execute on function public.admin_usage(int) from public, anon, authenticated;
grant execute on function public.admin_usage(int) to authenticated;
