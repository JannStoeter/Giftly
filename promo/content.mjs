/* Alle Texte und Zahlen für Karussell und Reel. Hier ändern, dann `npm run promo` ausführen. */
export const BRAND = { name: 'wishtale', handle: '@wishtale', domain: 'wishtale.de', claim: 'Jeder Wunsch hat eine Geschichte.' };

export const SLIDES = [
  { kind: 'cover', eyebrow: 'Eine kleine Tale', title: 'Das ist Jonas.', sub: 'Am Sonntag brüht Jonas sich den perfekten Kaffee. Und wenn Zeit bleibt, kocht Jonas gern für Freunde.', art: [['grinder', 0], ['teapot', 3], ['mug', 5]] },
  { kind: 'chips', eyebrow: 'Schritt 1', title: 'Jonas legt sein Wishtale an', sub: 'Ein paar freundliche Fragen, kein Formular.', rows: [[['Kaffee brühen', 'on'], ['Kochen'], ['Einrichten']], [['Hario'], ['Fellow'], ['Nicht: Duftkerzen', 'warn']]] },
  { kind: 'cards', eyebrow: 'Schritt 2', title: 'Jonas sammelt Wünsche', sub: 'Dinge, über die sich Jonas freuen würde.', cards: [['grinder', 0, 'Handkaffeemühle', 'mit Keramik-Mahlwerk'], ['teapot', 3, 'Wasserkocher', 'mit Temperaturwahl']] },
  { kind: 'chips', eyebrow: 'Schritt 3', title: 'Und trägt ein, was schon da ist', sub: 'Damit nichts doppelt geschenkt wird.', rows: [[['Siebträgermaschine', 'ok'], ['Gusseisenpfanne', 'ok']], [['Pastamaschine', 'ok']]] },
  { kind: 'chips', eyebrow: 'Schritt 4', title: 'Lena öffnet Jonas’ Link', sub: 'Eine Seite mit allem, was Lena wissen möchte. Ein Konto braucht Lena dafür nicht.', rows: [[['Weihnachten', 'gold'], ['5 Wünsche']], [['Nur offene anzeigen']]] },
  { kind: 'tale', eyebrow: 'Schritt 5', title: 'Wishtale schlägt vor, was passt', quote: 'Jonas liebt guten Kaffee. Für den perfekten Espresso nimmt sich Jonas am Sonntag gern auch mal etwas mehr Zeit.', cards: [['scale', 4, 'Digitale Kaffeewaage', 'mit Timer'], ['ticket', 2, 'Barista-Kurs', 'in Jonas’ Nähe']], note: 'Die Siebträgermaschine fehlt mit Absicht. Die hat Jonas schon.' },
  { kind: 'done', eyebrow: 'Schritt 6', title: 'Gewählt. Reserviert. Die Überraschung bleibt.', sub: 'Lena wählt Waage und Kurs. Jonas sieht davon nichts.', chip: 'Von Lena reserviert' },
  { kind: 'cta', title: 'Dein Wishtale wartet.', sub: 'Erzähl, was dir Freude macht. Deine Freunde finden den Rest.' },
];
