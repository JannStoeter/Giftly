import { requireUser, send, fail, HttpError } from './_lib/auth.js';
import { inspect } from './_lib/inspect.js';

const seen = new Map(); // einfache Bremse pro Instanz: höchstens 20 Abrufe in 10 Minuten je Person
const limited = id => { const now = Date.now(), l = (seen.get(id) || []).filter(t => now - t < 600000); l.push(now); seen.set(id, l); return l.length > 20; };

/** Liest Name, Preis, Marke und Größe einer Produktseite. Body: { url } (nur angemeldete Personen) */
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Nur POST.' });
  try {
    const { id } = await requireUser(req);
    if (limited(id)) throw new HttpError(429, 'Das waren gerade etwas viele Abrufe. Bitte versuche es in ein paar Minuten noch einmal.');
    const url = String(req.body?.url || '').trim();
    if (!url || url.length > 1000) throw new HttpError(400, 'Bitte füge einen Link ein.');
    return send(res, 200, { product: await inspect(url) });
  } catch (e) { return fail(res, e); }
}
