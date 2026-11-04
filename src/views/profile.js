import { S, initials } from '../state.js';
import { esc, ic } from '../lib/util.js';
import { art } from '../lib/art.js';
import { ACT, CATS, BRANDS, TRIES, NOGOS, ALTS, cat, crea } from '../data/content.js';
import { VisPill, Legend } from './shared.js';
import { GuestPage } from './giver.js';

export const STEPS=[
 {k:'interests',t:'Was machst du gerne?',h:'Wähle alles, was zu deinem Alltag gehört.',opts:()=>ACT.map(a=>a.l)},
 {k:'cats',t:'Welche Welten gefallen dir?',h:'Tippe auf die Bereiche, in denen du dich zuhause fühlst.',tiles:true},
 {k:'brands',t:'Welche Marken gefallen dir?',h:'Marken, bei denen du sofort Lust aufs Stöbern hast.',opts:()=>BRANDS},
 {k:'tries',t:'Was würdest du gerne einmal ausprobieren?',h:'Ideal für Erlebnisse und mutige Ideen.',opts:()=>TRIES},
 {k:'nogos',t:'Was möchtest du auf keinen Fall geschenkt bekommen?',h:'Sichtbar nur für Schenkende. Das erspart allen Peinlichkeiten.',opts:()=>NOGOS},
 {k:'alts',t:'Und wenn niemandem etwas einfällt?',h:'Deine Alternativen: Gutscheine, lokale Läden oder eine Spende.',opts:()=>ALTS}
];
export function Start(){
  const i=S.ui.step,st=STEPS[i],last=i===STEPS.length-1;
  let body='';
  if(st.tiles){
    body=`<div class="tiles">${CATS.map(c=>{const on=S.me.cats.includes(c.id);return `<button class="tile ${on?'on':''}" data-act="pick" data-k="cats" data-v="${c.id}" aria-pressed="${on}">${art(c.a,c.t)}<span>${c.n}<i class="tick">${ic('check','sm')}</i></span></button>`}).join('')}</div>`;
  }else{
    const list=[...new Set([...st.opts(),...S.me[st.k]])];
    body=`<div class="opts">${list.map(o=>{const on=S.me[st.k].includes(o);return `<button class="opt ${on?'on':''}" data-act="pick" data-k="${st.k}" data-v="${esc(o)}" aria-pressed="${on}">${esc(o)}</button>`}).join('')}</div>
    <form data-form="custom" class="addrow"><input type="hidden" name="k" value="${st.k}"><label class="sr" for="cust" style="position:absolute;left:-9999px">Eigene Angabe</label><input id="cust" name="v" class="inp" placeholder="Etwas anderes ergänzen" autocomplete="off"><button class="btn sec sm" type="submit">${ic('plus','sm')}Hinzufügen</button></form>`;
  }
  return `<div class="wrap"><div class="ob">
   <div class="prog" aria-label="Schritt ${i+1} von ${STEPS.length}">${STEPS.map((_,j)=>`<i class="${j<=i?'on':''}"></i>`).join('')}</div>
   <p class="eyebrow">Dein Wishtale · ${i+1} von ${STEPS.length}</p>
   ${S.me.managed?`<div class="banner green" style="margin-top:10px">${ic('user')}<span>Du richtest das Profil für ${esc(S.me.name)} ein. Am schönsten geht das gemeinsam.</span></div>`:''}
   <h1>${st.t}</h1><p class="muted" style="font-size:17px">${st.h}</p>
   ${body}
   <div class="obnav"><button class="btn ghost" data-act="${i?'prev':'go'}" data-v="profil">${ic('back','sm')}${i?'Zurück':'Abbrechen'}</button>
   <button class="btn pri" data-act="${last?'finish':'next'}">${last?'Profil fertigstellen':'Weiter'} ${ic('arrow','sm')}</button></div>
  </div></div>`;
}

/* ---- Profile ---- */
export function MgPanel(m){return `<section class="panel" style="margin-top:16px;display:grid;gap:10px"><div class="row" style="justify-content:space-between"><h3 style="font-size:24px">Kind-Konto</h3><span class="pill">${ic('lock','sm')}Nur auf Einladung</span></div>
 <p class="muted" style="font-size:15px">Du pflegst Profil, Wünsche und Feedback für ${esc(m.name)}. Du siehst, was reserviert oder gekauft ist, damit nichts doppelt kommt. ${esc(m.name)} sieht davon nichts.</p>
 <div class="chips">${m.invited.map(x=>`<span class="chip ok">${ic('check','sm')}${esc(x)}</span>`).join('')||'<span class="muted" style="font-size:14px">Noch niemand eingeladen.</span>'}</div>
 <div class="row"><button class="btn sec sm" data-act="invite">${ic('plus','sm')}Person einladen</button></div>
 <p class="disc" style="margin:0">Es werden nur Vorname und Alter gespeichert, keine Fotos und kein Nachname. Das Profil sehen nur Eingeladene.</p></section>`}
export function Profil(){
  const m=S.me,pv=S.ui.preview;
  const sec=(k,title,inner)=>{
    const vk=m.vis[k]||'giver';
    if(pv&&vk==='privat')return '';
    return `<section class="psec"><div class="hd"><h3>${title}</h3>${VisPill(vk,pv?null:k)}</div>${inner}</section>`;
  };
  const chips=(a,cls='')=>a.length?`<div class="chips">${a.map(x=>`<span class="chip ${cls}">${esc(x)}</span>`).join('')}</div>`:'<p class="muted">Noch nichts hinterlegt.</p>';
  const line=`${m.name} ${m.interests.length?`liebt ${m.interests.slice(0,3).map(esc).join(', ')}`:'hat noch keine Interessen hinterlegt'}. ${m.nogos.length?`Lieber nichts mit ${m.nogos.slice(0,2).map(esc).join(' oder ')}.`:''} ${m.alts.length?`Wenn die Idee fehlt: ${esc(m.alts[0])}.`:''}`;
  return `<div class="wrap">
   ${pv?'':`   <div class="pcard"><span class="av t${m.tone}">${initials(m.name)}</span>
    <div><p class="eyebrow" style="color:#B8C4A8">Wishtale</p><h1>${esc(m.name)}</h1><p style="margin-top:8px">${line}</p></div>
    <div class="row" style="gap:8px"><button class="btn gold sm" data-act="share">Link teilen</button><button class="btn sec sm" style="border-color:var(--accent-ink);color:var(--accent-ink)" data-act="edit">Bearbeiten</button></div></div>`}
   <div class="row" style="margin:18px 0 4px;justify-content:space-between">
     <div class="seg" role="group" aria-label="Ansicht"><button class="${!pv?'on':''}" data-act="preview" data-v="0">Meine Ansicht</button><button class="${pv?'on':''}" data-act="preview" data-v="1">So sehen Schenkende es</button></div>
   </div>
   ${pv?`<div class="banner green" style="margin-top:12px">${ic('eye')}<span>Vorschau: Private Bereiche und dein Feedback sind für Schenkende nicht sichtbar.</span></div>`:`<p class="muted" style="font-size:14px;margin-top:8px">Tippe auf die Sichtbarkeit, um sie pro Bereich zu ändern.</p>`}
   ${pv?GuestPage(m,{preview:true}):`
   ${m.managed?MgPanel(m):''}
   ${AboutSec(m)}
   ${sec('interests','Interessen',chips(m.interests))}
   ${sec('cats','Welten',`<div class="catrow">${m.cats.map(id=>{const c=cat(id);return `<div class="catmini">${art(c.a,c.t)}<div>${c.n}</div></div>`}).join('')||'<p class="muted">Noch nichts hinterlegt.</p>'}</div>`)}
   ${(m.style||[]).length?sec('style','Im Notfall',`<div class="chips">${m.style.map(x=>`<button class="chip gold" data-act="creator" data-id="${x.id}" data-go="1">${esc(crea(x.id).scope)} von ${esc(crea(x.id).handle)}</button>`).join('')}</div><p class="muted" style="font-size:14px">Wenn nichts Konkretes passt, orientieren sich Schenkende an diesen Listen.</p>`):''}
   ${sec('brands','Lieblingsmarken',chips(m.brands))}
   ${sec('tries','Möchte ich ausprobieren',chips(m.tries,'gold'))}
   ${sec('nogos','Bitte nicht',chips(m.nogos,'warn'))}
   ${sec('alts','Alternativen, wenn keine Idee passt',chips(m.alts,'ok'))}
   <section class="psec"><div class="hd"><h3>Dein Feedback</h3>${VisPill('nur')}</div><p class="muted">Wie dir Geschenke gefallen haben, sehen nur du und Wishtale. Schenkende erhalten höchstens eine freundliche Nachricht.</p></section>
   ${Legend()}`}
  </div>`;
}

function AboutSec(m){
  return `<section class="psec"><div class="hd"><h3>Über mich</h3>${VisPill('alle')}</div>
   <label for="about" class="muted" style="font-size:14px">Zwei, drei Sätze für Freunde, die etwas schenken wollen. Sie stehen ganz oben auf deiner Profilseite.</label>
   <textarea id="about" class="ta" data-prof="about" maxlength="320" placeholder="z. B. Ich koche gern für Freunde, trinke meinen Kaffee selbst gebrüht und richte meine Wohnung Stück für Stück ein.">${esc(m.about||'')}</textarea></section>`;
}
