# Charakter-Sprites

Hier liegen die KI-generierten Figuren-Sprites (PNG mit Alpha), erzeugt von
`npm run generate-art` (siehe Haupt-README, Abschnitt "KI-Artwork").

## Namensschema

- `{characterId}.png` — z.B. `greta.png`, `npc-hanne.png`
- IDs: `character.id` aus src/game/characters.ts bzw. `npc.id` aus src/game/npcs.ts

Fehlt die Datei, zeichnet die App automatisch den prozeduralen
Pixel-Platzhalter aus src/scene/sprites.ts.

## Format (Pflicht)

- **128×192 px, exakt 2:3** — entspricht `SPRITE_ASPECT` (32/48); andere
  Seitenverhältnisse werden auf der Bühnen-Plane verzerrt.
- **Binäres Alpha** (jedes Pixel voll deckend oder voll transparent) —
  das Material rendert mit `alphaTest 0.5`, weiche Kanten geben Säume.
- Figur unten-mittig, Fußpunkt ~2 px über der Unterkante — die Plane
  pivotiert am Fußpunkt.
- Basis-Blickrichtung: **nach rechts** (der Papiertheater-Flip spiegelt
  bei Bedarf nach links).

Neben jedem PNG liegt ein Sidecar `{name}.png.json` mit den
Generierungsparametern (Prompt, Seed, Modell) — bitte mitcommitten,
daran erkennt die Pipeline, ob das Asset aktuell ist.
