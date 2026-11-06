import { S, draftHasData } from '../state.js';
import { esc } from '../lib/util.js';

function Sent(){
  const a=S.ui.authSent,busy=S.ui.authBusy;
  const mail=esc(a.email);
  return `<div class="wrap"><div class="authcard" role="status">
   <p class="eyebrow">Wishtale</p>
   <h1>${a.kind==='signup'?'Fast geschafft, wir haben dir eine E-Mail geschickt':'Schau in dein Postfach'}</h1>
   <p style="margin:10px 0 6px;font-size:17px">Wir haben eine E-Mail an <b>${mail}</b> geschickt. Tippe darin auf den Link, dann bist du ${a.kind==='signup'?'mit deinem Wishtale gleich startklar':'sofort angemeldet'}.</p>
   <p class="muted" style="margin:0 0 16px">Du musst nichts weiter ausfüllen. Du kannst diese Seite offen lassen, sie geht von allein weiter, sobald du den Link auf diesem Gerät öffnest.</p>
   <div class="banner green"><span>Nichts angekommen? Schau bitte auch im Spam-Ordner nach. Die Mail kommt von Wishtale und kann ein paar Minuten brauchen.</span></div>
   ${S.ui.authResent?`<p class="muted" style="margin-top:10px" role="status">${esc(S.ui.authResent)}</p>`:''}
   <div class="row" style="margin-top:14px;gap:8px">${a.kind==='signup'?`<button class="btn sec sm" data-act="resend" ${busy?'disabled':''}>Mail erneut senden</button>`:''}<button class="btn ghost sm" data-act="authback">Andere E-Mail-Adresse verwenden</button></div>
  </div></div>`;
}

export function Login(){
  if(S.ui.authSent)return Sent();
  const tab=S.ui.authTab||'in',m=S.ui.authMsg,busy=S.ui.authBusy;
  const msg=m?`<div class="banner ${m.type==='ok'?'green':''}" role="status" style="margin-bottom:14px"><span>${esc(m.text)}</span></div>`:'';
  const err=S.auth.error?`<div class="banner" style="margin-bottom:14px"><span>${esc(S.auth.error)}</span></div>`:'';
  const dr=tab==='up'&&draftHasData()?S.accounts.draft:null;
  const note=dr?`<div class="banner green" role="status" style="margin-bottom:14px"><span>${dr.name?`Dein Wishtale ist fast fertig, ${esc(dr.name)}. `:'Dein Wishtale ist fast fertig. '}Lege jetzt ein Konto an, damit nichts verloren geht.</span></div>`:'';
  return `<div class="wrap"><div class="authcard">
   <p class="eyebrow">Wishtale</p>
   <h1>${tab==='up'?'Schön, dass du da bist':'Schön, dich wiederzusehen'}</h1>
   <p class="muted" style="margin:6px 0 18px">${tab==='up'?'Mit einem Konto bleiben deine Wünsche sicher gespeichert und deine Freunde können sie über deinen persönlichen Link ansehen, ganz ohne sich selbst anzumelden.':'Melde dich an, dann geht es genau dort weiter, wo du aufgehört hast.'}</p>
   <div class="seg" role="tablist" style="margin-bottom:16px"><button role="tab" aria-selected="${tab==='in'}" class="${tab==='in'?'on':''}" data-act="authtab" data-v="in">Anmelden</button><button role="tab" aria-selected="${tab==='up'}" class="${tab==='up'?'on':''}" data-act="authtab" data-v="up">Registrieren</button></div>
   ${note}${err}${msg}
   ${tab==='up'?`<form data-form="signup" class="authform">
     <div class="fld"><label for="an">Dein Vorname</label><input id="an" name="name" class="inp" required maxlength="60" value="${dr?esc(dr.name):''}" autocomplete="given-name"></div>
     <div class="fld"><label for="ae">E-Mail</label><input id="ae" name="email" type="email" class="inp" required autocomplete="email" value="${esc(S.ui.authEmail||'')}"></div>
     <div class="fld"><label for="ap">Passwort (mindestens 8 Zeichen)</label><input id="ap" name="password" type="password" class="inp" required minlength="8" autocomplete="new-password"></div>
     <button class="btn pri" type="submit" ${busy?'disabled':''}>Konto anlegen</button>
     <p class="disc" style="margin:0">Wie wir mit deinen Daten umgehen, steht in der <a href="../datenschutz.html">Datenschutzerklärung</a>.</p></form>`
   :`<form data-form="signin" class="authform">
     <div class="fld"><label for="ae">E-Mail</label><input id="ae" name="email" type="email" class="inp" required autocomplete="email" value="${esc(S.ui.authEmail||'')}"></div>
     <div class="fld"><label for="ap">Passwort</label><input id="ap" name="password" type="password" class="inp" required autocomplete="current-password"></div>
     <button class="btn pri" type="submit" ${busy?'disabled':''}>Anmelden</button></form>`}
   <details class="authalt"><summary>Lieber ohne Passwort? Wir schicken dir einen Link per E-Mail</summary>
    <form data-form="magic" class="authform" style="margin-top:10px">
     <div class="fld"><label for="am">E-Mail</label><input id="am" name="email" type="email" class="inp" required autocomplete="email"></div>
     <button class="btn sec" type="submit" ${busy?'disabled':''}>Link senden</button></form></details>
   <div class="authalt" style="border-top:1px solid var(--line);padding-top:14px;margin-top:6px"><button class="btn ghost sm" data-act="demo" style="padding-left:0">Ich möchte mich erst einmal umsehen, ohne Konto (Demo)</button></div>
  </div></div>`;
}
