import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/schibsted-grotesk/index.css';
import './styles/main.css';
import { loadState } from './state.js';
import { S } from './state.js';
import { sb } from './lib/supabase.js';
import { enter, adoptDraft } from './lib/auth.js';
import { toast } from './lib/util.js';
import { route } from './render.js';
import './actions.js';
import { loadPromo } from './lib/promo.js';

async function boot(){
  loadState(); // Demo-Daten (nur ohne Konto relevant)
  // Verarbeitet auch Login-Links aus E-Mails (Tokens im URL-Fragment), bevor der Router läuft.
  let session=null;
  try{ session=(await sb.auth.getSession()).data.session; }catch(e){ console.error(e); }
  const fromLink=/access_token|error_description/.test(location.hash);
  if(session){
    await enter(session.user);
    const adopted=adoptDraft();
    if(adopted){
      history.replaceState(null,'',location.pathname+'#wuensche');
      setTimeout(()=>toast('Dein Wishtale ist angelegt. Jetzt fehlen nur noch deine Wünsche.'),400);
    }else if(fromLink||!location.hash||['#login','#anmelden','#registrieren','#demo'].includes(location.hash)){
      const a=S.accounts.me;
      history.replaceState(null,'',location.pathname+(a&&!a.interests.length&&!a.wishes.length?'#start':'#profil'));
    }
  }else if(fromLink){
    history.replaceState(null,'',location.pathname+'#anmelden');
  }
  window.addEventListener('hashchange',route);
  route();
  loadPromo().then(p=>{S.promo=p;if(['entdecken','gast'].includes(S.ui.view)&&!S.ui.modal)route()});

  sb.auth.onAuthStateChange((event,sess)=>{
    // nicht direkt in der Callback-Funktion auf Supabase warten (Deadlock-Gefahr), daher setTimeout
    setTimeout(async()=>{
      if(event==='SIGNED_IN'&&sess&&!S.auth.user){
        await enter(sess.user);
        const adopted=adoptDraft();
        const a=S.accounts.me;
        location.hash=adopted?'#wuensche':a&&!a.interests.length&&!a.wishes.length?'#start':'#profil';
        route();
        if(adopted)toast('Dein Wishtale ist angelegt. Jetzt fehlen nur noch deine Wünsche.');
      }else if(event==='SIGNED_OUT'&&S.auth.user){
        S.auth.user=null;location.hash='#anmelden';location.reload();
      }
    },0);
  });
}
boot();
