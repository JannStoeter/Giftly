import { requireAdmin, rest, send, fail, HttpError } from './_lib/auth.js';
import { publish, igConfigured } from './_lib/instagram.js';

/** Veröffentlicht einen gespeicherten Beitrag (nur Admins). Body: { action: 'publish', postId } */
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Nur POST.' });
  try {
    const { token } = await requireAdmin(req);
    const { action, postId } = req.body || {};
    if (action !== 'publish' || !/^[0-9a-f-]{36}$/i.test(String(postId))) throw new HttpError(400, 'Ungültige Anfrage.');
    if (!igConfigured()) throw new HttpError(400, 'Instagram ist noch nicht verbunden.');
    const db = rest(token);
    const [post] = await db(`social_posts?id=eq.${postId}&select=*`);
    if (!post) throw new HttpError(404, 'Beitrag nicht gefunden.');
    if (post.status === 'posted') throw new HttpError(409, 'Dieser Beitrag ist schon gepostet.');
    try {
      const out = await publish({ imageUrls: post.image_urls, caption: post.caption });
      await db(`social_posts?id=eq.${postId}`, { method: 'PATCH', body: { status: 'posted', posted_at: new Date().toISOString(), ig_media_id: out.mediaId, ig_permalink: out.permalink, publish_error: null } });
      return send(res, 200, { ok: true, ...out });
    } catch (e) {
      await db(`social_posts?id=eq.${postId}`, { method: 'PATCH', body: { publish_error: String(e.message).slice(0, 400) } }).catch(() => {});
      throw e;
    }
  } catch (e) { return fail(res, e); }
}
