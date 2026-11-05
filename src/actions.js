import { S, W, switchTo, resetState, guestPerson, saveState } from './state.js';
import { $, toast, kwOf, nid, money, overlap } from './lib/util.js';
import { LOOKS, CATALOG, PRIO, crea, cprod, cat } from './data/content.js';
import { check } from './logic.js';
import { offersFor } from './lib/products.js';
import { parseAmazonInput, searchUrl } from './lib/shops.js';
import { render, route, refreshGuest } from './render.js';
import { guestRpc } from './lib/remote.js';
import { signIn, signUp, magicLink, signOut, friendly } from './lib/auth.js';

export const MONTHS=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
export 
/* ---- Amazon stöbern ---- */
const parsePrice=v=>{const n=parseFloat(String(v||'').replace(/\./g,'').replace(',','.'));return Number.isFinite(n)&&n>0?n:null};
function azParse(text){
  const z=S.ui.az,r=parseAmazonInput(text);
  z.text=text;z.res=r;
  if(!r.error){
    z.title=z.title||r.title;
    const guess=CATALOG.find(i=>overlap(kwOf(r.title),i.kw));
    z.c=guess?guess.c:(z.c||'wohnen');
  }
  render();
}

/* Reservieren: entweder über die Datenbank (echtes Profil) oder lokal (Demo). Liefert true bei Erfolg. */
function reserveFlow(p,w){
  if(p.remote){
    return guestRpc('reserve_wish',w.id)
      .then(r=>{if(!r.ok){toast('Oh, da war jemand schneller: Dieser Wunsch ist schon reserviert.');}return refreshGuest().then(()=>!!r.ok)})
      .catch(()=>{toast('Das hat leider nicht geklappt. Magst du es bitte noch einmal versuchen?');return false});
  }
  w.res='me';return Promise.resolve(true);
}
const A={
 scroll(el){document.getElementById(el.dataset.t)?.scrollIntoView({behavior:'smooth',block:'start'})},
 go(el){const v=el.dataset.v;if(v==='entdecken'){S.ui.look=null;S.ui.creator=null}if(v==='start')S.ui.step=0;location.hash='#'+v;if(location.hash==='#'+v&&S.ui.view===v)render(true)},
 pick(el){const k=el.dataset.k,v=el.dataset.v,a=S.me[k],i=a.indexOf(v);i>-1?a.splice(i,1):a.push(v);render()},
 next(){S.ui.step++;render(true)},prev(){S.ui.step--;render(true)},
 finish(){toast('Geschafft! Dein Wishtale ist startklar.');location.hash='#profil'},
 edit(){S.ui.step=0;location.hash='#start'},
 preview(el){S.ui.preview=el.dataset.v==='1';render()},
 vis(el){const o=['alle','giver','privat'],k=el.dataset.k;S.me.vis[k]=o[(o.indexOf(S.me.vis[k]||'giver')+1)%3];render()},
 wf(el){S.ui.wf=el.dataset.v;render()},wc(el){S.ui.wc=el.dataset.v;render()},
 selbst(el){const w=S.me.wishes.find(x=>x.id===el.dataset.id);w.status=w.status==='selbst'?'offen':'selbst';toast(w.status==='selbst'?'Dann ist dieser Wunsch erledigt. Deine Freunde sehen jetzt, dass du das schon hast.':'Der Wunsch ist wieder offen.');render()},
 prio(el){const w=S.me.wishes.find(x=>x.id===el.dataset.id);w.prio=w.prio%3+1;toast('Priorität: '+PRIO[w.prio]);render()},
 delw(el){S.ui.modal=null;S.me.wishes=S.me.wishes.filter(x=>x.id!==el.dataset.id);render()},
 modal(el){S.ui.modal=el.dataset.v;render();setTimeout(()=>document.querySelector('.sheet input,.sheet select')?.focus(),30)},
 close(){S.ui.modal=null;render()},
 authtab(el){S.ui.authTab=el.dataset.v;S.ui.authMsg=null;render()},
 demo(){try{sessionStorage.setItem('wishtale:demo','1')}catch{}S.auth.demo=true;S.ui.authMsg=null;location.hash='#profil';route()},
 tologin(){try{sessionStorage.removeItem('wishtale:demo')}catch{}S.auth.demo=false;S.ui.modal=null;location.hash='#login';route()},
 logout(){signOut().finally(()=>{location.hash='';location.reload()})},
 guestretry(){S.guest=null;route()},
 share(){
  const url=`${location.origin}${location.pathname}#p/${S.me.handle||S.ui.acct}`;
  const done=()=>toast('Dein Link ist kopiert und bereit zum Verschicken. (In der Demo öffnet er dein Profil nur in diesem Browser.)');
  if(navigator.share){navigator.share({title:`${S.me.name} bei Wishtale`,url}).catch(()=>{})}
  else if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(done,()=>toast(url))}
  else toast(url);
 },
 azopen(){S.ui.az={q:'',text:'',res:null,title:'',price:'',c:'wohnen',searched:false};S.ui.modal='amazon';render();setTimeout(()=>$('#azq')?.focus(),30)},
 azq(el){S.ui.az.q=el.dataset.v;render()},
 azclip(){
  if(!navigator.clipboard?.readText){toast('Dein Browser lässt das Einfügen per Knopf leider nicht zu. Füge den Link bitte mit Strg+V (am Handy mit langem Tippen) in das Feld ein.');return}
  navigator.clipboard.readText().then(azParse).catch(()=>toast('Wir kommen gerade nicht an deine Zwischenablage. Füge den Link bitte mit Strg+V in das Feld ein.'));
 },
 reset(){if(confirm('Alle Änderungen verwerfen und die Beispieldaten wiederherstellen?'))resetState()},
 closebg(el,e){if(e.target===el)A.close()},
 liked(el){const g=S.me.history.find(x=>x.id===el.dataset.id),o=['ja','teils','nein'];g.liked=o[(o.indexOf(g.liked)+1)%3];render()},
 have(el){const g=S.me.history.find(x=>x.id===el.dataset.id);g.have=!g.have;render()},
 again(el){const g=S.me.history.find(x=>x.id===el.dataset.id);g.again=!g.again;render()},
 fb(el){
  const g=S.me.inbox.find(x=>x.id===el.dataset.id),v=el.dataset.v;
  if(v==='swap'){S.ui.swap=g.id;S.ui.swapSel=S.me.alts.slice(0,2);render();return}
  const map={love:['ja',true,true,'Wie schön, das freut uns! Wir merken uns, was dir gefällt.'],happy:['ja',true,true,'Danke dir! Das fließt in künftige Vorschläge ein.'],meh:['teils',true,false,'Notiert. Das siehst nur du.'],have:['teils',true,false,'Verstanden. Ähnliches schlagen wir künftig nicht mehr vor.']};
  const [l,h,a,msg]=map[v];
  S.me.inbox=S.me.inbox.filter(x=>x.id!==g.id);
  S.me.history.unshift({id:g.id,what:g.what,from:g.from,when:'November 2026',liked:l,have:h,again:a,a:g.a,tone:g.tone,kw:g.kw});
  toast(msg);render();
 },
 swapsel(el){const v=el.dataset.v,a=S.ui.swapSel,i=a.indexOf(v);i>-1?a.splice(i,1):a.push(v);render()},
 swapcancel(){S.ui.swap=null;render()},
 swapsend(el){
  const g=S.me.inbox.find(x=>x.id===el.dataset.id);
  S.me.inbox=S.me.inbox.filter(x=>x.id!==g.id);
  S.me.history.unshift({id:g.id,what:g.what,from:g.from,when:'November 2026',liked:'teils',have:false,again:false,a:g.a,tone:g.tone,kw:g.kw});
  S.ui.swap=null;toast(`Das ist eine Vorschau: ${g.from} würde jetzt eine freundliche Nachricht bekommen, ganz ohne Bewertung.`);render();
 },
 reserve(el){
  const p=guestPerson(),w=p&&p.wishes.find(x=>x.id===el.dataset.id);if(!w)return;
  reserveFlow(p,w).then(ok=>{if(ok)toast(`Erledigt, der Wunsch ist für dich reserviert. ${p.name} erfährt davon nichts, und andere Freunde sehen nur „reserviert“.`);render()});
 },
 choose(el){
  const p=guestPerson(),w=p&&p.wishes.find(x=>x.id===el.dataset.wid);if(!w)return;
  const o=offersFor(p,w),pick=[o.main,...o.alts].filter(Boolean).find(x=>String(x.id)===el.dataset.pid);
  reserveFlow(p,w).then(ok=>{
   if(ok&&pick){S.ui.chosen[w.id]={t:pick.t,url:pick.url,price:pick.price||null};toast(`Reserviert: ${pick.t}. Du kannst ihn jederzeit hier wiederfinden.`)}
   render();
  });
 },
 release(el){
  const p=guestPerson(),w=p&&p.wishes.find(x=>x.id===el.dataset.id);if(!w)return;
  delete S.ui.chosen[w.id];
  if(p.remote){guestRpc('release_wish',w.id).then(refreshGuest).catch(()=>toast('Das hat nicht geklappt.'));return}
  w.res=null;render();
 },
 bought(el){
  const p=guestPerson(),w=p&&p.wishes.find(x=>x.id===el.dataset.id);if(!w)return;
  const done=()=>{toast('Prima, als gekauft markiert. Die Überraschung bleibt natürlich bestehen.')};
  if(p.remote){guestRpc('mark_bought',w.id).then(()=>{done();return refreshGuest()}).catch(()=>toast('Das hat nicht geklappt.'));return}
  w.bought=true;done();render();
 },
 world(el){S.ui.worldId=el.dataset.id;S.ui.worldCtx=el.dataset.ctx||'guest';S.ui.modal='world';render();setTimeout(()=>document.querySelector('.sheet [data-act=close]')?.focus(),30)},
 ownedel(el){S.me.wishes=S.me.wishes.filter(x=>x.id!==el.dataset.id);render()},
 aside(){S.ui.asideOpen=!S.ui.asideOpen;render()},
 wopen(el){S.ui.pickId=el.dataset.id;S.ui.wishCtx=el.dataset.ctx||'guest';S.ui.modal='wishdetail';render();setTimeout(()=>document.querySelector('.sheet [data-act=close]')?.focus(),30)},
 try(el){const p=guestPerson();S.ui.idea=el.dataset.v;S.ui.ideaRes=check(p,el.dataset.v);render()},
 save(el){const id=el.dataset.id;S.ui.saved[id]=!S.ui.saved[id];render()},
 kind(el){S.ui.kind=el.dataset.v;render()},
 acct(el){switchTo(el.dataset.id);render(true)},
 invite(){const m=S.me,n=['Onkel Tom','Patentante Sarah','Opa Heinz'].find(x=>!m.invited.includes(x));if(n){m.invited.push(n);toast('Simuliert: Einladung an '+n+' erstellt. Nur Eingeladene sehen das Profil.')}else toast('Alle Beispiel-Einladungen sind vergeben.');render()},
 creator(el){S.ui.creator=el.dataset.id;S.ui.look=null;S.ui.hot=null;if(el.dataset.go&&S.ui.view!=='entdecken'){location.hash='#entdecken';return}render(true)},
 cback(){S.ui.creator=null;S.ui.look=null;render(true)},
 cf(el){S.ui.cf=el.dataset.v;render()},
 look(el){S.ui.look=el.dataset.id;S.ui.hot=null;if(!el.dataset.keep)S.ui.creator=null;render(true)},
 lookback(){S.ui.look=null;S.ui.hot=null;render(true)},
 hot(el){S.ui.hot=S.ui.hot===el.dataset.id?null:el.dataset.id;render()},
 lookall(){const l=LOOKS.find(x=>x.id===S.ui.look),c=crea(l.cid);let n=0;l.objs.filter(o=>o.pid).forEach(o=>{const x=cprod(o.pid);if(!S.me.wishes.some(w=>w.pid===x.id)){S.me.wishes.unshift(W({t:x.t,c:x.c,prio:2,a:x.a,tone:x.tone,note:`Tipp von ${c.handle}: ${x.note}`,via:c.id,pid:x.id,kw:kwOf(x.t)}));n++}});toast(n?`${n===1?'Ein Teil':n+' Teile'} aus diesem Look stehen jetzt auf deiner Wunschliste. Wenn jemand darüber einkauft, bekommt ${c.handle} eine kleine Provision, für dich ändert sich dadurch nichts.`:'Alles aus diesem Look steht schon auf deiner Wunschliste.');render()},
 style(el){const m=S.me;m.style=m.style||[];const id=el.dataset.id,i=m.style.findIndex(x=>x.id===id);if(i>-1){m.style.splice(i,1);toast('Das Stil-Vorbild ist wieder entfernt.')}else{m.style.push({id});toast(`Das hat geklappt: In deinem Profil steht jetzt „${crea(id).scope} von ${crea(id).handle}“. So wissen deine Freunde, woran sie sich orientieren können.`)}render()},
 cadd(el){const x=cprod(el.dataset.id),c=crea(el.dataset.cid);S.me.wishes.unshift(W({t:x.t,c:x.c,prio:2,a:x.a,tone:x.tone,note:`Tipp von ${c.handle}: ${x.note}`,via:c.id,pid:x.id,kw:kwOf(x.t)}));toast(`Schön, das steht jetzt auf deiner Wunschliste. Wenn jemand darüber einkauft, bekommt ${c.handle} eine kleine Provision, für dich ändert sich dadurch nichts.`);render()},
 cbuy(el){const c=crea(el.dataset.cid);toast(`Das ist eine Vorschau: Hier würde sich der Partnerlink öffnen, und ${c.handle} bekäme bei einem Kauf eine kleine Provision.`)},
 occ(el){S.ui.occ=el.dataset.v;S.ui.budget=el.dataset.v==='danke'?40:100;render()},
 onlyopen(el){S.ui.onlyOpen=el.dataset.v==='1';render()},
 dens(el){S.ui.big=el.dataset.v==='1';render()},
 suggest(el){S.ui.pickId=el.dataset.id;S.ui.wishCtx='guest';S.ui.modal='wishdetail';render()}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t)return;const f=A[t.dataset.act];if(f)f(t,e)});
document.addEventListener('input',e=>{if(e.target.id==='bud'){S.ui.budget=+e.target.value;$('#budv').textContent=money(S.ui.budget)}});
document.addEventListener('change',e=>{if(e.target.id==='bud'){S.ui.budget=+e.target.value;render()}});
document.addEventListener('input',e=>{const f=e.target.dataset?.az;if(f&&S.ui.az)S.ui.az[f]=e.target.value});
document.addEventListener('change',e=>{const f=e.target.dataset?.az;if(f&&S.ui.az)S.ui.az[f]=e.target.value});
document.addEventListener('paste',e=>{
  if(e.target.id!=='azurl')return;
  e.preventDefault();azParse(e.clipboardData.getData('text'));
});
/* Zurück aus dem Amazon-Tab: Link aus der Zwischenablage automatisch übernehmen, falls erlaubt. */
window.addEventListener('focus',()=>{
  const z=S.ui.az;
  if(S.ui.modal!=='amazon'||!z?.searched||(z.res&&!z.res.error)||!navigator.clipboard?.readText)return;
  navigator.clipboard.readText().then(t=>{if(/amazon\.de\//i.test(t))azParse(t)}).catch(()=>{});
});
document.addEventListener('input',e=>{const f=e.target.dataset?.prof;if(f){S.me[f]=e.target.value;saveState()}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[role=button][data-act]')){e.preventDefault();e.target.click()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.ui.modal)A.close()});
document.addEventListener('submit',e=>{
  const f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();
  const fd=new FormData(f),kind=f.dataset.form;
  if(kind==='signin'||kind==='signup'||kind==='magic'){
    const email=(fd.get('email')||'').trim(),pw=fd.get('password')||'';
    S.ui.authBusy=true;S.ui.authMsg=null;render();
    const job=kind==='signin'?signIn(email,pw):kind==='signup'?signUp((fd.get('name')||'').trim(),email,pw):magicLink(email);
    job.then(({data,error})=>{
      S.ui.authBusy=false;
      if(error){S.ui.authMsg={type:'error',text:friendly(error)};render();return}
      if(kind==='signup'&&!data.session)S.ui.authMsg={type:'ok',text:'Fast geschafft! Wir haben dir gerade eine E-Mail geschickt. Wenn du darin auf den Link klickst, ist dein Konto startklar.'};
      else if(kind==='magic')S.ui.authMsg={type:'ok',text:'Wir haben dir einen Link per E-Mail geschickt. Öffne ihn am besten auf diesem Gerät, dann bist du sofort angemeldet.'};
      render();
    }).catch(e=>{S.ui.authBusy=false;S.ui.authMsg={type:'error',text:friendly(e)};render()});
    return;
  }
  if(kind==='owned'){
    const t=(fd.get('t')||'').trim();if(!t)return;
    const g=CATALOG.find(i=>overlap(kwOf(t),i.kw));const c=g?g.c:'wohnen';
    S.me.wishes.unshift(W({t,c,kind:'produkt',prio:1,status:'selbst',vis:'alle',a:cat(c).a,tone:cat(c).t,kw:kwOf(t)}));
    toast(`„${t}“ ist eingetragen. Das schlagen wir dir und deinen Freunden nicht mehr vor.`);render();return;
  }
  if(kind==='azsearch'){
    const q=(fd.get('q')||'').trim();S.ui.az.q=q;S.ui.az.searched=true;
    window.open(q?searchUrl.amazon(q):'https://www.amazon.de/?tag=jannst-21','_blank','noopener');return;
  }
  if(kind==='azlink'){azParse(fd.get('text')||'');return}
  if(kind==='azadd'){
    const z=S.ui.az,t=(fd.get('t')||'').trim();if(!t||!z.res||z.res.error)return;
    const c=fd.get('c');
    S.me.wishes.unshift(W({t,c,kind:'produkt',prio:2,link:z.res.url,price:parsePrice(fd.get('price')),a:cat(c).a,tone:cat(c).t,kw:kwOf(t)}));
    S.ui.modal=null;S.ui.az=null;S.ui.wf='offen';S.ui.wc='alle';toast('Schön, der Wunsch steht auf deiner Liste. Den Link zu Amazon haben wir direkt dazu gespeichert.');render();return;
  }
  if(kind==='child'){
    const name=(fd.get('name')||'').trim();if(!name)return;
    const id=nid('c');
    S.accounts[id]={id,name,age:+fd.get('age')||null,tone:Object.keys(S.accounts).length%6,managed:true,invited:[],interests:[],cats:[],brands:[],tries:[],nogos:[],alts:[],vis:{interests:'giver',cats:'giver',brands:'giver',tries:'giver',nogos:'giver',alts:'giver'},wishes:[],history:[],inbox:[]};
    switchTo(id);S.ui.step=0;toast(`Das Konto für ${name} ist angelegt. Jetzt könnt ihr das Profil gemeinsam einrichten.`);
    if(location.hash==='#start')render(true);else location.hash='#start';
    return;
  }
  if(kind==='custom'){const v=(fd.get('v')||'').trim(),k=fd.get('k');if(v&&!S.me[k].includes(v))S.me[k].push(v);render()}
  if(kind==='idea'){const v=(fd.get('idea')||'').trim();S.ui.idea=v;S.ui.ideaRes=v?check(guestPerson(),v):null;render()}
  if(kind==='gift'){
    const [y,mo]=(fd.get('when')||'2026-11').split('-');
    const what=fd.get('what').trim();
    S.me.history.unshift({id:nid('h'),what,from:fd.get('from').trim(),when:`${MONTHS[+mo-1]} ${y}`,liked:fd.get('liked'),have:fd.get('have')==='1',again:fd.get('again')==='1',a:'gift',tone:S.me.history.length%6,kw:kwOf(what)});
    S.ui.modal=null;toast('Das Geschenk ist eingetragen.');render();
  }
  if(kind==='wish'){
    const file=fd.get('img'),done=img=>{
      const c=fd.get('c'),t=fd.get('t').trim(),k=fd.get('kind');
      S.me.wishes.unshift(W({t,c,kind:k,prio:+fd.get('prio'),link:(fd.get('link')||'').trim(),price:parsePrice(fd.get('price')),occ:fd.getAll('occ'),budget:+fd.get('budget')||null,note:(fd.get('note')||'').trim(),vis:fd.get('vis'),a:k==='erlebnis'?'ticket':cat(c).a,tone:cat(c).t,img}));
      S.ui.modal=null;S.ui.wf='offen';S.ui.wc='alle';toast('Der Wunsch ist gespeichert.');render();
    };
    if(file&&file.size){const r=new FileReader();r.onload=()=>done(r.result);r.onerror=()=>done(null);r.readAsDataURL(file)}else done(null);
  }
});
