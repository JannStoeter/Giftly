// Lädt alle Fotos aus src/data/photos.js einmalig nach public/photos (Unsplash/Pexels). Danach liefert die Seite sie selbst aus.
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { PHOTOS, PHOTO_SIZES, photoUrl, remoteUrl } from '../src/data/photos.js';

mkdirSync('public/photos', { recursive: true });
let bad = 0;
for (const key of Object.keys(PHOTOS)) {
  for (const w of PHOTO_SIZES) {
    const file = 'public' + photoUrl(key, w);
    try { execFileSync('curl', ['-sfL', '-m', '40', '-o', file, remoteUrl(key, w)]); console.log('ok    ', file, Math.round(statSync(file).size / 1024) + ' KB'); }
    catch { bad++; console.log('FEHLT ', file); }
  }
}
process.exit(bad ? 1 : 0);
