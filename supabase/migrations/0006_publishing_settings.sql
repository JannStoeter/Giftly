-- Wishtale CMS, Teil 2: Einstellungen (Kategorie-Gewichtung), Veröffentlichung auf Instagram.
-- Bitte im Supabase-SQL-Editor ausführen.

-- Einstellungen: öffentlich lesbar (die App braucht die Gewichtung), nur Admins dürfen schreiben.
create table public.settings (
  key text primary key check (key ~ '^[a-z0-9._-]{1,60}$'),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create policy settings_read on public.settings for select to anon, authenticated using (true);
create policy settings_admin on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- Instagram-Beiträge: fertige Bilder (öffentliche Adressen), Ergebnis der Veröffentlichung.
alter table public.social_posts
  add column if not exists image_urls jsonb not null default '[]' check (jsonb_typeof(image_urls) = 'array'),
  add column if not exists ig_media_id text,
  add column if not exists ig_permalink text,
  add column if not exists publish_error text;

-- Speicher für die Bilder. Instagram holt sie über eine öffentliche Adresse ab, daher ein öffentlicher Bereich.
-- Hochladen und Löschen dürfen nur Admins. Instagram verlangt JPEG.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('social-posts', 'social-posts', true, 8388608, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 8388608, allowed_mime_types = array['image/jpeg'];

create policy social_posts_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'social-posts' and public.is_admin());
create policy social_posts_update on storage.objects for update to authenticated
  using (bucket_id = 'social-posts' and public.is_admin()) with check (bucket_id = 'social-posts' and public.is_admin());
create policy social_posts_delete on storage.objects for delete to authenticated
  using (bucket_id = 'social-posts' and public.is_admin());
