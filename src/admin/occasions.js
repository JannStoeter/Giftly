/*
 * Aktionsvorschläge für die nächsten Monate, schon fertig ausgefüllt.
 * Der Ton bleibt beim Wünschen: Es geht um die eigene Wunschliste, nicht um Angebote oder Kaufdruck.
 */
const d = (y, m, day, h = 8) => new Date(y, m - 1, day, h, 0, 0);
const nthWeekday = (y, m, wd, n) => { const first = d(y, m, 1).getDay(); return 1 + ((wd - first + 7) % 7) + (n - 1) * 7; };
const iso = x => x.toISOString();

/** Texte für Menschen, die schon ein Wishtale haben (in der App). Es geht um passende Geschenke für sie selbst. */
const APP = {
  bf: { app_headline: 'Black Friday steht vor der Tür', app_body: 'Der beste Zeitpunkt, damit deine Freunde passende Geschenke für dich finden. Teile deinen Wunschzettel, dann wissen sie, worüber du dich freuen würdest.', app_cta_label: 'Wunschzettel teilen', app_cta_action: 'share' },
  xmas: { app_headline: 'Weihnachten steht vor der Tür', app_body: 'Deine Liebsten suchen schon nach Ideen. Mit deinem Link sehen sie auf einen Blick, was zu dir passt.', app_cta_label: 'Wunschzettel teilen', app_cta_action: 'share' },
  nikolaus: { app_headline: 'Was steckt in deinem Stiefel?', app_body: 'Ein kleiner Wunsch reicht oft schon. Trag ihn ein, und teile danach deinen Link.', app_cta_label: 'Wunsch eintragen', app_cta_action: 'wishes' },
  last: { app_headline: 'Noch ein Link, und alle wissen Bescheid', app_body: 'Bis Heiligabend ist noch Zeit. Teile deinen Wunschzettel, damit deine Freunde das Passende für dich finden.', app_cta_label: 'Wunschzettel teilen', app_cta_action: 'share' },
  newyear: { app_headline: 'Was wünschst du dir fürs neue Jahr?', app_body: 'Zwischen den Jahren ist Zeit zum Träumen. Halte fest, worauf du dich freust.', app_cta_label: 'Wünsche ansehen', app_cta_action: 'wishes' },
  valentin: { app_headline: 'Verrate, worüber du dich freuen würdest', app_body: 'Wer weiß, was dir gefällt, trifft viel leichter, was dir wirklich Freude macht.', app_cta_label: 'Wunschzettel teilen', app_cta_action: 'share' },
  muttertag: { app_headline: 'Zeig deiner Familie, was dir gefällt', app_body: 'Mit einem Wunschzettel müssen deine Liebsten nicht raten.', app_cta_label: 'Wunschzettel teilen', app_cta_action: 'share' },
};

/** Liefert Vorschläge, deren Ende noch nicht vorbei ist, sortiert nach Beginn. */
export function suggest(now = new Date()) {
  const out = [];
  [now.getFullYear(), now.getFullYear() + 1].forEach(y => {
    const bf = nthWeekday(y, 11, 5, 4); // vierter Freitag im November
    const mother = nthWeekday(y, 5, 0, 2); // zweiter Sonntag im Mai
    out.push(
      { id: `bf-${y}`, title: `Black Week ${y}`, when: 'Black Friday bis Cyber Monday', start: d(y, 11, bf - 4), end: d(y, 12, 1, 0),
        headline: 'Black Friday, nur anders: Schreib auf, was du dir wirklich wünschst',
        body: 'Zwischen all den Angeboten geht leicht unter, worüber du dich wirklich freust. In deinem Wishtale sammelst du es an einem Ort, und deine Freunde finden es, wenn es Zeit zum Schenken ist.',
        cta_label: 'Meinen Wunschzettel anlegen' },
      { id: `xmas-${y}`, title: `Weihnachten steht vor der Tür ${y}`, when: 'Von Mitte November bis kurz vor Weihnachten', start: d(y, 11, 9), end: d(y, 12, 22, 20),
        headline: 'Weihnachten steht vor der Tür, und du weißt nicht, was du dir wünschen sollst?',
        body: 'Lass dich von deinem eigenen Geschmack inspirieren. In deinem Wishtale stehen deine Interessen, deine Lieblingsmarken und alles, was du schon hast, und daraus entstehen Wünsche, die zu dir passen.',
        cta_label: 'Wünsche entdecken' },
      { id: `nikolaus-${y}`, title: `Nikolaus ${y}`, when: '1. bis 6. Dezember', start: d(y, 12, 1), end: d(y, 12, 6, 23),
        headline: 'Was steckt in deinem Stiefel? Verrate es deinen Liebsten',
        body: 'Ein kleiner Wunsch reicht oft schon. Schreib ihn in dein Wishtale, und deine Familie weiß Bescheid.',
        cta_label: 'Wunsch aufschreiben' },
      { id: `last-${y}`, title: `Wunschzettel in letzter Minute ${y}`, when: '15. bis 23. Dezember', start: d(y, 12, 15), end: d(y, 12, 23, 20),
        headline: 'Noch ein Link, und alle wissen, worüber du dich freuen würdest',
        body: 'Auch kurz vor Heiligabend lässt sich ein Wunschzettel anlegen. Teile den Link, und deine Freunde finden ohne Nachfragen, was zu dir passt.',
        cta_label: 'Link jetzt anlegen' },
      { id: `newyear-${y + 1}`, title: `Wünsche fürs neue Jahr ${y + 1}`, when: 'Zwischen den Jahren', start: d(y, 12, 27), end: d(y + 1, 1, 6, 20),
        headline: 'Was wünschst du dir fürs neue Jahr?',
        body: 'Zwischen den Jahren ist Zeit zum Träumen. Halte fest, worauf du dich freust, und zeig es den Menschen, die dir eine Freude machen möchten.',
        cta_label: 'Meine Wünsche sammeln' },
      { id: `valentin-${y + 1}`, title: `Valentinstag ${y + 1}`, when: '1. bis 14. Februar', start: d(y + 1, 2, 1), end: d(y + 1, 2, 14, 20),
        headline: 'Wünsch dir was, damit andere es dir erfüllen können',
        body: 'Nicht jede Überraschung muss ein Rätsel sein. Wer weiß, was dir gefällt, trifft viel leichter, was dir wirklich Freude macht.',
        cta_label: 'Mein Wishtale anlegen' },
      { id: `muttertag-${y + 1}`, title: `Muttertag ${y + 1}`, when: 'Eine Woche vorher', start: d(y + 1, 5, mother - 7), end: d(y + 1, 5, mother, 12),
        headline: 'Verrate deiner Familie, worüber du dich freuen würdest',
        body: 'Mit einem Wunschzettel müssen deine Liebsten nicht raten. Sie sehen auf einer Seite, was dir gefällt.',
        cta_label: 'Wunschzettel anlegen' },
    );
  });
  return out.filter(o => o.end > now).sort((a, b) => a.start - b.start).slice(0, 6).map(o => ({
    ...APP[o.id.split('-')[0]], ...o, start: iso(o.start < now ? new Date(now.getTime() + 36e5) : o.start), end: iso(o.end), running: o.start <= now,
    placement: ['landing', 'app'], cta_url: '/app/#start',
  }));
}
