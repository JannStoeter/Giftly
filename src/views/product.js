import { esc, ic, money } from '../lib/util.js';
import { AMAZON_TAG, searchUrl } from '../lib/shops.js';
import { PRICE_DATE } from '../data/content.js';

const REL = 'noopener noreferrer sponsored nofollow';
const SOURCE = {
  erzeugt: 'Vorschlag von Wishtale',
  vorschlag: 'Vorschlag im Budget',
  katalog: 'Passendes Produkt',
  link: 'Gewünschtes Produkt'
};

export function priceLine(pr){
  if(pr.price)return `<div class="price"><b>${money(pr.price)}</b><span>${pr.priceBy==='user'?'Preis laut Eintrag':'bei Amazon beobachtet, Stand '+PRICE_DATE}. Kann abweichen.</span></div>`;
  if(pr.range)return `<div class="price"><b>Preis offen</b><span>Preisrahmen ca. ${money(pr.range)} (Schätzung). Aktuellen Preis bei Amazon prüfen.</span></div>`;
  return `<div class="price"><b>Preis offen</b><span>Aktuellen Preis bei Amazon prüfen.</span></div>`;
}

/** Produktkarte unter einem Wunsch: Titel, Richtwert-Preis und Amazon-Button. */
export function ProductBlock(pr){
  if(!pr)return '';
  const amazon=pr.host==='amazon.de'||pr.host.endsWith('.amazon.de');
  const label=amazon?(pr.direct?'Bei Amazon ansehen':'Bei Amazon suchen'):`Zu ${esc(pr.host)}`;
  return `<div class="prod">
   <div class="prodhd"><span class="eyebrow">${SOURCE[pr.source]}</span></div>
   <strong class="prodt">${esc(pr.t)}</strong>
   ${priceLine(pr)}
   <div class="row" style="gap:8px"><a class="btn amz sm" href="${pr.url}" target="_blank" rel="${REL}">${label} ${ic('arrow','sm')}</a><span class="ad">Anzeige</span></div>
  </div>`;
}

/** Ideen zu freien Wünschen. */
export function IdeasBlock(list){
  if(!list.length)return '';
  return `<div class="prod"><div class="prodhd"><span class="eyebrow">Ideen zu diesem Wunsch</span></div>
   ${list.map(i=>`<a class="idea" href="${searchUrl.amazon(i.t)}" target="_blank" rel="${REL}"><span>${esc(i.t)}</span><span class="muted">Preisrahmen ca. ${money(i.p)}</span></a>`).join('')}
   <span class="ad">Anzeige · Amazon-Suche</span></div>`;
}

export { AMAZON_TAG };

export function EmptyBlock(title,text){
  return `<div class="prod empty"><div class="prodhd"><span class="eyebrow">${esc(title)}</span></div><p class="muted" style="font-size:14px">${esc(text)}</p></div>`;
}
