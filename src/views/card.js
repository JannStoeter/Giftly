/*
 * Eine Wunschkarte für alle Ansichten. Fester Aufbau, jede Zeile hat überall dieselbe Höhe:
 *   Bild (mit Kategorie, Priorität, Status) / Titel (2 Zeilen) / Notiz (2 Zeilen) / Labels (1 Zeile)
 *   / Produktfeld (feste Höhe) / Aktionen (feste Höhe)
 */
import { esc, ic } from '../lib/util.js';
import { art } from '../lib/art.js';
import { productFor, ideasFor } from '../lib/products.js';
import { ProductBlock, IdeasBlock, EmptyBlock } from './product.js';
import { cat, PRIO } from '../data/content.js';

/** Bild zum Wunsch: eigenes Foto, sonst passend zum vorgeschlagenen Produkt, sonst zur Kategorie. */
export function WishArt(w,pr){
  if(w.img)return `<span class="imgbox art"><img src="${w.img}" alt=""></span>`;
  return art((pr&&pr.a)||w.a||cat(w.c).a,pr&&pr.tone!=null?pr.tone:(w.tone??0));
}

/** Immer genau ein Feld im Produktbereich. */
export function slot(p,w,opts={}){
  if(w.status==='selbst')return EmptyBlock('Schon vorhanden','Selbst gekauft, dafür braucht es kein Produkt.');
  if(w.kind==='frei')return IdeasBlock(ideasFor(p,w,2));
  const pr=productFor(p,w);
  if(!pr)return EmptyBlock(w.kind==='erlebnis'?'Erlebnis':'Kein Produkt','Dafür gibt es kein Amazon-Produkt.');
  return ProductBlock(pr,opts);
}

/**
 * w: Wunsch, p: Person, o.status: {text, tone:'res'|'me'} für das Bild, o.taken: Wunsch ist vergeben,
 * o.meta: HTML der Label-Zeile, o.actions: HTML der Aktionszeile, o.more: Wunsch-ID für "Weitere Vorschläge"
 */
export function WishCard(w,p,o={}){
  const pr=(w.kind==='frei'||w.status==='selbst')?null:productFor(p,w);
  const taken=!!o.taken;
  return `<article class="wcard ${taken?'taken':''} ${o.dim?'dim':''} ${w.status==='selbst'?'done':''}">
   <div class="wmedia">${WishArt(w,pr)}
    <div class="top"><span class="tag">${esc(cat(w.c).n)}</span><span class="dots" title="${PRIO[w.prio]}" aria-label="Priorität: ${PRIO[w.prio]}">${[1,2,3].map(n=>`<i class="${n<=w.prio?'on':''}"></i>`).join('')}</span></div>
    ${o.status?`<span class="wstate ${o.status.tone}">${ic('lock','sm')}${esc(o.status.text)}</span>`:''}
   </div>
   <div class="wbody">
    <h3 class="wt">${esc(w.t)}</h3>
    <p class="wn">${esc(w.note||'')}</p>
    <div class="wm">${o.meta||''}</div>
    <div class="prodslot">${taken?EmptyBlock('Schon vergeben','Dieser Wunsch ist reserviert oder gekauft.'):slot(p,w,{more:o.more})}</div>
    <div class="wa">${o.actions||''}</div>
   </div>
  </article>`;
}
