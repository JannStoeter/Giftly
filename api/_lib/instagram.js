/*
 * Veröffentlicht ein Karussell (oder ein Einzelbild) über die Instagram Content Publishing API.
 * Ablauf: je Bild einen Container anlegen, warten bis er fertig ist, bei mehreren Bildern einen Karussell-Container bauen, veröffentlichen.
 * Voraussetzung: Instagram-Geschäftskonto, Meta-App, Token mit instagram_content_publish. Bilder müssen öffentlich als JPEG erreichbar sein.
 */
import { HttpError } from './auth.js';

const HOST = () => process.env.META_API_HOST || 'https://graph.facebook.com';
const VERSION = () => process.env.META_GRAPH_VERSION || 'v23.0';

export const igConfig = () => ({ userId: process.env.META_IG_USER_ID || '', token: process.env.META_ACCESS_TOKEN || '' });
export const igConfigured = () => { const c = igConfig(); return !!(c.userId && c.token); };

async function call(path, { method = 'GET', params = {} } = {}, fetchImpl) {
  const c = igConfig();
  const q = new URLSearchParams({ ...params, access_token: c.token });
  const url = `${HOST()}/${VERSION()}/${path}`;
  const r = await fetchImpl(method === 'GET' ? `${url}?${q}` : url, method === 'GET' ? {} : { method, headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: q });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new HttpError(502, `Instagram: ${(j.error && (j.error.error_user_msg || j.error.message)) || r.status}`);
  return j;
}

async function waitReady(id, fetchImpl, tries = 12, delay = 2000) {
  for (let i = 0; i < tries; i++) {
    const s = await call(id, { params: { fields: 'status_code' } }, fetchImpl);
    if (s.status_code === 'FINISHED' || s.status_code === undefined) return;
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new HttpError(502, 'Instagram konnte ein Bild nicht verarbeiten.');
    await new Promise(r => setTimeout(r, delay));
  }
  throw new HttpError(504, 'Instagram braucht zu lange. Bitte versuche es später noch einmal.');
}

export async function account(fetchImpl = fetch) {
  const c = igConfig();
  const j = await call(c.userId, { params: { fields: 'username,name' } }, fetchImpl);
  return { username: j.username || j.name || '' };
}

export async function publish({ imageUrls, caption }, fetchImpl = fetch, opts = {}) {
  if (!igConfigured()) throw new HttpError(400, 'Instagram ist noch nicht verbunden.');
  if (!imageUrls?.length) throw new HttpError(400, 'Der Beitrag hat noch keine Bilder.');
  if (imageUrls.length > 10) throw new HttpError(400, 'Ein Karussell darf höchstens 10 Bilder haben.');
  const c = igConfig(), wait = opts.wait || waitReady;
  let container;
  if (imageUrls.length === 1) {
    container = (await call(`${c.userId}/media`, { method: 'POST', params: { image_url: imageUrls[0], caption } }, fetchImpl)).id;
  } else {
    const kids = [];
    for (const url of imageUrls) kids.push((await call(`${c.userId}/media`, { method: 'POST', params: { image_url: url, is_carousel_item: 'true' } }, fetchImpl)).id);
    for (const k of kids) await wait(k, fetchImpl);
    container = (await call(`${c.userId}/media`, { method: 'POST', params: { media_type: 'CAROUSEL', children: kids.join(','), caption } }, fetchImpl)).id;
  }
  await wait(container, fetchImpl);
  const pub = await call(`${c.userId}/media_publish`, { method: 'POST', params: { creation_id: container } }, fetchImpl);
  let permalink = '';
  try { permalink = (await call(pub.id, { params: { fields: 'permalink' } }, fetchImpl)).permalink || ''; } catch { /* nicht kritisch */ }
  return { mediaId: pub.id, permalink };
}
