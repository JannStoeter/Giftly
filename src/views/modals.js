import { S, initials, guestPerson } from '../state.js';
import { esc, ic, money } from '../lib/util.js';
import { art } from '../lib/art.js';
import { CATS, OCC, PRIO, PRICE_DATE } from '../data/content.js';
import { picks } from '../logic.js';
import { AMAZON_DISCLOSURE, shopChips } from '../lib/shops.js';

export function AcctModal(){
  const rows=Object.entries(S.accounts).map(([id,a])=>`<div class="altrow" style="grid-template-columns:44px 1fr auto"><span class="av t${a.tone}" style="width:44px;height:44px">${initials(a.name)}</span><div><strong>${esc(a.name)}${a.age?`, ${a.age}`:''}</strong><br><span class="muted" style="font-size:13.5px">${a.managed?`Kind-Konto, verwaltet von ${esc(S.accounts.me.name)}`:'Hauptkonto'}</span></div>${S.ui.acct===id?'<span class="chip ok">Aktiv</span>':`<button class="btn sec sm" data-act="acct" data-id="${id}">Wechseln</button>`}</div>`).join('');
  return `<div class="scrim" data-act="closebg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt">
   <h2 id="mt">Konten</h2>${rows}
   <h3 style="font-size:24px;margin:20px 0 6px">Kind-Konto anlegen</h3>
   <p class="muted" style="font-size:14.5px;margin-bottom:12px">Für Kinder pflegst du Profil und Wünsche. Du siehst, was reserviert ist. Das Kind sieht es nicht.</p>
   <form data-form="child">
    <div class="fld"><label for="cn">Vorname</label><input id="cn" name="name" class="inp" required autocomplete="off"></div>
    <div class="fld"><label for="ca">Alter</label><input id="ca" name="age" type="number" min="0" max="17" inputmode="numeric" class="inp"></div>
    <p class="disc" style="margin:0 0 12px">Du legst das Konto als sorgeberechtigte Person an. Gespeichert werden nur Vorname und Alter.</p>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="close">Schließen</button><button class="btn pri" type="submit">Anlegen und einrichten</button></div>
   </form>
   <p class="disc" style="margin-top:18px">Alle Daten liegen nur in deinem Browser. <button class="chip" data-act="reset">Demodaten zurücksetzen</button></p></div></div>`;
}
export function PickModal(){
  const p=guestPerson(),w=p.wishes.find(x=>x.id===S.ui.pickId);if(!w)return '';
  const {list,over}=picks(p,w),top=list[0],rest=list.slice(1,3);
  return `<div class="scrim" data-act="closebg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt">
   <p class="eyebrow">Produktvorschlag für ${esc(p.name)}</p><h2 id="mt" style="font-size:32px;margin-top:6px">${esc(w.t)}</h2>
   ${top?`<article class="pickmain">${art(top.x.a,top.x.tone)}<div class="pm"><span class="chip gold">Unsere Empfehlung · Anzeige</span><h3>${esc(top.x.t)}</h3>
    <ul class="pros">${[...top.why,...top.x.pros].map(t=>`<li>${ic('check','sm')}<span>${t.includes('<')?t:esc(t)}</span></li>`).join('')}</ul>
    <button class="btn pri" data-act="buy" data-id="${top.x.id}" data-wid="${w.id}">Reservieren und bei Amazon ansehen ${ic('arrow','sm')}</button>
    <div class="chips" style="align-items:center"><span class="muted" style="font-size:13px">Preise vergleichen:</span>${shopChips(top.x.search)}</div></div></article>`
   :`<p class="muted">Im Budget gibt es keinen passenden Vorschlag. Schau in die Empfehlungen.</p>`}
   ${rest.length?`<h3 style="font-size:22px;margin:18px 0 8px">Alternativen</h3>${rest.map(r=>`<div class="altrow">${art(r.x.a,r.x.tone)}<div><strong>${esc(r.x.t)}</strong><br><span class="muted" style="font-size:13.5px">${esc(r.x.brand)} · ${r.x.price?money(r.x.price)+' (Stand '+PRICE_DATE+')':'Preis bei Amazon prüfen'}</span></div><button class="btn sec sm" data-act="buy" data-id="${r.x.id}" data-wid="${w.id}">Wählen</button></div>`).join('')}`:''}
   ${over?`<p class="muted" style="font-size:13px;margin-top:10px">${over} Produkt${over>1?'e':''} über dem Budget ausgeblendet.</p>`:''}
   <p class="disc"><b>Anzeige, Partnerlinks:</b> Kaufst du über diese Links, erhält Wishtale eventuell eine Provision. Für dich ändert sich der Preis nicht.</p>
   <p class="disc">Preise stammen aus Beobachtungen bei Amazon und können abweichen; wo kein Preis steht, ist er uns nicht bekannt. Die Links führen zu den Suchergebnissen der Shops, dort siehst du den aktuellen Preis. ${AMAZON_DISCLOSURE}</p>
   <div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn ghost" data-act="close">Schließen</button></div></div></div>`;
}
export function AmazonModal(){
  const z=S.ui.az,r=z.res,ok=r&&!r.error;
  const ideas=[...new Set([...S.me.interests,...S.me.wishes.filter(w=>w.status==='offen').map(w=>w.t.split(',')[0])])].slice(0,6);
  return `<div class="scrim" data-act="closebg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt">
   <h2 id="mt">Bei Amazon stöbern</h2>
   <p class="muted" style="font-size:14.5px;margin-bottom:14px">Suche bei Amazon, öffne ein Produkt und komm hierher zurück. Den Link fügst du ein, den Rest übernimmt Wishtale.</p>
   <section class="azstep"><p class="eyebrow">1 · Suchen</p>
    <form data-form="azsearch" class="addrow"><label for="azq" style="position:absolute;left:-9999px">Suchbegriff</label><input id="azq" name="q" data-az="q" class="inp" value="${esc(z.q)}" placeholder="z. B. Kaffeemühle, Wanderstöcke" autocomplete="off"><button class="btn amz" type="submit">Bei Amazon suchen ${ic('arrow','sm')}</button></form>
    <div class="chips" style="margin-top:8px">${ideas.map(i=>`<button type="button" class="chip" data-act="azq" data-v="${esc(i)}">${esc(i)}</button>`).join('')}</div>
    <p class="disc" style="margin:8px 0 0">Amazon öffnet in einem neuen Tab. ${AMAZON_DISCLOSURE}</p></section>
   <section class="azstep"><p class="eyebrow">2 · Link einfügen</p>
    <form data-form="azlink" class="addrow"><label for="azurl" style="position:absolute;left:-9999px">Amazon-Link</label><input id="azurl" name="text" data-az="text" class="inp" value="${esc(z.text)}" placeholder="Link der Produktseite einfügen" autocomplete="off"><button class="btn sec" type="button" data-act="azclip">Aus Zwischenablage</button></form>
    <p class="muted" style="font-size:13px;margin-top:6px">In der Amazon-App: Produkt öffnen, Teilen, Link kopieren. Im Browser: Adresszeile kopieren.</p>
    ${r&&r.error?`<div class="banner" style="margin-top:10px">${ic('x')}<span>${esc(r.error)}</span></div>`:''}</section>
   ${ok?`<section class="azstep azprev"><p class="eyebrow">3 · Prüfen und speichern</p>
    <form data-form="azadd">
     <div class="fld"><label for="azt">Name des Wunsches</label><input id="azt" name="t" data-az="title" class="inp" required value="${esc(z.title)}" placeholder="Produktname"></div>
     <div class="fld"><label for="azp">Preis in Euro (optional, wie bei Amazon angezeigt)</label><input id="azp" name="price" data-az="price" class="inp" inputmode="decimal" value="${esc(z.price)}" placeholder="z. B. 69,90"></div>
     <div class="fld"><label for="azc">Kategorie</label><select id="azc" name="c" data-az="c" class="sel">${CATS.map(c=>`<option value="${c.id}" ${z.c===c.id?'selected':''}>${c.n}</option>`).join('')}</select></div>
     <p class="muted" style="font-size:13px;margin-bottom:10px">Amazon-Produkt ${esc(r.asin)} · der Link enthält unsere Partner-ID.</p>
     <div class="row"><button class="btn pri" type="submit">${ic('plus','sm')}Auf meine Wunschliste</button></div>
    </form></section>`:''}
   <div class="row" style="justify-content:flex-end;margin-top:12px"><button type="button" class="btn ghost" data-act="close">Schließen</button></div>
  </div></div>`;
}
export function Modal(){
  const m=S.ui.modal;if(!m)return '';
  if(m==='amazon')return AmazonModal();
  if(m==='pick')return PickModal();
  if(m==='accounts')return AcctModal();
  if(m==='wish')return `<div class="scrim" data-act="closebg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt">
   <h2 id="mt">Neuer Wunsch</h2>
   <form data-form="wish">
    <div class="fld"><label for="wt">Was wünschst du dir?</label><input id="wt" name="t" class="inp" required placeholder="Produkt, Erlebnis oder eine Idee" autocomplete="off"></div>
    <div class="fld"><span class="lb">Art</span><div class="radios">${[['produkt','Produkt'],['kategorie','Nur Kategorie'],['erlebnis','Erlebnis'],['frei','Freier Wunsch']].map(([v,l],i)=>`<label><input type="radio" name="kind" value="${v}" ${i?'':'checked'}><span>${l}</span></label>`).join('')}</div></div>
    <div class="fld"><label for="wb">Budget bis in Euro (optional, für Kategorie-Wünsche)</label><input id="wb" name="budget" type="number" min="1" inputmode="numeric" class="inp" placeholder="z. B. 100"></div>
    <div class="fld"><span class="lb">Besonders passend zu (optional)</span><div class="radios">${OCC.map(o=>`<label><input type="checkbox" name="occ" value="${o.id}"><span>${o.l}</span></label>`).join('')}</div></div>
    <div class="fld"><label for="wp">Preis in Euro (optional)</label><input id="wp" name="price" class="inp" inputmode="decimal" placeholder="z. B. 69,90"></div>
    <div class="fld"><span class="lb">Produkt bei Amazon suchen?</span><div><button type="button" class="btn amz sm" data-act="azopen">Bei Amazon stöbern ${ic('arrow','sm')}</button></div></div>
    <div class="fld"><label for="wl">Link (optional)</label><input id="wl" name="link" class="inp" placeholder="z. B. shop.de/produkt" autocomplete="off"></div>
    <div class="fld"><label for="wn">Notiz</label><textarea id="wn" name="note" class="ta" placeholder="Farbe, Größe, Stimmung"></textarea></div>
    <div class="fld"><label for="wc2">Kategorie</label><select id="wc2" name="c" class="sel">${CATS.map(c=>`<option value="${c.id}">${c.n}</option>`).join('')}</select></div>
    <div class="fld"><span class="lb">Wie wichtig ist es dir?</span><div class="radios">${[1,2,3].map(n=>`<label><input type="radio" name="prio" value="${n}" ${n===2?'checked':''}><span>${PRIO[n]}</span></label>`).join('')}</div></div>
    <div class="fld"><label for="wi">Bild (optional)</label><input id="wi" name="img" type="file" accept="image/*" class="inp"></div>
    <div class="fld"><label for="wv">Wer sieht das?</label><select id="wv" name="vis" class="sel"><option value="alle">Alle mit Profilzugriff</option><option value="giver">Nur Schenkende</option><option value="privat">Privat, nur ich</option></select></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="close">Abbrechen</button><button class="btn pri" type="submit">Wunsch speichern</button></div>
   </form></div></div>`;
  return `<div class="scrim" data-act="closebg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="mt">
   <h2 id="mt">Geschenk eintragen</h2>
   <form data-form="gift">
    <div class="fld"><label for="gw">Was war es?</label><input id="gw" name="what" class="inp" required autocomplete="off"></div>
    <div class="fld"><label for="gf">Von wem?</label><input id="gf" name="from" class="inp" required autocomplete="off"></div>
    <div class="fld"><label for="gd">Wann?</label><input id="gd" name="when" type="month" class="inp" value="2026-11"></div>
    <div class="fld"><span class="lb">Hat es gefallen?</span><div class="radios">${[['ja','Ja'],['teils','Teils, teils'],['nein','Nein']].map(([v,l],i)=>`<label><input type="radio" name="liked" value="${v}" ${i?'':'checked'}><span>${l}</span></label>`).join('')}</div></div>
    <div class="fld"><span class="lb">Ist es noch vorhanden?</span><div class="radios"><label><input type="radio" name="have" value="1" checked><span>Ja</span></label><label><input type="radio" name="have" value="0"><span>Nein</span></label></div></div>
    <div class="fld"><span class="lb">Würdest du dich erneut darüber freuen?</span><div class="radios"><label><input type="radio" name="again" value="1" checked><span>Ja</span></label><label><input type="radio" name="again" value="0"><span>Eher nicht</span></label></div></div>
    <div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-act="close">Abbrechen</button><button class="btn pri" type="submit">Speichern</button></div>
   </form></div></div>`;
}
