export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const money = n => (n == null || n === '' ? '' : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(+n));
export const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'post';
/** datetime-local <-> ISO */
export const toLocal = iso => { if (!iso) return ''; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
export const fromLocal = v => (v ? new Date(v).toISOString() : null);
export const fmtDate = iso => (iso ? new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' }) : '');
let t;
export function toast(msg, bad) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.className = 'show' + (bad ? ' bad' : '');
  clearTimeout(t); t = setTimeout(() => el.classList.remove('show'), 4200);
}
export const lines = v => String(v || '').split('\n').map(x => x.trim()).filter(Boolean);
