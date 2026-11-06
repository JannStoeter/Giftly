import { list, save, remove } from './api.js';
import { esc, toast, slug, toLocal, fromLocal, fmtDate, lines } from './util.js';
import { drawSlide, loadFonts, blank, blob, TYPES, THEMES } from './canvas.js';
import { SLIDES } from '../../promo/content.mjs';

const STATUS = { draft: 'Entwurf', ready: 'Bereit', posted: 'Gepostet' };
/** Vorlagen aus dem bestehenden Karussell „Jonas“ (promo/content.mjs). */
const fromPromo = () => SLIDES.map(s => ({
  type: { cover: 'cover', chips: 'chips', cards: 'cover', tale: 'quote', done: 'cover', cta: 'cta' }[s.kind] || 'cover', theme: s.kind === 'cta' ? 'gruen' : 'creme',
  eyebrow: s.eyebrow || '', title: s.title || '', sub: s.sub || '', quote: s.quote || '',
  chips: (s.rows || []).flat().map(([t, k]) => (k === 'on' || k === 'ok' ? '*' : '') + t), handle: s.kind === 'cta' ? '@wishtale.de' : '', domain: s.kind === 'cta' ? 'wishtale.de' : '',
}));
const newPost = () => ({ title: 'Neuer Beitrag', status: 'draft', caption: '', slides: [{ ...blank('cover'), title: 'Dein Titel' }, blank('cta')], scheduled_for: null });

export async function mount(el) {
  let posts = [], cur = null, sel = 0; const imgs = new Map(); // Fotos nur im Speicher dieser Sitzung
  await loadFonts();
  const load = async () => { posts = await list('social_posts', 'updated_at', false); draw(); };
  const paint = () => {
    const c = el.querySelector('#cv'); if (!c || !cur) return;
    drawSlide(c, cur.slides[sel], sel, cur.slides.length, { image: imgs.get(sel) });
    el.querySelectorAll('.thumb canvas').forEach((t, i) => drawSlide(t, cur.slides[i], i, cur.slides.length, { image: imgs.get(i) }));
  };
  const slideForm = () => {
    const s = cur.slides[sel]; if (!s) return '';
    return `<div class="card"><div class="row"><b>Folie ${sel + 1}</b>
     <button class="btn ghost sm" data-a="up" ${sel ? '' : 'disabled'}>Nach vorn</button><button class="btn ghost sm" data-a="down" ${sel < cur.slides.length - 1 ? '' : 'disabled'}>Nach hinten</button><button class="btn ghost sm" data-a="dupslide">Kopieren</button><button class="btn ghost sm danger" data-a="delslide" ${cur.slides.length > 1 ? '' : 'disabled'}>Löschen</button></div>
     <div class="grid2"><div class="fld"><label for="s-type">Art</label><select id="s-type" data-s="type" class="sel">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${s.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
     <div class="fld"><label for="s-theme">Farbe</label><select id="s-theme" data-s="theme" class="sel">${Object.keys(THEMES).map(k => `<option value="${k}" ${s.theme === k ? 'selected' : ''}>${k === 'creme' ? 'Hell (Creme)' : 'Dunkel (Grün)'}</option>`).join('')}</select></div>
     <div class="fld wide"><label for="s-eye">Kleine Zeile oben</label><input id="s-eye" data-s="eyebrow" class="inp" value="${esc(s.eyebrow)}"></div>
     <div class="fld wide"><label for="s-title">Überschrift</label><textarea id="s-title" data-s="title" class="ta" rows="2">${esc(s.title)}</textarea></div>
     <div class="fld wide"><label for="s-sub">Text darunter</label><textarea id="s-sub" data-s="sub" class="ta" rows="3">${esc(s.sub)}</textarea></div>
     ${s.type === 'quote' ? `<div class="fld wide"><label for="s-q">Zitat</label><textarea id="s-q" data-s="quote" class="ta" rows="3">${esc(s.quote)}</textarea></div>` : ''}
     ${s.type === 'chips' ? `<div class="fld wide"><label for="s-ch">Chips (eine pro Zeile, ein * davor hebt hervor)</label><textarea id="s-ch" data-s="chips" class="ta" rows="5">${esc((s.chips || []).join('\n'))}</textarea></div>` : ''}
     ${s.type === 'photo' ? `<div class="fld wide"><label for="s-img">Foto (bleibt nur in dieser Sitzung, vor dem Schließen herunterladen)</label><input id="s-img" type="file" accept="image/*" class="inp"></div>` : ''}
     ${s.type === 'cta' ? `<div class="fld"><label for="s-h">Instagram-Name</label><input id="s-h" data-s="handle" class="inp" value="${esc(s.handle)}"></div><div class="fld"><label for="s-d">Webadresse</label><input id="s-d" data-s="domain" class="inp" value="${esc(s.domain)}"></div>` : ''}
     <div class="fld wide"><label for="s-f">Fußzeile</label><input id="s-f" data-s="footer" class="inp" value="${esc(s.footer ?? 'Jeder Wunsch hat eine Geschichte.')}"></div></div></div>`;
  };
  const editor = () => `<div class="studio">
    <div><div class="card"><div class="grid2"><div class="fld wide"><label for="p-t">Interner Titel</label><input id="p-t" data-p="title" class="inp" value="${esc(cur.title)}"></div>
     <div class="fld"><label for="p-st">Status</label><select id="p-st" data-p="status" class="sel">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${cur.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
     <div class="fld"><label for="p-sc">Geplant für</label><input id="p-sc" data-p="scheduled_for" type="datetime-local" class="inp" value="${toLocal(cur.scheduled_for)}"></div>
     <div class="fld wide"><label for="p-c">Bildunterschrift</label><textarea id="p-c" data-p="caption" class="ta" rows="7" maxlength="2200">${esc(cur.caption)}</textarea><p class="hint"><span id="cc">${cur.caption.length}</span>/2200 Zeichen</p></div></div></div>
     ${slideForm()}</div>
    <div><div class="canvaswrap"><canvas id="cv" role="img" aria-label="Vorschau der Folie ${sel + 1}"></canvas></div>
     <div class="thumbs">${cur.slides.map((_, i) => `<button class="thumb ${i === sel ? 'on' : ''}" data-a="pick" data-i="${i}" aria-label="Folie ${i + 1} auswählen"><canvas></canvas></button>`).join('')}<button class="thumb add" data-a="add" aria-label="Folie hinzufügen">+</button></div>
     <div class="row"><button class="btn pri" data-a="save">Speichern</button><button class="btn sec" data-a="png">Diese Folie als Bild</button><button class="btn sec" data-a="all">Alle Folien als Bilder</button></div>
     <div class="row"><button class="btn ghost" data-a="tpl">Folien aus Vorlage „Jonas“ laden</button><button class="btn ghost" data-a="back">Zurück zur Liste</button>${cur.id ? '<button class="btn ghost danger" data-a="delpost">Beitrag löschen</button>' : ''}</div>
     <div class="banner"><b>Noch nicht mit Instagram verbunden.</b> Lade die Bilder herunter und poste sie in der Instagram-App. Das direkte Veröffentlichen aus dem CMS braucht ein Instagram-Geschäftskonto, eine Facebook-Seite und eine Meta-App mit Freigabe. Sag Bescheid, wenn du das einrichten möchtest.</div></div></div>`;
  const draw = () => {
    if (cur) { el.innerHTML = `<div class="head"><div><h1>${esc(cur.title)}</h1><p class="muted">Instagram-Beitrag bearbeiten. Die Vorschau zeigt genau das Bild, das du herunterlädst (1080 × 1350).</p></div></div>${editor()}`; paint(); return; }
    el.innerHTML = `<div class="head"><div><h1>Instagram</h1><p class="muted">Karussells entwerfen, Folien bearbeiten und als fertige Bilder herunterladen.</p></div><button class="btn pri" data-a="newpost">Beitrag hinzufügen</button></div>
     <div class="tablewrap"><table><thead><tr><th>Beitrag</th><th>Folien</th><th>Geplant</th><th>Status</th><th></th></tr></thead><tbody>
     ${posts.map(p => `<tr><td><b>${esc(p.title)}</b></td><td>${p.slides.length}</td><td>${fmtDate(p.scheduled_for)}</td><td><span class="pill ${p.status === 'posted' ? 'ok' : p.status === 'ready' ? 'gold' : ''}">${STATUS[p.status]}</span></td><td class="actions"><button class="btn sec sm" data-a="open" data-id="${p.id}">Öffnen</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Noch keine Beiträge.</td></tr>'}</tbody></table></div>`;
  };
  const dl = async (i) => {
    const c = document.createElement('canvas'); drawSlide(c, cur.slides[i], i, cur.slides.length, { image: imgs.get(i) });
    const b = await blob(c), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `wishtale-${slug(cur.title)}-${String(i + 1).padStart(2, '0')}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const persist = async () => {
    const row = { ...(cur.id ? { id: cur.id } : {}), title: cur.title.trim() || 'Beitrag', status: cur.status, caption: cur.caption, slides: cur.slides, scheduled_for: cur.scheduled_for || null, posted_at: cur.status === 'posted' ? (cur.posted_at || new Date().toISOString()) : null };
    const r = await save('social_posts', row); cur = { ...cur, ...r }; toast('Gespeichert.');
  };
  el.onclick = async e => {
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a;
    try {
      if (a === 'newpost') { cur = newPost(); sel = 0; imgs.clear(); draw(); }
      else if (a === 'open') { cur = { ...posts.find(p => p.id === b.dataset.id) }; cur.slides = JSON.parse(JSON.stringify(cur.slides)); sel = 0; imgs.clear(); draw(); }
      else if (a === 'back') { if (!confirm('Ungespeicherte Änderungen gehen verloren. Zur Liste zurück?')) return; cur = null; await load(); }
      else if (a === 'pick') { sel = +b.dataset.i; draw(); }
      else if (a === 'add') { cur.slides.push(blank('cover')); sel = cur.slides.length - 1; draw(); }
      else if (a === 'dupslide') { cur.slides.splice(sel + 1, 0, JSON.parse(JSON.stringify(cur.slides[sel]))); sel++; draw(); }
      else if (a === 'delslide') { cur.slides.splice(sel, 1); imgs.delete(sel); sel = Math.max(0, sel - 1); draw(); }
      else if (a === 'up' || a === 'down') { const j = a === 'up' ? sel - 1 : sel + 1;[cur.slides[sel], cur.slides[j]] = [cur.slides[j], cur.slides[sel]]; const x = imgs.get(sel), y = imgs.get(j); x ? imgs.set(j, x) : imgs.delete(j); y ? imgs.set(sel, y) : imgs.delete(sel); sel = j; draw(); }
      else if (a === 'tpl') { if (!confirm('Die aktuellen Folien werden durch die Vorlage ersetzt. Fortfahren?')) return; cur.slides = fromPromo(); cur.title = cur.title === 'Neuer Beitrag' ? 'Karussell Jonas' : cur.title; sel = 0; imgs.clear(); draw(); }
      else if (a === 'save') await persist();
      else if (a === 'png') await dl(sel);
      else if (a === 'all') { for (let i = 0; i < cur.slides.length; i++) { await dl(i); await new Promise(r => setTimeout(r, 350)); } }
      else if (a === 'delpost') { if (confirm('Diesen Beitrag wirklich löschen?')) { await remove('social_posts', cur.id); cur = null; await load(); } }
    } catch (err) { toast('Das hat nicht geklappt: ' + (err.message || err), true); }
  };
  el.oninput = e => {
    const t = e.target;
    if (t.dataset.p) { cur[t.dataset.p] = t.dataset.p === 'scheduled_for' ? fromLocal(t.value) : t.value; if (t.dataset.p === 'caption') el.querySelector('#cc').textContent = t.value.length; return; }
    if (t.dataset.s) { const s = cur.slides[sel]; s[t.dataset.s] = t.dataset.s === 'chips' ? lines(t.value) : t.value; paint(); }
  };
  el.onchange = e => {
    const t = e.target;
    if (t.dataset.s === 'type' || t.dataset.s === 'theme') { cur.slides[sel][t.dataset.s] = t.value; draw(); }
    if (t.id === 's-img' && t.files[0]) { const f = t.files[0]; createImageBitmap(f).then(bm => { imgs.set(sel, bm); paint(); }).catch(() => toast('Das Bild konnte nicht gelesen werden.', true)); }
  };
  await load();
}
