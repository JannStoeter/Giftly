import { S } from '../state.js';
import { esc, ic } from '../lib/util.js';
import { art } from '../lib/art.js';
import { FB } from '../data/content.js';
import { GivenSection } from './given.js';

export function Historie(){
  const m=S.me;
  return `<div class="wrap">
   <div class="pagehead"><p class="eyebrow">Geschenk-Historie</p><h1>${m.managed?`Was ${esc(m.name)} bekommen hat und wie es ankam.`:'Was ich bekommen habe und wie es ankam.'}</h1>
    <p class="muted" style="max-width:600px">Hier sammelst du, was du schon geschenkt bekommen hast. Das hilft deinen Freunden, nichts doppelt zu schenken. Sie sehen, was es war, aber nie, wie ehrlich du es bewertet hast.</p></div>
   ${m.inbox.length?`<section><h3 aria-level="2" style="margin-bottom:12px">${m.managed?`Neu bei ${esc(m.name)} angekommen. Du antwortest für ${esc(m.name)}.`:'Neu bei dir angekommen'}</h3><div class="glist">${m.inbox.map(g=>{
     const open=S.ui.swap===g.id;
     return `<article class="panel" style="grid-column:1/-1"><div class="gitem" style="border:0;padding:0;background:none">${art(g.a,g.tone)}<div><h3 aria-level="2">${esc(g.what)}</h3><p class="muted" style="font-size:14px">Von ${esc(g.from)} · ${esc(g.when)}</p></div></div>
      ${open?SwapPanel(g):`<div class="fb">${Object.entries(FB).map(([k,l])=>`<button class="fbtn" data-act="fb" data-id="${g.id}" data-v="${k}">${ic(k==='swap'?'gift':k==='have'?'check':'heart','sm')}${l}</button>`).join('')}</div>`}
     </article>`}).join('')}</div></section>`:`<div class="banner green">${ic('check')}<span>Du bist auf dem neuesten Stand. Sobald du ein neues Geschenk einträgst, taucht es hier auf.</span></div>`}
   <section class="sect"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h3 aria-level="2">Bisher erhalten</h3><button class="btn sec sm" data-act="modal" data-v="gift">${ic('plus','sm')}Geschenk eintragen</button></div>
    <div class="glist">${m.history.map(g=>`
     <article class="gitem">${art(g.a,g.tone)}<div>
      <h3 aria-level="2">${esc(g.what)}</h3><p class="muted" style="font-size:14px">Von ${esc(g.from)} · ${esc(g.when)}</p>
      <div class="chips" style="margin-top:8px">
       <button class="chip ${g.liked==='ja'?'ok':g.liked==='nein'?'warn':'gold'}" data-act="liked" data-id="${g.id}" title="Bewertung ändern">${g.liked==='ja'?'Hat gefallen':g.liked==='nein'?'Nicht mein Fall':'Teils, teils'}</button>
       <button class="chip" data-act="have" data-id="${g.id}">${g.have?'Noch vorhanden':'Nicht mehr da'}</button>
       <button class="chip" data-act="again" data-id="${g.id}">${g.again?'Würde mich wieder freuen':'Lieber nicht nochmal'}</button>
      </div></div></article>`).join('')}</div>
    <div class="legend" style="margin-top:14px"><span>${ic('eye','sm')}Deine Bewertungen sieht nur du. Deine Freunde sehen lediglich, was es war, von wem es kam und wann.</span></div></section>
   ${m.managed?'':GivenSection()}
  </div>`;
}
export function SwapPanel(g){
  const alts=S.me.alts, sel=S.ui.swapSel;
  const picked=alts.filter(a=>sel.includes(a));
  const txt=picked.length?`${S.me.name} hat sich sehr über deine Aufmerksamkeit gefreut. Falls du magst: ${picked.length>1?picked.slice(0,-1).join(', ')+' oder '+picked.slice(-1):picked[0]} wäre ${S.me.name} noch eine Spur lieber. Ganz unverbindlich.`:'Wähle mindestens eine Alternative.';
  return `<div style="margin-top:12px"><p class="eyebrow">Was wäre dir lieber?</p>
   <div class="opts" style="margin:10px 0">${alts.map(a=>`<button class="opt ${sel.includes(a)?'on':''}" data-act="swapsel" data-v="${esc(a)}" aria-pressed="${sel.includes(a)}">${esc(a)}</button>`).join('')}</div>
   <p class="eyebrow">Das bekommt ${esc(g.from)}</p><div class="msg">${esc(txt)}</div>
   <p class="muted" style="font-size:13.5px">Die Nachricht ist freundlich und verrät nichts über deine Bewertung. Das ist nur eine Vorschau, es wird nichts verschickt.</p>
   <div class="row" style="margin-top:12px"><button class="btn pri sm" data-act="swapsend" data-id="${g.id}" ${picked.length?'':'disabled'}>Diskret senden</button><button class="btn ghost sm" data-act="swapcancel">Zurück</button></div></div>`;
}
