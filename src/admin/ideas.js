/*
 * Beitragsideen: Aus einer gewählten Idee entsteht ein fertiges Karussell mit Bildunterschrift, das im Studio weiter bearbeitet wird.
 * Ton: warm, ganze Sätze, du-Ansprache, Namen statt Pronomen. Kein Komma vor „und“ zwischen Hauptsätzen.
 */
import { blank } from './canvas.js';
import { gen } from '../lib/util.js';
import { PRODUCTS, PRICE_DATE, cat } from '../data/content.js';
import { WORLD_OF_CAT } from '../lib/products.js';
import { weightOf } from '../lib/weights.js';
import { livePRODUCTS } from '../lib/catalog.js';
import { amazonUrl } from '../lib/products.js';

const TAGS = '#wishtale #wunschliste #geschenkideen #geschenke #wishlist';
const S = (o = {}) => ({ ...blank(o.type || 'cover'), ...o });
const split = v => String(v || '').split(',').map(x => x.trim()).filter(Boolean);
const cta = (title = 'Dein Wishtale wartet schon auf dich', sub = 'Erzähle deine eigene kleine Geschichte und bekomme Geschenke, die passen.') => S({ type: 'cta', theme: 'gruen', title, sub, handle: '@wishtale.de', domain: 'wishtale.de' });
const daysToXmas = () => { const n = new Date(), x = new Date(n.getFullYear(), 11, 24); if (x < n) x.setFullYear(n.getFullYear() + 1); return Math.ceil((x - n) / 864e5); };
const week = () => Math.floor(Date.now() / (7 * 864e5));

/** Wählt ein Produkt automatisch: gewichtet nach Qualität und Kategorie-Gewichtung, wechselt jede Woche. */
export function pickProduct(offset = 0) {
  const pool = livePRODUCTS().map(x => ({ x, w: Math.max(0, x.q * weightOf(WORLD_OF_CAT[x.cat] || 'wohnen')) })).filter(e => e.w > 0);
  if (!pool.length) return null;
  const sorted = [...pool].sort((a, b) => b.w - a.w || a.x.id.localeCompare(b.x.id));
  // Aus der oberen Hälfte der gewichteten Liste rotieren, damit nicht immer dasselbe Produkt kommt
  const top = sorted.slice(0, Math.max(3, Math.ceil(sorted.length / 2)));
  return top[(week() + offset) % top.length].x;
}

/** Auswahlliste für die Produkt-Idee: Standard ist die automatische Wahl, daneben alle Produkte mit Marke, Welt und Hinweis auf die Gewichtung. */
function productOptions() {
  const auto = pickProduct(0);
  return [['', `Automatisch wählen${auto ? ` (diese Woche: ${auto.t})` : ''}`],
    ...PRODUCTS.map(x => [x.id, `${x.t}${x.brand ? ' · ' + x.brand : ''} · ${cat(WORLD_OF_CAT[x.cat] || 'wohnen').n}${weightOf(WORLD_OF_CAT[x.cat] || 'wohnen') === 0 ? ' (Kategorie ausgeblendet)' : ''}`])];
}

export const IDEAS = [
  { id: 'tale', title: 'So lebt dein Tale', desc: 'Die Geschichte von einer Person, ihrem Wishtale und einem Geschenk, das passt. Der Klassiker für den Einstieg.',
    fields: [['name', 'Name der Person', 'Jonas'], ['helper', 'Name der schenkenden Person', 'Lena'], ['interests', 'Interessen (mit Komma)', 'Kaffee brühen, Kochen, Einrichten'], ['brands', 'Marken (mit Komma)', 'Hario, Fellow'], ['wishes', 'Wünsche (mit Komma)', 'Handkaffeemühle, Wasserkocher, Kochkurs'], ['owned', 'Schon vorhanden (mit Komma)', 'Siebträgermaschine, Gusseisenpfanne'], ['pick', 'Das schenkt die Person', 'die Waage und den Kurs'], ['tale', 'Kleine Geschichte (Zitat)', 'liebt guten Kaffee. Für den perfekten Espresso nimmt sich die Person am Sonntag gern etwas mehr Zeit.']],
    build: v => ({
      title: `So lebt dein Tale: ${v.name}`,
      caption: `${v.helper} sucht ein Geschenk für ${v.name}. Wishtale zeigt, was sich ${v.name} wünscht, was ${v.name} schon hat und was dazu noch passen könnte, und für ${v.name} bleibt es trotzdem eine Überraschung.\n\nWie sieht dein Wishtale aus? Den Link findest du in der Bio.\n\n${TAGS} #geschenkideen`,
      slides: [
        S({ eyebrow: 'So lebt dein Tale', title: `Lernen wir ${v.name} kennen`, sub: `${v.name} hat ein Wishtale angelegt, und auf den nächsten Folien siehst du, wie daraus ein Geschenk wird, das wirklich passt.` }),
        S({ type: 'chips', eyebrow: 'Der Anfang', title: `Zuerst erzählt ${v.name}, was ${v.name} gefällt`, sub: 'Ein paar freundliche Fragen am Anfang, ganz ohne Formular.', chips: [...split(v.interests).map((c, i) => (i ? '' : '*') + c), ...split(v.brands)] }),
        S({ type: 'chips', eyebrow: 'Die Wünsche', title: `Dann sammelt ${v.name} Wünsche, über die sich ${v.name} freuen würde`, sub: 'Ein Produkt, ein Erlebnis oder einfach eine Idee, so wie sie gerade einfällt.', chips: split(v.wishes).map((c, i) => (i ? '' : '*') + c) }),
        S({ type: 'chips', eyebrow: 'Das Vorhandene', title: `Und ${v.name} trägt ein, was schon im Schrank steht`, sub: 'Damit nichts doppelt geschenkt wird, nicht einmal aus Versehen.', chips: split(v.owned).map(c => '*' + c) }),
        S({ eyebrow: 'Der Link', title: `${v.helper} öffnet ${gen(v.name)} Link und sieht alles auf einer Seite`, sub: 'Wünsche, Vorlieben und das, was schon da ist, ohne Konto und ohne Nachfragen.' }),
        S({ type: 'quote', eyebrow: 'Die Vorschläge', title: `Wishtale zeigt ${v.helper}, was zu ${v.name} passt`, quote: `${v.name} ${v.tale}` }),
        S({ eyebrow: 'Das Ende', title: `${v.helper} entscheidet sich für ${v.pick}. Für ${v.name} bleibt es eine Überraschung`, sub: 'Für alle anderen Freunde steht dort jetzt, dass sich schon jemand darum kümmert.' }),
        cta(),
      ],
    }) },
  { id: 'mehr', title: 'Mehr als eine Wunschliste', desc: 'Erklärt in sechs Folien, was Wishtale von einer normalen Wunschliste unterscheidet.', fields: [],
    build: () => ({
      title: 'Mehr als eine Wunschliste',
      caption: 'Eine Wunschliste sagt dir, was du dir wünschst, aber sie erzählt nicht, warum und was du längst zu Hause hast. Wishtale erzählt auch das, und deine Freunde finden Geschenke, die wirklich passen.\n\nDen Link findest du in der Bio.\n\n' + TAGS,
      slides: [
        S({ eyebrow: 'Wishtale', title: 'Mehr als eine Wunschliste', sub: 'Neben deinen Wünschen erzählt Wishtale, was dich ausmacht.' }),
        S({ type: 'chips', eyebrow: 'Dein Geschmack', title: 'Deine Interessen und Lieblingsmarken', sub: 'Daran erkennen deine Freunde, was zu dir passt.', chips: ['*Kaffee brühen', 'Wandern', 'Lesen', 'Hario', 'Patagonia'] }),
        S({ type: 'chips', eyebrow: 'Das Vorhandene', title: 'Was du schon hast, steht auch drin', sub: 'So bekommst du nichts doppelt.', chips: ['*Siebträgermaschine', '*Wanderrucksack', '*Notizbuch'] }),
        S({ type: 'chips', eyebrow: 'Bitte nicht', title: 'Und was du lieber nicht geschenkt bekommst', sub: 'Das sehen nur Menschen, die dir etwas schenken wollen.', chips: ['Duftkerzen', 'Deko-Kitsch', 'Socken'] }),
        S({ eyebrow: 'Das Ergebnis', title: 'Deine Freunde müssen nicht mehr raten und du bekommst nichts doppelt', sub: 'So kommen Geschenke an, über die man sich wirklich freut.' }),
        cta(),
      ],
    }) },
  { id: 'kennt', title: 'Die Wunschliste, die dich kennt', desc: 'Kurzer, allgemeiner Beitrag für neue Leute: Was ist Wishtale und wofür ist es gut?', fields: [],
    build: () => ({
      title: 'Die Wunschliste, die dich kennt',
      caption: 'Jede Wunschliste zeigt, was du dir wünschst. Deine zeigt auch, wer du bist.\n\nLege dein Wishtale an und lass deine Freunde das passende Geschenk finden. Den Link findest du in der Bio.\n\n' + TAGS,
      slides: [
        S({ eyebrow: 'Wishtale', title: 'Die Wunschliste, die dich kennt', sub: 'Eine kleine Geschichte über dich, für Geschenke, die wirklich passen.' }),
        S({ eyebrow: 'Das Problem', title: 'Zum Geburtstag heißt es oft: Ich wünsche mir nichts Besonderes', sub: 'Und deine Freunde stehen ratlos vor dem Regal.' }),
        S({ type: 'chips', eyebrow: 'Die Lösung', title: 'In deinem Wishtale steht, was dich ausmacht', sub: 'Deine Wünsche und der Geschmack dahinter.', chips: ['*Wünsche', 'Interessen', 'Lieblingsmarken', 'Schon vorhanden', 'Bitte nicht'] }),
        S({ eyebrow: 'Der Link', title: 'Ein Link für alle deine Freunde', sub: 'Sie sehen alles auf einer Seite, ohne Konto und ohne Nachfragen.' }),
        cta(),
      ],
    }) },
  { id: 'fragen', title: 'Drei Fragen für bessere Geschenke', desc: 'Lehrreicher Beitrag mit drei Fragen, die jedem Geschenk helfen.', fields: [],
    build: () => ({
      title: 'Drei Fragen für bessere Geschenke',
      caption: 'Drei Fragen, und das nächste Geschenk sitzt: Was macht die Person in ihrer freien Zeit, was hat sie schon, und was möchte sie lieber nicht bekommen?\n\nIn deinem Wishtale beantwortest du sie einmal, und deine Freunde finden alles auf einer Seite. Den Link findest du in der Bio.\n\n' + TAGS,
      slides: [
        S({ eyebrow: 'Geschenke-Tipp', title: 'Drei Fragen, und das nächste Geschenk sitzt', sub: 'Mit diesen Fragen wird aus Raten ein Treffer.' }),
        S({ eyebrow: 'Frage 1', title: 'Was macht die Person am liebsten in der freien Zeit?', sub: 'Daran erkennst du, wofür sich Freude lohnt.' }),
        S({ eyebrow: 'Frage 2', title: 'Was steht schon im Schrank?', sub: 'So vermeidest du das zweite Waffeleisen.' }),
        S({ eyebrow: 'Frage 3', title: 'Was möchte die Person lieber nicht bekommen?', sub: 'Auch das ist eine Antwort, die Enttäuschungen erspart.' }),
        cta('Alle drei Antworten stehen in deinem Wishtale', 'Lege es an und teile den Link mit deinen Freunden.'),
      ],
    }) },
  { id: 'xmas', title: 'Weihnachten ohne Rätselraten', desc: 'Saisonbeitrag mit Countdown bis Heiligabend (die Tage werden beim Erstellen berechnet).', fields: [],
    build: () => ({
      title: 'Weihnachten ohne Rätselraten',
      caption: `Noch ${daysToXmas()} Tage bis Heiligabend. Genug Zeit, um ein Wishtale anzulegen und deinen Liebsten das Schenken leichter zu machen.\n\nDen Link findest du in der Bio.\n\n${TAGS} #weihnachten #weihnachtsgeschenke`,
      slides: [
        S({ eyebrow: 'Weihnachten', title: `Noch ${daysToXmas()} Tage bis Heiligabend`, sub: 'Genug Zeit für Geschenke, die wirklich passen.' }),
        S({ eyebrow: 'Der Plan', title: 'Leg dein Wishtale an und teile den Link', sub: 'Deine Familie und deine Freunde sehen sofort, was dir gefällt und was du schon hast.' }),
        S({ type: 'chips', eyebrow: 'Dazu gehört', title: 'Alles auf einer Seite', chips: ['*Wünsche', 'Lieblingsmarken', 'Schon vorhanden', 'Bitte nicht', 'Reservieren ohne Doppel'] }),
        cta('Weihnachten kann kommen', 'Dein Wishtale ist in wenigen Minuten angelegt.'),
      ],
    }) },
  { id: 'wunsch', format: 'story', title: 'Wunsch des Tages (Story)', desc: 'Kurze Story-Folgen: eine Frage ans Publikum, dein Wunsch und der Weg zum eigenen Wunschzettel.',
    fields: [['frage', 'Frage', 'Was wünschst du dir gerade?'], ['wunsch', 'Dein Wunsch des Tages', 'Ein ruhiger Sonntag und ein frisch gebrühter Kaffee']],
    build: v => ({
      title: 'Story: Wunsch des Tages', caption: '',
      slides: [S({ eyebrow: 'Wünsch dir was', title: v.frage, sub: 'Antworte uns gern in der Story.' }), S({ eyebrow: 'Unser Wunsch des Tages', title: v.wunsch, theme: 'gruen' }), cta('Was steht auf deinem Wunschzettel?', 'Lege dein Wishtale an, den Link findest du in unserer Bio.')],
    }) },
  { id: 'countdown', format: 'story', title: 'Countdown bis Heiligabend (Story)', desc: 'Eine Story mit den Tagen bis Heiligabend und dem Hinweis auf den Wunschzettel. Die Tage werden beim Erstellen berechnet.', fields: [],
    build: () => ({
      title: 'Story: Countdown', caption: '',
      slides: [S({ eyebrow: 'Weihnachten', title: `Noch ${daysToXmas()} Tage bis Heiligabend`, sub: 'Weißt du schon, was du dir wünschst?' }), cta('Schreib es auf, solange noch Zeit ist', 'Dein Wishtale ist in wenigen Minuten angelegt.')],
    }) },
  { id: 'produkt', title: 'Wunsch-Idee der Woche', desc: 'Eine Anregung zum Wünschen, mit einem Produkt als Beispiel. Das Produkt wählt Wishtale automatisch, passend zu deiner Gewichtung. Bitte nur gelegentlich einsetzen, damit es nicht nach Werbung aussieht.',
    fields: [['intro', 'Einstiegssatz', 'Weihnachten steht vor der Tür, aber du weißt nicht, was du dir wünschen sollst? Schau dir das hier an'], ['product', 'Produkt', '', productOptions], ['anzeige', 'Mit „Anzeige“ kennzeichnen (ja oder nein)', 'ja']],
    build: v => {
      const x = (v.product && PRODUCTS.find(p => p.id === v.product)) || pickProduct(0);
      if (!x) return { title: 'Wunsch-Idee der Woche', caption: '', slides: [S({ title: 'Gerade ist kein Produkt ausgewählt', sub: 'Unter Produkte steht jede Kategorie auf null. Stelle dort mindestens eine wieder auf 100 %.' })] };
      const world = cat(WORLD_OF_CAT[x.cat] || 'wohnen').n, ad = !/^n/i.test(String(v.anzeige || 'ja'));
      return {
        title: `Wunsch-Idee: ${x.t}`, product: x.id,
        caption: `${ad ? 'Anzeige | ' : ''}${v.intro}:\n\n${x.t}${x.brand ? ` von ${x.brand}` : ''}. ${(x.pros || []).slice(0, 2).join(' ')}\n\nVielleicht ist das ein Wunsch für deinen Wunschzettel? In deinem Wishtale sammelst du alles, worüber du dich freuen würdest, und deine Freunde finden es ohne Nachfragen. Den Link findest du in der Bio.${ad ? '\n\nAls Amazon-Partner verdiene ich an qualifizierten Verkäufen.' : ''}\n\n${TAGS} #wunschzettel${ad ? ' #werbung' : ''}`,
        slides: [
          S({ eyebrow: 'Wünsch dir was', title: v.intro, sub: 'Eine Idee für deinen Wunschzettel.' }),
          S({ type: 'photo', photoKey: x.a, eyebrow: x.brand || world, title: x.t, sub: x.price ? `Bei Amazon zuletzt ca. ${x.price.toFixed(2).replace('.', ',')} € gesehen (Stand ${PRICE_DATE}), der Preis kann abweichen.` : 'Den aktuellen Preis siehst du bei Amazon.' }),
          S({ type: 'chips', eyebrow: 'Darum könnte es dir gefallen', title: 'Das spricht dafür', chips: (x.pros || []).slice(0, 4).map((c, i) => (i ? '' : '*') + c) }),
          S({ eyebrow: 'Dein Wunschzettel', title: 'Setz es auf deine Wunschliste, wenn es dir gefällt', sub: 'In deinem Wishtale steht neben den Wünschen auch, was du schon hast und was dich ausmacht.' }),
          cta('Sammle deine Wünsche an einem Ort', 'Lege dein Wishtale an und teile den Link mit deinen Freunden.'),
        ],
        link: amazonUrl(x),
      };
    } },
  { id: 'aktion', title: 'Aktion aus dem CMS', desc: 'Baut aus einer deiner Aktionen (zum Beispiel Black Week oder Weihnachten) ein Karussell, das ums Wünschen geht.', fields: [['campaign', 'Aktion', '']], ctx: true,
    build: (v, ctx) => buildCampaignPost((ctx.campaigns || []).find(x => x.id === v.campaign) || (ctx.campaigns || [])[0], ctx) },
];

/** Karussell zu einer Aktion: Es geht immer ums Wünschen, nicht ums Kaufen. */
export function buildCampaignPost(c, ctx = {}) {
  if (!c) return { title: 'Aktion', caption: '', slides: [S({ title: 'Lege zuerst unter Aktionen eine Aktion an' }), cta()] };
  const prods = (c.product_ids || []).map(id => (ctx.products || []).find(p => p.id === id)).filter(Boolean);
  const head = c.headline || c.title;
  return {
    title: `Aktion: ${c.title}`, campaignId: c.id,
    caption: `${head}\n\n${c.body || ''}\n\nLege dein Wishtale an und teile den Link mit deinen Liebsten. Den Link findest du in der Bio.\n\n${TAGS} #wunschzettel${prods.length ? ' #werbung' : ''}`.replace(/\n\n\n/g, '\n\n'),
    slides: [
      S({ eyebrow: 'Wünsch dir was', title: head, sub: '' }),
      ...(c.body ? [S({ eyebrow: 'Dein Wunschzettel', title: 'So geht das mit deinem Wishtale', sub: c.body })] : []),
      S({ type: 'chips', eyebrow: 'Das gehört dazu', title: 'Alles, was dich ausmacht, auf einer Seite', chips: ['*Deine Wünsche', 'Interessen', 'Lieblingsmarken', 'Schon vorhanden', 'Bitte nicht'] }),
      ...(prods.length ? [S({ type: 'chips', eyebrow: 'Ein paar Ideen', title: 'Vielleicht ist ja etwas für deinen Wunschzettel dabei', chips: prods.map((p, i) => (i ? '' : '*') + p.title) })] : []),
      cta(c.cta_label || 'Meinen Wunschzettel anlegen', 'Dein Wishtale ist in wenigen Minuten angelegt.'),
    ],
  };
}
