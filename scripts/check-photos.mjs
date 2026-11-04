// Prüft, ob alle Fotos aus src/data/photos.js erreichbar sind (benötigt Zugriff auf images.unsplash.com).
import { PHOTOS, photoUrl } from '../src/data/photos.js';
let bad = 0;
for (const key of Object.keys(PHOTOS)) {
  const url = photoUrl(key, 200);
  try {
    const r = await fetch(url, { method: 'HEAD' });
    if (!r.ok) { bad++; console.log(`FEHLT  ${key}  (${r.status})  ${url}`); } else console.log(`ok     ${key}`);
  } catch (e) { bad++; console.log(`FEHLER ${key}  ${e.message}`); }
}
console.log(bad ? `\n${bad} Foto(s) nicht erreichbar.` : '\nAlle Fotos erreichbar.');
process.exit(bad ? 1 : 0);
