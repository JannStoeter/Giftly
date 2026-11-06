/* Pinterest-Pins direkt ansehen. Das Pinterest-Skript wird erst nach ausdrücklicher Zustimmung geladen. */
import { S, guestPerson } from '../state.js';
import { esc } from '../lib/util.js';
import { pinConsent, pinterestKind } from '../lib/social.js';

export function PinsModal(){
  const p=S.ui.pinsCtx==='guest'?guestPerson():S.me;
  const url=p&&p.social&&p.social.pinterest;
  if(!url)return '';
  const name=esc(p.name),kind=pinterestKind(url);
  if(!pinConsent()){
    return `<div class="scrim" data-act="closebg"><div class="sheet wide" role="dialog" aria-modal="true" aria-labelledby="mt">
     <p class="eyebrow">Pinterest</p><h2 id="mt">Die Pins von ${name} ansehen</h2>
     <p style="margin:10px 0">Die Pins zeigt Pinterest selbst an. Wenn du sie hier ansehen möchtest, laden wir dafür ein Skript von Pinterest nach. Dabei werden Daten wie deine IP-Adresse an Pinterest übertragen und Pinterest kann Cookies setzen. Solange du nicht zustimmst, passiert nichts davon.</p>
     <p class="muted" style="font-size:14px">Wenn dir das lieber ist, kannst du die Pins auch direkt bei Pinterest öffnen.</p>
     <div class="row" style="margin-top:14px;gap:8px"><button class="btn pri" data-act="pinconsent">Einverstanden, Pins laden</button><a class="btn sec" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Direkt auf Pinterest öffnen</a><span style="flex:1"></span><button class="btn ghost" data-act="close">Schließen</button></div>
    </div></div>`;
  }
  const w=Math.max(260,Math.min(600,window.innerWidth-90));
  const attrs=kind==='board'
    ?`data-pin-do="embedBoard" data-pin-board-width="${w}" data-pin-scale-height="480" data-pin-scale-width="115"`
    :`data-pin-do="embedUser" data-pin-board-width="${w}" data-pin-scale-height="480" data-pin-scale-width="115"`;
  return `<div class="scrim" data-act="closebg"><div class="sheet wide" role="dialog" aria-modal="true" aria-labelledby="mt">
   <p class="eyebrow">Pinterest</p><h2 id="mt">Was ${name} inspiriert</h2>
   <div class="pinwrap"><a ${attrs} href="${esc(url)}"></a></div>
   <p class="disc">Diese Inhalte stammen von Pinterest. Es gelten deren Datenschutzbestimmungen. <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Auf Pinterest öffnen</a></p>
   <div class="row" style="justify-content:flex-end;margin-top:10px;gap:8px"><button class="btn ghost" data-act="pinrevoke">Zustimmung widerrufen</button><button class="btn ghost" data-act="close">Schließen</button></div>
  </div></div>`;
}
