import { S, W, switchTo, resetState } from './state.js';
import { $, toast, kwOf, nid, money, overlap } from './lib/util.js';
import { LOOKS, PRODUCTS, CATALOG, PRIO, crea, cprod, cat } from './data/content.js';
import { check } from './logic.js';
import { amazonUrl } from './lib/products.js';
import { parseAmazonInput, searchUrl } from './lib/shops.js';
import { render } from './render.js';

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
const A={
 go(el){const v=el.dataset.v;if(v==='entdecken'){S.ui.look=null;S.ui.creator=null}if(v==='start')S.ui.step=0;location.hash='#'+v;if(location.hash==='#'+v&&S.ui.view===v)render(true)},
 pick(el){const k=el.dataset.k,v=el.dataset.v,a=S.me[k],i=a.indexOf(v);i>-1?a.splice(i,1):a.push(v);render()},
 next(){S.ui.step++;render(true)},prev(){S.ui.step--;render(true)},
 finish(){toast('Dein Geschenkprofil ist bereit.');location.hash='#profil'},
 edit(){S.ui.step=0;location.hash='#start'},
 preview(el){S.ui.preview=el.dataset.v==='1';render()},
 vis(el){const o=['alle','giver','privat'],k=el.dataset.k;S.me.vis[k]=o[(o.indexOf(S.me.vis[k]||'giver')+1)%3];render()},
 wf(el){S.ui.wf=el.dataset.v;render()},wc(el){S.ui.wc=el.dataset.v;render()},
 selbst(el){const w=S.me.wishes.find(x=>x.id===el.dataset.id);w.status=w.status==='selbst'?'offen':'selbst';toast(w.status==='selbst'?'Als selbst gekauft markiert. Schenkende sehen, dass du es schon hast.':'Wieder offen.');render()},
 prio(el){const w=S.me.wishes.find(x=>x.id===el.dataset.id);w.prio=w.prio%3+1;toast('Priorität: '+PRIO[w.prio]);render()},
 delw(el){S.me.wishes=S.me.wishes.filter(x=>x.id!==el.dataset.id);render()},
 modal(el){S.ui.modal=el.dataset.v;render();setTimeout(()=>document.querySelector('.sheet input,.sheet select')?.focus(),30)},
 close(){S.ui.modal=null;render()},
 azopen(){S.ui.az={q:'',text:'',res:null,title:'',price:'',c:'wohnen',searched:false};S.ui.modal='amazon';render();setTimeout(()=>$('#azq')?.focus(),30)},
 azq(el){S.ui.az.q=el.dataset.v;render()},
 azclip(){
  if(!navigator.clipboard?.readText){toast('Dein Browser erlaubt kein Einfügen per Knopf. Füge den Link mit Strg+V ins Feld ein.');return}
  navigator.clipboard.readText().then(azParse).catch(()=>toast('Zwischenablage nicht lesbar. Füge den Link mit Strg+V ins Feld ein.'));
 },
 reset(){if(confirm('Alle Änderungen verwerfen und die Beispieldaten wiederherstellen?'))resetState()},
 closebg(el,e){if(e.target===el)A.close()},
 liked(el){const g=S.me.history.find(x=>x.id===el.dataset.id),o=['ja','teils','nein'];g.liked=o[(o.indexOf(g.liked)+1)%3];render()},
 have(el){const g=S.me.history.find(x=>x.id===el.dataset.id);g.have=!g.have;render()},
 again(el){const g=S.me.history.find(x=>x.id===el.dataset.id);g.again=!g.again;render()},
 fb(el){
  const g=S.me.inbox.find(x=>x.id===el.dataset.id),v=el.dataset.v;
  if(v==='swap'){S.ui.swap=g.id;S.ui.swapSel=S.me.alts.slice(0,2);render();return}
  const map={love:['ja',true,true,'Schön. Giftly merkt sich, was dir gefällt.'],happy:['ja',true,true,'Gespeichert. Das fließt in künftige Empfehlungen ein.'],meh:['teils',true,false,'Gespeichert, nur für dich sichtbar.'],have:['teils',true,false,'Gespeichert. Ähnliches wird künftig nicht mehr vorgeschlagen.']};
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
  S.ui.swap=null;toast(`Simuliert: ${g.from} bekommt eine freundliche Nachricht, ohne Bewertung.`);render();
 },
 person(el){S.ui.person=el.dataset.id;S.ui.ideaRes=null;S.ui.idea='';render()},
 tab(el){S.ui.tab=el.dataset.v;render()},
 reserve(el){
  const p=S.people[S.ui.person],w=p.wishes.find(x=>x.id===el.dataset.id);w.res='me';
  toast(`Reserviert. ${p.name} sieht davon nichts, andere Schenkende sehen nur „reserviert“.`);
  if(el.dataset.stay){S.ui.ideaRes=null;S.ui.tab='wuensche'}render();
 },
 release(el){const w=S.people[S.ui.person].wishes.find(x=>x.id===el.dataset.id);w.res=null;render()},
 bought(el){const w=S.people[S.ui.person].wishes.find(x=>x.id===el.dataset.id);w.bought=true;toast('Als gekauft markiert. Die Überraschung bleibt erhalten.');render()},
 try(el){const p=S.people[S.ui.person];S.ui.idea=el.dataset.v;S.ui.ideaRes=check(p,el.dataset.v);render()},
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
 lookall(){const l=LOOKS.find(x=>x.id===S.ui.look),c=crea(l.cid);let n=0;l.objs.filter(o=>o.pid).forEach(o=>{const x=cprod(o.pid);if(!S.me.wishes.some(w=>w.pid===x.id)){S.me.wishes.unshift(W({t:x.t,c:x.c,prio:2,a:x.a,tone:x.tone,note:`Tipp von ${c.handle}: ${x.note}`,via:c.id,pid:x.id,kw:kwOf(x.t)}));n++}});toast(n?`${n} Teile auf deiner Wunschliste. Kauft jemand darüber, erhält ${c.handle} eine kleine Provision.`:'Alles schon auf deiner Wunschliste.');render()},
 style(el){const m=S.me;m.style=m.style||[];const id=el.dataset.id,i=m.style.findIndex(x=>x.id===id);if(i>-1){m.style.splice(i,1);toast('Stil-Vorbild entfernt.')}else{m.style.push({id});toast(`Gespeichert: In deinem Profil steht jetzt „${crea(id).scope} von ${crea(id).handle}“.`)}render()},
 cadd(el){const x=cprod(el.dataset.id),c=crea(el.dataset.cid);S.me.wishes.unshift(W({t:x.t,c:x.c,prio:2,a:x.a,tone:x.tone,note:`Tipp von ${c.handle}: ${x.note}`,via:c.id,pid:x.id,kw:kwOf(x.t)}));toast(`Auf deiner Wunschliste. Kauft jemand darüber, erhält ${c.handle} eine kleine Provision. Dir kostet das nichts.`);render()},
 cbuy(el){const c=crea(el.dataset.cid);toast(`Simuliert: Der Partnerlink öffnet sich. ${c.handle} erhält bei Kauf die Provision.`)},
 occ(el){S.ui.occ=el.dataset.v;S.ui.budget=el.dataset.v==='danke'?40:100;render()},
 dens(el){S.ui.big=el.dataset.v==='1';render()},
 suggest(el){S.ui.pickId=el.dataset.id;S.ui.modal='pick';render()},
 buy(el){const p=S.people[S.ui.person],w=p.wishes.find(x=>x.id===el.dataset.wid),pr=PRODUCTS.find(x=>x.id===el.dataset.id);w.res='me';S.ui.modal=null;S.ui.ideaRes=null;window.open(amazonUrl(pr),'_blank','noopener');toast(`Reserviert. „${pr.t}“ wurde bei Amazon geöffnet.`);render()}
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
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&S.ui.modal)A.close()});
document.addEventListener('submit',e=>{
  const f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();
  const fd=new FormData(f),kind=f.dataset.form;
  if(kind==='azsearch'){
    const q=(fd.get('q')||'').trim();S.ui.az.q=q;S.ui.az.searched=true;
    window.open(q?searchUrl.amazon(q):'https://www.amazon.de/?tag=jannst-21','_blank','noopener');return;
  }
  if(kind==='azlink'){azParse(fd.get('text')||'');return}
  if(kind==='azadd'){
    const z=S.ui.az,t=(fd.get('t')||'').trim();if(!t||!z.res||z.res.error)return;
    const c=fd.get('c');
    S.me.wishes.unshift(W({t,c,kind:'produkt',prio:2,link:z.res.url,price:parsePrice(fd.get('price')),a:cat(c).a,tone:cat(c).t,kw:kwOf(t)}));
    S.ui.modal=null;S.ui.az=null;S.ui.wf='offen';S.ui.wc='alle';toast('Auf deiner Wunschliste. Der Link zu Amazon ist gespeichert.');render();return;
  }
  if(kind==='child'){
    const name=(fd.get('name')||'').trim();if(!name)return;
    const id=nid('c');
    S.accounts[id]={id,name,age:+fd.get('age')||null,tone:Object.keys(S.accounts).length%6,managed:true,invited:[],interests:[],cats:[],brands:[],tries:[],nogos:[],alts:[],vis:{interests:'giver',cats:'giver',brands:'giver',tries:'giver',nogos:'giver',alts:'giver'},wishes:[],history:[],inbox:[]};
    switchTo(id);S.ui.step=0;toast(`Kind-Konto für ${name} angelegt. Richte jetzt das Profil ein.`);
    if(location.hash==='#start')render(true);else location.hash='#start';
    return;
  }
  if(kind==='custom'){const v=(fd.get('v')||'').trim(),k=fd.get('k');if(v&&!S.me[k].includes(v))S.me[k].push(v);render()}
  if(kind==='idea'){const v=(fd.get('idea')||'').trim();S.ui.idea=v;S.ui.ideaRes=v?check(S.people[S.ui.person],v):null;render()}
  if(kind==='gift'){
    const [y,mo]=(fd.get('when')||'2026-11').split('-');
    const what=fd.get('what').trim();
    S.me.history.unshift({id:nid('h'),what,from:fd.get('from').trim(),when:`${MONTHS[+mo-1]} ${y}`,liked:fd.get('liked'),have:fd.get('have')==='1',again:fd.get('again')==='1',a:'gift',tone:S.me.history.length%6,kw:kwOf(what)});
    S.ui.modal=null;toast('Geschenk eingetragen.');render();
  }
  if(kind==='wish'){
    const file=fd.get('img'),done=img=>{
      const c=fd.get('c'),t=fd.get('t').trim(),k=fd.get('kind');
      S.me.wishes.unshift(W({t,c,kind:k,prio:+fd.get('prio'),link:(fd.get('link')||'').trim(),price:parsePrice(fd.get('price')),occ:fd.getAll('occ'),budget:+fd.get('budget')||null,note:(fd.get('note')||'').trim(),vis:fd.get('vis'),a:k==='erlebnis'?'ticket':cat(c).a,tone:cat(c).t,img}));
      S.ui.modal=null;S.ui.wf='offen';S.ui.wc='alle';toast('Wunsch gespeichert.');render();
    };
    if(file&&file.size){const r=new FileReader();r.onload=()=>done(r.result);r.onerror=()=>done(null);r.readAsDataURL(file)}else done(null);
  }
});
