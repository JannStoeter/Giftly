import { S, initials } from '../state.js';
import { esc, ic, money } from '../lib/util.js';
import { sceneImg, pimg } from '../lib/art.js';
import { CREATORS, LOOKS, LOOKSCOPE, crea, cprod } from '../data/content.js';

export function lookCard(l,keep){
  const c=crea(l.cid),n=l.objs.filter(o=>o.pid).length;
  return `<button class="lcard" data-act="look" data-id="${l.id}" ${keep?'data-keep="1"':''}><span class="scene">${sceneImg(l)}<span class="tagc">${n} Teile</span></span><span><span class="ltitle">${esc(l.t)}</span><br><span class="muted" style="font-size:13px">${esc(c.handle)}</span></span></button>`;
}
export function LookView(){
  const m=S.me,u=S.ui,l=LOOKS.find(x=>x.id===u.look),c=crea(l.cid);
  const pts=l.objs.filter(o=>o.pid),mine=m.wishes.map(w=>w.pid),sel=u.hot&&cprod(u.hot);
  const styleOn=(m.style||[]).some(x=>x.id===c.id);
  return `<div class="wrap">
   <button class="btn ghost sm" data-act="lookback" style="margin-bottom:12px">${ic('back','sm')}${u.creator?esc(c.handle):'Alle Looks'}</button>
   <div class="lookwrap">
    <div class="sceneBig">${sceneImg(l)}<div class="hotrow" role="group" aria-label="Teile im Look">${pts.map((o,i)=>`<button class="hot ${u.hot===o.pid?'on':''}" data-act="hot" data-id="${o.pid}" aria-pressed="${u.hot===o.pid}" aria-label="Teil ${i+1}: ${esc(cprod(o.pid).t)}">${i+1}</button>`).join('')}</div>
     ${sel?`<div class="hotcard">${pimg(sel)}<div><strong style="font-size:14.5px">${esc(sel.t)}</strong><br><span class="muted" style="font-size:13px">ca. ${money(sel.p)}</span></div>${mine.includes(sel.id)?`<span class="chip ok">${ic('check','sm')}Gemerkt</span>`:`<button class="btn pri sm" data-act="cadd" data-id="${sel.id}" data-cid="${c.id}">${ic('plus','sm')}Wunsch</button>`}</div>`:''}</div>
    <div>
     <div class="row" style="margin-bottom:12px"><button class="row" data-act="creator" data-id="${c.id}" data-go="1" style="gap:10px;text-align:left"><span class="av t${c.tone}" style="width:42px;height:42px">${initials(c.name)}</span><span><strong>${esc(c.name)}</strong><br><span class="muted" style="font-size:13px">${esc(c.handle)}</span></span></button></div>
     <h1 style="font-size:clamp(34px,5vw,54px)">${esc(l.t)}</h1><p class="muted" style="margin:8px 0 18px;max-width:480px">${esc(l.d)}</p>
     <p class="eyebrow" style="margin-bottom:8px">Shop the Look</p>
     ${pts.map((o,i)=>{const x=cprod(o.pid);return `<div class="altrow" style="grid-template-columns:28px 64px 1fr auto"><span class="numb">${i+1}</span>${pimg(x)}<div><strong>${esc(x.t)}</strong><br><span class="muted" style="font-size:13px">ca. ${money(x.p)}</span></div>${mine.includes(x.id)?`<span class="chip ok">${ic('check','sm')}Gemerkt</span>`:`<button class="btn sec sm" data-act="cadd" data-id="${x.id}" data-cid="${c.id}">${ic('plus','sm')}Wunsch</button>`}</div>`}).join('')}
     <div class="row" style="margin-top:12px"><button class="btn pri" data-act="lookall">Alle auf meine Wunschliste</button><button class="btn sec" data-act="style" data-id="${c.id}">${styleOn?`${ic('check','sm')}Stil-Vorbild`:'Als Stil-Vorbild'}</button></div>
     <p class="disc" style="margin-top:16px"><b>Transparenz:</b> Kauft jemand einen übernommenen Wunsch über Giftly, erhält ${esc(c.name.split(' ')[0])} eine Provision. Dir kostet das nichts. Beispieldaten: fiktive Creatorin, Fotos: Unsplash, Preise und Links simuliert.</p>
    </div></div></div>`;
}
export function Entdecken(){
  const m=S.me,u=S.ui;
  if(u.look)return LookView();
  const c=u.creator&&crea(u.creator);
  const styleOf=cid=>(m.style||[]).some(x=>x.id===cid);
  if(!c){
    const list=LOOKS.filter(l=>!u.cf||u.cf==='Alle'||crea(l.cid).scope===u.cf);
    return `<div class="wrap">
     <div class="pagehead"><p class="eyebrow">Inspiration</p><h1>Looks von Menschen mit gutem Geschmack.</h1>
      <p class="muted" style="max-width:620px">Tippe auf die Nummern im Bild, übernimm Teile auf deine Wunschliste oder verweise im Notfall auf einen Stil. Wenn darüber gekauft wird, verdienen die Creator mit.</p></div>
     <div class="people" style="margin-bottom:14px">${CREATORS.map(x=>`<button class="person" data-act="creator" data-id="${x.id}"><span class="av t${x.tone}">${initials(x.name)}</span>${esc(x.name)}</button>`).join('')}</div>
     <div class="seg" role="group" aria-label="Bereich" style="margin-bottom:16px">${LOOKSCOPE.map(k=>`<button class="${(u.cf||'Alle')===k?'on':''}" data-act="cf" data-v="${k}">${k}</button>`).join('')}</div>
     <div class="lgrid">${list.map(l=>lookCard(l)).join('')}</div>
     <p class="disc" style="margin-top:18px">Beispieldaten: Creator fiktiv, Fotos: Unsplash, Preise und Links simuliert.</p>
    </div>`;
  }
  const mine=m.wishes.map(w=>w.pid);
  return `<div class="wrap">
   <button class="btn ghost sm" data-act="cback" style="margin-bottom:10px">${ic('back','sm')}Alle Looks</button>
   <div class="crhead"><span class="av t${c.tone}" style="width:88px;height:88px;font-size:48px">${initials(c.name)}</span><div><p class="eyebrow">${esc(c.niche)}</p><h1 style="font-size:clamp(34px,6vw,56px)">${esc(c.name)}</h1><p class="muted">${esc(c.handle)}</p></div></div>
   <p style="max-width:620px;margin-bottom:16px">${esc(c.bio)}</p>
   <div class="panel" style="display:grid;gap:10px;margin-bottom:20px">
    <h3 style="font-size:24px">Im Notfall: ${esc(c.scope)} von ${esc(c.name.split(' ')[0])}</h3>
    <p class="muted" style="font-size:15px">Legst du ${esc(c.name.split(' ')[0])} als Stil-Vorbild fest, sehen Schenkende in deinem Profil: „Wenn nichts Konkretes passt, nimm etwas aus dieser Liste.“</p>
    <div><button class="btn ${styleOf(c.id)?'sec':'pri'} sm" data-act="style" data-id="${c.id}">${styleOf(c.id)?`${ic('check','sm')}Stil-Vorbild entfernen`:'Als Stil-Vorbild festlegen'}</button></div>
   </div>
   <h3 style="margin-bottom:12px">Looks</h3>
   <div class="lgrid">${LOOKS.filter(l=>l.cid===c.id).map(l=>lookCard(l,true)).join('')}</div>
   <h3 style="margin:26px 0 12px">Einzelne Empfehlungen</h3>
   <div class="wgrid">${c.items.map(cprod).map(x=>`
    <article class="wcard">${pimg(x)}<div class="bd"><h3>${esc(x.t)}</h3><p class="quote">„${esc(x.note)}“</p><div class="chips"><span class="chip">ca. ${money(x.p)}</span></div>
     <div class="acts">${mine.includes(x.id)?`<span class="state me">${ic('check','sm')}Auf deiner Wunschliste</span>`:`<button class="btn pri sm" data-act="cadd" data-id="${x.id}" data-cid="${c.id}">${ic('plus','sm')}Auf meine Wunschliste</button>`}</div></div></article>`).join('')}</div>
   <p class="disc" style="margin-top:18px"><b>Transparenz:</b> Kauft jemand einen übernommenen Wunsch über Giftly, erhält ${esc(c.name.split(' ')[0])} eine Provision. Dir kostet das nichts. Beispieldaten: fiktive Creatorin, Preise und Links simuliert.</p>
  </div>`;
}
