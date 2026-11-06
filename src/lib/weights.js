/*
 * Gewichtung der Kategorien (aus dem CMS, Tabelle settings, Schlüssel category_weights).
 * Werte in Prozent: 100 = normal, 0 = nicht zeigen, 200 = doppelt so stark.
 * Die Auswahl der Produkte bleibt automatisch, die Gewichtung steuert nur, wie stark eine Kategorie nach vorn rückt.
 */
let W = {};
export const setWeights = o => { W = o && typeof o === 'object' ? o : {}; };
export const getWeights = () => W;
export const weightOf = c => { const v = W[c]; return v == null || Number.isNaN(+v) ? 1 : Math.max(0, Math.min(2, +v / 100)); };
