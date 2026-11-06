import { sb } from '../lib/supabase.js';
import { esc } from './util.js';

const step = (t, body) => `<li><b>${t}</b>${body ? `<div class="muted">${body}</div>` : ''}</li>`;

export async function mount(el) {
  el.innerHTML = '<div class="head"><div><h1>Verbindungen</h1><p class="muted">Hier siehst du, was schon verbunden ist, und wie du Instagram und Google Ads anschließt.</p></div></div><p class="muted">Wird geprüft …</p>';
  let st = null, err = '';
  try { const { data: { session } } = await sb.auth.getSession(); const r = await fetch('/api/integrations', { headers: { authorization: 'Bearer ' + session.access_token } }); if (!r.ok) throw new Error((await r.json()).error || r.status); st = await r.json(); }
  catch (e) { err = String(e.message || e); }
  const pill = (ok, yes = 'Verbunden', no = 'Nicht verbunden') => `<span class="pill ${ok ? 'ok' : ''}">${ok ? yes : no}</span>`;
  el.innerHTML = `<div class="head"><div><h1>Verbindungen</h1><p class="muted">Hier siehst du, was schon verbunden ist, und wie du Instagram und Google Ads anschließt. Alle Schlüssel trägst du in Vercel ein, nie in dieses CMS und nie in eine Chat-Nachricht.</p></div></div>
  ${err ? `<div class="banner warn2" role="alert"><b>Der Status konnte nicht geladen werden.</b> ${esc(err)} Auf einer Vorschau ohne Server-Funktionen (npm run dev) geht das nicht, auf der echten Seite schon.</div>` : ''}
  <div class="card"><h2>Instagram ${st ? pill(st.instagram.configured, st.instagram.username ? 'Verbunden mit @' + esc(st.instagram.username) : 'Verbunden') : ''}</h2>
   ${st?.instagram.error ? `<p class="banner warn2" role="alert">${esc(st.instagram.error)}</p>` : ''}
   <p class="muted">Damit postest du Beiträge direkt aus dem Studio. Du brauchst ein Instagram-Geschäftskonto oder Creator-Konto, das mit einer Facebook-Seite verbunden ist.</p>
   <ol class="steps">
    ${step('1. Konto vorbereiten', 'Stelle @wishtale.de in der Instagram-App auf „Berufliches Konto“ und verbinde es unter Einstellungen mit einer Facebook-Seite für Wishtale.')}
    ${step('2. Meta-App anlegen', 'Auf developers.facebook.com eine App vom Typ „Business“ anlegen und das Produkt „Instagram“ hinzufügen. Berechtigungen: <code>instagram_basic</code>, <code>instagram_content_publish</code>, <code>pages_show_list</code>, <code>pages_read_engagement</code>.')}
    ${step('3. Token erzeugen', 'Im Graph API Explorer ein Nutzer-Token mit diesen Berechtigungen erzeugen und in ein langlebiges Token (60 Tage) umtauschen. Dein Konto als Tester oder Entwickler der App eintragen, dann ist keine Meta-Prüfung nötig, solange du nur dein eigenes Konto bedienst.')}
    ${step('4. Instagram-ID finden', 'Abfrage <code>/me/accounts</code> liefert deine Facebook-Seite, danach <code>/{seiten-id}?fields=instagram_business_account</code> liefert die Instagram-ID.')}
    ${step('5. In Vercel eintragen', `Projekt <b>wishtale</b> › Settings › Environment Variables: <code>META_ACCESS_TOKEN</code> und <code>META_IG_USER_ID</code>. Danach neu deployen.`)}
   </ol>
   <p class="hint">Hinweis: Das langlebige Token läuft nach etwa 60 Tagen ab, dann musst du ein neues eintragen. Der Status oben zeigt dir, wenn es nicht mehr funktioniert.</p></div>
  <div class="card"><h2>Geplante Beiträge ${st ? pill(st.cron.secret && st.cron.serviceKey && st.instagram.configured, 'Bereit', 'Nicht bereit') : ''}</h2>
   <p class="muted">Damit Beiträge zur geplanten Zeit automatisch erscheinen, ruft Vercel täglich um 7 Uhr (UTC) eine Funktion auf. Dafür brauchst du in Vercel zusätzlich:</p>
   <ol class="steps">${step('<code>CRON_SECRET</code>', 'Eine lange zufällige Zeichenfolge, die du dir ausdenkst. Vercel schickt sie beim Aufruf mit. ' + (st ? pill(st.cron.secret, 'Gesetzt', 'Fehlt') : ''))}
   ${step('<code>SUPABASE_SERVICE_ROLE_KEY</code>', 'In Supabase unter Project Settings › API Keys der geheime Schlüssel (secret). Er darf niemals im Browser oder im Chat landen. ' + (st ? pill(st.cron.serviceKey, 'Gesetzt', 'Fehlt') : ''))}</ol>
   <p class="hint">Der kostenlose Vercel-Plan erlaubt nur eine Prüfung pro Tag. Beiträge erscheinen deshalb bis zu 24 Stunden nach der geplanten Zeit. Mit „Jetzt auf Instagram posten“ geht es sofort.</p></div>
  <div class="card"><h2>Google Ads ${st ? pill(st.googleAds.configured) : ''}</h2>
   <p class="muted">Damit siehst du Kampagnen mit Kosten und Klicks, pausierst sie, änderst das Tagesbudget und legst aus einem Plan eine neue Kampagne an (immer pausiert, damit nichts ungeprüft Geld kostet).</p>
   <ol class="steps">
    ${step('1. Google-Ads-Konto', 'Konto auf ads.google.com anlegen und die Kunden-ID notieren (10 Ziffern, oben rechts).')}
    ${step('2. Entwickler-Token', 'Im Google-Ads-Konto unter Tools › API-Center das Entwickler-Token beantragen. Mit einem Test-Token geht es sofort, für echte Kampagnen prüft Google den Antrag (meist einige Tage).')}
    ${step('3. OAuth-Client', 'In der Google Cloud Console ein Projekt anlegen, die „Google Ads API“ aktivieren und einen OAuth-Client (Typ „Webanwendung“) anlegen. Client-ID und Secret notieren.')}
    ${step('4. Refresh-Token', 'Im OAuth Playground (developers.google.com/oauthplayground) mit eigenem Client, Bereich <code>https://www.googleapis.com/auth/adwords</code>, ein Refresh-Token erzeugen.')}
    ${step('5. In Vercel eintragen', '<code>GOOGLE_ADS_DEVELOPER_TOKEN</code>, <code>GOOGLE_ADS_CLIENT_ID</code>, <code>GOOGLE_ADS_CLIENT_SECRET</code>, <code>GOOGLE_ADS_REFRESH_TOKEN</code>, <code>GOOGLE_ADS_CUSTOMER_ID</code> (ohne Bindestriche). Bei einem Verwaltungskonto zusätzlich <code>GOOGLE_ADS_LOGIN_CUSTOMER_ID</code>. Danach neu deployen.')}
   </ol>
   <p class="hint">Hinweis: Wer Conversion-Messung oder Remarketing nutzt, braucht ein Einwilligungsbanner und eine angepasste Datenschutzerklärung. Das Steuern über das CMS setzt keine Google-Skripte auf deiner Seite ein.</p></div>`;
}
