/* Profilbild für Instagram & Co.: node promo/avatar.mjs  ->  promo/out/profilbild-*.png (1080 x 1080, quadratisch, Instagram schneidet rund zu) */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap" rel="stylesheet">';
const variants = {
  gruen: { bg: '#2E3B2F', fg: '#F6F0E4', dot: '#D9A441' },
  creme: { bg: '#F3EDE2', fg: '#2E3B2F', dot: '#B8801F' },
};
mkdirSync('promo/out', { recursive: true });
const b = await chromium.launch();
for (const [name, c] of Object.entries(variants)) {
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await p.setContent(`<!doctype html><meta charset="utf-8">${FONTS}<style>
   html,body{margin:0;height:100%;background:${c.bg}}
   .w{height:100%;display:grid;place-items:center}
   .m{font-family:'Instrument Serif',serif;font-size:620px;line-height:1;color:${c.fg};letter-spacing:-.03em;display:flex;align-items:baseline;margin-top:-30px}
   .m i{width:84px;height:84px;border-radius:50%;background:${c.dot};margin-left:10px}
  </style><div class="w"><div class="m">w<i></i></div></div>`);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  await p.screenshot({ path: `promo/out/profilbild-${name}.png` });
  await p.close();
}
await b.close();
