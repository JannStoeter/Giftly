/*
 * Foto-Manifest: ein Eintrag pro Motiv (Schlüssel = Illustrations-Name aus lib/art.js,
 * bzw. "look:<id>" für Creator-Looks). Alle Bilder stammen von Unsplash (Unsplash License:
 * kostenlos, auch kommerziell nutzbar). Die Foto-ID steht in der URL nach "photo-".
 *
 * Fehlende oder nicht ladende Bilder fallen automatisch auf die Illustration zurück.
 * Mit `npm run photos:check` wird geprüft, ob alle IDs erreichbar sind.
 */
const ID = {
  grinder:    '1517256064527-09c73fc73e38', // Kaffee brühen
  glasses:    '1514362545857-3bc16c4c7d1b', // Gläser
  mug:        '1514432324607-a09d9b4aefdd', // Tasse
  pan:        '1556910103-1c02745aae4d',    // Küche
  book:       '1512820790803-83ca734da794', // Bücher
  vase:       '1612196808214-b7e239e5f6b7', // Vase
  sneaker:    '1542291026-7eec264c27ff',    // Sneaker
  tent:       '1504280390367-361c6d9f38f4', // Zelt
  suitcase:   '1565026057447-bc90a3dceb87', // Koffer
  ticket:     '1514525253161-7a46d19cd819', // Erlebnis / Konzert
  headphones: '1505740420928-5e560c06d30e', // Kopfhörer
  sweater:    '1576566588028-4147f3842f27', // Pullover
  lamp:       '1507473885765-e6ed057f782c', // Lampe
  scale:      '1626806787461-102c1bfaaea1', // Küchenwaage
  knife:      '1593618998160-e34014e67546', // Messer
  pot:        '1585515320310-259814833e62', // Bräter
  sticks:     '1551632811-561732d1e306',    // Wandern
  compass:    '1508672019048-805c876b67e2', // Kompass / Karte
  journal:    '1531346878377-a5be20888e57', // Notizbuch
  teapot:     '1544787219-7f47ccb76574',    // Tee
  game:       '1610890716171-6b1bb98ffd09', // Spiele
  bottle:     '1602143407151-7111542de6e8', // Trinkflasche
  gift:       '1513885535751-8b9238bd345a', // Geschenk
  mountain:   '1464822759023-fed622ff2c3b', // Berge
  plant:      '1485955900006-10f4d324d411', // Pflanze
  bag:        '1553062407-98eeb64c6a62',    // Rucksack
  // Creator-Looks
  'look:l1':  '1513694203232-719a280e022f', // Flur / Interior
  'look:l2':  '1507473885765-e6ed057f782c', // Abendlicht
  'look:l3':  '1495474472287-4d71bcdd2085', // Kaffee-Ecke
  'look:l4':  '1556909114-f6e7ad7d3136',    // Schmorgericht / Küche
  'look:l5':  '1470071459604-3b5ec3a7fe05', // Hüttentour
  'look:l6':  '1553531384-cc64ac80f931',    // Packen
  // Landingpage
  'hero':     '1513885535751-8b9238bd345a',
};

export const PHOTOS = Object.fromEntries(Object.entries(ID).map(([k, id]) => [k, id]));

/** URL für ein Motiv in gewünschter Breite, oder null, wenn kein Foto hinterlegt ist. */
export const photoUrl = (key, w = 800) =>
  ID[key] ? `https://images.unsplash.com/photo-${ID[key]}?auto=format&fit=crop&w=${w}&q=70` : null;
