import { rest, send, fail, HttpError } from './_lib/auth.js';
import { publish, igConfigured } from './_lib/instagram.js';

/**
 * Geplante Beiträge veröffentlichen. Vercel ruft das täglich auf (vercel.json) und schickt CRON_SECRET mit.
 * Braucht SUPABASE_SERVICE_ROLE_KEY, weil hier kein angemeldeter Admin dabei ist.
 */
export default async function handler(req, res) {
  try {
    const secret = process.env.CRON_SECRET, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) throw new HttpError(401, 'Nicht erlaubt.');
    if (!key || !igConfigured()) return send(res, 200, { ok: true, skipped: 'nicht verbunden' });
    const db = rest(key);
    const due = await db(`social_posts?status=eq.ready&scheduled_for=lte.${new Date().toISOString()}&select=*&order=scheduled_for.asc&limit=3`);
    const out = [];
    for (const p of due) {
      if (!Array.isArray(p.image_urls) || !p.image_urls.length) { out.push({ id: p.id, skipped: 'keine Bilder' }); continue; }
      try {
        const r = await publish({ imageUrls: p.image_urls, caption: p.caption });
        await db(`social_posts?id=eq.${p.id}`, { method: 'PATCH', body: { status: 'posted', posted_at: new Date().toISOString(), ig_media_id: r.mediaId, ig_permalink: r.permalink, publish_error: null } });
        out.push({ id: p.id, ok: true });
      } catch (e) {
        await db(`social_posts?id=eq.${p.id}`, { method: 'PATCH', body: { publish_error: String(e.message).slice(0, 400) } }).catch(() => {});
        out.push({ id: p.id, error: e.message });
      }
    }
    return send(res, 200, { ok: true, results: out });
  } catch (e) { return fail(res, e); }
}
