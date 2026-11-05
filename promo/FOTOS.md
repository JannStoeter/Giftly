# Fotos für Karussell und Reel

Eigene Fotos der echten Produkte machen das Material glaubwürdiger. Sie sind außerdem rechtlich einfacher als alles, was von Amazon kommt: Amazon-Produktbilder und Amazon-Preise dürfen wir ohne die API nicht verwenden.

## Welche Produkte
Vier Motive, in dieser Reihenfolge der Geschichte von Jonas:

| Schlüssel | Motiv | Wo es erscheint |
|---|---|---|
| `grinder` | Handkaffeemühle (die, die auf Jonas’ Wunschliste steht) | Folie 3, Reel „Darüber würde sich Jonas freuen“ |
| `kettle` | Wasserkocher mit Temperaturwahl | Folie 3, Reel |
| `scale` | Kaffeewaage (das Geschenk, das Lena wählt) | Folie 6, Reel |
| `course` | Barista-Kurs: zum Beispiel eine Gutscheinkarte, ein Siphon oder Siebträger im Café | Folie 6, Reel |

Der Barista-Kurs ist ein Erlebnis. Ein schönes Foto dafür: eine selbst gestaltete Gutscheinkarte neben einer Tasse, oder ein Siebträger im Licht.

## So fotografierst du
- **Licht:** Am Fenster, tagsüber, kein Blitz. Die Lichtquelle seitlich, nicht von vorne.
- **Hintergrund:** Ein ruhiger, warmer Untergrund in Beige oder Leinen, möglichst derselbe für alle vier Fotos. Das passt zu unserem Papierton (`#F3EDE2`).
- **Perspektive:** Von schräg oben (etwa 30 bis 45 Grad) oder von oben. Für alle Fotos dieselbe.
- **Abstand:** Das Produkt in der Mitte und rundherum viel Platz. Wir schneiden quadratisch und in 10:7 zu, deshalb darf nichts am Rand kleben.
- **Format:** Hochkant oder quer ist egal, mindestens 1500 Pixel an der langen Seite, als JPG.
- **Marken:** Logos dürfen sichtbar sein. Stell das Produkt nicht so, dass es nach Empfehlung einer Marke aussieht.
- **Keine Personen und keine Preisschilder** im Bild.

## So kommen die Fotos in den Beitrag
1. Lege die Dateien in `promo/photos/` ab, zum Beispiel `muehle.jpg`, `kocher.jpg`, `waage.jpg`, `kurs.jpg`.
2. Trage die Dateinamen in `promo/content.mjs` ein:
   `export const PH = { grinder: 'muehle.jpg', kettle: 'kocher.jpg', scale: 'waage.jpg', course: 'kurs.jpg' };`
3. Passe in derselben Datei die Namen der Produkte an (zum Beispiel „Handkaffeemühle“ in den genauen Namen).
4. `npm run promo` ausführen. Alle Folien und das Reel nehmen die Fotos automatisch. Ohne Datei bleibt die Illustration stehen.

Hinweis: Das Repository ist öffentlich. Alles in `promo/photos/` ist damit sichtbar, sobald es gepusht wird. Wenn du das nicht möchtest, lass die Fotos lokal und führe den Befehl bei dir aus.
