# Szenenbilder

Hier liegen die Matte-Painting-Hintergründe der Bühne (PNG, ideal 16:9,
z.B. 1920x1080 — der Pixel-Look kommt über NearestFilter, also gern auch
kleiner wie 480x270).

## Namensschema

- `{epoche}-{szene}.png` — z.B. `1760-marktplatz.png`, `1960-gasse.png`
- `default-{szene}.png` — Fallback für alle Epochen, z.B. `default-werkstatt.png`

Fehlt beides, generiert die App automatisch einen Pixel-Platzhalter.

## Aktuell verwendete Szenen-Keys

- Krimi "Die gestohlene Taschenuhr": `marktplatz`, `werkstatt`, `wachstube`, `gasse`, `finale`
- Heldengeschichte "Die Nacht des Hochwassers": `kanal`, `marktplatz`, `muehle`

Epochen: `1760`, `1860`, `1960`.
