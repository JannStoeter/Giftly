/*
 * Passt ein Produkt zu den Eigenschaften, die im Wunsch stehen? „Beschichtete Bratpfanne“ bekommt keine Eisenpfanne,
 * „Handmühle“ keine elektrische Mühle. Jedes Produkt trägt eine Liste von Eigenschaften (attrs), der Wunsch nennt, was er verlangt.
 */
import { norm } from './util.js';

/** Eigenschaften, die ein Wunsch verlangen kann. „von“ sind Wortanfänge im Wunschtext, „attr“ die geforderte Eigenschaft. */
const WANTS = [
  { re: /\bunbeschichtet/, attr: '!beschichtet' },
  { re: /\b(?<!un)beschichtet|antihaft/, attr: 'beschichtet' },
  { re: /\bgusseisen|\bgussei|\bguss\b/, attr: 'guss' },
  { re: /\bschmiedeeisen|\beisenpfanne|\beisen\b/, attr: 'eisen' },
  { re: /\bemailliert|\bemaille/, attr: 'emailliert' },
  { re: /\bedelstahl/, attr: 'edelstahl' },
  { re: /\bschwanenhals/, attr: 'schwanenhals' },
  { re: /\btemperatur/, attr: 'temperatur' },
  { re: /\bretro/, attr: 'retro' },
  { re: /\bhandm[üu]hle|\bhandkaffeem|\bmanuell/, attr: 'hand' },
  { re: /\bkeramik/, attr: 'keramik' },
];

/** Eigenschaften, die der Wunsch (Titel und Notiz) verlangt. */
export function wanted(w) {
  const t = norm(`${w.t || ''} ${w.note || ''}`);
  return WANTS.filter(x => x.re.test(t)).map(x => x.attr);
}

/** Erfüllt das Produkt alle verlangten Eigenschaften? Gusseisen zählt auch als Eisen. */
export function fits(w, x) {
  const need = wanted(w);
  if (!need.length) return true;
  const have = new Set(x.attrs || []);
  if (have.has('guss')) have.add('eisen');
  return need.every(a => (a.startsWith('!') ? !have.has(a.slice(1)) : have.has(a)));
}
