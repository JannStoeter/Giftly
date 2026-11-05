import { sb } from './supabase.js';
import { S } from '../state.js';
import { loadMine } from './remote.js';

export const redirectUrl = () => location.origin + location.pathname;

export function friendly(err) {
  const m = (err && (err.message || String(err))) || '';
  const c = err && err.code;
  if (/invalid login credentials/i.test(m)) return 'E-Mail oder Passwort stimmt nicht.';
  if (/email not confirmed/i.test(m)) return 'Bitte bestätige zuerst deine E-Mail. Wir haben dir einen Link geschickt.';
  if (/already registered|already been registered/i.test(m)) return 'Diese E-Mail ist schon registriert. Bitte melde dich an.';
  if (/password should be at least|weak/i.test(m)) return 'Das Passwort ist zu kurz oder zu einfach (mindestens 8 Zeichen).';
  if (c === 'over_email_send_rate_limit' || /rate limit|too many/i.test(m)) return 'Zu viele E-Mails in kurzer Zeit. Bitte warte ein paar Minuten.';
  if (/invalid.*email|unable to validate email/i.test(m)) return 'Diese E-Mail-Adresse sieht ungültig aus.';
  if (/failed to fetch|network/i.test(m)) return 'Keine Verbindung zum Server. Bitte prüfe dein Internet.';
  return m || 'Das hat nicht geklappt. Bitte versuche es noch einmal.';
}

export const signIn = (email, password) => sb.auth.signInWithPassword({ email, password });
export const signUp = (name, email, password) =>
  sb.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: redirectUrl() } });
export const magicLink = email =>
  sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectUrl(), shouldCreateUser: true } });
export const signOut = () => sb.auth.signOut();

/** Nach dem Login: eigene Daten laden. */
export async function enter(user) {
  S.auth.user = user;
  S.auth.error = '';
  try { await loadMine(user); }
  catch (e) { S.auth.error = friendly(e); console.error(e); }
}
