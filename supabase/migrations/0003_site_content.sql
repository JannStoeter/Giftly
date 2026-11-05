-- Wishtale: Texte der Landingpage direkt auf der Seite bearbeiten.
-- Alle dürfen lesen. Schreiben dürfen nur Konten, die in "admins" stehen.
-- Wer Admin werden darf, steht in "admin_emails" (nur über das Dashboard oder SQL pflegbar).

create table public.admin_emails (
  email text primary key check (email = lower(email))
);
alter table public.admin_emails enable row level security;  -- bewusst ohne Policies: nicht lesbar von außen

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;        -- bewusst ohne Policies

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- Ein angemeldetes Konto mit bestätigter E-Mail aus der Liste darf sich selbst zum Admin machen.
create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid()); em text;
begin
  if uid is null then return false; end if;
  select lower(email) into em from auth.users where id = uid and email_confirmed_at is not null;
  if em is null then return false; end if;
  if not exists (select 1 from public.admin_emails where email = em) then return false; end if;
  insert into public.admins (user_id) values (uid) on conflict do nothing;
  return true;
end $$;

create table public.site_content (
  key text primary key check (key ~ '^[a-z0-9._-]{1,80}$'),
  value text not null check (char_length(value) between 1 and 2000),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.site_content enable row level security;
create policy site_content_read on public.site_content for select to anon, authenticated using (true);
create policy site_content_write on public.site_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Verlauf: jede Änderung bleibt nachvollziehbar und lässt sich zurückholen.
create table public.site_content_history (
  id bigint generated always as identity primary key,
  key text not null,
  old_value text,
  new_value text,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
alter table public.site_content_history enable row level security;
create policy site_content_history_read on public.site_content_history for select to authenticated using (public.is_admin());

create or replace function public.site_content_log()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    insert into public.site_content_history (key, old_value, new_value, changed_by) values (old.key, old.value, null, (select auth.uid()));
    return old;
  elsif tg_op = 'UPDATE' then
    insert into public.site_content_history (key, old_value, new_value, changed_by) values (new.key, old.value, new.value, (select auth.uid()));
    new.updated_at := now(); new.updated_by := (select auth.uid());
    return new;
  else
    insert into public.site_content_history (key, old_value, new_value, changed_by) values (new.key, null, new.value, (select auth.uid()));
    new.updated_by := (select auth.uid());
    return new;
  end if;
end $$;
create trigger site_content_log before insert or update or delete on public.site_content
  for each row execute function public.site_content_log();

-- Rechte: nur angemeldete Konten rufen die Hilfsfunktionen auf.
revoke execute on function public.is_admin() from public, anon, authenticated;
revoke execute on function public.claim_admin() from public, anon, authenticated;
revoke execute on function public.site_content_log() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.claim_admin() to authenticated;
