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
- keine Kurzsätze aus ein, zwei Wörtern mit Punkt („Gewählt. Reserviert.“, „Das ist Jonas.“). Lieber ein fließender Satz mit Verbindung („Lena wählt, und für Jonas bleibt es eine Überraschung“)
- Überschriften ohne Schlusspunkt, wenn sie ein ganzer Satz sind
- keine Pronomen (er/sie) für Personen, deren Geschlecht nicht bekannt ist; Namen wiederholen
- Genitiv von Namen mit `gen()` aus `src/lib/util.js` („Jonas’“, „Lenas“)

## Technik in Kürze
- Vite, Vanilla-JS-Module. Landingpage `index.html`, App unter `/app/`, Gast-Ansicht `#p/<handle>`.
- Daten: Supabase (Migrationen in `supabase/migrations/`), Demo-Modus mit localStorage.
- Amazon-Partner-ID `jannst-21` in `src/lib/shops.js`, immer mit Hinweis „Anzeige“.
- Instagram-Material wird mit `npm run promo` erzeugt (`promo/`).
- Texte der Landingpage sind über `data-edit`-Schlüssel in der Datenbank überschreibbar (`src/cms/`). Neue Texte in `index.html` bekommen einen eigenen Schlüssel, bestehende Schlüssel nicht umbenennen oder umsortieren, sonst passen gespeicherte Änderungen nicht mehr.
- Rechtsseiten (`impressum.html`, `datenschutz.html`, `barrierefreiheit.html`) beziehen Name, Anschrift und Aufsichtsbehörde aus `legal.config.mjs`. Leere Pflichtfelder erscheinen gelb markiert und der Build warnt. Änderungen an Datenverarbeitung (neue Dienste, Cookies, Tracking, Partner) gehören in `datenschutz.html`.
- Schriften und Fotos werden selbst ausgeliefert (`@fontsource`, `public/photos`, Nachladen mit `npm run photos:fetch`). Keine Google-Fonts, keine Hotlinks zu Unsplash oder Pexels.
- CMS unter `/cms/` (Code in `src/admin/`, nur für Admins aus `admin_emails`): Produkte, Aktionen (Zeitraum, Orte `landing` und `app`), Instagram-Studio (Canvas, 1080×1350), Google-Ads-Pläne mit CSV-Export, Seitentexte mit Verlauf. Tabellen aus `0005_cms.sql`. Instagram-Direktveröffentlichung und Google-Ads-API sind noch nicht angebunden. Produktbilder aus dem CMS werden bewusst nicht von Fremdseiten geladen.
- Vor dem Pushen: `npx eslint src` und `npm run build`.
