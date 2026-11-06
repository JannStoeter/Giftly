-- Aktionen bekommen eigene Texte für Menschen, die schon ein Wishtale haben (in der App).
-- Die Landingpage nutzt weiter headline, body und cta_*, die für neue Besucher geschrieben sind.
alter table public.campaigns
  add column if not exists app_headline text not null default '' check (char_length(app_headline) <= 120),
  add column if not exists app_body text not null default '' check (char_length(app_body) <= 400),
  add column if not exists app_cta_label text not null default '' check (char_length(app_cta_label) <= 40),
  add column if not exists app_cta_action text not null default '' check (app_cta_action in ('', 'share', 'wishes', 'inspiration'));
