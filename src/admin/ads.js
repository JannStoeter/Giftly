import { list, save, remove } from './api.js';
import { esc, toast, lines } from './util.js';

const HL = 30, DL = 90;
const empty = () => ({ name: '', status: 'draft', budget_daily: '', final_url: 'https://wishtale.de', keywords: [], headlines: [], descriptions: [], utm_campaign: '', notes: '' });
const utmUrl = p => { try { const u = new URL(p.final_url); u.searchParams.set('utm_source', 'google'); u.searchParams.set('utm_medium', 'cpc'); if (p.utm_campaign) u.searchParams.set('utm_campaign', p.utm_campaign); return u.href; } catch { return ''; } };
const csv = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';

/** CSV für den Google Ads Editor (Import: Datei > Importieren > Aus Datei). */
export function toCsv(p) {
  const hs = p.headlines.slice(0, 15), ds = p.descriptions.slice(0, 4), url = utmUrl(p);
  const head = ['Campaign', 'Ad group', 'Keyword', 'Criterion Type', ...hs.map((_, i) => `Headline ${i + 1}`), ...ds.map((_, i) => `Description ${i + 1}`), 'Final URL', 'Daily budget'];
  const rows = [head.map(csv).join(',')];
  rows.push([p.name, '', '', '', ...hs.map(() => ''), ...ds.map(() => ''), '', p.budget_daily || ''].map(csv).join(','));
  p.keywords.forEach(k => rows.push([p.name, p.name + ' – Anzeigengruppe', k.replace(/^["\[]|["\]]$/g, ''), /^\[/.test(k) ? 'Exact' : /^"/.test(k) ? 'Phrase' : 'Broad', ...hs.map(() => ''), ...ds.map(() => ''), '', ''].map(csv).join(',')));
  rows.push([p.name, p.name + ' – Anzeigengruppe', '', 'Responsive search ad', ...hs, ...ds, url, ''].map(csv).join(','));
  return rows.join('\n');
}
export const problems = p => {
  const out = [];
  if (p.headlines.length < 3) out.push('Mindestens 3 Überschriften nötig (bis 15).');
  if (p.descriptions.length < 2) out.push('Mindestens 2 Beschreibungen nötig (bis 4).');
  p.headlines.forEach((h, i) => h.length > HL && out.push(`Überschrift ${i + 1} ist ${h.length - HL} Zeichen zu lang (max. ${HL}).`));
  p.descriptions.forEach((d, i) => d.length > DL && out.push(`Beschreibung ${i + 1} ist ${d.length - DL} Zeichen zu lang (max. ${DL}).`));
  if (!utmUrl(p)) out.push('Die Ziel-Adresse ist ungültig.');
  if (!p.keywords.length) out.push('Noch keine Suchbegriffe.');
  return out;
};

export async function mount(el) {
  let rows = [], edit = null;
  const load = async () => { rows = await list('ad_plans', 'updated_at', false); draw(); };
  const cur = () => ({ ...edit, headlines: lines(edit._h ?? edit.headlines.join('\n')), descriptions: lines(edit._d ?? edit.descriptions.join('\n')), keywords: lines(edit._k ?? edit.keywords.join('\n')) });
  const preview = () => { const p = cur(), h = p.headlines.slice(0, 3); return `<div class="adprev"><span class="adtag">Anzeige</span> <span class="muted">${esc(p.final_url.replace(/^https:\/\//, ''))}</span><div class="adh">${esc(h.join(' | ') || 'Deine Überschriften erscheinen hier')}</div><div>${esc(p.descriptions[0] || 'Deine Beschreibung erscheint hier.')}</div></div>`; };
  const check = () => { const p = cur(), pr = problems(p); return pr.length ? `<ul class="warn">${pr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="pill ok">Bereit für den Export</p>'; };
  const form = () => `<form class="card" data-f="ad" style="margin:16px 0"><h2>${edit.id ? 'Anzeigenplan bearbeiten' : 'Neuer Anzeigenplan'}</h2>
   <div class="grid2"><div class="fld"><label for="a-n">Name der Kampagne</label><input id="a-n" name="name" class="inp" required maxlength="120" value="${esc(edit.name)}" placeholder="z. B. Weihnachten Suche"></div>
   <div class="fld"><label for="a-b">Tagesbudget in Euro</label><input id="a-b" name="budget_daily" class="inp" inputmode="decimal" value="${esc(edit.budget_daily ?? '')}"></div>
   <div class="fld"><label for="a-u">Ziel-Adresse</label><input id="a-u" name="final_url" class="inp" required inputmode="url" value="${esc(edit.final_url)}"></div>
   <div class="fld"><label for="a-c">Kampagnen-Kürzel für Auswertung (a–z, 0–9, -, _)</label><input id="a-c" name="utm_campaign" class="inp" maxlength="60" pattern="[a-z0-9_\\-]*" value="${esc(edit.utm_campaign)}" placeholder="weihnachten-2026"></div>
   <div class="fld wide"><label for="a-h">Überschriften (eine pro Zeile, höchstens ${HL} Zeichen, 3 bis 15)</label><textarea id="a-h" name="_h" class="ta" rows="6" data-count="${HL}">${esc((edit._h ?? edit.headlines.join('\n')))}</textarea><p class="hint" data-for="a-h"></p></div>
   <div class="fld wide"><label for="a-d">Beschreibungen (eine pro Zeile, höchstens ${DL} Zeichen, 2 bis 4)</label><textarea id="a-d" name="_d" class="ta" rows="4" data-count="${DL}">${esc((edit._d ?? edit.descriptions.join('\n')))}</textarea><p class="hint" data-for="a-d"></p></div>
   <div class="fld wide"><label for="a-k">Suchbegriffe (eine pro Zeile; [genau], "Wortgruppe" oder frei)</label><textarea id="a-k" name="_k" class="ta" rows="5">${esc((edit._k ?? edit.keywords.join('\n')))}</textarea></div>
   <div class="fld wide"><label for="a-no">Notizen</label><textarea id="a-no" name="notes" class="ta">${esc(edit.notes)}</textarea></div>
   <div class="fld"><label for="a-s">Status</label><select id="a-s" name="status" class="sel">${[['draft', 'Entwurf'], ['live', 'Läuft in Google Ads'], ['paused', 'Pausiert']].map(([k, v]) => `<option value="${k}" ${edit.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
   <div id="adprev">${preview()}</div><div id="adchk">${check()}</div>
   <p class="hint">Tracking-Link: <code>${esc(utmUrl(cur()))}</code></p>
   <div class="row"><button class="btn pri" type="submit">Speichern</button><button class="btn sec" type="button" data-a="csv">CSV für Google Ads Editor</button><button class="btn ghost" type="button" data-a="cancel">Abbrechen</button>${edit.id ? '<button class="btn ghost danger" type="button" data-a="del">Löschen</button>' : ''}</div></form>`;
  const draw = () => {
    el.innerHTML = `<div class="head"><div><h1>Google Ads</h1><p class="muted">Hier planst du Suchanzeigen, prüfst die Längen und exportierst alles für den Google Ads Editor.</p></div><button class="btn pri" data-a="new">Plan hinzufügen</button></div>
    <div class="banner"><b>Noch nicht mit Google Ads verbunden.</b> Anzeigen werden hier geplant und als Datei in den Google Ads Editor geladen. Eine direkte Steuerung (Budget, Pausieren, Auswertung) braucht einen Zugang zur Google-Ads-Schnittstelle mit Entwickler-Token. Das richten wir ein, sobald du ein Google-Ads-Konto hast.</div>
    <div class="banner warn2"><b>Datenschutz:</b> Für Conversion-Messung oder Remarketing von Google braucht die Seite ein Einwilligungsbanner, und die Datenschutzerklärung muss angepasst werden. Das ist bisher nicht eingebaut, die Seite setzt keine Google-Skripte ein.</div>
    ${edit ? form() : ''}<div class="tablewrap"><table><thead><tr><th>Plan</th><th>Budget</th><th>Status</th><th></th></tr></thead><tbody>
    ${rows.map(r => `<tr><td><b>${esc(r.name)}</b><br><span class="muted">${r.headlines.length} Überschriften, ${r.keywords.length} Suchbegriffe</span></td><td>${r.budget_daily ? esc(r.budget_daily) + ' € pro Tag' : ''}</td><td><span class="pill ${r.status === 'live' ? 'ok' : r.status === 'paused' ? 'gold' : ''}">${{ draft: 'Entwurf', live: 'Läuft', paused: 'Pausiert' }[r.status]}</span></td><td class="actions"><button class="btn sec sm" data-a="edit" data-id="${r.id}">Bearbeiten</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Noch keine Pläne.</td></tr>'}</tbody></table></div>`;
    countHints();
  };
  const countHints = () => el.querySelectorAll('textarea[data-count]').forEach(t => { const max = +t.dataset.count, hint = el.querySelector(`[data-for="${t.id}"]`); if (hint) hint.innerHTML = lines(t.value).map((l, i) => `<span class="${l.length > max ? 'over' : ''}">${i + 1}: ${l.length}/${max}</span>`).join(' · '); });
  el.oninput = e => {
    if (!edit || !e.target.name) return;
    edit[e.target.name] = e.target.value;
    if (e.target.matches('textarea[data-count]')) countHints();
    if (e.target.name.startsWith('_') || e.target.name === 'final_url' || e.target.name === 'utm_campaign') { el.querySelector('#adprev').innerHTML = preview(); el.querySelector('#adchk').innerHTML = check(); const h = el.querySelector('.hint code'); if (h) h.textContent = utmUrl(cur()); }
  };
  el.onclick = async e => {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, r = rows.find(x => x.id === b.dataset.id);
    try {
      if (a === 'new') { edit = empty(); draw(); }
      else if (a === 'edit') { edit = { ...r }; draw(); window.scrollTo(0, 0); }
      else if (a === 'cancel') { edit = null; draw(); }
      else if (a === 'csv') { const p = cur(), pr = problems(p); if (pr.length && !confirm('Es gibt noch Hinweise:\n\n' + pr.join('\n') + '\n\nTrotzdem exportieren?')) return; const url = URL.createObjectURL(new Blob(['﻿' + toCsv(p)], { type: 'text/csv;charset=utf-8' })); const l = document.createElement('a'); l.href = url; l.download = 'google-ads-' + (p.utm_campaign || 'plan') + '.csv'; l.click(); URL.revokeObjectURL(url); }
      else if (a === 'del') { if (confirm('Diesen Plan wirklich löschen?')) { await remove('ad_plans', edit.id); edit = null; await load(); } }
    } catch (err) { toast('Das hat nicht geklappt: ' + (err.message || err), true); }
  };
  el.onsubmit = async e => {
    e.preventDefault(); const p = cur(), b = parseFloat(String(edit.budget_daily).replace(',', '.'));
    const row = { ...(edit.id ? { id: edit.id } : {}), name: p.name.trim(), status: p.status, budget_daily: Number.isFinite(b) && b > 0 ? b : null, final_url: p.final_url.trim(), keywords: p.keywords, headlines: p.headlines, descriptions: p.descriptions, utm_campaign: (p.utm_campaign || '').trim(), notes: p.notes || '' };
    try { await save('ad_plans', row); toast('Gespeichert.'); edit = null; await load(); } catch (err) { toast('Das hat nicht geklappt: ' + (err.message || err), true); }
  };
  await load();
}
