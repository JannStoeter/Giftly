// Prüft, ob zu jedem Foto aus src/data/photos.js eine Datei in public/photos liegt.
import { existsSync } from 'node:fs';
import { PHOTOS, PHOTO_SIZES, photoUrl } from '../src/data/photos.js';

let bad = 0;
for (const key of Object.keys(PHOTOS)) for (const w of PHOTO_SIZES) {
  const f = 'public' + photoUrl(key, w);
  if (!existsSync(f)) { bad++; console.log('FEHLT  ' + f); }
}
console.log(bad ? `\n${bad} Datei(en) fehlen. Mit npm run photos:fetch laden.` : 'Alle Fotos sind vorhanden.');
process.exit(bad ? 1 : 0);
