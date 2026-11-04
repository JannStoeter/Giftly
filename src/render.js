import { S, saveState } from './state.js';
import { $, esc } from './lib/util.js';
import { Header, BottomNav } from './views/shared.js';
import { Start, Profil } from './views/profile.js';
import { Wuensche } from './views/wishes.js';
import { Historie } from './views/history.js';
import { Entdecken } from './views/inspiration.js';
import { Schenken } from './views/giver.js';
import { Modal } from './views/modals.js';

export const VIEWS={start:Start,profil:Profil,wuensche:Wuensche,historie:Historie,entdecken:Entdecken,schenken:Schenken};
const DEFAULT_VIEW='profil';

export function render(top){
  const y=window.scrollY,v=S.ui.view;
  const body=VIEWS[v]();
  $('#app').innerHTML=Header(v)
    +(S.me.managed?`<div class="mgbar">Du verwaltest das Konto von ${esc(S.me.name)}.<button data-act="acct" data-id="me">Zurück zu ${esc(S.accounts.me.name)}</button></div>`:'')
    +`<main id="main" class="appmain">${body}</main>`
    +BottomNav(v)+Modal();
  window.scrollTo(0,top?0:y);
  saveState();
}

export function route(){
  const h=location.hash.replace('#','');
  const prev=S.ui.view;
  S.ui.view=h in VIEWS?h:DEFAULT_VIEW;
  if(prev!==S.ui.view&&S.ui.view==='schenken')S.ui.tab='wuensche';
  S.ui.modal=null;
  render(true);
}
