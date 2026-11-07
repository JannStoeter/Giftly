import { list, save, remove } from './api.js';
import { sb } from '../lib/supabase.js';
import { esc, money, toast } from './util.js';
import { CATS } from '../data/content.js';
import { withAmazonTag } from '../lib/shops.js';
import { guessCategory } from '../lib/category.js';
import { PRODUCTS, PRICE_DATE } from '../data/content.js';
import { amazonUrl, WORLD_OF_CAT } from '../lib/products.js';

export const PARTNERS = { amazon: 'Amazon', mydays: 'mydays', 'jochen-schweizer': 'Jochen Schweizer', otto: 'Otto', zalando: 'Zalando', thalia: 'Thalia', direkt: 'Direkt beim Hersteller', sonstige: 'Sonstige' };
const empty = () => ({ title: '', brand: '', category: 'wohnen', partner: 'amazon', url: '', price: '', image_url: '', note: '', active: true, featured: false, sort: 0 });

export async function mount(el) {
  let rows = [], edit = null, q = '', weights = {}, off = [];
  const load = async () => {
    rows = await list('products', 'sort', true);
    const { data } = await sb.from('settings').select('value').eq('key', 'category_weights').maybeSingle();
    weights = (data && data.value) || {};
    const o = await sb.from('settings').select('value').eq('key', 'catalog_disabled').maybeSingle(); off = (o.data && o.data.value) || [];
    draw();
  };
  const wlabel = v => (v === 0 ? 'Nicht zeigen' : v < 100 ? 'Weniger' : v > 100 ? 'Mehr' : 'Normal');
  const steering = () => `<section class="card"><h2>Automatische Auswahl steuern</h2>
    <p class="muted">Wishtale wählt die Produkte selbst aus, passend zu Interessen, Marken und Wünschen. Hier legst du nur fest, welche Kategorien dabei stärker oder schwächer nach vorn rücken. 100 % ist normal, 0 % blendet eine Kategorie ganz aus.</p>
    <div class="weights">${CATS.map(c => { const v = weights[c.id] ?? 100; return `<div class="wrow"><label for="w-${c.id}">${c.n}</label><input id="w-${c.id}" type="range" min="0" max="200" step="10" value="${v}" data-w="${c.id}"><output for="w-${c.id}">${v} % · ${wlabel(v)}</output></div>`; }).join('')}</div>
    <div class="row"><button class="btn pri sm" data-a="saveweights">Gewichtung speichern</button><button class="btn ghost sm" data-a="resetweights">Alles auf normal</button></div></section>`;
  const catalog = () => `<section class="card"><h2>Katalog prüfen</h2>
    <p class="muted">Das sind die Produkte, aus denen die App automatisch auswählt. Wir testen sie nicht selbst, deshalb lohnt sich ab und zu ein Blick: Ist das Produkt noch lieferbar, wie sind die Bewertungen, stimmt der Preis? Ein ausgeblendetes Produkt wird nirgends mehr vorgeschlagen. Preisstand der Angaben: ${esc(PRICE_DATE)}.</p>
    <div class="tablewrap"><table><thead><tr><th>Produkt</th><th>Welt</th><th>Eigenschaften</th><th>Status</th><th></th></tr></thead><tbody>
    ${PRODUCTS.map(x => `<tr><td><b>${esc(x.t)}</b><br><span class="muted">${esc(x.brand || '')} · Qualität ${x.q} von 5</span></td><td>${esc((CATS.find(c => c.id === (WORLD_OF_CAT[x.cat] || 'wohnen')) || {}).n || '')}</td><td>${esc((x.attrs || []).join(', ') || '–')}</td>
      <td>${off.includes(x.id) ? '<span class="pill">Ausgeblendet</span>' : '<span class="pill ok">Wird vorgeschlagen</span>'}</td>
      <td class="actions"><a class="btn ghost sm" href="${esc(amazonUrl(x))}" target="_blank" rel="noopener noreferrer">Bei Amazon prüfen</a> <button class="btn sec sm" data-a="catalog" data-id="${x.id}">${off.includes(x.id) ? 'Wieder zeigen' : 'Ausblenden'}</button></td></tr>`).join('')}
    </tbody></table></div></section>`;
  const draw = () => {
    const shown = rows.filter(r => !q || (r.title + r.brand + r.note).toLowerCase().includes(q));
    el.innerHTML = `<div class="head"><div><h1>Produkte</h1><p class="muted">Die Empfehlungen in der App entstehen automatisch. Du steuerst sie über die Gewichtung der Kategorien und kannst eigene Produkte ergänzen. Ein Produkt mit Haken bei „Hervorgehoben“ erscheint zusätzlich unter Inspiration als Empfehlung von Wishtale (mit „Anzeige“).</p></div></div>${steering()}${catalog()}<div class="head"><div><h2>Eigene Produkte (optional)</h2></div><button class="btn pri" data-a="new">Produkt hinzufügen</button></div>
     <div class="row"><label class="sr" for="pq">Suchen</label><input id="pq" class="inp" placeholder="Produkte suchen" value="${esc(q)}" style="max-width:320px"></div>
     ${edit ? form() : ''}
     <div class="tablewrap"><table><thead><tr><th>Produkt</th><th>Partner</th><th>Preis</th><th>Status</th><th></th></tr></thead><tbody>
     ${shown.map(r => `<tr><td><b>${esc(r.title)}</b><br><span class="muted">${esc(r.brand)} · ${esc((CATS.find(c => c.id === r.category) || {}).n || r.category)}</span></td><td>${esc(PARTNERS[r.partner] || r.partner)}</td><td>${money(r.price)}</td>
      <td>${r.active ? '<span class="pill ok">Aktiv</span>' : '<span class="pill">Aus</span>'} ${r.featured ? '<span class="pill gold">Hervorgehoben</span>' : ''}</td>
      <td class="actions"><button class="btn sec sm" data-a="edit" data-id="${r.id}">Bearbeiten</button> <button class="btn ghost sm" data-a="toggle" data-id="${r.id}">${r.active ? 'Ausschalten' : 'Einschalten'}</button></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Noch keine Produkte. Mit „Produkt hinzufügen“ legst du das erste an.</td></tr>'}
     </tbody></table></div>`;
  };
  const form = () => `<form class="card" data-f="product" style="margin:16px 0">
    <h2>${edit.id ? 'Produkt bearbeiten' : 'Neues Produkt'}</h2>
    <div class="grid2">
     <div class="fld"><label for="f-title">Name</label><input id="f-title" name="title" class="inp" required maxlength="160" value="${esc(edit.title)}"></div>
     <div class="fld"><label for="f-brand">Marke</label><input id="f-brand" name="brand" class="inp" maxlength="80" value="${esc(edit.brand)}"></div>
     <div class="fld"><label for="f-cat">Kategorie</label><select id="f-cat" name="category" class="sel">${CATS.map(c => `<option value="${c.id}" ${edit.category === c.id ? 'selected' : ''}>${c.n}</option>`).join('')}</select></div>
     <div class="fld"><label for="f-partner">Partner</label><select id="f-partner" name="partner" class="sel">${Object.entries(PARTNERS).map(([k, v]) => `<option value="${k}" ${edit.partner === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
     <div class="fld wide"><label for="f-url">Link (Partnerlink, beginnt mit https://)</label><input id="f-url" name="url" class="inp" required inputmode="url" value="${esc(edit.url)}"><p class="hint">Bei Amazon hängen wir deine Partner-ID automatisch an.</p></div>
     <div class="fld"><label for="f-price">Preis in Euro (optional)</label><input id="f-price" name="price" class="inp" inputmode="decimal" value="${esc(edit.price ?? '')}"></div>
     <div class="fld"><label for="f-sort">Reihenfolge (kleine Zahl zuerst)</label><input id="f-sort" name="sort" type="number" class="inp" value="${esc(edit.sort)}"></div>
     <div class="fld wide"><label for="f-note">Kurztext (optional, bis 300 Zeichen)</label><textarea id="f-note" name="note" class="ta" maxlength="300">${esc(edit.note)}</textarea></div>
    </div>
    <div class="row"><label class="chk"><input type="checkbox" name="active" ${edit.active ? 'checked' : ''}> Aktiv (sichtbar in der App)</label><label class="chk"><input type="checkbox" name="featured" ${edit.featured ? 'checked' : ''}> Hervorgehoben unter Inspiration</label></div>
    <div class="row"><button class="btn pri" type="submit">Speichern</button><button class="btn ghost" type="button" data-a="cancel">Abbrechen</button>${edit.id ? '<button class="btn ghost danger" type="button" data-a="del">Löschen</button>' : ''}</div></form>`;
  el.onclick = async e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a, r = rows.find(x => x.id === b.dataset.id);
    try {
      if (a === 'new') { edit = empty(); draw(); el.querySelector('#f-title')?.focus(); }
      else if (a === 'edit') { edit = { ...r }; draw(); el.querySelector('#f-title')?.focus(); window.scrollTo(0, 0); }
      else if (a === 'cancel') { edit = null; draw(); }
      else if (a === 'catalog') { const id = b.dataset.id; off = off.includes(id) ? off.filter(x => x !== id) : [...off, id]; const { error } = await sb.from('settings').upsert({ key: 'catalog_disabled', value: off }); if (error) throw error; toast(off.includes(id) ? 'Das Produkt wird nicht mehr vorgeschlagen.' : 'Das Produkt wird wieder vorgeschlagen.'); draw(); }
      else if (a === 'saveweights') { const { error } = await sb.from('settings').upsert({ key: 'category_weights', value: weights }); if (error) throw error; toast('Die Gewichtung ist gespeichert und wirkt sofort in der App.'); }
      else if (a === 'resetweights') { weights = {}; draw(); toast('Zurückgesetzt. Zum Übernehmen bitte speichern.'); }
      else if (a === 'toggle') { await save('products', { id: r.id, active: !r.active }); toast(r.active ? 'Das Produkt ist ausgeschaltet.' : 'Das Produkt ist wieder aktiv.'); await load(); }
      else if (a === 'del') { if (confirm('Dieses Produkt wirklich löschen?')) { await remove('products', edit.id); edit = null; toast('Gelöscht.'); await load(); } }
    } catch (err) { toast('Das hat nicht geklappt: ' + (err.message || err), true); }
  };
  el.onchange = e => { if (e.target.id === 'f-cat') e.target.dataset.touched = '1'; if (e.target.id === 'f-title') { const c = el.querySelector('#f-cat'); if (c && !c.dataset.touched && !edit.id) c.value = guessCategory(e.target.value, c.value); } };
  el.oninput = e => { if (e.target.dataset.w) { weights[e.target.dataset.w] = +e.target.value; e.target.nextElementSibling.textContent = `${e.target.value} % · ${wlabel(+e.target.value)}`; return; } if (e.target.id === 'pq') { q = e.target.value.toLowerCase(); const pos = e.target.selectionStart; draw(); const i = el.querySelector('#pq'); i.focus(); i.setSelectionRange(pos, pos); } };
  el.onsubmit = async e => {
    e.preventDefault(); const fd = new FormData(e.target);
    let url = (fd.get('url') || '').trim();
    if (!/^https:\/\//i.test(url)) return toast('Der Link muss mit https:// beginnen.', true);
    if (fd.get('partner') === 'amazon') url = withAmazonTag(url);
    const price = parseFloat(String(fd.get('price') || '').replace(',', '.'));
    const row = { ...(edit.id ? { id: edit.id } : {}), title: fd.get('title').trim(), brand: (fd.get('brand') || '').trim(), category: fd.get('category'), partner: fd.get('partner'), url,
      price: Number.isFinite(price) && price > 0 ? price : null, image_url: edit.image_url || '', note: (fd.get('note') || '').trim(), sort: +fd.get('sort') || 0, active: fd.get('active') === 'on', featured: fd.get('featured') === 'on' };
    try { await save('products', row); toast('Gespeichert.'); edit = null; await load(); } catch (err) { toast('Das hat nicht geklappt: ' + (err.message || err), true); }
  };
  await load();
}
