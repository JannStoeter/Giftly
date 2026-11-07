import { rest, send, HttpError } from './_lib/auth.js';
import { buildEvent } from './_lib/event.js';

const seen = new Map(); // Bremse pro Instanz: höchstens 40 Ereignisse pro Minute und Besuch
const limited = v => { const now = Date.now(), l = (seen.get(v) || []).filter(t => now - t < 60000); l.push(now); seen.set(v, l); if (seen.size > 5000) seen.clear(); return l.length > 40; };

/** Nimmt ein Ereignis der eigenen Seiten entgegen (sendBeacon). Antwortet immer leise, damit die Seite nie davon abhängt. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Nur POST.' });
  try {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const salt = process.env.ANALYTICS_SALT || key || '';
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
    const row = key ? buildEvent(body, req.headers, salt) : null;
    if (row && !limited(row.visitor)) await rest(key)('events', { method: 'POST', body: row }).catch(() => {});
  } catch (e) { if (!(e instanceof HttpError)) console.error(e); }
  res.status(204).end();
}
