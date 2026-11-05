import { S } from '../state.js';
import { esc, ic } from '../lib/util.js';
import { art, artIllu } from '../lib/art.js';
import { worldOffers } from '../lib/products.js';
import { CATS, cat } from '../data/content.js';
import { priceLine } from './product.js';

const REL='noopener noreferrer sponsored nofollow';

function Card(o,cid,have){
  const amazon=o.host==='amazon.de';
  const label=o.cta||(amazon?(o.direct?'Bei Amazon ansehen':'Bei Amazon suchen'):`Zu ${esc(o.host)}`);
  return `<article class="offer">
   ${o.brand?`<span class="otn brand" aria-hidden="true"><b>${esc(o.brand.slice(0,1))}</b><small>${esc(o.brand)}</small></span>`:`<span class="otn">${artIllu(o.a||'gift',o.tone||0)}</span>`}
   <div class="obody">
    ${o.exp?'<span class="eyebrow">Erlebnis</span>':''}
    <strong class="ot">${esc(o.t)}</strong>
    ${o.exp?'':priceLine(o)}
    ${(o.why||[]).slice(0,2).map(t=>`<span class="why">${esc(t)}</span>`).join('')}
   </div>
   <div class="oa">
    <a class="btn amz sm" href="${o.url}" target="_blank" rel="${REL}">${label} ${ic('arrow','sm')}</a>
    ${have?`<span class="chip ok">${ic('check','sm')}Auf deiner Liste</span>`:`<button class="btn sec sm" data-act="oadd" data-cid="${cid}" data-id="${esc(o.id)}">${ic('plus','sm')}Als Wunsch</button>`}
   </div>
  </article>`;
}

export function Entdecken(){
  const m=S.me;
  const ids=m.cats.length?m.cats:CATS.slice(0,4).map(c=>c.id);
  const mine=new Set(m.wishes.map(w=>w.t.toLowerCase()));
  const secs=ids.map(id=>{
    const c=cat(id),list=worldOffers(m,id,3);
    if(!list.length)return '';
    return `<section class="psec" style="margin-bottom:18px">
     <div class="row" style="gap:12px;margin-bottom:10px"><span class="wm-img" style="width:56px;height:56px">${art(c.a,c.t)}</span><div><p class="eyebrow">Deine Welt</p><h3 style="font-size:26px">${esc(c.n)}</h3></div></div>
     <div class="offers">${list.map(o=>Card(o,id,mine.has(o.t.toLowerCase()))).join('')}</div>
    </section>`;
  }).filter(Boolean);
  return `<div class="wrap">
   <div class="pagehead"><p class="eyebrow">Inspiration</p><h1>Ideen aus deinen Welten</h1>
    <p class="muted" style="max-width:620px">${m.cats.length?'Wir haben für jede deiner Welten ein paar Dinge herausgesucht, die zu deinen Interessen und Marken passen. Was dir gefällt, setzt du mit einem Tipp auf deine Wunschliste.':'Sobald du in deinem Profil ein paar Welten auswählst, schlagen wir dir hier passende Dinge vor. Bis dahin findest du ein paar Anregungen aus beliebten Bereichen.'}</p></div>
   ${secs.length?secs.join(''):'<p class="muted">Für deine Welten haben wir gerade noch keine Vorschläge. Das kommt bald.</p>'}
   <p class="disc" style="margin-top:18px"><b>Anzeige:</b> Links zu Amazon sind Partnerlinks. ${'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.'} Preise sind Richtwerte und können abweichen.</p>
  </div>`;
}
