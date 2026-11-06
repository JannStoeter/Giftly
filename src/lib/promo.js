/*
 * Aktionen und hervorgehobene Produkte aus dem CMS (Tabellen campaigns und products).
 * Besucher sehen nur, was aktiv ist und im Zeitraum liegt (Regeln in der Datenbank).
 * Fehlt die Tabelle oder ist die Verbindung weg, bleibt alles einfach leer.
 */
import { sb } from './supabase.js';
import { withAmazonTag } from './shops.js';

let cache = null;
export async function loadPromo() {
  if (cache) return cache;
  try {
    const [c, p] = await Promise.all([
      sb.from('campaigns').select('*').order('starts_at', { ascending: false }),
      sb.from('products').select('*').order('sort', { ascending: true }),
    ]);
    cache = { campaigns: c.error ? [] : c.data, products: p.error ? [] : p.data };
  } catch { cache = { campaigns: [], products: [] }; }
  return cache;
}
export const safeUrl = u => { try { const x = new URL(u, location.origin); return /^https?:$/.test(x.protocol) ? withAmazonTag(x.href) : '#'; } catch { return '#'; } };
