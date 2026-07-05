# Szenenbilder

Hier liegen die Matte-Painting-Hintergründe der Bühne (PNG, ideal 16:9,
z.B. 1920x1080 — der Pixel-Look kommt über NearestFilter, also gern auch
kleiner wie 480x270).

## Namensschema

- `{epoche}-{szene}.png` — z.B. `1760-marktplatz.png`, `1960-gasse.png`
- `default-{szene}.png` — Fallback für alle Epochen, z.B. `default-werkstatt.png`

Fehlt beides, generiert die App automatisch einen Pixel-Platzhalter.

## Aktuell verwendete Szenen-Keys

Jede Epoche×Genre-Kombination hat ihre eigene Kampagne:

- 1760 Krimi "Die gestohlene Taschenuhr": `marktplatz`, `werkstatt`, `wachstube`, `gasse`, `finale`
- 1760 Helden "Die Nacht des Hochwassers": `kanal`, `marktplatz`, `muehle`
- 1860 Krimi "Die Lohnkasse aus dem Nachtzug": `bahnhof`, `wachstube`, `gasse`, `finale`
- 1860 Helden "Funkenflug": `bahnhof`, `marktplatz`, `kanal`, `muehle`
- 1960 Krimi "Die verschwundenen Blaupausen": `fabrik`, `wachstube`, `marktplatz`, `gasse`, `finale`
- 1960 Helden "Kohle auf dem Eis": `kanal`, `fabrik`, `marktplatz`, `muehle`

Epochen: `1760`, `1860`, `1960`.
