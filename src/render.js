import { S, saveState } from './state.js';
import { $, esc } from './lib/util.js';
import { Header, BottomNav, GuestHeader } from './views/shared.js';
import { Start, Profil } from './views/profile.js';
import { Wuensche } from './views/wishes.js';
import { Historie } from './views/history.js';
import { Entdecken } from './views/inspiration.js';
import { Gast } from './views/giver.js';
import { Modal } from './views/modals.js';

export const VIEWS={start:Start,profil:Profil,wuensche:Wuensche,historie:Historie,entdecken:Entdecken,gast:Gast};
const DEFAULT_VIEW='profil';

export function render(top){
  const y=window.scrollY,v=S.ui.view;
  const body=VIEWS[v]();
  if(v==='gast'){
    $('#app').innerHTML=GuestHeader()+`<main id="main" class="appmain">${body}</main>`+Modal();
    window.scrollTo(0,top?0:y);
    return;
  }
  $('#app').innerHTML=Header(v)
    +(S.me.managed?`<div class="mgbar">Du verwaltest das Konto von ${esc(S.me.name)}.<button data-act="acct" data-id="me">Zurück zu ${esc(S.accounts.me.name)}</button></div>`:'')
    +`<main id="main" class="appmain">${body}</main>`
    +BottomNav(v)+Modal();
  window.scrollTo(0,top?0:y);
  saveState();
}

export function route(){
  const h=location.hash.replace('#','');
  const guest=h.match(/^p\/([\w-]+)$/);
  if(guest){S.ui.person=guest[1];S.ui.view='gast'}
  else if(h==='schenken'){location.hash='#p/jonas';return}  // alter Link
  else S.ui.view=(h in VIEWS&&h!=='gast')?h:DEFAULT_VIEW;
  S.ui.modal=null;
  render(true);
}
