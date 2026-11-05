/*
 * Alle Texte und Zahlen für Karussell und Reel. Hier ändern, dann `npm run promo` ausführen.
 * Ton: fließende, warme Sätze. Keine Kurzsätze aus ein, zwei Wörtern mit Punkt.
 */
export const BRAND = {
  name: 'wishtale', handle: '@wishtale', domain: 'wishtale.de',
  claim: 'Jeder Wunsch hat eine Geschichte.', tagline: 'Die Wunschliste, die dich kennt.',
};

/*
 * Fotos: Eine Karte kann als 5. Eintrag einen Dateinamen aus promo/photos/ bekommen, zum Beispiel
 * ['grinder', 0, 'Handkaffeemühle', 'mit Keramik-Mahlwerk', 'muehle.jpg']. Ohne Datei bleibt die Illustration.
 */

/* Dateinamen in promo/photos/. Leer lassen, solange es kein Foto gibt (dann erscheint die Illustration). */
export const PH = { grinder: '', kettle: '', scale: '', course: '' };

/* Karussell 1: die Geschichte von Jonas */
export const SLIDES = [
  { kind: 'cover', eyebrow: 'Eine kleine Tale', title: 'Lernen wir Jonas kennen', sub: 'Am Sonntag nimmt sich Jonas Zeit für den perfekten Kaffee, und wenn danach noch Zeit bleibt, kocht Jonas gern für Freunde.', art: [['grinder', 0], ['teapot', 3], ['mug', 5]] },
  { kind: 'chips', eyebrow: 'Der Anfang', title: 'Zuerst erzählt Jonas, was Jonas gefällt', sub: 'Ein paar freundliche Fragen am Anfang, ganz ohne Formular.', rows: [[['Kaffee brühen', 'on'], ['Kochen'], ['Einrichten']], [['Hario'], ['Fellow'], ['Nicht: Duftkerzen', 'warn']]] },
  { kind: 'cards', eyebrow: 'Die Wünsche', title: 'Dann sammelt Jonas, worüber sich Jonas freuen würde', sub: 'Ein Produkt, ein Erlebnis oder einfach eine Idee, so wie sie Jonas gerade einfällt.', cards: [['grinder', 0, 'Handkaffeemühle', 'mit Keramik-Mahlwerk', PH.grinder], ['teapot', 3, 'Wasserkocher', 'mit Temperaturwahl', PH.kettle]] },
  { kind: 'chips', eyebrow: 'Das Vorhandene', title: 'Und Jonas trägt ein, was schon im Schrank steht', sub: 'Damit nichts doppelt geschenkt wird, nicht einmal aus Versehen.', rows: [[['Siebträgermaschine', 'ok'], ['Gusseisenpfanne', 'ok']], [['Pastamaschine', 'ok']]] },
  { kind: 'chips', eyebrow: 'Der Link', title: 'Lena öffnet Jonas’ Link und sieht alles auf einer Seite', sub: 'Wünsche, Vorlieben und das, was schon da ist, ohne Konto und ohne Nachfragen.', rows: [[['Weihnachten', 'gold'], ['5 Wünsche']], [['Nur offene anzeigen']]] },
  { kind: 'tale', eyebrow: 'Die Vorschläge', title: 'Wishtale zeigt Lena, was zu Jonas passt', quote: 'Jonas liebt guten Kaffee. Für den perfekten Espresso nimmt sich Jonas am Sonntag gern auch mal etwas mehr Zeit.', cards: [['scale', 4, 'Kaffeewaage', 'für den perfekten Espresso', PH.scale], ['ticket', 2, 'Barista-Kurs', 'in Jonas’ Nähe', PH.course]], note: 'Die Siebträgermaschine fehlt mit Absicht, denn die hat Jonas schon.' },
  { kind: 'done', eyebrow: 'Das Ende', title: 'Lena wählt Waage und Kurs, und für Jonas bleibt es eine Überraschung', sub: 'Für alle anderen Freunde steht dort jetzt, dass sich schon jemand darum kümmert.', chip: 'Von Lena reserviert' },
  { kind: 'cta', title: 'Dein Wishtale wartet schon auf dich', sub: 'Erzähl uns, was dir Freude macht und was dich ausmacht, den Rest finden deine Freunde selbst.' },
];

/* Karussell 2: Mehr als eine Wunschliste */
export const USP = [
  { kind: 'statement', eyebrow: 'Wishtale', title: 'Mehr als eine Wunschliste', sub: 'Eine Wunschliste kennt deine Wünsche, Wishtale kennt zusätzlich das, was dir gefällt.' },
  { kind: 'statement', eyebrow: 'Das Problem', title: 'Eine Liste sagt, was du dir wünschst, aber nicht warum', sub: 'Und sie weiß auch nicht, was du längst zu Hause hast.' },
  { kind: 'duo', eyebrow: 'Die Idee', title: 'Wishtale zeigt dir beides auf einer Seite', cols: [
    { tag: 'Das kennst du', title: 'Deine Wünsche', chips: [['Handkaffeemühle'], ['Wasserkocher'], ['Wochenende in den Bergen']] },
    { tag: 'Das ist neu', title: 'Dein Geschmack', plus: true, chips: [['Kaffee brühen', 'on'], ['Hario'], ['Siebträgermaschine schon da', 'ok']] },
  ] },
  { kind: 'chips', eyebrow: 'Deine Wünsche', title: 'Sammle, worüber du dich freuen würdest', sub: 'Produkte, Erlebnisse und freie Ideen, und zu jedem Wunsch zeigen wir deinen Freunden ein passendes Produkt.', rows: [[['Handkaffeemühle'], ['Wasserkocher']], [['Ein Wochenende in den Bergen', 'gold']], [['Etwas Schönes für den Balkon']]] },
  { kind: 'chips', eyebrow: 'Dein Geschmack', title: 'Erzähl uns, was dich ausmacht', sub: 'Deine Interessen, deine Lieblingsmarken, das, was du schon hast, und das, was du lieber nicht geschenkt bekommen möchtest.', rows: [[['Kaffee brühen', 'on'], ['Kochen'], ['Einrichten']], [['Hario'], ['Fellow']], [['Siebträgermaschine', 'ok'], ['Nicht: Duftkerzen', 'warn']]] },
  { kind: 'tale', eyebrow: 'Die Tale', title: 'Aus deinem Geschmack werden Vorschläge, die passen', quote: 'Jonas liebt guten Kaffee. Für den perfekten Espresso nimmt sich Jonas am Sonntag gern auch mal etwas mehr Zeit.', cards: [['scale', 4, 'Kaffeewaage', 'für den perfekten Espresso', PH.scale], ['ticket', 2, 'Barista-Kurs', 'in Jonas’ Nähe', PH.course]], note: 'Die Siebträgermaschine fehlt mit Absicht, denn die hat Jonas schon.' },
  { kind: 'done', eyebrow: 'Das Ergebnis', title: 'Deine Freunde müssen nicht mehr raten, und du bekommst nichts doppelt', sub: 'So kommen Geschenke an, über die man sich wirklich freut.', chip: 'Geschenke, die ankommen' },
  { kind: 'cta', title: 'Dein Wishtale wartet schon auf dich', sub: 'Erzähl uns, was dir Freude macht und was dich ausmacht, den Rest finden deine Freunde selbst.' },
];

export const SETS = [
  { name: 'jonas', slides: SLIDES },
  { name: 'usp', slides: USP },
];
