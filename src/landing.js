import './styles/main.css';
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
