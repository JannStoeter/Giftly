/*
 * Produkt-Zuordnung: Zu jedem Wunsch gibt es ein Produkt mit Amazon-Link.
 *  1. Kategorie-Wunsch ("Pfanne bis 100 €")  -> bester Treffer im Budget
 *  2. Link der Person                         -> genau dieser Link
 *  3. Treffer in Produktdaten / Katalog       -> Produkt mit Amazon-Seite (ASIN) bzw. Suche
 *  4. sonst                                   -> von Wishtale erzeugter Vorschlag (Amazon-Suche zur Wunschbeschreibung)
 */
import { same, overlap, norm, kwOf } from './util.js';
import { PRODUCTS, CATALOG } from '../data/content.js';
import { AMAZON_TAG, normUrl, searchUrl } from './shops.js';
import { picks, excluded, recommend } from '../logic.js';

export const amazonUrl = p => p.asin ? `https://www.amazon.de/dp/${p.asin}?tag=${AMAZON_TAG}` : searchUrl.amazon(p.search || p.t);

/** Ergebnis: { t, url, host, price, a, tone, source, ideas } */
export function productFor(person, w) {
  if (w.kind === 'kategorie') {
    const top = picks(person, w).list[0];
    if (top) return fromProduct(top.x, 'vorschlag');
  }
  const own = deepLink(w.link);
  if (own) return { t: w.t, url: own, host: new URL(own).hostname.replace(/^www\./, ''), price: w.price || null, priceBy: 'user', source: 'link', direct: true };
  const brandHit = PRODUCTS.find(x => w.kw.some(k => same(k, x.cat)) && norm(w.t).includes(norm(x.brand)));
  const catHit = brandHit || PRODUCTS.find(x => w.kw.some(k => same(k, x.cat)));
  if (catHit && w.kind !== 'frei') return fromProduct(catHit, 'katalog');
  const cat = CATALOG.find(i => i.k === 'ding' && overlap(w.kw, i.kw));
  if (cat && w.kind !== 'frei') return { t: cat.t, url: searchUrl.amazon(cat.t), host: 'amazon.de', range: cat.p, a: cat.a, source: 'katalog', direct: false };
  if (w.kind === 'erlebnis' || w.kind === 'frei') return null; // dafür gibt es Ideen (ideasFor)
  return { t: w.t, url: searchUrl.amazon(w.t), host: 'amazon.de', source: 'erzeugt', direct: false };
}

/* Nur echte Produktlinks zählen. Eine bloße Shop-Startseite (z. B. lecreuset.de) ersetzen wir durch ein Amazon-Produkt. */
function deepLink(raw) {
  const u = normUrl(raw);
  if (!u) return null;
  const { pathname, search } = new URL(u);
  return pathname.length > 1 || search ? u : null;
}

const fromProduct = (x, source) => ({ t: x.t, url: amazonUrl(x), host: 'amazon.de', price: x.price, a: x.a, tone: x.tone, brand: x.brand, source, direct: !!x.asin });

/** Ideen zu freien Wünschen ("Etwas Schönes für den Balkon"): passende Katalogprodukte. */
export function ideasFor(person, w, n = 3) {
  const stop = new Set(kwOf(w.t));
  return CATALOG.filter(i => i.k === 'ding' && !excluded(person, i) && (i.c === w.c || i.tags.some(t => stop.has(t))))
    .slice(0, n);
}

/**
 * Angebote zu einem Wunsch für das Detail-Fenster: ein Hauptvorschlag und Alternativen.
 * Jedes Angebot hat eine id, damit der Gast eines davon wählen kann.
 */
export function offersFor(person, w) {
  const main = productFor(person, w);
  if (w.kind === 'kategorie') {
    const { list, over } = picks(person, w);
    const offers = list.map(e => ({ ...fromProduct(e.x, 'vorschlag'), id: e.x.id, why: e.why }));
    return { main: offers[0] || (main && { ...main, id: 'main' }) || null, alts: offers.slice(1, 4), over };
  }
  const pool = PRODUCTS.filter(x => w.kw.some(k => same(k, x.cat)));
  if (main && pool.length && w.kind !== 'frei') {
    const mp = pool.find(x => x.t === main.t);
    const alts = pool.filter(x => x !== mp).sort((a, b) => b.q - a.q).slice(0, 3).map(x => ({ ...fromProduct(x, 'katalog'), id: x.id }));
    return { main: { ...main, id: mp ? mp.id : 'main' }, alts, over: 0 };
  }
  const alts = w.kind === 'frei'
    ? ideasFor(person, w, 3).map(i => ({ t: i.t, url: searchUrl.amazon(i.t), host: 'amazon.de', range: i.p, a: i.a, source: 'idee', direct: false, id: i.id }))
    : [];
  return { main: main ? { ...main, id: 'main' } : null, alts, over: 0 };
}

/* ---------- Welten ---------- */
const WORLD_OF_CAT = { pfanne: 'kochen', bräter: 'kochen', messerset: 'kochen', wasserkocher: 'genuss', mühle: 'genuss', wanderstöcke: 'outdoor' };
const strip = t => String(t).replace(/<[^>]+>/g, '');
const nearby = t => `https://www.google.de/search?q=${encodeURIComponent(t + ' in der Nähe')}`;

/**
 * Produkte und Erlebnisse zu einer Welt (z. B. "genuss") aus dem, was wir über die Person wissen:
 * Interessen, Marken, Wünsche. Ausgeschlossen: was sie schon hat, schon bekam oder nicht möchte.
 */
export function worldOffers(person, cid, n = 6) {
  const out = [];
  PRODUCTS.filter(x => WORLD_OF_CAT[x.cat] === cid && !excluded(person, { kw: [...kwOf(x.t), x.cat] })).forEach(x => {
    const why = [];
    let sc = x.q;
    if (person.brands.includes(x.brand)) { sc += 4; why.push(`${x.brand} gehört zu den Lieblingsmarken.`); }
    if (person.wishes.some(w => w.status === 'offen' && w.kw.some(k => same(k, x.cat)))) { sc += 3; why.push('Passt zu einem Wunsch auf der Liste.'); }
    out.push({ sc, offer: { ...fromProduct(x, 'katalog'), id: x.id, why } });
  });
  recommend(person).good.filter(g => g.it.c === cid).forEach(g => {
    const exp = g.it.k === 'erlebnis';
    out.push({
      sc: g.sc,
      offer: {
        t: g.it.t, url: exp ? nearby(g.it.t) : searchUrl.amazon(g.it.t), host: exp ? 'google.de' : 'amazon.de', cta: exp ? 'In der Nähe suchen' : null,
        range: exp ? null : g.it.p, a: g.it.a, source: 'idee', direct: false, id: g.it.id, exp, why: g.why.slice(0, 2).map(strip),
      },
    });
  });
  const seen = new Set();
  return out.sort((a, b) => b.sc - a.sc).map(o => o.offer).filter(o => !seen.has(o.t) && seen.add(o.t)).slice(0, n);
}
