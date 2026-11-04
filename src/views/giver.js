import { S, initials } from '../state.js';
import { esc, ic, money, kwOf } from '../lib/util.js';
import { art } from '../lib/art.js';
import { CATS, OCC, cat, crea, cprod, occL, occTip, PRIO } from '../data/content.js';
import { ownedOf, excluded, recommend } from '../logic.js';
import { WishArt, densSeg } from './wishes.js';
import { AMAZON_DISCLOSURE, normUrl, searchUrl, linkChip } from '../lib/shops.js';

export function Schenken(){
  const u=S.ui,p=S.people[u.person];
  const tabs=[['wuensche','Wünsche'],['ideen','Ideen-Check'],['empfehlungen','Empfehlungen'],['profil','Profil']];
  let body='';
  if(u.tab==='wuensche')body=GWishes(p);
  if(u.tab==='ideen')body=Ideen(p);
  if(u.tab==='empfehlungen')body=Recs(p);
  if(u.tab==='profil')body=GProfile(p);
  return `<div class="wrap">
   <div class="pagehead"><p class="eyebrow">Geschenk finden</p><h1>Für ${esc(p.name)} etwas finden, das wirklich passt.</h1></div>
   <div class="people" role="group" aria-label="Person wählen">${Object.values(S.people).map(x=>`<button class="person ${x.id===p.id?'on':''}" data-act="person" data-id="${x.id}"><span class="av t${x.tone}">${initials(x.name)}</span>${esc(x.name)}${x.managed?'<small class="muted" style="font-weight:500">Kind</small>':''}</button>`).join('')}</div>
   <div class="chips" style="margin:14px 0 4px">${p.managed?`<span class="chip gold">Kind-Konto${p.age?', '+p.age+' Jahre':''}</span>`:''}${p.interests.map(i=>`<span class="chip">${esc(i)}</span>`).join('')}${p.nogos.map(i=>`<span class="chip warn">Nicht: ${esc(i)}</span>`).join('')}</div>
   <div class="occ"><p class="eyebrow">Anlass</p><div class="seg" role="group" aria-label="Anlass">${[['none','Ohne Anlass'],...OCC.map(o=>[o.id,o.l])].map(([k,l])=>`<button class="${u.occ===k?'on':''}" data-act="occ" data-v="${k}">${l}</button>`).join('')}</div><p class="muted tip">${occTip(u.occ)}</p></div>
   <div class="seg" style="margin:14px 0 20px" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${u.tab===k}" class="${u.tab===k?'on':''}" data-act="tab" data-v="${k}">${l}</button>`).join('')}</div>
   ${body}
  </div>`;
}
export function GWishes(p){
  const oc=S.ui.occ;
  const rel=w=>(!w.occ.length||oc==='none')?1:(w.occ.includes(oc)?2:0);
  const open=p.wishes.filter(w=>w.status==='offen'&&w.vis!=='privat').sort((a,b)=>rel(b)-rel(a)||b.prio-a.prio);
  const owned=ownedOf(p).filter(w=>w.vis!=='privat');
  return `<div class="banner" style="margin-bottom:16px">${ic('lock')}<span>${p.managed?`Kind-Konto: ${esc(p.parent||'Die Eltern')} pflegt die Wünsche und sieht Reservierungen, damit nichts doppelt kommt. ${esc(p.name)} sieht nichts.`:`Reservierungen sind anonym. ${esc(p.name)} sieht nie, was reserviert oder gekauft wurde.`}</span></div>
  <div class="row" style="justify-content:space-between;margin-bottom:14px"><span class="muted" style="font-size:14px">${open.length} offene Wünsche${oc!=='none'?`, passende zu ${occL(oc)} zuerst`:''}</span>${densSeg()}</div>
  <div class="wgrid ${S.ui.big?'big':''}">${open.map(w=>{
    const r=rel(w),isCat=w.kind==='kategorie';
    let st='',btn='';
    if(w.bought)st=`<div class="state me">${ic('check','sm')}Von dir gekauft. Bleibt eine Überraschung.</div>`;
    else if(w.res==='me'){st=`<div class="state me">${ic('lock','sm')}Von dir reserviert</div>`;btn=`<button class="btn pri sm" data-act="bought" data-id="${w.id}">Gekauft</button><button class="btn ghost sm" data-act="release" data-id="${w.id}">Freigeben</button>`}
    else if(w.res==='other')st=`<div class="state res">${ic('lock','sm')}Bereits reserviert</div>`;
    else btn=isCat?`<button class="btn gold sm" data-act="suggest" data-id="${w.id}">${ic('spark','sm')}Produkt vorschlagen</button>`:`<button class="btn pri sm" data-act="reserve" data-id="${w.id}">Reservieren</button>`;
    return `<article class="wcard ${(w.res==='other'||r===0)?'dim':''}"><div style="position:relative">${WishArt(w)}<div class="top"><span class="tag">${cat(w.c).n}</span><span class="dots" aria-label="Priorität: ${PRIO[w.prio]}">${[1,2,3].map(n=>`<i class="${n<=w.prio?'on':''}"></i>`).join('')}</span></div></div>
     <div class="bd"><h3>${esc(w.t)}</h3>${w.note?`<p class="note">${esc(w.note)}</p>`:''}
      <div class="chips">${w.via?`<span class="chip gold">Tipp von ${esc(crea(w.via).handle)}</span>`:''}${r===2&&w.occ.length?`<span class="chip gold">Für ${occL(oc)}</span>`:''}${r===0?`<span class="chip">Eher: ${w.occ.map(occL).join(', ')}</span>`:''}${isCat?`<span class="chip">Kategorie${w.budget?' bis '+money(w.budget):''}</span>`:''}</div>
      ${st}<div class="acts">${btn}</div>${wishLink(w)}</div></article>`}).join('')}</div>
  ${owned.length?`<section class="sect"><h3>Hat ${esc(p.name)} schon</h3><div class="chips">${owned.map(w=>`<span class="chip">${ic('check','sm')}${esc(w.t)}</span>`).join('')}</div></section>`:''}
  <p class="disc">Links zu Shops können Partnerlinks sein. ${AMAZON_DISCLOSURE}</p>
  <section class="sect"><h3>Schon verschenkt</h3><div class="chips">${p.gifts.map(g=>`<span class="chip">${esc(g.what)} · ${esc(g.from)}</span>`).join('')}</div></section>`;
}
export function Ideen(p){
  const u=S.ui,r=u.ideaRes;
  let out='';
  if(r){
    const bad=r.res.length>0;
    const cards=r.res.map(x=>{
      if(x.type==='wish')return `<div class="res-card bad"><strong>Steht schon auf der Liste</strong><p>${esc(x.w.t)}${x.w.res==='other'?' ist bereits von jemandem reserviert.':' ist noch frei.'}</p>${x.w.res?'':`<div class="row">${x.w.kind==='kategorie'?`<button class="btn gold sm" data-act="suggest" data-id="${x.w.id}">Produkt vorschlagen</button>`:''}<button class="btn pri sm" data-act="reserve" data-id="${x.w.id}" data-stay="1">Jetzt reservieren</button></div>`}</div>`;
      if(x.type==='have')return `<div class="res-card bad"><strong>Gibt es schon</strong><p>${esc(p.name)} hat sich bereits selbst gekauft: ${esc(x.w.t)}.</p></div>`;
      if(x.type==='given')return `<div class="res-card bad"><strong>Wurde schon geschenkt</strong><p>${esc(x.g.what)} von ${esc(x.g.from)} (${esc(x.g.when)}).${x.g.liked==='nein'?' Es kam nicht gut an.':''}</p></div>`;
      return `<div class="res-card bad"><strong>Besser nicht</strong><p>${esc(p.name)} möchte keine ${esc(x.n)} geschenkt bekommen.</p></div>`;
    }).join('');
    let verdict='';
    if(!bad){
      const f=r.hitTags.length||r.fits.length;
      verdict=`<div class="res-card ${f?'good':'info'}"><strong>${f?'Gute Idee':'Kein Konflikt gefunden'}</strong><p>${f?`Passt zu ${esc(p.name)}s Interessen${r.fits.length?`: ${r.fits.map(esc).join(', ')}`:''}. Nichts davon ist schon vorhanden oder gewünscht.`:`Nichts spricht dagegen, aber wir sehen keinen direkten Bezug zu ${esc(p.name)}s Interessen. Schau dir die Ideen unten an.`}</p></div>`;
    }
    const rc=recommend(p).good.filter(g=>!r.ctags.length||g.it.tags.some(t=>r.ctags.includes(t))||g.it.comp).slice(0,3);
    const sug=(rc.length?rc:recommend(p).good.slice(0,3));
    out=`${cards}${verdict}<section class="sect"><h3>${bad?'Stattdessen passt vielleicht':'Dazu passen auch'}</h3><div class="recs grid">${sug.map(RecCard).join('')}</div></section>`;
  }
  return `<form data-form="idea" class="ibar"><label for="idea" style="position:absolute;left:-9999px">Deine Geschenkidee</label><input id="idea" name="idea" class="inp" placeholder="Deine Idee, z. B. Kaffeemühle, Pfanne, Duftkerze" value="${esc(u.idea)}" autocomplete="off"><button class="btn pri" type="submit">${ic('search','sm')}Prüfen</button></form>
   <div class="chips" style="margin-bottom:6px"><span class="muted" style="font-size:13px;align-self:center">Probier:</span>${['Kaffeemühle','Pfanne','Duftkerze','Vase'].map(x=>`<button class="chip" data-act="try" data-v="${x}">${x}</button>`).join('')}</div>
   ${out||`<p class="muted" style="margin-top:16px;max-width:520px">Giftly gleicht deine Idee mit Wünschen, Besitz, bisherigen Geschenken und No-Gos von ${esc(p.name)} ab.</p>`}`;
}
export function RecCard(g){
  const {it,why}=g,saved=S.ui.saved[it.id];
  return `<article class="rec">${art(it.a,CATS.find(c=>c.id===it.c).t)}<div>
   <h3>${esc(it.t)}</h3>
   <p class="why">${why.slice(0,3).join(' ')}</p>
   <div class="row" style="gap:6px"><span class="chip">${money(it.p)}</span><span class="chip ${it.k==='erlebnis'?'gold':''}">${it.k==='erlebnis'?'Erlebnis':'Geschenk'}</span>${it.k==='ding'?linkChip(searchUrl.idealo(it.t),'Preise'):''}<button class="chip ${saved?'on':''}" data-act="save" data-id="${it.id}" aria-pressed="${!!saved}">${saved?'Gemerkt':'Merken'}</button></div></div></article>`;
}
export function StyleBlock(p){
  const out=(p.style||[]).map(x=>{
    const c=crea(x.id);
    const items=c.items.map(cprod).filter(it=>it.p<=S.ui.budget&&!excluded(p,{kw:kwOf(it.t)})).slice(0,3);
    if(!items.length)return '';
    return `<section class="panel" style="margin-bottom:20px;display:grid;gap:10px"><div><p class="eyebrow" style="color:var(--gold)">Im Notfall</p><h3 style="font-size:26px;margin-top:4px">${esc(c.scope)} von ${esc(c.handle)}</h3>
     <p class="muted" style="font-size:14.5px;margin-top:4px">${esc(p.name)} verweist auf diesen Stil. Wenn dir nichts Konkretes einfällt, passt etwas aus der Liste.</p></div>
     <div class="recs grid">${items.map(it=>`<article class="rec">${art(it.a,it.tone)}<div><h3>${esc(it.t)}</h3><p class="quote" style="margin:4px 0 8px">„${esc(it.note)}“</p><div class="row" style="gap:6px"><span class="chip">${money(it.p)}</span><button class="chip on" data-act="cbuy" data-id="${it.id}" data-cid="${c.id}">Ansehen · Anzeige</button></div></div></article>`).join('')}</div>
     <p class="disc" style="margin:0">Anzeige: Kaufst du über diese Links, erhält ${esc(c.handle)} eine Provision. Für dich ändert sich der Preis nicht.</p></section>`;
  }).join('');
  return out;
}
export function Recs(p){
  const u=S.ui,{good,skip}=recommend(p);
  const list=good.filter(g=>(u.kind==='alle'||g.it.k===u.kind)&&g.it.p<=u.budget).slice(0,8);
  return `${StyleBlock(p)}<div class="row" style="justify-content:space-between;margin-bottom:14px">
    <div class="seg" role="group" aria-label="Art">${[['alle','Alle'],['ding','Geschenke'],['erlebnis','Erlebnisse']].map(([k,l])=>`<button class="${u.kind===k?'on':''}" data-act="kind" data-v="${k}">${l}</button>`).join('')}</div>
    <label class="range" for="bud">Bis <b style="color:var(--ink)" id="budv">${money(u.budget)}</b><input id="bud" type="range" min="20" max="100" step="5" value="${u.budget}"></label></div>
  <div class="recs grid">${list.map(RecCard).join('')||'<p class="muted">Nichts im Budget. Erhöhe es etwas.</p>'}</div>
  ${skip.length?`<div class="skipped"><p class="eyebrow">Bewusst ausgelassen</p>${skip.slice(0,5).map(s=>`<span>${ic('x','sm')} ${esc(s.it.t)}: ${esc(s.why)}</span>`).join('')}</div>`:''}
  <section class="sect"><h3>Keine Idee? Das mag ${esc(p.name)} als Alternative</h3><div class="chips">${p.alts.map(a=>`<span class="chip ok">${esc(a)}</span>`).join('')}</div></section>`;
}
export function GProfile(p){
  const row=(t,a,c='')=>`<section class="psec"><h3>${t}</h3><div class="chips">${a.map(x=>`<span class="chip ${c}">${esc(x)}</span>`).join('')}</div></section>`;
  return `${row('Interessen',p.interests)}<section class="psec"><h3>Welten</h3><div class="catrow">${p.cats.map(id=>{const c=cat(id);return `<div class="catmini">${art(c.a,c.t)}<div>${c.n}</div></div>`}).join('')}</div></section>${row('Lieblingsmarken',p.brands)}${row('Möchte ausprobieren',p.tries,'gold')}${row('Bitte nicht',p.nogos,'warn')}${row('Alternativen',p.alts,'ok')}`;
}

/* Link zum Wunsch: eigener Link der Person, sonst Preisvergleich zur Wunschbeschreibung. */
export function wishLink(w){
  if(w.kind==='erlebnis'||w.kind==='frei')return '';
  const own=normUrl(w.link);
  return `<div class="chips">${own?linkChip(own,'Zum Wunsch-Link'):linkChip(searchUrl.idealo(w.t),'Preise vergleichen')}</div>`;
}
