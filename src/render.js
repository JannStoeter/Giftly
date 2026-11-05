import { S, saveState } from './state.js';
import { $, esc } from './lib/util.js';
import { Header, BottomNav, GuestHeader, LoginHeader } from './views/shared.js';
import { Start, Profil } from './views/profile.js';
import { Wuensche } from './views/wishes.js';
import { Historie } from './views/history.js';
import { Entdecken } from './views/inspiration.js';
import { Gast } from './views/giver.js';
import { Login } from './views/auth.js';
import { fetchPublic, scheduleSync } from './lib/remote.js';
import { Modal } from './views/modals.js';

export const VIEWS={start:Start,profil:Profil,wuensche:Wuensche,historie:Historie,entdecken:Entdecken,gast:Gast,login:Login};
const DEFAULT_VIEW='profil';

let lastModalKey='';
export function render(top){
  const y=window.scrollY,v=S.ui.view;
  // Scrollposition im Fenster merken: gleiches Fenster bleibt, wo es war, ein neues beginnt ganz oben.
  const oldSheet=document.querySelector('.sheet');
  const sheetY=oldSheet?oldSheet.scrollTop:0;
  const modalKey=S.ui.modal?`${S.ui.modal}:${S.ui.pickId||''}:${S.ui.worldId||''}`:'';
  const body=VIEWS[v]();
  if(v==='login'){
    $('#app').innerHTML=LoginHeader()+`<main id="main" class="appmain">${body}</main>`;
    window.scrollTo(0,0);
    return;
  }
  if(v==='gast'){
    $('#app').innerHTML=GuestHeader()+`<main id="main" class="appmain">${body}</main>`+Modal();
    window.scrollTo(0,top?0:y);
    const gs=document.querySelector('.sheet');
    if(gs)gs.scrollTop=(modalKey&&modalKey===lastModalKey)?sheetY:0;
    lastModalKey=modalKey;
    return;
  }
  $('#app').innerHTML=Header(v)
    +(S.me.managed?`<div class="mgbar">Du verwaltest das Konto von ${esc(S.me.name)}.<button data-act="acct" data-id="me">Zurück zu ${esc(S.accounts.me.name)}</button></div>`:'')
    +`<main id="main" class="appmain">${body}</main>`
    +BottomNav(v)+Modal();
  window.scrollTo(0,top?0:y);
  const sheet=document.querySelector('.sheet');
  if(sheet)sheet.scrollTop=(modalKey&&modalKey===lastModalKey)?sheetY:0;
  lastModalKey=modalKey;
  saveState();
  scheduleSync();
}

export function route(){
  const h=location.hash.replace('#','');
  const guest=h.match(/^p\/([\w-]+)$/);
  if(guest){
    S.ui.person=guest[1];S.ui.view='gast';startGuest(guest[1]);
  }
  else if(!S.auth.user&&!S.auth.demo){S.ui.view='login'}
  else if(h==='schenken'){location.hash='#p/jonas';return}  // alter Link
  else S.ui.view=(h in VIEWS&&h!=='gast'&&h!=='login')?h:DEFAULT_VIEW;
  S.ui.modal=null;
  render(true);
}

/* Gast-Profil aus der Datenbank laden. Gibt es das Handle dort nicht, greifen die lokalen Demo-Profile. */
function startGuest(handle){
  if(S.guest&&S.guest.handle===handle&&S.guest.status!=='error'){return}
  S.guest={handle,status:'loading',person:null};
  fetchPublic(handle)
    .then(p=>{if(S.guest?.handle!==handle)return;S.guest={handle,status:'ready',person:p};if(S.ui.view==='gast')render(true)})
    .catch(e=>{console.error(e);if(S.guest?.handle!==handle)return;S.guest={handle,status:S.people[handle]?'ready':'error',person:null};if(S.ui.view==='gast')render(true)});
}
export function refreshGuest(){
  const h=S.guest?.handle;if(!h)return Promise.resolve();
  return fetchPublic(h).then(p=>{if(S.guest?.handle===h){S.guest.person=p;render()}});
}
