import { S } from '../state.js';
import { esc, ic, money } from '../lib/util.js';
import { art } from '../lib/art.js';
import { productFor, ideasFor } from '../lib/products.js';
import { ProductBlock, IdeasBlock, EmptyBlock } from './product.js';
import { V, cat, crea, occL, PRIO } from '../data/content.js';

export function WishArt(w){return w.img?`<span class="imgbox art" style="aspect-ratio:16/10"><img src="${w.img}" alt=""></span>`:art(w.a||cat(w.c).a,w.tone??0)}
export function VisIcon(k){const x=V[k];return `<span class="pill" title="${x.l}" aria-label="${x.l}">${ic(x.i,'sm')}</span>`}
export function densSeg(){return `<div class="seg" role="group" aria-label="Darstellung"><button class="${!S.ui.big?'on':''}" data-act="dens" data-v="0">Kompakt</button><button class="${S.ui.big?'on':''}" data-act="dens" data-v="1">Groß</button></div>`}
export function Wuensche(){
  const m=S.me,u=S.ui;
  let list=m.wishes.filter(w=>u.wf==='alle'||(u.wf==='offen'?w.status==='offen':w.status==='selbst'));
  if(u.wc!=='alle')list=list.filter(w=>w.c===u.wc);
  list=[...list].sort((a,b)=>b.prio-a.prio);
  const used=[...new Set(m.wishes.map(w=>w.c))];
  const open=m.wishes.filter(w=>w.status==='offen').length;
  return `<div class="wrap">
   <div class="pagehead"><p class="eyebrow">Meine Wünsche</p><h1>${m.managed?`${open} Wünsche von ${esc(m.name)}.`:`${open} Dinge, die mir Freude machen würden.`}</h1></div>
   <div class="banner" style="margin-bottom:8px">${ic('lock')}<span>${m.managed?`Als Elternteil siehst du, was reserviert oder gekauft ist. ${esc(m.name)} sieht es nicht.`:'Überraschungsschutz: Du siehst nicht, ob jemand einen Wunsch reserviert oder gekauft hat.'}</span></div>
   <p class="muted" style="font-size:14px;margin-bottom:16px">Tipp: Ein Kategorie-Wunsch wie „Hochwertige Pfanne bis 100 €“ bekommt von Giftly einen konkreten Produktvorschlag für Schenkende. Auch ohne Link suchen wir bei jedem Wunsch ein passendes Amazon-Produkt.</p>
   <div class="row" style="justify-content:space-between;margin-bottom:16px">
     <div class="seg" role="group" aria-label="Status">${[['offen','Offen'],['selbst','Selbst gekauft'],['alle','Alle']].map(([k,l])=>`<button class="${u.wf===k?'on':''}" data-act="wf" data-v="${k}">${l}</button>`).join('')}</div>
     <div class="seg" role="group" aria-label="Kategorie"><button class="${u.wc==='alle'?'on':''}" data-act="wc" data-v="alle">Alle</button>${used.map(c=>`<button class="${u.wc===c?'on':''}" data-act="wc" data-v="${c}">${cat(c).n}</button>`).join('')}</div>
     ${densSeg()}
   </div>
   <div class="wgrid ${u.big?'big':''}">${list.map(w=>`
    <article class="wcard ${w.status==='selbst'?'done':''}">
      <div style="position:relative">${WishArt(w)}<div class="top"><span class="tag">${cat(w.c).n}</span><span class="dots" title="${PRIO[w.prio]}" aria-label="Priorität: ${PRIO[w.prio]}">${[1,2,3].map(n=>`<i class="${n<=w.prio?'on':''}"></i>`).join('')}</span></div></div>
      <div class="bd"><h3>${esc(w.t)}</h3>
       <p class="note">${esc(w.note||'')}</p>
       <div class="chips meta">${w.kind==='kategorie'?`<span class="chip gold">Kategorie${w.budget?' bis '+money(w.budget):''}</span>`:''}${w.kind==='erlebnis'?'<span class="chip">Erlebnis</span>':''}${w.kind==='frei'?'<span class="chip">Freier Wunsch</span>':''}${w.via?`<span class="chip gold">via ${esc(crea(w.via).handle)}</span>`:''}${w.occ.map(o=>`<span class="chip">${occL(o)}</span>`).join('')}</div>
       ${m.managed&&(w.res||w.bought)?`<div class="state ${w.bought?'me':'res'}">${ic('lock','sm')}${w.bought?'Gekauft':'Reserviert'}</div>`:''}
       <div class="prodslot">${slot(m,w)}</div>
       <div class="acts">${VisIcon(w.vis)}<span style="flex:1"></span>
        <button class="iconbtn" data-act="selbst" data-id="${w.id}" title="${w.status==='selbst'?'Wieder offen':'Selbst gekauft'}" aria-label="${w.status==='selbst'?'Wieder offen':'Als selbst gekauft markieren'}">${ic('check','sm')}</button>
        <button class="iconbtn" data-act="prio" data-id="${w.id}" title="Priorität ändern" aria-label="Priorität ändern">${ic('star','sm')}</button>
        <button class="iconbtn" data-act="delw" data-id="${w.id}" title="Löschen" aria-label="Wunsch löschen">${ic('trash','sm')}</button>
       </div></div>
    </article>`).join('')||`<p class="muted">Hier ist nichts. Füge einen Wunsch hinzu.</p>`}</div>
   <div class="fab"><button class="btn amz" data-act="azopen">Bei Amazon stöbern</button><button class="btn pri" data-act="modal" data-v="wish">${ic('plus','sm')}Wunsch hinzufügen</button></div>
  </div>`;
}

/* Immer genau ein Feld im Produktbereich, damit alle Karten gleich aufgebaut sind. */
export function slot(p,w){
  if(w.status==='selbst')return EmptyBlock('Schon vorhanden','Selbst gekauft, dafür braucht es kein Produkt.');
  if(w.kind==='frei')return IdeasBlock(ideasFor(p,w,2));
  if(w.kind==='erlebnis'&&!productFor(p,w))return EmptyBlock('Erlebnis','Dafür gibt es kein Amazon-Produkt.');
  return ProductBlock(productFor(p,w));
}
