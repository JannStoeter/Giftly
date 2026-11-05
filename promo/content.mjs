/* Alle Texte und Zahlen für Karussell und Reel. Hier ändern, dann `npm run promo` ausführen. */
export const BRAND = { name: 'wishtale', handle: '@wishtale', domain: 'wishtale.de', claim: 'Jeder Wunsch hat eine Geschichte.', tagline: 'Die Wunschliste, die dich kennt.' };

export const SLIDES = [
  { kind: 'cover', eyebrow: 'Eine kleine Tale', title: 'Das ist Jonas.', sub: 'Am Sonntag brüht Jonas sich den perfekten Kaffee. Und wenn Zeit bleibt, kocht Jonas gern für Freunde.', art: [['grinder', 0], ['teapot', 3], ['mug', 5]] },
  { kind: 'chips', eyebrow: 'Schritt 1', title: 'Jonas legt sein Wishtale an', sub: 'Ein paar freundliche Fragen, kein Formular.', rows: [[['Kaffee brühen', 'on'], ['Kochen'], ['Einrichten']], [['Hario'], ['Fellow'], ['Nicht: Duftkerzen', 'warn']]] },
  { kind: 'cards', eyebrow: 'Schritt 2', title: 'Jonas sammelt Wünsche', sub: 'Dinge, über die sich Jonas freuen würde.', cards: [['grinder', 0, 'Handkaffeemühle', 'mit Keramik-Mahlwerk'], ['teapot', 3, 'Wasserkocher', 'mit Temperaturwahl']] },
  { kind: 'chips', eyebrow: 'Schritt 3', title: 'Und trägt ein, was schon da ist', sub: 'Damit nichts doppelt geschenkt wird.', rows: [[['Siebträgermaschine', 'ok'], ['Gusseisenpfanne', 'ok']], [['Pastamaschine', 'ok']]] },
  { kind: 'chips', eyebrow: 'Schritt 4', title: 'Lena öffnet Jonas’ Link', sub: 'Eine Seite mit allem, was Lena wissen möchte. Ein Konto braucht Lena dafür nicht.', rows: [[['Weihnachten', 'gold'], ['5 Wünsche']], [['Nur offene anzeigen']]] },
  { kind: 'tale', eyebrow: 'Schritt 5', title: 'Wishtale schlägt vor, was passt', quote: 'Jonas liebt guten Kaffee. Für den perfekten Espresso nimmt sich Jonas am Sonntag gern auch mal etwas mehr Zeit.', cards: [['scale', 4, 'Digitale Kaffeewaage', 'mit Timer'], ['ticket', 2, 'Barista-Kurs', 'in Jonas’ Nähe']], note: 'Die Siebträgermaschine fehlt mit Absicht. Die hat Jonas schon.' },
  { kind: 'done', eyebrow: 'Schritt 6', title: 'Gewählt. Reserviert. Die Überraschung bleibt.', sub: 'Lena wählt Waage und Kurs. Jonas sieht davon nichts.', chip: 'Von Lena reserviert' },
  { kind: 'cta', title: 'Dein Wishtale wartet.', sub: 'Deine Wünsche und alles, was dich ausmacht. Deine Freunde finden den Rest.' },
];

/* Karussell "Mehr als eine Wunschliste": erklärt den Unterschied zu einer gewöhnlichen Wunschliste. */
export const USP = [
  { kind: 'statement', eyebrow: 'Wishtale', title: 'Mehr als eine Wunschliste.', sub: 'Eine Wunschliste kennt deine Wünsche. Wishtale kennt auch das, was dir gefällt.' },
  { kind: 'statement', eyebrow: 'Das Problem', title: 'Eine Liste sagt, was du dir wünschst.', sub: 'Aber nicht, warum. Und sie vergisst, was du schon hast.' },
  { kind: 'duo', eyebrow: 'Die Idee', title: 'Wishtale zeigt beides.', cols: [
    { tag: 'Das kennst du', title: 'Deine Wünsche', chips: [['Handkaffeemühle'], ['Wasserkocher'], ['Wochenende in den Bergen']] },
    { tag: 'Das ist neu', title: 'Dein Geschmack', plus: true, chips: [['Kaffee brühen', 'on'], ['Hario'], ['Siebträgermaschine schon da', 'ok']] },
  ] },
  { kind: 'chips', eyebrow: 'Deine Wünsche', title: 'Sammle, was dir Freude machen würde', sub: 'Produkte, Erlebnisse und freie Ideen. Zu jedem Wunsch zeigen wir deinen Freunden ein passendes Produkt.', rows: [[['Handkaffeemühle'], ['Wasserkocher']], [['Ein Wochenende in den Bergen', 'gold']], [['Etwas Schönes für den Balkon']]] },
  { kind: 'chips', eyebrow: 'Dein Geschmack', title: 'Erzähl, was dich ausmacht', sub: 'Interessen, Lieblingsmarken, Welten, was du schon hast und was du lieber nicht geschenkt bekommst.', rows: [[['Kaffee brühen', 'on'], ['Kochen'], ['Einrichten']], [['Hario'], ['Fellow']], [['Siebträgermaschine', 'ok'], ['Nicht: Duftkerzen', 'warn']]] },
  { kind: 'tale', eyebrow: 'Daraus entsteht eine Tale', title: 'Und Vorschläge, die passen', quote: 'Jonas liebt guten Kaffee. Für den perfekten Espresso nimmt sich Jonas am Sonntag gern auch mal etwas mehr Zeit.', cards: [['scale', 4, 'Digitale Kaffeewaage', 'mit Timer'], ['ticket', 2, 'Barista-Kurs', 'in Jonas’ Nähe']], note: 'Die Siebträgermaschine fehlt mit Absicht. Die hat Jonas schon.' },
  { kind: 'done', eyebrow: 'Das Ergebnis', title: 'Deine Freunde müssen nicht raten.', sub: 'Und du bekommst nichts doppelt.', chip: 'Geschenke, die ankommen' },
  { kind: 'cta', title: 'Dein Wishtale wartet.', sub: 'Deine Wünsche und alles, was dich ausmacht. Deine Freunde finden den Rest.' },
];

export const SETS = [
  { name: 'jonas', slides: SLIDES },
  { name: 'usp', slides: USP },
];
