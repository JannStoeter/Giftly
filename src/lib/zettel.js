/* Wunschzettel einlesen: Fotos werden hier verkleinert (Upload-Grenze) und an api/zettel.js geschickt. */
import { sb } from './supabase.js';

const shrink = file => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => {
    const k = Math.min(1, 1800 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    resolve({ media: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.82).split(',')[1] });
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Dieses Bild lässt sich nicht öffnen. Bitte nimm ein Foto im Format JPG oder PNG.')); };
  img.src = url;
});

export async function readZettelRemote({ text, files }) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error('Melde dich an, dann liest Wishtale den Wunschzettel für dich.');
  const images = [];
  for (const f of (files || []).slice(0, 4)) images.push(await shrink(f));
  let r;
  try { r = await fetch('/api/zettel', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + session.access_token }, body: JSON.stringify({ text, images }) }); }
  catch { throw new Error('Keine Verbindung. Bitte versuche es gleich noch einmal.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Das hat nicht geklappt.');
  return j;
}
