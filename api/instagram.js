import { requireAdmin, rest, send, fail, HttpError } from './_lib/auth.js';
import { publish, publishStories, startReel, containerStatus, finish, igConfigured } from './_lib/instagram.js';

const done = (db, id, out) => db(`social_posts?id=eq.${id}`, { method: 'PATCH', body: { status: 'posted', posted_at: new Date().toISOString(), ig_media_id: out.mediaId, ig_permalink: out.permalink, publish_error: null, ig_creation_id: null } });

/**
 * Veröffentlicht einen gespeicherten Beitrag (nur Admins).
 *  { action: 'publish', postId }  Beitrag, Story oder Reel starten (Reels melden „processing“, solange Instagram rechnet)
 *  { action: 'finish', postId }   Reel abschließen, sobald Instagram fertig ist
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Nur POST.' });
  let db, postId;
  try {
    const { token } = await requireAdmin(req);
    const { action } = req.body || {}; postId = req.body?.postId;
    if (!['publish', 'finish'].includes(action) || !/^[0-9a-f-]{36}$/i.test(String(postId))) throw new HttpError(400, 'Ungültige Anfrage.');
    if (!igConfigured()) throw new HttpError(400, 'Instagram ist noch nicht verbunden.');
    db = rest(token);
    const [post] = await db(`social_posts?id=eq.${postId}&select=*`);
    if (!post) throw new HttpError(404, 'Beitrag nicht gefunden.');
    if (post.status === 'posted') throw new HttpError(409, 'Dieser Beitrag ist schon gepostet.');

    if (post.format === 'reel') {
      let creation = post.ig_creation_id;
      if (action === 'publish' || !creation) {
        creation = await startReel({ videoUrl: post.video_url, caption: post.caption });
        await db(`social_posts?id=eq.${postId}`, { method: 'PATCH', body: { ig_creation_id: creation, publish_error: null } });
      }
      const st = await containerStatus(creation);
      if (st !== 'FINISHED') return send(res, 202, { processing: true });
      const out = await finish(creation); await done(db, postId, out);
      return send(res, 200, { ok: true, ...out });
    }
    const out = post.format === 'story' ? await publishStories({ imageUrls: post.image_urls }) : await publish({ imageUrls: post.image_urls, caption: post.caption });
    await done(db, postId, out);
    return send(res, 200, { ok: true, ...out });
  } catch (e) {
    if (db && postId) await db(`social_posts?id=eq.${postId}`, { method: 'PATCH', body: { publish_error: String(e.message).slice(0, 400) } }).catch(() => {});
    return fail(res, e);
  }
}
