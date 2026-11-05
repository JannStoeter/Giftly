import './styles/main.css';
import { loadState } from './state.js';
import { S } from './state.js';
import { sb } from './lib/supabase.js';
import { enter } from './lib/auth.js';
import { route } from './render.js';
import './actions.js';

async function boot(){
  loadState(); // Demo-Daten (nur ohne Konto relevant)
  // Verarbeitet auch Login-Links aus E-Mails (Tokens im URL-Fragment), bevor der Router läuft.
  let session=null;
  try{ session=(await sb.auth.getSession()).data.session; }catch(e){ console.error(e); }
  const fromLink=/access_token|error_description/.test(location.hash);
  if(session){
    await enter(session.user);
    if(fromLink||!location.hash||location.hash==='#login'){
      const a=S.accounts.me;
      history.replaceState(null,'',location.pathname+(a&&!a.interests.length&&!a.wishes.length?'#start':'#profil'));
    }
  }else if(fromLink){
    history.replaceState(null,'',location.pathname+'#login');
  }
  window.addEventListener('hashchange',route);
  route();

  sb.auth.onAuthStateChange((event,sess)=>{
    // nicht direkt in der Callback-Funktion auf Supabase warten (Deadlock-Gefahr), daher setTimeout
    setTimeout(async()=>{
      if(event==='SIGNED_IN'&&sess&&!S.auth.user){
        await enter(sess.user);
        const a=S.accounts.me;
        location.hash=a&&!a.interests.length&&!a.wishes.length?'#start':'#profil';
        route();
      }else if(event==='SIGNED_OUT'&&S.auth.user){
        S.auth.user=null;location.hash='#login';location.reload();
      }
    },0);
  });
}
boot();
