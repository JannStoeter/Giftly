/*
 * Kleine Geschichte (Tale) zu einer Welt. Wird aus dem Profil zusammengesetzt, ohne Pronomen,
 * damit sie für jede Person passt. Reihenfolge: Interesse, Gewohnheit, Marken, Wünsche, Vorhandenes, Überleitung.
 */
import { ACT } from '../data/content.js';

const WORLD_TAGS = {
  genuss: ['kaffee', 'tee'], kochen: ['kochen'], wohnen: ['wohnen', 'garten', 'keramik'], buecher: ['lesen', 'vorlesen'],
  outdoor: ['wandern', 'draussen', 'tiere', 'rad'], reisen: ['reisen'], spielen: ['spiele', 'basteln', 'bauen'],
  technik: ['musik'], sport: ['laufen', 'rad'], mode: [], erlebnisse: ['keramik'],
};
const WORLD_BRANDS = {
  Hario: 'genuss', Fellow: 'genuss', Stelton: 'wohnen', Muji: 'wohnen', Aesop: 'wohnen', 'Le Creuset': 'kochen',
  Patagonia: 'outdoor', Fjällräven: 'outdoor', Moleskine: 'buecher', Leuchtturm1917: 'buecher',
};
const list = a => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' und ' + a.slice(-1));

const BANK = {
  genuss: n => [`${n} nimmt sich Zeit für die kleinen Genussmomente.`, 'Ein guter Kaffee oder Tee am Sonntag gehört dazu, gern auch langsam.', `Damit das Ritual noch runder wird, könnten ${n} diese Produkte gefallen:`],
  kochen: n => [`${n} steht gern in der Küche.`, 'Gutes Werkzeug macht aus einem normalen Abendessen ein kleines Ritual.', `Für noch mehr Freude am Kochen könnten ${n} diese Dinge gefallen:`],
  wohnen: n => [`${n} richtet das Zuhause Stück für Stück ein.`, 'Wenige, gute Dinge mit Material und Form sind besser als viel Deko.', `Zu diesem Stil könnten ${n} diese Dinge gefallen:`],
  buecher: n => [`${n} verliert sich gern in Büchern.`, 'Eine gute Leselampe, ein schönes Notizbuch und ein ruhiger Abend reichen schon.', `Für mehr Leseglück könnten ${n} diese Dinge gefallen:`],
  outdoor: n => [`${n} ist am liebsten draußen unterwegs.`, 'Leicht packen, lange laufen und abends müde, aber zufrieden ankommen.', `Für die nächste Tour könnten ${n} diese Dinge gefallen:`],
  reisen: n => [`${n} plant gern die nächste Reise.`, 'Ordnung im Gepäck und gute Begleiter für unterwegs machen das Ankommen leichter.', `Für unterwegs könnten ${n} diese Dinge gefallen:`],
  spielen: n => [`${n} spielt, baut und bastelt gern.`, 'Dabei entstehen die schönsten Geschichten.', `Für noch mehr Spielfreude könnten ${n} diese Dinge gefallen:`],
  technik: n => [`${n} mag gute Technik, wenn sie einfach funktioniert.`, 'Musik, Hörbücher oder ein ruhiger Abend mit Kopfhörern.', `Dazu könnten ${n} diese Dinge gefallen:`],
  sport: n => [`${n} bewegt sich gern.`, 'Ein gutes Gefühl beim Laufen oder Radeln beginnt bei der richtigen Ausrüstung.', `Für die nächste Runde könnten ${n} diese Dinge gefallen:`],
  mode: n => [`${n} legt Wert auf Dinge, die sich gut anfühlen.`, 'Natürliche Materialien, schlichte Schnitte, lange tragbar.', `Dazu könnten ${n} diese Dinge gefallen:`],
  erlebnisse: n => [`${n} sammelt lieber Erlebnisse als Dinge.`, 'Ein Nachmittag, an den man sich noch lange erinnert, ist oft das beste Geschenk.', `Dafür könnten ${n} diese Ideen gefallen:`],
};

/** Liefert { paragraphs: [...], ask } für eine Welt. */
export function worldTale(p, cid, cats) {
  const n = p.name;
  const tags = WORLD_TAGS[cid] || [];
  const ints = p.interests.filter(l => tags.includes((ACT.find(a => a.l === l) || {}).t));
  const [s1, s2, ask] = (BANK[cid] || BANK.wohnen)(n);
  const out = [];

  // Zuspitzung bei Kaffee: persönlicher als der Standardsatz.
  if (cid === 'genuss' && p.interests.includes('Kaffee brühen')) {
    out.push(`${n} liebt guten Kaffee. Für den perfekten Espresso nimmt sich ${n} am Sonntag gern auch mal etwas mehr Zeit.`);
  } else {
    out.push(`${s1}${ints.length ? ` ${list(ints)} gehört zum Alltag.` : ''} ${s2}`);
  }

  const brands = p.brands.filter(b => WORLD_BRANDS[b] === cid);
  if (brands.length) out.push(`Lieblingsmarken in dieser Welt: ${list(brands)}.`);

  const wishes = p.wishes.filter(w => w.status === 'offen' && w.c === cid && w.vis !== 'privat').map(w => w.t);
  if (wishes.length) out.push(`Schon auf der Wunschliste: ${list(wishes.slice(0, 3))}.`);

  const owned = p.wishes.filter(w => w.status === 'selbst' && w.c === cid && w.vis !== 'privat').map(w => w.t);
  if (owned.length) out.push(`Schon vorhanden: ${list(owned.slice(0, 3))}. Dazu passt Zubehör besonders gut.`);

  return { paragraphs: out, ask: cid === 'genuss' && p.interests.includes('Kaffee brühen') ? `Um den perfekten Kaffee zu erzeugen, könnten ${n} diese Produkte noch gefallen:` : ask };
}

/** Wie gut kennen wir die Person? 0 bis 100 plus nächste Schritte. */
export function completeness(a) {
  const owned = a.wishes.filter(w => w.status === 'selbst').length;
  const open = a.wishes.filter(w => w.status === 'offen').length;
  const steps = [
    [15, !!(a.about && a.about.trim().length > 20), 'Schreib ein paar Sätze „Über mich“.'],
    [15, a.interests.length >= 3, 'Wähle mindestens drei Interessen.'],
    [10, a.cats.length >= 3, 'Wähle mindestens drei Welten.'],
    [10, a.brands.length >= 3, 'Nenne ein paar Lieblingsmarken.'],
    [10, a.nogos.length >= 1, 'Sag, was du auf keinen Fall geschenkt bekommen möchtest.'],
    [5, a.tries.length >= 1, 'Was möchtest du gern einmal ausprobieren?'],
    [5, a.alts.length >= 2, 'Wähle Alternativen, falls niemandem etwas einfällt.'],
    [15, open >= 5, 'Sammle mindestens fünf Wünsche.'],
    [10, owned >= 3, 'Trage ein, was du schon hast (mindestens drei Dinge).'],
    [5, a.history.length >= 1, 'Trage ein Geschenk ein, das du bekommen hast.'],
  ];
  const pct = steps.reduce((s, [pts, ok]) => s + (ok ? pts : 0), 0);
  return { pct, next: steps.filter(([, ok]) => !ok).map(([, , t]) => t) };
}
