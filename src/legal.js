import '@fontsource/instrument-serif/400.css';
import '@fontsource-variable/schibsted-grotesk/index.css';
import './styles/main.css';

/* Datenschutz: Statistik für diesen Browser ein- oder ausschalten */
import { statsOff, setStatsOff } from './lib/track.js';
const tg=document.getElementById('stats-toggle'),st=document.getElementById('stats-state');
if(tg){
  const paint=()=>{const off=statsOff();tg.textContent=off?'Statistik wieder einschalten':'Statistik ausschalten';if(st)st.textContent=off?'Die Statistik ist für diesen Browser aus.':'Die Statistik ist an.'};
  tg.addEventListener('click',()=>{try{setStatsOff(localStorage.getItem('wishtale:no-stats')!=='1')}catch{}paint()});paint();
}
