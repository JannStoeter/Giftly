import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/schibsted-grotesk/index.css';
import './styles/main.css';
import { initContent } from './cms/content.js';
import { illustration } from './lib/art.js';

document.querySelectorAll('.art[data-kind]').forEach(el=>el.insertAdjacentHTML('afterbegin',illustration(el.dataset.kind)));

const ROTATION=[
  ['Handkaffeemühle','Jonas liebt Kaffee und hat schon eine Siebträgermaschine.'],
  ['Keramik-Schnupperkurs','Lena möchte Keramik gern ausprobieren.'],
  ['Wildkräuter-Wanderung','Mira wandert gern. Ein Erlebnis statt noch eines Gegenstands.']
];
const t=document.getElementById('rot-t'),w=document.getElementById('rot-w');
if(t&&w&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  let i=0;
  setInterval(()=>{i=(i+1)%ROTATION.length;t.textContent=ROTATION[i][0];w.textContent=ROTATION[i][1]},4200);
}

/* Geschichte: Schritt für Schritt einblenden, sobald er sichtbar wird. Ohne JavaScript bleibt alles sichtbar. */
document.documentElement.classList.add('js');
document.querySelectorAll('.tstep').forEach(step=>step.querySelectorAll('.chip,.mini').forEach((el,i)=>el.style.setProperty('--i',i)));
const steps=document.querySelectorAll('.tstep');
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.35,rootMargin:'0px 0px -8% 0px'});
  steps.forEach(s=>io.observe(s));
}else steps.forEach(s=>s.classList.add('in'));

/* Texte aus der Datenbank, und der Einstieg in den Bearbeitungsmodus (wird erst bei Bedarf geladen). */
initContent();
const openCms=async e=>{e?.preventDefault();const m=await import('./cms/editor.js');m.openEditor()};
document.getElementById('cms-open')?.addEventListener('click',openCms);
if(location.search.includes('bearbeiten'))openCms();
