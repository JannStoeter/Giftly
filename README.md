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
