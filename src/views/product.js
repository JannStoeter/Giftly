import { esc, ic, money } from '../lib/util.js';
import { AMAZON_TAG, searchUrl } from '../lib/shops.js';

const REL = 'noopener noreferrer sponsored nofollow';
const SOURCE = {
  erzeugt: 'Produktvorschlag von Giftly',
  vorschlag: 'Unser Vorschlag im Budget',
  katalog: 'Passendes Produkt',
  link: 'Link der Wunschperson'
};

/** Produktkarte unter einem Wunsch: Titel, Richtwert-Preis und Amazon-Button. */
export function ProductBlock(pr){
  if(!pr)return '';
  const amazon=pr.host==='amazon.de'||pr.host.endsWith('.amazon.de');
  const label=amazon?(pr.direct?'Bei Amazon ansehen':'Bei Amazon suchen'):`Zu ${esc(pr.host)}`;
  return `<div class="prod">
   <div class="prodhd"><span class="eyebrow">${SOURCE[pr.source]}</span>${pr.price?`<span class="muted">Richtwert ca. ${money(pr.price)}</span>`:''}</div>
   <strong class="prodt">${esc(pr.t)}</strong>
   <div class="row" style="gap:8px"><a class="btn amz sm" href="${pr.url}" target="_blank" rel="${REL}">${label} ${ic('arrow','sm')}</a><span class="ad">Anzeige</span></div>
  </div>`;
}

/** Ideen zu freien Wünschen. */
export function IdeasBlock(list){
  if(!list.length)return '';
  return `<div class="prod"><div class="prodhd"><span class="eyebrow">Ideen zu diesem Wunsch</span></div>
   ${list.map(i=>`<a class="idea" href="${searchUrl.amazon(i.t)}" target="_blank" rel="${REL}"><span>${esc(i.t)}</span><span class="muted">ca. ${money(i.p)}</span></a>`).join('')}
   <span class="ad">Anzeige · Amazon-Suche</span></div>`;
}

export { AMAZON_TAG };
