import { S, initials } from '../state.js';
import { ic, esc } from '../lib/util.js';
import { V } from '../data/content.js';

export function Header(v){
  const items=[['profil','Profil'],['wuensche','Wünsche'],['historie','Historie'],['entdecken','Inspiration']];
  return `<header class="hdr"><div class="wrap">
   <a class="mark" href="../" aria-label="Zur Startseite">wishtale<i></i></a>
   <nav class="nav" aria-label="Hauptnavigation">${items.map(([k,l])=>`<button class="${v===k?'on':''}" data-act="go" data-v="${k}">${l}</button>`).join('')}</nav>
   <div class="right"><button class="acctbtn" data-act="modal" data-v="accounts" aria-label="Konto wechseln"><span class="av t${S.me.tone}">${initials(S.me.name)}</span><span class="hide-s">${esc(S.me.name)}${S.me.managed?' (Kind)':''}</span></button></div>
  </div></header>`;
}
export function BottomNav(v){
  const items=[['profil','user','Profil'],['wuensche','star','Wünsche'],['historie','clock','Historie'],['entdecken','spark','Inspiration']];
  return `<nav class="btm" aria-label="Hauptnavigation">${items.map(([k,i,l])=>`<button class="${v===k?'on':''}" data-act="go" data-v="${k}">${ic(i)}${l}</button>`).join('')}</nav>`;
}
export const Legend=()=>`<div class="legend">${Object.values(V).map(x=>`<span>${ic(x.i,'sm')}${x.l}</span>`).join('')}</div>`;
export const VisPill=(k,btn)=>{const x=V[k];return btn?`<button class="pill" data-act="vis" data-k="${btn}" title="Sichtbarkeit ändern">${ic(x.i,'sm')}${x.l}</button>`:`<span class="pill">${ic(x.i,'sm')}${x.l}</span>`};


/* Kopfzeile für Gäste: nur Logo und der Einstieg in ein eigenes Wishtale. */
export function GuestHeader(){
  return `<header class="hdr"><div class="wrap">
   <a class="mark" href="../" aria-label="Zur Startseite">wishtale<i></i></a>
   <div class="right"><a class="btn pri sm" href="#start" data-act="go" data-v="start">Eigenes Wishtale erstellen</a></div>
  </div></header>`;
}
