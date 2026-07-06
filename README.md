# Eberswalder Zeitreise

Prototyp (Vertical Slice, Reifegrad 1) des Text-Adventures für das Museum
Eberswalde: ein klassisches 80er-Adventure als 3D-Theaterbühne — Matte-Painting-
Hintergrund, Pixel-Avatar im Vordergrund, sanfter Parallax, 8-Bit-Musik.

## Starten

```
npm install
npm run dev
```

Dann http://localhost:5173 öffnen (auch am Smartphone im selben Netz nutzbar,
`npm run dev -- --host`).

## Aufbau

- `src/game/` — Story-Engine und Kampagnen, reines TypeScript ohne React/three.
  Jede Kombination aus Epoche und Genre hat ihre eigene Kampagne (Matrix in
  `src/game/campaigns/index.ts`). Neue Geschichten entstehen als Daten in
  `src/game/campaigns/` (Format siehe `types.ts`; `validateCampaign` prüft
  die Struktur beim Dev-Start).

## Drehbuch-Format

Ein Story-Knoten ist ein kleines Drehbuch: `text` ist die Erzählung, optionale
`dialog`-Zeilen folgen mit Sprecher — und die Bühne spielt mit:

```ts
text: { default: 'Die alte Hanne senkt die Stimme.' },
dialog: [
  { by: 'hanne', line: { default: 'Kurz vor dem Schrei huschte einer vorbei …' } },
  { by: 'narrator', line: { default: 'Ein grünes Halstuch … das kennst du doch.' } },
],
cast: ['wache', 'karl'],   // optional: Grundbesetzung statt Szenen-Standard
```

- Dialogzeilen erscheinen in der Textbox mit goldenem Sprechernamen und werden
  mit der Stimme des Sprechers vorgelesen (`voice`-Key des NPCs / der Figur).
- Erreicht der Typewriter (oder die Sprachausgabe) eine Zeile, betritt ihr
  Sprecher die Bühne — Auftritt auf Stichwort. `by: 'player'` spricht die
  eigene Figur, `by: 'narrator'` erzählt weiter.
- Ohne `cast` gilt die Standard-Besetzung der Szene (`SCENE_DEFAULT_CAST` in
  `npcs.ts`); die Stichwort-Besetzung bleibt für die Dauer der Szene bestehen.
- Alle sechs Kampagnen sind im Drehbuch-Format geschrieben.
- Anwesende NPCs sind anklickbar und geben eine Plauderzeile (`chatter` in
  `npcs.ts`), die ans Drehbuch der Textbox angehängt und vorgelesen wird.
- `src/scene/` — die R3F-Bühne: Backdrop mit Crossfade, prozeduraler
  Pixel-Avatar, Parallax-Kamera, Textur-Lader mit Platzhalter-Fallback.
- `src/ui/` — DOM-Overlays: Start-, Adventure- und End-Screen, Letterbox.
- `src/audio/` — prozeduraler Chiptune-Loop und SFX (WebAudio, keine Dateien);
  dazu `voice.ts` für Vorlesen (TTS) und Sprachwahl der Optionen (STT).

## Sprache (TTS/STT)

Das Sprachfeature existiert nur, wenn ein ElevenLabs-Key gesetzt ist —
dann wird das Drehbuch automatisch vorgelesen und der Mikrofon-Knopf wählt
Optionen per Sprache ("die Erste", "zwei", oder Worte aus der Option).
Der eine Sound-Schalter oben rechts regelt alles: Ist der Ton aus, spielt
weder Musik noch Sprache — und es werden auch keine TTS-Aufrufe abgesetzt.
Dazu eine `.env` anlegen:

```
VITE_ELEVENLABS_API_KEY=…
VITE_ELEVENLABS_VOICE_ID=…   # optional, überschreibt die Erzählstimme
```

Die Stimmen sind in `src/audio/voices.json` unter semantischen Keys
("narrator", "old-woman", …) verwaltet — Charaktere und NPCs referenzieren
nur den Key (`voice: 'old-woman'`), die IDs werden zentral gepflegt.
Beim Wählen einer Option wird die Sprachausgabe des Zielknotens schon
vorgeneriert; der Typewriter startet erst mit der Wiedergabe, damit Text
und Stimme zusammen beginnen.

Achtung: Der Key landet im Client-Bundle — nur für Demo/Kiosk geeignet,
in Produktion gehört ein kleiner Proxy davor.

## Szenenbilder

Echte Hintergründe (Pixel-Art, 16:9) einfach unter `src/assets/scenes/`
ablegen — Namensschema und aktuell verwendete Szenen-Keys stehen in
`src/assets/scenes/README.md`. Ohne Bild generiert die App automatisch
einen stimmungsvollen Platzhalter.
