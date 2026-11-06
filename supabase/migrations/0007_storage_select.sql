-- Admins dürfen die Bilder im Bereich social-posts auch lesen und auflisten (nötig für Überschreiben und Aufräumen).
-- Die Bilder selbst bleiben über ihre öffentliche Adresse für Instagram abrufbar.
create policy social_posts_select on storage.objects for select to authenticated
  using (bucket_id = 'social-posts' and public.is_admin());
