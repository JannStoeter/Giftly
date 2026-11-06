-- Wishtale CMS, Teil 3: Stories und Reels.
-- Bitte im Supabase-SQL-Editor ausführen.

alter table public.social_posts
  add column if not exists format text not null default 'post' check (format in ('post','story','reel')),
  add column if not exists video_url text check (video_url is null or video_url ~* '^https://'),
  add column if not exists ig_creation_id text;

-- Bildspeicher erlaubt jetzt auch MP4-Videos (bis 50 MB, das ist die Grenze des kostenlosen Supabase-Plans).
update storage.buckets
  set allowed_mime_types = array['image/jpeg','video/mp4'], file_size_limit = 52428800
  where id = 'social-posts';
