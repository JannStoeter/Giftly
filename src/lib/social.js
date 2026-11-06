/*
 * Pinterest und Instagram am Profil.
 * Alles aus der Datenbank gilt als nicht vertrauenswürdig: Adressen werden beim Speichern und beim Anzeigen
 * geprüft und neu aufgebaut, nie unverändert übernommen.
 */
const PIN_HOST = /^(www\.|[a-z]{2}\.)?pinterest\.(com|de|at|ch|fr|es|it|nl|co\.uk)$/i;
const IG_HANDLE = /^[A-Za-z0-9._]{1,30}$/;
const withProto = v => (/^https?:\/\//i.test(v) ? v : 'https://' + v);

/** Pinterest-Profil oder -Board. Liefert { ok, value, kind } oder { ok:false, error }. */
export function parsePinterest(raw) {
  const v = String(raw || '').trim();
  if (!v) return { ok: true, value: '' };
  let u;
  try { u = new URL(withProto(v)); } catch { return { ok: false, error: 'Das sieht nicht nach einem Link aus.' }; }
  if (!PIN_HOST.test(u.hostname)) return { ok: false, error: 'Bitte füge einen Link von pinterest.com oder pinterest.de ein.' };
  const seg = u.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (!seg.length || seg[0] === 'pin') return { ok: false, error: 'Das ist ein einzelner Pin. Bitte nimm den Link zu deinem Profil oder zu einem Board, zum Beispiel pinterest.de/dein-name/.' };
  if (seg.length > 2) seg.length = 2;
  if (!seg.every(s => /^[\p{L}\p{N}_.\-%]{1,100}$/u.test(s))) return { ok: false, error: 'Der Link enthält Zeichen, die wir nicht übernehmen können.' };
  const value = 'https://www.pinterest.com/' + seg.map(encodeURIComponent).join('/') + '/';
  return { ok: true, value, kind: seg.length === 2 ? 'board' : 'user' };
}

/** Instagram-Name (mit oder ohne @) oder Profil-Link. Gespeichert wird nur der Name. */
export function parseInstagram(raw) {
  let v = String(raw || '').trim();
  if (!v) return { ok: true, value: '' };
  if (/instagram\.com/i.test(v)) {
    let u;
    try { u = new URL(withProto(v)); } catch { return { ok: false, error: 'Das sieht nicht nach einem Link aus.' }; }
    if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return { ok: false, error: 'Bitte nimm einen Link von instagram.com.' };
    const first = u.pathname.split('/').filter(Boolean)[0] || '';
    if (!first || ['p', 'reel', 'reels', 'stories', 'explore', 'tv'].includes(first)) return { ok: false, error: 'Das ist kein Profil-Link. Schreib am besten einfach deinen Instagram-Namen.' };
    v = first;
  }
  v = v.replace(/^@/, '');
  if (!IG_HANDLE.test(v)) return { ok: false, error: 'Ein Instagram-Name besteht aus Buchstaben, Zahlen, Punkten und Unterstrichen.' };
  return { ok: true, value: v };
}

/** Aus unbekannten Daten ein sauberes { pinterest, instagram } machen. */
export function safeSocial(raw) {
  const out = {};
  if (raw && typeof raw === 'object') {
    const p = parsePinterest(raw.pinterest);
    if (p.ok && p.value) out.pinterest = p.value;
    const i = parseInstagram(raw.instagram);
    if (i.ok && i.value) out.instagram = i.value;
  }
  return out;
}

export const instagramUrl = h => `https://www.instagram.com/${encodeURIComponent(h)}/`;
export const pinterestKind = url => (url.replace(/^https:\/\/www\.pinterest\.com\//, '').split('/').filter(Boolean).length === 2 ? 'board' : 'user');

/* Einwilligung für das Laden von Pinterest-Inhalten (Drittanbieter). */
const KEY = 'wishtale:consent:pinterest';
export const hasPinConsent = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
export const givePinConsent = () => { try { localStorage.setItem(KEY, '1'); } catch { /* nur für diese Sitzung */ } window.__pinConsent = true; };
export const revokePinConsent = () => { try { localStorage.removeItem(KEY); } catch { /* ignorieren */ } window.__pinConsent = false; };
export const pinConsent = () => hasPinConsent() || !!window.__pinConsent;

let pinPromise;
/** Lädt das Pinterest-Skript erst nach Einwilligung. */
export function loadPinterest() {
  if (window.PinUtils) return Promise.resolve(true);
  if (!pinPromise) {
    pinPromise = new Promise(res => {
      const s = document.createElement('script');
      s.async = true; s.src = 'https://assets.pinterest.com/js/pinit.js';
      // pinit.js lädt sein Hauptskript nach: erst fertig, wenn PinUtils existiert.
      s.onload = () => {
        const t0 = Date.now();
        const wait = () => (window.PinUtils ? res(true) : Date.now() - t0 > 4000 ? (pinPromise = null, res(false)) : setTimeout(wait, 100));
        wait();
      };
      s.onerror = () => { pinPromise = null; res(false); };
      document.body.appendChild(s);
    });
  }
  return pinPromise;
}
