/*
 * Texte der Landingpage aus der Datenbank.
 * Jedes Element mit data-edit="schlüssel" kann überschrieben werden. Der Text im HTML ist der Standard.
 * Es wird nie HTML aus der Datenbank eingesetzt: Text wird maskiert, nur *wort* (kursiv) und Zeilenumbrüche sind erlaubt.
 */
import { SUPABASE_URL, SUPABASE_KEY } from '../lib/config.js';

export const CACHE_KEY = 'wishtale:cms';

export const fmt = raw => String(raw)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(/\*([^*\n]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');

/** Aktueller Inhalt eines Elements als Rohtext (kursiv als *wort*). */
export function toRaw(el) {
  const html = el.innerHTML.replace(/<em>/g, '*').replace(/<\/em>/g, '*').replace(/<br\s*\/?>/g, '\n');
  const t = document.createElement('span');
  t.innerHTML = html;
  return t.textContent;
}

export const nodes = () => [...document.querySelectorAll('[data-edit]')];

/** Setzt Texte aus map; ohne Eintrag gilt der Standard aus dem HTML. */
export function applyMap(map) {
  nodes().forEach(el => {
    if (!el.hasAttribute('data-def')) el.setAttribute('data-def', toRaw(el));
    const v = map[el.dataset.edit];
    el.innerHTML = fmt(v != null && v !== '' ? v : el.getAttribute('data-def'));
  });
}

export async function fetchMap() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=key,value`, { headers: { apikey: SUPABASE_KEY } });
  if (!r.ok) throw new Error('Texte nicht ladbar (' + r.status + ')');
  return Object.fromEntries((await r.json()).map(x => [x.key, x.value]));
}

export function cacheMap(map) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ map, ts: Date.now() })); } catch { /* ohne Zwischenspeicher */ }
}

export async function initContent() {
  try {
    const map = await fetchMap();
    applyMap(map);
    cacheMap(map);
  } catch (e) { console.warn(e); /* Standardtexte bleiben stehen */ }
}
