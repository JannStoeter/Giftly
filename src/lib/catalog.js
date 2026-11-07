/*
 * Welche Katalog-Produkte dürfen vorgeschlagen werden? Standard: alle. Im CMS (Produkte › Katalog prüfen) lassen sich einzelne
 * ausblenden, zum Beispiel wenn ein Produkt nicht mehr lieferbar ist oder die Bewertungen schlechter geworden sind.
 * Gespeichert in der Tabelle settings unter catalog_disabled.
 */
import { PRODUCTS } from '../data/content.js';

let off = new Set();
export const setCatalogOff = a => { off = new Set(Array.isArray(a) ? a : []); };
export const catalogOff = () => [...off];
export const livePRODUCTS = () => PRODUCTS.filter(x => !off.has(x.id));
