/* Welt-Fenster: kleine Geschichte zur Person und passende Produkte, aus Wünschen, Marken und Vorlieben. */
import { S, guestPerson } from '../state.js';
import { esc, ic } from '../lib/util.js';
import { art, artIllu } from '../lib/art.js';
import { worldOffers } from '../lib/products.js';
import { worldTale } from '../lib/tale.js';
import { cat } from '../data/content.js';
import { priceLine } from './product.js';

const REL = 'noopener noreferrer sponsored nofollow';

function Row(o, ctx) {
  const amazon = o.host === 'amazon.de';
  const label = o.cta || (amazon ? (o.direct ? 'Bei Amazon ansehen' : 'Bei Amazon suchen') : `Zu ${esc(o.host)}`);
  const saved = S.ui.saved[o.id];
  return `<div class="offer">
   ${o.brand ? `<span class="otn brand" aria-hidden="true"><b>${esc(o.brand.slice(0, 1))}</b><small>${esc(o.brand)}</small></span>` : `<span class="otn">${artIllu(o.a || 'gift', o.tone || 0)}</span>`}
   <div class="obody">
    ${o.exp ? '<span class="eyebrow">Erlebnis</span>' : ''}
    <strong class="ot">${esc(o.t)}</strong>
    ${o.exp ? '' : priceLine(o)}
    ${(o.why || []).slice(0, 2).map(t => `<span class="why">${esc(t)}</span>`).join('')}
   </div>
   <div class="oa">
    <a class="btn amz sm" href="${o.url}" target="_blank" rel="${REL}">${label} ${ic('arrow', 'sm')}</a>
    <button class="btn sec sm" data-act="save" data-id="${esc(o.id)}" aria-pressed="${!!saved}">${saved ? 'Gemerkt' : 'Merken'}</button>
    ${ctx === 'own' && !o.exp ? `<button class="btn ghost sm" data-act="ihave" data-id="${esc(o.id)}">Habe ich schon</button>` : ''}
   </div>
  </div>`;
}

export function WorldModal() {
  const ctx = S.ui.worldCtx || 'guest';
  const p = ctx === 'guest' ? guestPerson() : S.me;
  const c = p && cat(S.ui.worldId);
  if (!p || !c) return '';
  const tale = worldTale(p, c.id);
  const offers = worldOffers(p, c.id, 6);
  return `<div class="scrim" data-act="closebg"><div class="sheet wide" role="dialog" aria-modal="true" aria-labelledby="mt">
   <div class="wm-top">
    <span class="wm-img">${art(c.a, c.t)}</span>
    <div><p class="eyebrow">Welt · ${esc(p.name)}</p><h2 id="mt">${esc(c.n)}</h2></div>
   </div>
   <div class="tale">${tale.paragraphs.map(t => `<p>${esc(t)}</p>`).join('')}<p class="ask">${esc(tale.ask)}</p></div>
   ${offers.length ? offers.map(o => Row(o, ctx)).join('') : `<p class="muted" style="margin:14px 0">Dazu haben wir noch keine Idee, die nicht schon vorhanden oder gewünscht ist. Schau gern in die Wunschliste.</p>`}
   <p class="disc"><b>Hinweis:</b> Wir haben diese Auswahl aus den Wünschen, Lieblingsmarken und Vorlieben von ${esc(p.name)} zusammengestellt. Es kann trotzdem sein, dass ${esc(p.name)} das eine oder andere schon besitzt. Die Links zu Amazon sind Partnerlinks (Anzeige), Preise können abweichen.</p>
   <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-act="close">Schließen</button></div>
  </div></div>`;
}
