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
- `src/scene/` — die R3F-Bühne: Backdrop mit Crossfade, prozeduraler
  Pixel-Avatar, Parallax-Kamera, Textur-Lader mit Platzhalter-Fallback.
- `src/ui/` — DOM-Overlays: Start-, Adventure- und End-Screen, Letterbox.
- `src/audio/` — prozeduraler Chiptune-Loop und SFX (WebAudio, keine Dateien);
  dazu `voice.ts` für Vorlesen (TTS) und Sprachwahl der Optionen (STT).

## Sprache (TTS/STT)

Der 🔊-Knopf in der Textbox liest die Geschichte vor, der 🎤-Knopf wählt
Optionen per Sprache ("die Erste", "zwei", oder Worte aus der Option).
Ohne Konfiguration spricht die Browser-Stimme (Web Speech API). Für
ElevenLabs-Qualität eine `.env` anlegen:

```
VITE_ELEVENLABS_API_KEY=…
VITE_ELEVENLABS_VOICE_ID=…   # optional
```

Achtung: Der Key landet im Client-Bundle — nur für Demo/Kiosk geeignet,
in Produktion gehört ein kleiner Proxy davor.

## Szenenbilder

Echte Hintergründe (Pixel-Art, 16:9) einfach unter `src/assets/scenes/`
ablegen — Namensschema und aktuell verwendete Szenen-Keys stehen in
`src/assets/scenes/README.md`. Ohne Bild generiert die App automatisch
einen stimmungsvollen Platzhalter.
