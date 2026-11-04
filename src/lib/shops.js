/*
 * Shop-Links. Ohne Produkt-Feed gibt es keine garantierten Direktlinks oder Live-Preise.
 * Darum erzeugen wir aus Wunsch/Produkt eine Suchanfrage und verlinken auf Preisvergleich und Shops,
 * dort sieht man tagesaktuelle Preise. Eigene Links der Nutzer (Wunsch-Link) haben Vorrang.
 */
const enc = encodeURIComponent;

/* Amazon-PartnerNet Tracking-ID. Wird als ?tag=... an alle amazon.de-Links gehängt. */
export const AMAZON_TAG = 'jannst-21';

/** Pflichthinweis laut Amazon-PartnerNet-Teilnahmebedingungen. */
export const AMAZON_DISCLOSURE = 'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.';

/** Hängt die Partner-ID an jede amazon.de-URL (auch an Direktlinks von Nutzern). */
export function withAmazonTag(url) {
  try {
    const u = new URL(url);
    if (/(^|\.)amazon\.de$/i.test(u.hostname)) u.searchParams.set('tag', AMAZON_TAG);
    return u.href;
  } catch { return url; }
}

/** Macht aus "shop.de/produkt" eine gültige https-URL; liefert null bei leerer/ungültiger Eingabe. */
export function normUrl(raw) {
  const v = (raw || '').trim();
  if (!v) return null;
  const u = /^https?:\/\//i.test(v) ? v : 'https://' + v;
  try { const p = new URL(u); return /\./.test(p.hostname) ? withAmazonTag(p.href) : null; } catch { return null; }
}

export const searchUrl = {
  idealo: q => `https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=${enc(q)}`,
  google: q => `https://www.google.de/search?tbm=shop&q=${enc(q)}`,
  amazon: q => `https://www.amazon.de/s?k=${enc(q)}&tag=${AMAZON_TAG}`,
};

export const shopLinks = q => [
  { n: 'idealo', u: searchUrl.idealo(q) },
  { n: 'Google Shopping', u: searchUrl.google(q) },
  { n: 'Amazon', u: searchUrl.amazon(q) },
];

/** Anzeige-HTML: eine Zeile mit Link-Chips. Externe Links immer mit noopener und sponsored. */
export const linkChip = (href, label) =>
  `<a class="chip" href="${href}" target="_blank" rel="noopener noreferrer sponsored">${label}</a>`;

export const shopChips = q => shopLinks(q).map(s => linkChip(s.u, s.n)).join('');
