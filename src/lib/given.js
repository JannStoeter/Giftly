/*
 * „Was ich verschenkt habe“: Geschenke merken, die man bei anderen reserviert, gekauft oder von Hand eingetragen hat.
 * Ohne Konto liegt die Liste nur im Browser (wishtale:given). Mit Konto liegt sie in der Tabelle given_gifts, nur für die eigene Person lesbar.
 * Die beschenkte Person erfährt nie etwas davon.
 */
import { sb } from './supabase.js';
import { S } from '../state.js';

const KEY = 'wishtale:given';
const rd = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const wr = a => { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 200))); } catch { /* nur für diese Sitzung */ } };
const today = () => new Date().toISOString().slice(0, 10);

export const toRow = (g, uid) => ({
  owner_id: uid, wish_ref: g.ref || null, recipient_name: String(g.recipient || '').slice(0, 60),
  recipient_handle: /^[a-z0-9-]{3,31}$/.test(g.handle || '') ? g.handle : null, wish_title: String(g.wishTitle || '').slice(0, 160),
  what: String(g.what || '').slice(0, 160), url: String(g.url || '').slice(0, 600), occasion: String(g.occasion || '').slice(0, 40),
  status: g.status || 'reserved', price: g.price > 0 ? g.price : null, reaction: g.reaction || null, note: String(g.note || '').slice(0, 400), given_on: g.when || today(),
});
export const fromRow = r => ({ id: r.id, ref: r.wish_ref, recipient: r.recipient_name, handle: r.recipient_handle, wishTitle: r.wish_title, what: r.what, url: r.url, occasion: r.occasion, status: r.status, price: r.price ? +r.price : null, reaction: r.reaction, note: r.note, when: r.given_on });

export async function loadGiven() {
  if (S.auth.user) {
    const { data, error } = await sb.from('given_gifts').select('*').order('given_on', { ascending: false }).order('created_at', { ascending: false });
    S.given = error ? [] : data.map(fromRow);
  } else S.given = rd();
}

/** Legt ein Geschenk an oder aktualisiert es (gleiche ref = gleicher Wunsch). Fehler beim Speichern bleiben still, die Liste ist ein Komfort. */
export async function saveGift(g) {
  const i = g.id ? S.given.findIndex(x => x.id === g.id) : g.ref ? S.given.findIndex(x => x.ref === g.ref) : -1;
  const merged = { ...(i > -1 ? S.given[i] : {}), ...g };
  if (!merged.when) merged.when = today();
  if (!S.auth.user) {
    if (!merged.id) merged.id = 'l' + Math.random().toString(36).slice(2, 10);
    if (i > -1) S.given[i] = merged; else S.given.unshift(merged);
    wr(S.given); return merged;
  }
  try {
    if (i > -1 && merged.id) {
      const { error } = await sb.from('given_gifts').update(toRow(merged, S.auth.user.id)).eq('id', merged.id); if (error) throw error;
      S.given[i] = merged;
    } else {
      const { data, error } = await sb.from('given_gifts').insert(toRow(merged, S.auth.user.id)).select().single(); if (error) throw error;
      S.given.unshift(fromRow(data));
    }
  } catch (e) { console.error(e); }
  return merged;
}

export async function removeGift(id) {
  S.given = S.given.filter(x => x.id !== id);
  if (!S.auth.user) { wr(S.given); return; }
  try { await sb.from('given_gifts').delete().eq('id', id); } catch (e) { console.error(e); }
}

/** Nach der Anmeldung: was auf diesem Gerät gemerkt wurde, wandert ins Konto. */
export async function migrateGiven() {
  const local = rd();
  if (!S.auth.user || !local.length) return 0;
  const rows = local.map(g => toRow(g, S.auth.user.id));
  const { error } = await sb.from('given_gifts').upsert(rows, { onConflict: 'owner_id,wish_ref', ignoreDuplicates: true });
  if (error) { console.error(error); return 0; }
  try { localStorage.removeItem(KEY); } catch { /* ignorieren */ }
  return rows.length;
}

export const giftsFor = handle => (S.given || []).filter(g => handle && g.handle === handle);
export const STATUS = { reserved: 'Reserviert', bought: 'Gekauft', given: 'Verschenkt' };
