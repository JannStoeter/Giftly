/* Logo für E-Mails als PNG (SVG zeigen viele Mail-Programme nicht): node scripts/mail-logo.mjs -> public/mail/logo.png (2x, transparent) */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 520, height: 140 }, deviceScaleFactor: 2 });
await p.setContent(`<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap" rel="stylesheet">
<style>html,body{margin:0;background:transparent}.m{display:inline-flex;align-items:baseline;font:400 96px 'Instrument Serif',Georgia,serif;color:#1F1B16;letter-spacing:-.02em;padding:14px 8px 0}.m i{width:15px;height:15px;border-radius:50%;background:#B8801F;margin-left:4px}</style><div class="m" id="l">wishtale<i></i></div>`);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
await p.locator('#l').screenshot({ path: 'public/mail/logo.png', omitBackground: true });
await b.close();
