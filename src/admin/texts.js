import { sb } from '../lib/supabase.js';
import { esc, toast, fmtDate } from './util.js';

export async function mount(el) {
  let rows = [], hist = null;
  const load = async () => { const { data, error } = await sb.from('site_content').select('*').order('key'); if (error) throw error; rows = data; draw(); };
  const draw = () => {
    el.innerHTML = `<div class="head"><div><h1>Seitentexte</h1><p class="muted">Texte der Landingpage direkt auf der Seite bearbeiten, mit Verlauf und Zurücksetzen. Hier siehst du alle Texte, die du gegenüber dem Standard geändert hast.</p></div><a class="btn pri" href="../?bearbeiten" target="_blank" rel="noopener">Landingpage bearbeiten</a></div>
    ${hist ? `<div class="card"><h2>Verlauf: ${esc(hist.key)}</h2><ul class="hist">${hist.items.map(h => `<li><span class="muted">${fmtDate(h.changed_at)}</span><br><b>Neu:</b> ${esc(h.new_value ?? '(gelöscht)')}<br><b>Vorher:</b> ${esc(h.old_value ?? '(neu)')} ${h.old_value ? `<button class="btn ghost sm" data-a="restore" data-key="${esc(hist.key)}" data-v="${esc(h.old_value)}">Diese Fassung zurückholen</button>` : ''}</li>`).join('') || '<li class="muted">Noch kein Verlauf.</li>'}</ul><button class="btn ghost" data-a="closehist">Schließen</button></div>` : ''}
    <div class="tablewrap"><table><thead><tr><th>Schlüssel</th><th>Geänderter Text</th><th>Zuletzt</th><th></th></tr></thead><tbody>
    ${rows.map(r => `<tr><td><code>${esc(r.key)}</code></td><td>${esc(r.value)}</td><td>${fmtDate(r.updated_at)}</td><td class="actions"><button class="btn sec sm" data-a="hist" data-key="${esc(r.key)}">Verlauf</button> <button class="btn ghost sm danger" data-a="reset" data-key="${esc(r.key)}">Auf Standard zurücksetzen</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">Noch keine eigenen Änderungen. Alle Texte sind noch im Standard.</td></tr>'}</tbody></table></div>`;
  };
  el.onclick = async e => {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, key = b.dataset.key;
    try {
      if (a === 'hist') { const { data, error } = await sb.from('site_content_history').select('*').eq('key', key).order('changed_at', { ascending: false }).limit(20); if (error) throw error; hist = { key, items: data }; draw(); }
      else if (a === 'closehist') { hist = null; draw(); }
      else if (a === 'restore') { const { error } = await sb.from('site_content').upsert({ key, value: b.dataset.v }); if (error) throw error; toast('Die Fassung ist zurückgeholt.'); hist = null; await load(); }
      else if (a === 'reset') { if (!confirm('Diesen Text auf den Standard zurücksetzen?')) return; const { error } = await sb.from('site_content').delete().eq('key', key); if (error) throw error; toast('Zurückgesetzt.'); await load(); }
    } catch (err) { toast('Das hat nicht geklappt: ' + (err.message || err), true); }
  };
  await load();
}
