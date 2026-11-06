import { list, save, remove } from './api.js';
import { esc, toast, toLocal, fromLocal, fmtDate } from './util.js';
import { suggest } from './occasions.js';
import { buildCampaignPost } from './ideas.js';

const PLACES = { landing: 'Banner auf der Landingpage', app: 'Inspiration in der App' };
const empty = () => { const s = new Date(), e = new Date(Date.now() + 7 * 864e5); return { title: '', headline: '', body: '', cta_label: '', cta_url: '', placement: ['app'], product_ids: [], starts_at: s.toISOString(), ends_at: e.toISOString(), active: true }; };
const state = c => { const n = Date.now(); if (!c.active) return ['Aus', '']; if (new Date(c.starts_at) > n) return ['Geplant', 'gold']; if (new Date(c.ends_at) < n) return ['Beendet', '']; return ['Läuft', 'ok']; };

export async function mount(el) {
  let rows = [], prods = [], edit = null;
  const load = async () => { [rows, prods] = await Promise.all([list('campaigns', 'starts_at', false), list('products', 'sort', true)]); draw(); };
  const form = () => `<form class="card" data-f="c" style="margin:16px 0"><h2>${edit.id ? 'Aktion bearbeiten' : 'Neue Aktion'}</h2>
   <div class="grid2">
    <div class="fld wide"><label for="c-title">Interner Name</label><input id="c-title" name="title" class="inp" required maxlength="120" value="${esc(edit.title)}" placeholder="z. B. Black Friday 2026"></div>
    <div class="fld wide"><label for="c-head">Überschrift (sieht jeder)</label><input id="c-head" name="headline" class="inp" maxlength="120" value="${esc(edit.headline)}" placeholder="z. B. Geschenkideen zur Weihnachtszeit"></div>
    <div class="fld wide"><label for="c-body">Text (optional, bis 400 Zeichen)</label><textarea id="c-body" name="body" class="ta" maxlength="400">${esc(edit.body)}</textarea></div>
    <div class="fld"><label for="c-cta">Knopf-Text (optional)</label><input id="c-cta" name="cta_label" class="inp" maxlength="40" value="${esc(edit.cta_label)}"></div>
    <div class="fld"><label for="c-url">Knopf-Link (https:// oder /app/…)</label><input id="c-url" name="cta_url" class="inp" value="${esc(edit.cta_url)}"></div>
    <div class="fld"><label for="c-s">Start</label><input id="c-s" name="starts_at" type="datetime-local" class="inp" required value="${toLocal(edit.starts_at)}"></div>
    <div class="fld"><label for="c-e">Ende</label><input id="c-e" name="ends_at" type="datetime-local" class="inp" required value="${toLocal(edit.ends_at)}"></div>
   </div>
   <fieldset class="fld"><legend>Wo soll die Aktion erscheinen?</legend>${Object.entries(PLACES).map(([k, v]) => `<label class="chk"><input type="checkbox" name="pl" value="${k}" ${edit.placement.includes(k) ? 'checked' : ''}> ${v}</label>`).join('')}</fieldset>
   <fieldset class="fld"><legend>Produkte als Beispiele (optional, erscheinen in der App unter der Aktion)</legend>${prods.map(p => `<label class="chk"><input type="checkbox" name="pr" value="${p.id}" ${edit.product_ids.includes(p.id) ? 'checked' : ''}> ${esc(p.title)}${p.active ? '' : ' (aus)'}</label>`).join('') || '<p class="muted">Keine eigenen Produkte angelegt. Das ist in Ordnung, die Aktion läuft auch ohne.</p>'}</fieldset>
   <div class="row"><label class="chk"><input type="checkbox" name="active" ${edit.active ? 'checked' : ''}> Eingeschaltet (läuft nur im Zeitraum)</label>${edit.id ? '' : `<label class="chk"><input type="checkbox" name="ig" checked> Passenden Instagram-Beitrag dazu erstellen</label>`}</div>
   <div class="row"><button class="btn pri" type="submit">Speichern</button><button class="btn ghost" type="button" data-a="cancel">Abbrechen</button>${edit.id ? '<button class="btn ghost danger" type="button" data-a="del">Löschen</button>' : ''}</div></form>`;
  const suggestions = () => {
    const have = new Set(rows.map(r => r.title)), list = suggest().filter(x => !have.has(x.title));
    if (!list.length) return '';
    return `<section class="card"><h2>Vorschläge für die nächsten Wochen</h2><p class="muted">Fertig ausgefüllt, mit Zeitraum und Texten, die ums Wünschen gehen und nicht ums Kaufen. Du entscheidest nur, ob du die Aktion fährst. Danach kannst du alles noch ändern.</p>
      <div class="ideas">${list.map(x => `<div class="card idea"><b>${esc(x.title)}</b><span class="muted">${esc(x.when)} · ${fmtDate(x.start)} bis ${fmtDate(x.end)}${x.running ? ' · <span class="pill ok">jetzt aktuell</span>' : ''}</span><span>${esc(x.headline)}</span><button class="btn pri sm" data-a="drive" data-id="${esc(x.id)}">Aktion fahren</button></div>`).join('')}</div></section>`;
  };
  const draw = () => {
    el.innerHTML = `${edit ? '' : suggestions()}<div class="head"><div><h1>Aktionen</h1><p class="muted">Sonderaktionen mit Zeitraum, zum Beispiel zum Black Friday oder zu Weihnachten. Eine Aktion erscheint automatisch von Start bis Ende und verschwindet danach von selbst.</p></div><button class="btn pri" data-a="new">Aktion hinzufügen</button></div>
    ${edit ? form() : ''}<div class="tablewrap"><table><thead><tr><th>Aktion</th><th>Zeitraum</th><th>Ort</th><th>Status</th><th></th></tr></thead><tbody>
    ${rows.map(c => { const [t, k] = state(c); return `<tr><td><b>${esc(c.title)}</b><br><span class="muted">${esc(c.headline)}</span></td><td>${fmtDate(c.starts_at)}<br>bis ${fmtDate(c.ends_at)}</td><td>${c.placement.map(p => esc(PLACES[p] || p)).join('<br>')}</td><td><span class="pill ${k}">${t}</span></td><td class="actions"><button class="btn sec sm" data-a="edit" data-id="${c.id}">Bearbeiten</button> <button class="btn ghost sm" data-a="dup" data-id="${c.id}">Kopieren</button></td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">Noch keine Aktionen.</td></tr>'}
    </tbody></table></div>`;
  };
  el.onclick = async e => {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a, r = rows.find(x => x.id === b.dataset.id);
    try {
      if (a === 'drive') { const x = suggest().find(v => v.id === b.dataset.id); edit = { title: x.title, headline: x.headline, body: x.body, cta_label: x.cta_label, cta_url: x.cta_url, placement: x.placement, product_ids: [], starts_at: x.start, ends_at: x.end, active: true }; draw(); window.scrollTo(0, 0); el.querySelector('#c-title')?.focus(); }
      else if (a === 'new') { edit = empty(); draw(); el.querySelector('#c-title')?.focus(); }
      else if (a === 'edit') { edit = { ...r }; draw(); window.scrollTo(0, 0); el.querySelector('#c-title')?.focus(); }
      else if (a === 'dup') { const rest = { ...r }; delete rest.id; delete rest.created_at; delete rest.updated_at; edit = { ...rest, title: r.title + ' (Kopie)', active: false }; draw(); window.scrollTo(0, 0); }
      else if (a === 'cancel') { edit = null; draw(); }
      else if (a === 'del') { if (confirm('Diese Aktion wirklich löschen?')) { await remove('campaigns', edit.id); edit = null; toast('Gelöscht.'); await load(); } }
    } catch (err) { toast('Das hat nicht geklappt: ' + (err.message || err), true); }
  };
  el.onsubmit = async e => {
    e.preventDefault(); const fd = new FormData(e.target), f = n => (fd.get(n) || '').toString().trim();
    const s = fromLocal(f('starts_at')), en = fromLocal(f('ends_at'));
    if (!(new Date(en) > new Date(s))) return toast('Das Ende muss nach dem Start liegen.', true);
    const url = f('cta_url'); if (url && !/^(https:\/\/|\/)/.test(url)) return toast('Der Knopf-Link muss mit https:// oder / beginnen.', true);
    const row = { ...(edit.id ? { id: edit.id } : {}), title: f('title'), headline: f('headline'), body: f('body'), cta_label: f('cta_label'), cta_url: url, starts_at: s, ends_at: en,
      placement: fd.getAll('pl'), product_ids: fd.getAll('pr'), active: fd.get('active') === 'on' };
    try {
      const saved = await save('campaigns', row); toast('Gespeichert.');
      if (fd.get('ig') === 'on' && !edit.id) {
        const out = buildCampaignPost(saved, { products: prods });
        const post = await save('social_posts', { title: out.title, status: 'draft', caption: out.caption, slides: out.slides, scheduled_for: new Date(saved.starts_at) > new Date() ? saved.starts_at : null });
        try { sessionStorage.setItem('cms:open-post', post.id); } catch { /* ohne Speicher */ }
        toast('Die Aktion ist angelegt, und der Instagram-Beitrag wartet auf dich.'); location.hash = '#instagram'; return;
      }
      edit = null; await load();
    } catch (err) { toast('Das hat nicht geklappt: ' + (err.message || err), true); }
  };
  await load();
}
