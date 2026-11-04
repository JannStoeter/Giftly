-- Wishtale: Datenmodell mit Zugriffsregeln (RLS).
-- Gäste lesen und reservieren nur über die Funktionen unten, nie direkt aus Tabellen.
-- Ausführen: Supabase-Dashboard, SQL Editor, einfügen, Run.

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  is_demo boolean not null default false,
  handle text not null unique check (handle ~ '^[a-z0-9][a-z0-9-]{2,30}$'),
  name text not null check (char_length(name) between 1 and 60),
  age int check (age between 0 and 120),
  managed boolean not null default false,
  parent_name text,
  tone int not null default 0,
  about text not null default '' check (char_length(about) <= 400),
  interests text[] not null default '{}',
  cats text[] not null default '{}',
  brands text[] not null default '{}',
  tries text[] not null default '{}',
  nogos text[] not null default '{}',
  alts text[] not null default '{}',
  style jsonb not null default '[]',
  vis jsonb not null default '{"interests":"giver","cats":"giver","brands":"giver","tries":"giver","nogos":"giver","alts":"giver","style":"giver"}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint owner_or_demo check (owner_id is not null or is_demo)
);
create index profiles_owner_idx on public.profiles(owner_id);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  kind text not null default 'produkt' check (kind in ('produkt','kategorie','erlebnis','frei')),
  prio smallint not null default 2 check (prio between 1 and 3),
  note text not null default '' check (char_length(note) <= 400),
  link text not null default '' check (char_length(link) <= 600),
  price numeric(10,2) check (price is null or price > 0),
  budget int check (budget is null or budget > 0),
  category text not null default 'wohnen',
  occ text[] not null default '{}',
  vis text not null default 'alle' check (vis in ('alle','giver','privat')),
  status text not null default 'offen' check (status in ('offen','selbst')),
  via text,
  pid text,
  kw text[] not null default '{}',
  art text,
  tone int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index wishes_profile_idx on public.wishes(profile_id);

create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  what text not null check (char_length(what) between 1 and 160),
  from_name text not null check (char_length(from_name) between 1 and 80),
  when_label text not null default '',
  liked text not null default 'ja' check (liked in ('ja','teils','nein')),
  have boolean not null default true,
  again boolean not null default true,
  kw text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index gifts_profile_idx on public.gifts(profile_id);

-- Reservierungen: bewusst OHNE Policies. Niemand liest oder schreibt direkt, nur die Funktionen unten.
-- So kann auch der Besitzer des Profils nie sehen, wer reserviert hat (Überraschungsschutz).
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  wish_id uuid not null unique references public.wishes(id) on delete cascade,
  token_hash text not null,
  state text not null default 'reserved' check (state in ('reserved','bought')),
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger wishes_touch before update on public.wishes for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.wishes enable row level security;
alter table public.gifts enable row level security;
alter table public.reservations enable row level security;

-- Besitzer verwalten ihre eigenen Daten.
create policy profiles_owner on public.profiles for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy wishes_owner on public.wishes for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())));
create policy gifts_owner on public.gifts for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = (select auth.uid())));

-- Gast-Ansicht: ein Profil mit Wunschliste, ohne Besitzer-Daten. Private Bereiche und Wünsche fehlen.
create or replace function public.public_profile(p_handle text, p_token text default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare p public.profiles; th text; v jsonb;
begin
  select * into p from public.profiles where handle = lower(p_handle);
  if not found then return null; end if;
  th := case when p_token is not null and char_length(p_token) >= 16 then encode(extensions.digest(p_token, 'sha256'), 'hex') end;
  v := p.vis;
  return jsonb_build_object(
    'id', p.id, 'handle', p.handle, 'name', p.name, 'age', p.age, 'managed', p.managed,
    'parent_name', p.parent_name, 'tone', p.tone, 'about', p.about,
    'interests', case when v->>'interests' = 'privat' then '[]'::jsonb else to_jsonb(p.interests) end,
    'cats',      case when v->>'cats'      = 'privat' then '[]'::jsonb else to_jsonb(p.cats) end,
    'brands',    case when v->>'brands'    = 'privat' then '[]'::jsonb else to_jsonb(p.brands) end,
    'tries',     case when v->>'tries'     = 'privat' then '[]'::jsonb else to_jsonb(p.tries) end,
    'nogos',     case when v->>'nogos'     = 'privat' then '[]'::jsonb else to_jsonb(p.nogos) end,
    'alts',      case when v->>'alts'      = 'privat' then '[]'::jsonb else to_jsonb(p.alts) end,
    'style',     case when v->>'style'     = 'privat' then '[]'::jsonb else p.style end,
    'wishes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', w.id, 'title', w.title, 'kind', w.kind, 'prio', w.prio, 'note', w.note, 'link', w.link,
        'price', w.price, 'budget', w.budget, 'category', w.category, 'occ', w.occ, 'status', w.status,
        'via', w.via, 'pid', w.pid, 'kw', w.kw, 'art', w.art, 'tone', w.tone,
        'reserved', r.id is not null,
        'bought', coalesce(r.state = 'bought', false),
        'mine', r.token_hash is not null and r.token_hash = th
      ) order by w.prio desc, w.created_at)
      from public.wishes w left join public.reservations r on r.wish_id = w.id
      where w.profile_id = p.id and w.vis <> 'privat'), '[]'::jsonb),
    'gifts', coalesce((
      select jsonb_agg(jsonb_build_object('what', g.what, 'from', g.from_name, 'when', g.when_label, 'kw', g.kw) order by g.created_at desc)
      from public.gifts g where g.profile_id = p.id), '[]'::jsonb)
  );
end $$;

-- Reservieren, freigeben, als gekauft markieren. Der Gast identifiziert sich mit einem zufälligen Token
-- aus seinem Browser. In der Datenbank liegt nur der Hash davon.
create or replace function public.reserve_wish(p_wish_id uuid, p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare th text; w public.wishes; r public.reservations;
begin
  if p_token is null or char_length(p_token) < 16 then return jsonb_build_object('ok', false, 'reason', 'token'); end if;
  th := encode(extensions.digest(p_token, 'sha256'), 'hex');
  select * into w from public.wishes where id = p_wish_id and vis <> 'privat' and status = 'offen';
  if not found then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  insert into public.reservations (wish_id, token_hash) values (p_wish_id, th) on conflict (wish_id) do nothing;
  select * into r from public.reservations where wish_id = p_wish_id;
  if r.token_hash <> th then return jsonb_build_object('ok', false, 'reason', 'taken'); end if;
  return jsonb_build_object('ok', true, 'state', r.state);
end $$;

create or replace function public.release_wish(p_wish_id uuid, p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare th text;
begin
  if p_token is null or char_length(p_token) < 16 then return jsonb_build_object('ok', false); end if;
  th := encode(extensions.digest(p_token, 'sha256'), 'hex');
  delete from public.reservations where wish_id = p_wish_id and token_hash = th;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.mark_bought(p_wish_id uuid, p_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare th text; n int;
begin
  if p_token is null or char_length(p_token) < 16 then return jsonb_build_object('ok', false); end if;
  th := encode(extensions.digest(p_token, 'sha256'), 'hex');
  update public.reservations set state = 'bought' where wish_id = p_wish_id and token_hash = th;
  get diagnostics n = row_count;
  return jsonb_build_object('ok', n > 0);
end $$;

-- Nur für Kind-Konten: Eltern sehen, welche Wünsche reserviert oder gekauft sind (nicht von wem).
create or replace function public.owner_reservations(p_profile_id uuid)
returns table (wish_id uuid, state text) language sql stable security definer set search_path = '' as $$
  select r.wish_id, r.state
  from public.reservations r
  join public.wishes w on w.id = r.wish_id
  join public.profiles p on p.id = w.profile_id
  where p.id = p_profile_id and p.managed and p.owner_id = (select auth.uid());
$$;

-- Rechte: nur die gewollten Funktionen sind aufrufbar.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.public_profile(text, text) to anon, authenticated;
grant execute on function public.reserve_wish(uuid, text) to anon, authenticated;
grant execute on function public.release_wish(uuid, text) to anon, authenticated;
grant execute on function public.mark_bought(uuid, text) to anon, authenticated;
grant execute on function public.owner_reservations(uuid) to authenticated;
