# Story-Exponate

Hier liegen die Objekte für die Galerie-Rahmen des Museumsrundgangs
(PNG 256×256, transparent, Motiv zentriert, binäres Alpha), erzeugt von
`npm run generate-art` (Katalog: `OBJECTS` in scripts/art-manifest.mjs).

Referenziert werden sie aus `src/scene/gallerySets.ts` als
`kind: 'object'` mit dem Dateinamen (ohne .png) als `src`.

Die generierten Objekte sind Platzhalter — sobald Originalfotos aus dem
Museumsbestand digital vorliegen, hängen die per `kind: 'image'` direkt
in die Rahmen (keine Generierung nötig; ein sharp-Aufbereitungsschritt
für den Pixel-Look genügt).

Neben jedem PNG liegt ein Sidecar `{name}.png.json` mit den
Generierungsparametern — bitte mitcommitten.
