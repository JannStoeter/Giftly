-- Wishtale: Geschenke, die man selbst verschenkt hat, merken (für Schenkende mit Konto).
-- Nur die eigene Person sieht ihre Einträge. Die beschenkte Person erfährt davon nichts.
-- Ohne Konto liegt dieselbe Liste nur im Browser (localStorage "wishtale:given") und wandert nach der Anmeldung ins Konto.
-- Wird das Konto gelöscht, verschwinden die Einträge mit (on delete cascade).

create table public.given_gifts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  wish_ref text check (char_length(wish_ref) <= 80),
  recipient_name text not null check (char_length(recipient_name) between 1 and 60),
  recipient_handle text check (recipient_handle ~ '^[a-z0-9-]{3,31}$'),
  wish_title text not null default '' check (char_length(wish_title) <= 160),
  what text not null check (char_length(what) between 1 and 160),
  url text not null default '' check (char_length(url) <= 600),
  occasion text not null default '' check (char_length(occasion) <= 40),
  status text not null default 'reserved' check (status in ('reserved', 'bought', 'given')),
  price numeric(10,2) check (price is null or price > 0),
  reaction text check (reaction in ('ja', 'teils', 'nein')),
  note text not null default '' check (char_length(note) <= 400),
  given_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, wish_ref)
);
create index given_gifts_owner_idx on public.given_gifts (owner_id, given_on desc);
create trigger given_gifts_touch before update on public.given_gifts for each row execute function public.touch_updated_at();
alter table public.given_gifts enable row level security;
create policy given_gifts_own on public.given_gifts for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
