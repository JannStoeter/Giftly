import { S, initials } from '../state.js';
import { esc, ic, money, kwOf } from '../lib/util.js';
import { art } from '../lib/art.js';
import { CATS, OCC, ABOUT, cat, crea, cprod, occL, occTip, PRIO } from '../data/content.js';
import { ownedOf, excluded, recommend } from '../logic.js';
import { WishArt, densSeg, slot } from './wishes.js';
import { AMAZON_DISCLOSURE, searchUrl } from '../lib/shops.js';
import { EmptyBlock } from './product.js';

export function Schenken(){
  const u=S.ui,p=S.people[u.person];
  const wl=WishList(p);
  return `<div class="wrap">
   <div class="people" role="group" aria-label="Person wählen"><span class="muted" style="align-self:center;font-size:14px">Du schenkst:</span>${Object.values(S.people).map(x=>`<button class="person ${x.id===p.id?'on':''}" data-act="person" data-id="${x.id}"><span class="av t${x.tone}">${initials(x.name)}</span>${esc(x.name)}${x.managed?'<small class="muted" style="font-weight:500">Kind</small>':''}</button>`).join('')}</div>
   ${ProfileHead(p)}
   <div class="pgrid">
    <div class="pmain">
     ${wl.html}
     ${Curated(p,wl.open)}
     <section class="sect" id="ideen"><p class="eyebrow">Eigene Idee?</p><h3>Idee prüfen</h3><p class="muted" style="font-size:14.5px;margin:4px 0 12px">Wishtale gleicht sie mit Wünschen, Besitz, bisherigen Geschenken und No-Gos ab.</p>${Ideen(p)}</section>
     <p class="disc">Links zu Shops sind Partnerlinks (Anzeige). ${AMAZON_DISCLOSURE} Preise können abweichen, maßgeblich ist der Preis bei Amazon.</p>
    </div>
    <aside class="paside" aria-label="Mehr über ${esc(p.name)}">${Facts(p)}</aside>
   </div>
  </div>`;
}

/* Kopfbereich: Über mich, Interessen, Marken und No-Gos auf einen Blick, daneben der Anlass. */
export function ProfileHead(p){
  const u=S.ui,about=p.about||ABOUT[p.id]||'';
  const row=(l,items,cls='')=>items.length?`<div class="pfact"><span class="eyebrow">${l}</span><div class="chips">${items.map(x=>`<span class="chip ${cls}">${esc(x)}</span>`).join('')}</div></div>`:'';
  return `<section class="phead" aria-label="Profil von ${esc(p.name)}">
   <div>
    <div class="top"><span class="av t${p.tone}">${initials(p.name)}</span><div><p class="eyebrow">${p.managed?`Kind-Konto${p.age?', '+p.age+' Jahre':''}`:'Wishtale-Profil'}</p><h1>${esc(p.name)}</h1></div></div>
    ${about?`<p class="about"><span class="eyebrow" style="display:block;margin-bottom:4px">Über ${esc(p.name)}</span>${esc(about)}</p>`:''}
    <div class="pfacts">${row('Interessen',p.interests)}${row('Lieblingsmarken',p.brands)}${row('Bitte nicht',p.nogos,'warn')}</div>
   </div>
   <div class="occ pocc"><p class="eyebrow">Wofür suchst du?</p><div class="seg" role="group" aria-label="Anlass">${[['none','Ohne Anlass'],...OCC.map(o=>[o.id,o.l])].map(([k,l])=>`<button class="${u.occ===k?'on':''}" data-act="occ" data-v="${k}">${l}</button>`).join('')}</div><p class="muted tip">${occTip(u.occ)}</p>
    <button class="btn ghost sm" data-act="scroll" data-t="ideen" style="justify-self:start;padding-left:0">${ic('search','sm')}Eigene Idee prüfen</button></div>
  </section>`;
}

/* Seitenleiste: was Schenkende zusätzlich wissen sollten. */
export function Facts(p){
  const owned=ownedOf(p).filter(w=>w.vis!=='privat');
  const block=(t,inner)=>inner?`<section class="fact"><h3>${t}</h3>${inner}</section>`:'';
  const chips=(a,c='')=>a.length?`<div class="chips">${a.map(x=>`<span class="chip ${c}">${esc(x)}</span>`).join('')}</div>`:'';
  return block('Hat '+esc(p.name)+' schon',chips(owned.map(w=>w.t),'ok'))
   +block('Schon verschenkt',chips(p.gifts.map(g=>`${g.what} · ${g.from}`)))
   +block('Möchte ausprobieren',chips(p.tries,'gold'))
   +block('Welten',p.cats.length?`<div class="catrow">${p.cats.map(id=>{const c=cat(id);return `<div class="catmini">${art(c.a,c.t)}<div>${c.n}</div></div>`}).join('')}</div>`:'')
   +block('Wenn nichts passt',`<p class="muted" style="font-size:13.5px;margin-bottom:8px">${esc(p.name)} freut sich auch über:</p>`+chips(p.alts,'ok'));
}

/* Die Wunschliste: steht direkt unter dem Profilkopf. */
export function WishList(p){
  const oc=S.ui.occ;
  const rel=w=>(!w.occ.length||oc==='none')?1:(w.occ.includes(oc)?2:0);
  const open=p.wishes.filter(w=>w.status==='offen'&&w.vis!=='privat').sort((a,b)=>rel(b)-rel(a)||b.prio-a.prio);
  const html=`<section id="wunschliste" aria-label="Wunschliste von ${esc(p.name)}">
   <div class="row" style="justify-content:space-between;margin-bottom:8px"><div><p class="eyebrow">Wunschliste</p><h2 style="font-size:clamp(30px,4vw,44px)">${open.length} Wünsche von ${esc(p.name)}</h2></div>${densSeg()}</div>
   <p class="muted" style="font-size:14px;margin-bottom:14px">${ic('lock','sm')} ${p.managed?`${esc(p.parent||'Die Eltern')} pflegt die Wünsche und sieht Reservierungen. ${esc(p.name)} sieht nichts.`:`Reservierungen sind anonym. ${esc(p.name)} sieht nie, was reserviert oder gekauft wurde.`}${oc!=='none'?` Passende zu ${occL(oc)} stehen zuerst.`:''}</p>
   <div class="wgrid ${S.ui.big?'big':''}">${open.map(w=>{
    const r=rel(w),isCat=w.kind==='kategorie';
    let st='',btn='';
    if(w.bought)st=`<div class="state me">${ic('check','sm')}Von dir gekauft. Bleibt eine Überraschung.</div>`;
    else if(w.res==='me'){st=`<div class="state me">${ic('lock','sm')}Von dir reserviert</div>`;btn=`<button class="btn pri sm" data-act="bought" data-id="${w.id}">Gekauft</button><button class="btn ghost sm" data-act="release" data-id="${w.id}">Freigeben</button>`}
    else if(w.res==='other')st=`<div class="state res">${ic('lock','sm')}Bereits reserviert</div>`;
    else btn=isCat?`<button class="btn sec sm" data-act="suggest" data-id="${w.id}">${ic('spark','sm')}Weitere Vorschläge</button><button class="btn pri sm" data-act="reserve" data-id="${w.id}">Reservieren</button>`:`<button class="btn pri sm" data-act="reserve" data-id="${w.id}">Reservieren</button>`;
    return `<article class="wcard ${(w.res==='other'||r===0)?'dim':''}"><div style="position:relative">${WishArt(w)}<div class="top"><span class="tag">${cat(w.c).n}</span><span class="dots" aria-label="Priorität: ${PRIO[w.prio]}">${[1,2,3].map(n=>`<i class="${n<=w.prio?'on':''}"></i>`).join('')}</span></div></div>
     <div class="bd"><h3>${esc(w.t)}</h3><p class="note">${esc(w.note||'')}</p>
      <div class="chips meta">${w.via?`<span class="chip gold">Tipp von ${esc(crea(w.via).handle)}</span>`:''}${r===2&&w.occ.length?`<span class="chip gold">Für ${occL(oc)}</span>`:''}${r===0?`<span class="chip">Eher: ${w.occ.map(occL).join(', ')}</span>`:''}${isCat?`<span class="chip">Kategorie${w.budget?' bis '+money(w.budget):''}</span>`:''}</div>
      <div class="stateslot">${st}</div><div class="prodslot">${w.res==='other'||w.bought?EmptyBlock('Schon vergeben','Dieser Wunsch ist reserviert oder gekauft.'):slot(p,w)}</div><div class="acts">${btn}</div></div></article>`}).join('')}</div></section>`;
  return {html,open:open.length};
}

/* "Das würde auch gut passen": von uns kuratiert. Steht bewusst unter der Wunschliste. */
export function Curated(p,openWishes){
  const few=openWishes<4;
  return `<section class="sect curated" id="passt"><p class="eyebrow">Von Wishtale kuratiert</p><h2 style="font-size:clamp(28px,3.6vw,40px)">Das würde auch gut passen</h2>
   <p class="muted" style="font-size:14.5px;margin:6px 0 16px">${few?`${esc(p.name)} hat noch wenig auf der Liste, deshalb gleich mehr Ideen. `:'Falls nichts von der Wunschliste passt. '}Ausgewählt nach Interessen, Marken, Anlass und dem, was ${esc(p.name)} schon hat.</p>
   ${Recs(p)}</section>`;
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
   ${out}`;
}
export function RecCard(g){
  const {it,why}=g,saved=S.ui.saved[it.id];
  return `<article class="rec">${art(it.a,CATS.find(c=>c.id===it.c).t)}<div>
   <h3>${esc(it.t)}</h3>
   <p class="why">${why.slice(0,3).join(' ')}</p>
   <div class="row" style="gap:6px"><span class="chip" title="Schätzung, kein Live-Preis">Preisrahmen ca. ${money(it.p)}</span><span class="chip ${it.k==='erlebnis'?'gold':''}">${it.k==='erlebnis'?'Erlebnis':'Geschenk'}</span>${it.k==='ding'?`<a class="btn amz sm" href="${searchUrl.amazon(it.t)}" target="_blank" rel="noopener noreferrer sponsored nofollow">Bei Amazon suchen</a>`:''}<button class="chip ${saved?'on':''}" data-act="save" data-id="${it.id}" aria-pressed="${!!saved}">${saved?'Gemerkt':'Merken'}</button></div></div></article>`;
}
export function StyleBlock(p){
  const out=(p.style||[]).map(x=>{
    const c=crea(x.id);
    const items=c.items.map(cprod).filter(it=>it.p<=S.ui.budget&&!excluded(p,{kw:kwOf(it.t)})).slice(0,3);
    if(!items.length)return '';
    return `<section class="panel" style="margin-bottom:20px;display:grid;gap:10px"><div><p class="eyebrow" style="color:var(--gold)">Im Notfall</p><h3 style="font-size:26px;margin-top:4px">${esc(c.scope)} von ${esc(c.handle)}</h3>
     <p class="muted" style="font-size:14.5px;margin-top:4px">${esc(p.name)} verweist auf diesen Stil. Wenn dir nichts Konkretes einfällt, passt etwas aus der Liste.</p></div>
     <div class="recs grid">${items.map(it=>`<article class="rec">${art(it.a,it.tone)}<div><h3>${esc(it.t)}</h3><p class="quote" style="margin:4px 0 8px">„${esc(it.note)}“</p><div class="row" style="gap:6px"><span class="chip" title="Schätzung, kein Live-Preis">Preisrahmen ca. ${money(it.p)}</span><button class="chip on" data-act="cbuy" data-id="${it.id}" data-cid="${c.id}">Ansehen · Anzeige</button></div></div></article>`).join('')}</div>
     <p class="disc" style="margin:0">Anzeige: Kaufst du über diese Links, erhält ${esc(c.handle)} eine Provision. Für dich ändert sich der Preis nicht.</p></section>`;
  }).join('');
  return out;
}
export function Recs(p){
  const u=S.ui,{good,skip}=recommend(p);
  const list=good.filter(g=>(u.kind==='alle'||g.it.k===u.kind)&&g.it.p<=u.budget).slice(0,8);
  return `${StyleBlock(p)}<div class="row" style="justify-content:space-between;margin-bottom:14px">
    <div class="seg" role="group" aria-label="Art">${[['alle','Alle'],['ding','Geschenke'],['erlebnis','Erlebnisse']].map(([k,l])=>`<button class="${u.kind===k?'on':''}" data-act="kind" data-v="${k}">${l}</button>`).join('')}</div>
    <label class="range" for="bud">Preisrahmen bis <b style="color:var(--ink)" id="budv">${money(u.budget)}</b><input id="bud" type="range" min="20" max="100" step="5" value="${u.budget}"></label></div>
  <div class="recs grid">${list.map(RecCard).join('')||'<p class="muted">Nichts im Budget. Erhöhe es etwas.</p>'}</div>
  ${skip.length?`<div class="skipped"><p class="eyebrow">Bewusst ausgelassen</p>${skip.slice(0,5).map(s=>`<span>${ic('x','sm')} ${esc(s.it.t)}: ${esc(s.why)}</span>`).join('')}</div>`:''}`;
}

export function RecSection(p,openWishes){
  const few=openWishes<4;
  return `<section class="sect recsec"><details ${few?'open':''}><summary><span class="eyebrow">${few?'Noch wenig auf der Liste':'Zusätzlich'}</span><h3>Produkte, die wir auf Basis der Vorlieben empfehlen</h3></summary>
   <p class="muted" style="font-size:14.5px;margin:6px 0 16px">${few?`${esc(p.name)} hat wenig offene Wünsche. Diese Produkte passen zu Interessen, Marken und Anlass:`:`Nur falls nichts von der Wunschliste passt: Ideen aus ${esc(p.name)}s Profil.`}</p>
   ${Recs(p)}</details></section>`;
}
