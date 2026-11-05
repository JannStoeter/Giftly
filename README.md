# Wishtale

Persönliches Geschenkprofil, Wunschlisten, Geschenk-Historie und kluge Geschenkideen.

- `/` Landingpage (`index.html`)
- `/app/` die App für Besitzer (Hash-Routing: `#profil`, `#wuensche`, `#historie`, `#entdecken`, `#start`)
- `/app/#p/<id>` die Gast-Ansicht: ein Freund sieht nur das Profil mit Wunschliste (z. B. `#p/jonas`). In dieser Demo ohne Server funktionieren Links nur im selben Browser.

## Entwicklung
```bash
npm install
npm run dev        # Dev-Server
npm run build      # Produktion nach dist/
npm run lint
npm run photos:check   # prüft alle Unsplash-Foto-IDs
```

## Aufbau
- `src/data/content.js` Inhalte und Beispieldaten, `src/state.js` Zustand + localStorage
- `src/logic.js` Empfehlungen, Ideen-Check, Produktvorschläge
- `src/views/*` Ansichten, `src/actions.js` Interaktionen, `src/render.js` Rendering/Routing
- `src/data/photos.js` Foto-Manifest (Unsplash, kostenlos nutzbar). Lädt ein Foto nicht, erscheint die Illustration.

Alle Daten sind Beispieldaten und liegen nur im Browser (localStorage). Zahlungen, Shops und Konten sind simuliert.

## Konten und Daten (Supabase)
- Struktur und Zugriffsregeln: `supabase/migrations/0001_init.sql` (Profile, Wünsche, Geschenke, Reservierungen, RLS, Gast-Funktionen) und `0002_social.sql` (Pinterest und Instagram am Profil).
- Der Browser nutzt nur den öffentlichen Schlüssel (`src/lib/supabase.js`, überschreibbar per `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- Ohne Konto läuft ein Demo-Modus mit lokalen Beispieldaten. Mit Konto liegen alle Daten in Supabase (`src/lib/remote.js`).
- Gäste öffnen `#p/<handle>`. Die Seite lädt über die Funktion `public_profile` und sieht nie private Bereiche oder Reservierer.
- Im Supabase-Dashboard unter *Authentication → URL Configuration* müssen Site URL und Redirect URLs (lokal und Produktion, jeweils mit `/app/`) eingetragen sein, sonst funktionieren E-Mail-Links nicht.

## Pinterest und Instagram
Profile können Pinterest (Profil oder Board) und Instagram verlinken. Pinterest-Pins werden erst nach ausdrücklicher Zustimmung des Besuchers eingebettet (das Skript von assets.pinterest.com wird vorher nicht geladen). Adressen werden in `src/lib/social.js` beim Speichern und beim Anzeigen geprüft. In der Datenschutzerklärung muss das Pinterest-Widget erwähnt werden.

## Texte der Landingpage direkt auf der Seite bearbeiten
- Jeder Text mit `data-edit="schlüssel"` in `index.html` lässt sich überschreiben. Der Text im HTML ist der Standard.
- Die geänderten Texte liegen in der Tabelle `site_content` (Migration `0003_site_content.sql`) und sind öffentlich lesbar. Schreiben dürfen nur Konten in `admins`.
- Administrator wird, wer sich mit einer E-Mail anmeldet, die in `admin_emails` steht und bestätigt ist. Einmalig freigeben:
  `insert into public.admin_emails (email) values ('deine@mail.de');` (Kleinschreibung).
- Bearbeiten: Auf der Seite unten auf „Seite bearbeiten“ klicken (oder `/?bearbeiten` aufrufen), anmelden, Text anklicken, ändern, „Speichern“. Mit `*wort*` wird ein Wort kursiv.
- Jede Änderung steht in `site_content_history` (alter und neuer Wert), falls ein Text zurückgeholt werden muss.
- Nicht enthalten: Texte in der App (`src/`), Bilder und neue Abschnitte.
