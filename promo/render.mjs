/*
 * Erzeugt Instagram-Material aus unserem Design:
 *   promo/out/karussell-jonas-01..08.png   (1080x1350, 4:5)
 *   promo/out/reel-jonas.mp4                (1080x1920, 9:16, 30 fps, ohne Ton)
 * Benötigt: playwright (mit Chromium) und ffmpeg.   Aufruf: npm run promo
 */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { illustration } from '../src/lib/art.js';
import { BRAND, SETS } from './content.mjs';

const { chromium } = createRequire(import.meta.url)('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, 'out');
const mainCss = readFileSync(join(here, '../src/styles/main.css'), 'utf8');
mkdirSync(OUT, { recursive: true });

/* Schriftgröße nach Titellänge, damit auch längere, fließende Titel passen. */
const fs = (t, big = 124) => { const n = String(t).length; return n > 62 ? 70 : n > 48 ? 80 : n > 36 ? 92 : n > 26 ? 108 : big; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const art = (k, t, cls = '') => `<span class="art t${t} ${cls}">${illustration(k)}</span>`;
const chip = ([t, c = '']) => `<span class="chip ${c}">${esc(t)}</span>`;
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">';

const PZ = `
html,body{margin:0;background:var(--bg);overflow:hidden}
.pz{position:relative;overflow:hidden;background:var(--bg);color:var(--ink);font-family:var(--body)}
.pz *{box-sizing:border-box}
.pz .logo{font-family:var(--disp);font-size:56px;letter-spacing:-.02em;display:flex;align-items:baseline;gap:4px}
.pz .logo i{width:11px;height:11px;border-radius:50%;background:var(--gold);display:inline-block}
.pz .eyebrow{font-size:26px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:600}
.pz h1,.pz h2{font-family:var(--disp);font-weight:400;line-height:.98;letter-spacing:-.015em;margin:0}
.pz .sub{font-size:40px;line-height:1.38;color:var(--muted);margin:0}
.pz .chip{font-size:32px;padding:14px 28px;border-radius:99px}
.pz .chips{display:flex;flex-wrap:wrap;gap:16px}
.pz .cardrow{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.pz .minic{background:var(--surface);border:2px solid var(--line);border-radius:36px;padding:20px;display:grid;gap:10px}
.pz .minic .art{aspect-ratio:1/1;border-radius:24px}
.pz .minic b{font-size:40px;font-family:var(--disp);font-weight:400;line-height:1.05;margin-top:6px}
.pz .minic small{font-size:28px;color:var(--muted)}
.pz .quote{font-family:var(--disp);font-style:italic;font-size:50px;line-height:1.22;color:var(--accent);margin:0}
.pz .note{font-size:30px;color:var(--muted)}
`;
const base = (w, h, body, extra = '') => `<!doctype html><html lang="de"><head><meta charset="utf-8">${FONTS}<style>${mainCss}${PZ}${extra}</style></head><body><div class="pz" style="width:${w}px;height:${h}px">${body}</div></body></html>`;

/* ---------------- Karussell ---------------- */
const W = 1080, H = 1350, PAD = 84;
function slideBody(s, i, n) {
  const frame = inner => `
   <div style="position:absolute;inset:0;padding:${PAD}px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center"><div class="logo">${BRAND.name}<i></i></div><span style="font-size:30px;color:var(--muted)">${i + 1} / ${n}</span></div>
    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:40px">${inner}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:30px;color:var(--muted)"><span>${esc(BRAND.claim)}</span>${i < n - 1 ? '<span style="font-size:44px;color:var(--accent)">→</span>' : ''}</div>
   </div>`;
  if (s.kind === 'cover') return frame(`
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h1 style="font-size:${fs(s.title, 168)}px">${esc(s.title)}</h1>
    <p class="sub" style="max-width:860px">${esc(s.sub)}</p>
    <div style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:24px;margin-top:10px">${s.art.map(([k, t], j) => art(k, t, '') ).map((a, j) => `<div style="border-radius:32px;overflow:hidden;aspect-ratio:${j ? '1/1' : '1.4/1'}">${a.replace('class="art', 'style="height:100%" class="art')}</div>`).join('')}</div>`);
  if (s.kind === 'statement') return frame(`
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h1 style="font-size:${fs(s.title, 150)}px">${esc(s.title)}</h1>
    <p class="sub" style="max-width:880px">${esc(s.sub)}</p>`);
  if (s.kind === 'duo') return frame(`
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h2 style="font-size:${fs(s.title, 92)}px">${esc(s.title)}</h2>
    <div style="display:grid;gap:20px">${s.cols.map(c => `<div class="minic" style="padding:28px 32px;gap:14px;${c.plus ? 'border-color:var(--gold);background:color-mix(in srgb,var(--gold) 8%,var(--surface))' : ''}"><span class="eyebrow" style="color:${c.plus ? 'var(--gold)' : 'var(--muted)'};font-size:24px">${esc(c.tag)}</span><b style="font-size:54px">${esc(c.title)}</b><div class="chips">${c.chips.map(chip).join('')}</div></div>`).join('')}</div>`);
  if (s.kind === 'chips') return frame(`
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h2 style="font-size:${fs(s.title, 116)}px">${esc(s.title)}</h2>
    <p class="sub">${esc(s.sub)}</p>
    <div style="display:grid;gap:18px">${s.rows.map(r => `<div class="chips">${r.map(chip).join('')}</div>`).join('')}</div>`);
  if (s.kind === 'cards') return frame(`
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h2 style="font-size:${fs(s.title, 116)}px">${esc(s.title)}</h2>
    <p class="sub">${esc(s.sub)}</p>
    <div class="cardrow">${s.cards.map(([k, t, a, b]) => `<div class="minic">${art(k, t)}<b>${esc(a)}</b><small>${esc(b)}</small></div>`).join('')}</div>`);
  if (s.kind === 'tale') return frame(`
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h2 style="font-size:${Math.min(84, fs(s.title, 84))}px">${esc(s.title)}</h2>
    <p class="quote" style="font-size:44px">${esc(s.quote)}</p>
    <div class="cardrow">${s.cards.map(([k, t, a, b]) => `<div class="minic" style="padding:16px"><div style="aspect-ratio:1/.72;border-radius:24px;overflow:hidden">${art(k, t).replace('class="art','style="height:100%" class="art')}</div><b style="font-size:36px">${esc(a)}</b><small>${esc(b)}</small></div>`).join('')}</div>
    <p class="note" style="font-size:28px">${esc(s.note)}</p>`);
  if (s.kind === 'done') return frame(`
    <p class="eyebrow">${esc(s.eyebrow)}</p>
    <h2 style="font-size:${fs(s.title, 124)}px">${esc(s.title)}</h2>
    <p class="sub">${esc(s.sub)}</p>
    <div class="chips"><span class="chip ok">✓ ${esc(s.chip)}</span></div>`);
  /* cta */
  return `<div style="position:absolute;inset:0;background:var(--accent);color:var(--accent-ink);padding:${PAD}px;display:flex;flex-direction:column;justify-content:space-between">
    <div class="logo" style="color:var(--accent-ink)">${BRAND.name}<i></i></div>
    <div style="display:grid;gap:36px">
     <h1 style="font-size:${fs(s.title, 150)}px;color:var(--accent-ink)">${esc(s.title)}</h1>
     <p class="sub" style="color:#C9D3BD">${esc(s.sub)}</p>
     <p style="font-size:44px;margin:0;color:var(--accent-ink)"><b>${esc(BRAND.handle)}</b> · ${esc(BRAND.domain)}</p>
    </div>
    <p style="font-size:30px;margin:0;color:#B8C4A8">${esc(BRAND.tagline)}</p></div>`;
}

/* ---------------- Reel ---------------- */
const RW = 1080, RH = 1920, FPS = 30;
const SCENES = [
  { s: 0, e: 3.4 }, { s: 3.0, e: 7.4 }, { s: 7.0, e: 11.4 }, { s: 11.0, e: 14.4 }, { s: 14.0, e: 20.0 }, { s: 19.6, e: 23.2 }, { s: 22.8, e: 27.0 },
];
const TOTAL = SCENES[SCENES.length - 1].e;
const reelHtml = () => {
  const sc = (i, inner, extra = '') => `<section class="rscene" data-i="${i}" style="${extra}"><div class="rstack">${inner}</div></section>`;
  const mini = (k, t, a, b) => `<div class="minic rpop">${art(k, t)}<b>${esc(a)}</b><small>${esc(b)}</small></div>`;
  const css = `
   .rscene{position:absolute;inset:0;opacity:0;display:flex;align-items:center;justify-content:center}
   .rstack{width:100%;padding:0 90px;display:grid;gap:46px;margin-top:-30px}
   .rup{opacity:0}.rpop{opacity:0}
   .pz .rbig{font-size:176px}.pz .rmid{font-size:128px}
   .pz .sub{font-size:46px}.pz .chip{font-size:38px;padding:16px 32px}
   .pz .minic b{font-size:48px}.pz .minic small{font-size:32px}
   .pz .quote{font-size:56px}
   .rtag{position:absolute;left:0;right:0;top:150px;text-align:center}
   .rtag .logo{justify-content:center}
  `;
  const body = `
   <div class="rtag" style="z-index:3"><div class="logo">${BRAND.name}<i></i></div></div>
   ${sc(0, `<p class="eyebrow rup">Eine kleine Tale</p><h1 class="rbig rup" style="font-size:150px">Lernen wir<br>Jonas<br>kennen</h1>`)}
   ${sc(1, `<h2 class="rmid rup" style="font-size:104px">Am Sonntag nimmt sich Jonas Zeit für den perfekten Kaffee</h2><div class="chips">${['Kaffee brühen|on', 'Kochen', 'Einrichten'].map(x => { const [t, c] = x.split('|'); return `<span class="chip rpop ${c || ''}">${t}</span>` }).join('')}</div>`)}
   ${sc(2, `<h2 class="rmid rup" style="font-size:108px">Darüber würde sich Jonas sehr freuen</h2><div class="cardrow">${mini('grinder', 0, 'Handkaffeemühle', 'mit Keramik-Mahlwerk')}${mini('teapot', 3, 'Wasserkocher', 'mit Temperaturwahl')}</div>`)}
   ${sc(3, `<h2 class="rmid rup" style="font-size:108px">Und das steht schon bei Jonas im Schrank</h2><div class="chips">${['Siebträgermaschine', 'Gusseisenpfanne', 'Pastamaschine'].map(t => `<span class="chip ok rpop">${t}</span>`).join('')}</div><p class="sub rup">Damit nichts doppelt geschenkt wird, nicht einmal aus Versehen.</p>`)}
   ${sc(4, `<h2 class="rmid rup" style="font-size:84px">Lena sucht ein Geschenk, und Wishtale zeigt, was zu Jonas passt</h2><p class="quote rup">Um den perfekten Kaffee zu erzeugen, könnten Jonas diese Produkte noch gefallen:</p><div class="cardrow">${mini('scale', 4, 'Digitale Kaffeewaage', 'mit Timer')}${mini('ticket', 2, 'Barista-Kurs', 'in Jonas’ Nähe')}</div><p class="note rup" style="font-size:34px">Die Siebträgermaschine fehlt mit Absicht, denn die hat Jonas schon.</p>`)}
   ${sc(5, `<h2 class="rbig rup" style="font-size:104px">Lena wählt, und für Jonas bleibt es eine Überraschung</h2><div class="chips"><span class="chip ok rpop">✓ Von Lena reserviert</span></div><p class="sub rup">Jonas sieht davon nichts, und alle anderen Freunde wissen, dass sich schon jemand kümmert.</p>`)}
   ${sc(6, `<div style="position:absolute;inset:0;background:var(--accent)"></div><div style="position:relative;display:grid;gap:40px;padding:0 90px;color:var(--accent-ink)"><h1 class="rbig rup" style="color:var(--accent-ink);font-size:150px">Dein<br>Wishtale<br>wartet schon<br>auf dich</h1><p class="sub rup" style="color:#C9D3BD">${esc(BRAND.tagline)}</p><p class="rup" style="font-size:50px;margin:0"><b>${esc(BRAND.handle)}</b> · ${esc(BRAND.domain)}</p></div>`)}`;
  const js = `
   const TOTAL=${TOTAL}, SC=${JSON.stringify(SCENES)}, tl=[];
   const E='cubic-bezier(.2,.8,.2,1)';
   function anim(el,kf,start,dur,ease){const a=el.animate(kf,{duration:dur*1000,delay:start*1000,fill:'both',easing:ease||E});a.pause();tl.push(a)}
   document.querySelectorAll('.rscene').forEach((el,i)=>{
     const {s,e}=SC[i],d=e-s,fi=.45,fo=i===SC.length-1?0:.45;
     const kf=[{opacity:0,offset:0},{opacity:1,offset:fi/d},{opacity:1,offset:1-fo/d},{opacity:i===SC.length-1?1:0,offset:1}];
     anim(el,kf,s,d,'linear');
     el.querySelectorAll('.rup').forEach((u,j)=>anim(u,[{opacity:0,transform:'translateY(40px)'},{opacity:1,transform:'none'}],s+.25+j*.35,.7));
     el.querySelectorAll('.rpop').forEach((u,j)=>anim(u,[{opacity:0,transform:'translateY(30px) scale(.9)'},{opacity:1,transform:'none'}],s+.9+j*.3,.6,'cubic-bezier(.2,1.3,.4,1)'));
   });
   window.seek=t=>{tl.forEach(a=>{a.currentTime=Math.max(0,t*1000)})};
   window.ready=document.fonts.ready.then(()=>true);
   seek(0);`;
  return base(RW, RH, body, css).replace('</body>', `<script>${js}</script></body>`);
};

/* ---------------- Ausführung ---------------- */
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const set of SETS) {
    for (let i = 0; i < set.slides.length; i++) {
      await page.setContent(base(W, H, slideBody(set.slides[i], i, set.slides.length)), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      const file = join(OUT, `karussell-${set.name}-${String(i + 1).padStart(2, '0')}.png`);
      await page.screenshot({ path: file });
      console.log(set.name, 'Folie', i + 1);
    }
  }
  if (process.env.SKIP_REEL) { console.log('Reel übersprungen'); await browser.close(); process.exit(0); }
  const rp = await browser.newPage({ viewport: { width: RW, height: RH }, deviceScaleFactor: 1 });
  await rp.setContent(reelHtml(), { waitUntil: 'networkidle' });
  await rp.evaluate(() => window.ready);
  await rp.waitForTimeout(300);
  const frames = join(OUT, '_frames');
  if (existsSync(frames)) rmSync(frames, { recursive: true });
  mkdirSync(frames);
  const n = Math.round(TOTAL * FPS);
  for (let f = 0; f < n; f++) {
    await rp.evaluate(t => window.seek(t), f / FPS);
    await rp.screenshot({ path: join(frames, `f${String(f).padStart(4, '0')}.png`) });
    if (f % 100 === 0) console.log('Reel-Bild', f, '/', n);
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, 'f%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', join(OUT, 'reel-jonas.mp4')]);
  rmSync(frames, { recursive: true });
  console.log('Reel →', join(OUT, 'reel-jonas.mp4'), `(${TOTAL}s)`);
} finally { await browser.close(); }
