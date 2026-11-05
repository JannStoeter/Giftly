# Wishtale: Projekthinweise

## Marke
- **Name:** Wishtale (früher Giftly, dieser Name ist vergeben)
- **Tagline (kurz, für Überschriften, Titel, Bio, Schlussfolien):** „Die Wunschliste, die dich kennt.“
- **Erzählzeile (länger, für Unterzeilen, „Über uns“, Beschreibungen):** „Wishtale. Eine kleine Geschichte über dich – für Geschenke, die wirklich passen.“
- **Claim (Zweitaussage):** „Jeder Wunsch hat eine Geschichte.“
- Die kurze Tagline sagt, was Wishtale ist. Die Erzählzeile sagt, wie es sich anfühlt. Beide stehen nie direkt nebeneinander in derselben Größe.
- **Idee:** Eine Wunschliste kennt jeder. Der Mehrwert ist der Geschmack dahinter (Interessen, Marken, Welten, was man schon hat, was man nicht möchte). Die eigenen Wünsche bleiben der Kern und werden nie vergessen.

## Ton (Tale)
- warm, in ganzen Sätzen, du-Ansprache, leicht erzählend
- keine Stichpunkt-Ketten, kein „Kein X, kein Y“, keine Ausrufezeichen-Serien
- keine Pronomen (er/sie) für Personen, deren Geschlecht nicht bekannt ist; Namen wiederholen
- Genitiv von Namen mit `gen()` aus `src/lib/util.js` („Jonas’“, „Lenas“)

## Technik in Kürze
- Vite, Vanilla-JS-Module. Landingpage `index.html`, App unter `/app/`, Gast-Ansicht `#p/<handle>`.
- Daten: Supabase (Migrationen in `supabase/migrations/`), Demo-Modus mit localStorage.
- Amazon-Partner-ID `jannst-21` in `src/lib/shops.js`, immer mit Hinweis „Anzeige“.
- Instagram-Material wird mit `npm run promo` erzeugt (`promo/`).
- Vor dem Pushen: `npx eslint src` und `npm run build`.
