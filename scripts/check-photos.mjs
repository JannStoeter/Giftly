// Prüft, ob alle Fotos aus src/data/photos.js erreichbar sind (Unsplash/Pexels).
// Nutzt curl, damit ein konfigurierter HTTPS-Proxy automatisch verwendet wird.
import { execFileSync } from 'node:child_process';
import { PHOTOS, photoUrl } from '../src/data/photos.js';

let bad = 0;
for (const key of Object.keys(PHOTOS)) {
  const url = photoUrl(key, 200);
  let code = '000';
  try { code = execFileSync('curl', ['-s', '-m', '20', '-o', '/dev/null', '-w', '%{http_code}', url]).toString(); } catch { /* bleibt 000 */ }
  if (code !== '200') { bad++; console.log(`FEHLT  ${key} (${code})  ${url}`); } else console.log(`ok     ${key}`);
}
console.log(bad ? `\n${bad} Foto(s) nicht erreichbar.` : '\nAlle Fotos erreichbar.');
process.exit(bad ? 1 : 0);
