/*
 * Produkt-Zuordnung: Zu jedem Wunsch gibt es ein Produkt mit Amazon-Link.
 *  1. Kategorie-Wunsch ("Pfanne bis 100 €")  -> bester Treffer im Budget
 *  2. Link der Person                         -> genau dieser Link
 *  3. Treffer in Produktdaten / Katalog       -> Produkt mit Amazon-Seite (ASIN) bzw. Suche
 *  4. sonst                                   -> von Giftly erzeugter Vorschlag (Amazon-Suche zur Wunschbeschreibung)
 */
import { same, overlap, norm, kwOf } from './util.js';
import { PRODUCTS, CATALOG } from '../data/content.js';
import { AMAZON_TAG, normUrl, searchUrl } from './shops.js';
import { picks, excluded } from '../logic.js';

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
