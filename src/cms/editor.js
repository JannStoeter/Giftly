/*
 * Bearbeitungsmodus für die Landingpage. Wird erst geladen, wenn jemand auf "Seite bearbeiten" klickt.
 * Anmelden, Admin-Recht prüfen, Texte direkt auf der Seite ändern, speichern oder auf den Standard zurücksetzen.
 */
import { sb } from '../lib/supabase.js';
import { nodes, toRaw, applyMap, fetchMap, cacheMap } from './content.js';

const st = { on: false, dirty: new Map(), map: {}, bar: null, focus: null, modal: null };
const plainOnly = (() => { const d = document.createElement('div'); d.setAttribute('contenteditable', 'plaintext-only'); return d.contentEditable === 'plaintext-only'; })();

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => (k === 'class' ? (e.className = v) : k.startsWith('on') ? e.addEventListener(k.slice(2), v) : e.setAttribute(k, v)));
  kids.flat().forEach(k => e.append(k));
  return e;
};

function toast(msg) {
  document.querySelectorAll('.toast').forEach(x => x.remove());
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 4200);
}

/* ---------- Anmeldung ---------- */
function closeModal() { st.modal?.remove(); st.modal = null; }
function modal(title, body) {
  closeModal();
  st.modal = h('div', { class: 'scrim', onclick: e => { if (e.target === st.modal) closeModal(); } },
    h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' }, h('h2', {}, title), body));
  document.body.append(st.modal);
  return st.modal;
}

function showLogin(note = '') {
  const email = h('input', { class: 'inp', type: 'email', required: '', autocomplete: 'email', id: 'cms-mail' });
  const pw = h('input', { class: 'inp', type: 'password', required: '', autocomplete: 'current-password', id: 'cms-pw' });
  const msg = h('p', { class: 'muted', style: 'font-size:14px;margin-bottom:10px' }, note || 'Melde dich mit deinem Wishtale-Konto an, um die Texte dieser Seite zu bearbeiten.');
  const go = h('button', { class: 'btn pri', type: 'submit' }, 'Anmelden');
  const form = h('form', { class: 'authform', onsubmit: async e => {
    e.preventDefault(); go.disabled = true;
    const { error } = await sb.auth.signInWithPassword({ email: email.value.trim(), password: pw.value });
    go.disabled = false;
    if (error) { msg.textContent = /invalid/i.test(error.message) ? 'E-Mail oder Passwort stimmt nicht.' : error.message; return; }
    closeModal(); enter();
  } },
    msg,
    h('div', { class: 'fld' }, h('label', { for: 'cms-mail' }, 'E-Mail'), email),
    h('div', { class: 'fld' }, h('label', { for: 'cms-pw' }, 'Passwort'), pw),
    h('div', { class: 'row', style: 'justify-content:flex-end;gap:8px' }, h('button', { class: 'btn ghost', type: 'button', onclick: closeModal }, 'Abbrechen'), go));
  modal('Seite bearbeiten', form);
  email.focus({ preventScroll: true });
}

function showNoRights() {
  modal('Keine Berechtigung', h('div', {},
    h('p', { class: 'muted' }, 'Dein Konto darf die Texte dieser Seite nicht bearbeiten. Dafür muss die E-Mail-Adresse in Supabase als Administrator freigegeben und bestätigt sein.'),
    h('div', { class: 'row', style: 'justify-content:flex-end;gap:8px;margin-top:12px' },
      h('button', { class: 'btn ghost', onclick: async () => { await sb.auth.signOut(); closeModal(); } }, 'Abmelden'),
      h('button', { class: 'btn pri', onclick: closeModal }, 'Schließen'))));
}

/* ---------- Einstieg ---------- */
export async function openEditor() {
  if (st.on) return;
  const { data } = await sb.auth.getSession();
  if (!data.session) return showLogin();
  enter();
}

async function enter() {
  let { data: ok } = await sb.rpc('is_admin');
  if (!ok) { const c = await sb.rpc('claim_admin'); ok = c.data === true; }
  if (!ok) return showNoRights();
  try { st.map = await fetchMap(); } catch { st.map = {}; }
  start();
}

/* ---------- Bearbeiten ---------- */
const nodeFor = k => nodes().find(n => n.dataset.edit === k);
const rawNow = el => el.textContent.replace(/ /g, ' ').trim();

function onInput(e) {
  const el = e.currentTarget, k = el.dataset.edit;
  const base = st.map[k] ?? el.getAttribute('data-def');
  const val = rawNow(el);
  if (val === base) { st.dirty.delete(k); el.classList.remove('dirty'); } else { st.dirty.set(k, val); el.classList.add('dirty'); }
  updateBar();
}
const onKey = e => { if (e.key === 'Enter') e.preventDefault(); };
const onPaste = e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\s*\n\s*/g, ' ')); };
const blockLinks = e => { if (e.target.closest('a') && e.target.closest('[data-edit]')) e.preventDefault(); };

function start() {
  st.on = true;
  document.body.classList.add('cms-edit');
  document.querySelectorAll('.tstep').forEach(s => s.classList.add('in'));
  nodes().forEach(el => {
    if (!el.hasAttribute('data-def')) el.setAttribute('data-def', toRaw(el));
    el.textContent = st.map[el.dataset.edit] ?? el.getAttribute('data-def');
    el.classList.toggle('dirty', false);
    el.setAttribute('contenteditable', plainOnly ? 'plaintext-only' : 'true');
    el.setAttribute('spellcheck', 'true');
    el.addEventListener('input', onInput); el.addEventListener('keydown', onKey); el.addEventListener('paste', onPaste);
    el.addEventListener('focus', () => { st.focus = el; });
  });
  document.addEventListener('click', blockLinks, true);
  mountBar();
}

function mountBar() {
  const count = h('span', { class: 'cms-count' }, 'Keine Änderungen');
  const save = h('button', { class: 'btn gold sm', 'data-cms': 'save', disabled: '', onclick: save_ }, 'Speichern');
  st.bar = h('div', { class: 'cms-bar', role: 'region', 'aria-label': 'Bearbeitungsmodus' },
    h('span', { class: 'cms-title' }, 'Bearbeitungsmodus'), count,
    h('span', { class: 'cms-hint' }, 'Mit *Sternchen* wird ein Wort kursiv.'),
    h('button', { class: 'btn sm cms-ghost', onclick: resetFocused }, 'Diesen Text zurücksetzen'),
    save,
    h('button', { class: 'btn sm cms-ghost', onclick: exit }, 'Beenden'));
  document.body.append(st.bar);
}

function updateBar() {
  const n = st.dirty.size;
  st.bar.querySelector('.cms-count').textContent = n ? `${n} ${n === 1 ? 'Änderung' : 'Änderungen'}` : 'Keine Änderungen';
  const b = st.bar.querySelector('[data-cms=save]');
  if (n) b.removeAttribute('disabled'); else b.setAttribute('disabled', '');
}

function resetFocused() {
  const el = st.focus; if (!el) return toast('Klicke zuerst in den Text, den du zurücksetzen möchtest.');
  el.textContent = el.getAttribute('data-def');
  el.dispatchEvent(new Event('input'));
  // Standardtext: soll beim Speichern den Eintrag in der Datenbank löschen
  if (st.map[el.dataset.edit] != null) { st.dirty.set(el.dataset.edit, el.getAttribute('data-def')); el.classList.add('dirty'); updateBar(); }
}

async function save_() {
  const up = [], del = [];
  for (const [k, v] of st.dirty) {
    const def = nodeFor(k)?.getAttribute('data-def');
    if (!v || v === def) del.push(k); else up.push({ key: k, value: v.slice(0, 2000) });
  }
  const btn = st.bar.querySelector('[data-cms=save]'); btn.setAttribute('disabled', '');
  if (up.length) { const { error } = await sb.from('site_content').upsert(up); if (error) { btn.removeAttribute('disabled'); return toast('Nicht gespeichert: ' + error.message); } }
  if (del.length) { const { error } = await sb.from('site_content').delete().in('key', del); if (error) { btn.removeAttribute('disabled'); return toast('Nicht gespeichert: ' + error.message); } }
  up.forEach(r => { st.map[r.key] = r.value; }); del.forEach(k => delete st.map[k]);
  st.dirty.clear(); nodes().forEach(n => n.classList.remove('dirty'));
  cacheMap(st.map); updateBar();
  toast('Gespeichert. Die Änderungen sind sofort für alle sichtbar.');
}

function exit() {
  if (st.dirty.size && !confirm('Du hast noch nicht gespeicherte Änderungen. Möchtest du den Bearbeitungsmodus wirklich beenden?')) return;
  nodes().forEach(el => {
    el.removeAttribute('contenteditable'); el.removeAttribute('spellcheck'); el.classList.remove('dirty');
    el.removeEventListener('input', onInput); el.removeEventListener('keydown', onKey); el.removeEventListener('paste', onPaste);
  });
  document.removeEventListener('click', blockLinks, true);
  applyMap(st.map);
  st.bar?.remove(); st.bar = null; st.dirty.clear(); st.on = false;
  document.body.classList.remove('cms-edit');
}
