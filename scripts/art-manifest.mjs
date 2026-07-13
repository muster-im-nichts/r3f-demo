/**
 * Prompt-/Seed-Katalog für die KI-Art-Pipeline (npm run generate-art).
 *
 * Reine Daten, kein Code: pro Asset ein Eintrag mit key, seed und prompt.
 * Die Seeds sind fest vergeben (Nummernkreise: Szenen 17600x/18600x/19600x,
 * Charaktere 9000xx) — Kuration heißt: Seed im Eintrag ändern, committen.
 * Prompt- oder Seed-Änderungen erkennt generate-art.mjs über die Sidecar-
 * Dateien ({name}.png.json) und generiert das Asset neu.
 *
 * Prompts auf Englisch — Flux versteht englische Prompts deutlich besser.
 * Optionale Overrides pro Eintrag: steps, colors, kernel, model; für
 * Charaktere zusätzlich flip (Bild spiegeln, wenn der Blick nach links
 * geriet) und pixelate (n = gröberes Pixelraster für weiche Bilder).
 */

/** Gemeinsamer Stil-Vorspann — Konsistenz vor Kreativität. */
export const STYLE = {
  // "theater stage set" + parallele Kanten: die Bühne scrollt seitwärts,
  // Kulissen brauchen Frontal-Komposition — keine Fluchtpunkt-Tiefe zur
  // Bildmitte (Straße/Gleis orthogonal zur unteren Schnittkante)
  scene:
    'fine pixel art, 16-bit hi-bit style, point-and-click adventure game background, ' +
    'in the style of classic SCUMM adventures, painterly dithering, muted palette, ' +
    'moody theatrical night lighting, flat side-on view like a theater stage set, ' +
    'building facades parallel to the picture plane, street running level across ' +
    'the bottom edge, seen straight-on from across the street, empty scene, ' +
    'no people, no animals, no text, no watermark',
  // Ohne eigenen Vorspann drückt "street" Innenräume nach draußen
  sceneInterior:
    'fine pixel art, 16-bit hi-bit style, point-and-click adventure game background, ' +
    'in the style of classic SCUMM adventures, painterly dithering, muted palette, ' +
    'moody dim interior lighting, flat side-on view like a theater stage set, ' +
    'back wall parallel to the picture plane, floor running level across the ' +
    'bottom edge, room seen straight-on from inside, empty room, ' +
    'no people, no animals, no text, no watermark',
  object:
    'fine pixel art, 16-bit hi-bit style, a single museum exhibit object on display, ' +
    'centered, isolated, softly lit from above, plain flat light grey background, ' +
    'no text, no watermark, no people, no hands',
  // "natural realistic body proportions" hält die Figuren-Anatomie über
  // alle Charaktere einheitlich — ohne mischt Flux Chibi- und Normalformen
  character:
    'fine pixel art, 16-bit hi-bit style, full-body adventure game character sprite, ' +
    'in the style of classic SCUMM adventures, standing idle in relaxed pose, ' +
    'three-quarter view facing right, natural realistic body proportions, ' +
    'whole figure visible from head to feet, feet at the bottom edge, centered, ' +
    'plain flat light grey background, no text, no watermark',
}

/** Epochen-Kontext (angelehnt an die Taglines in src/game/epochs.ts) */
export const EPOCH_CONTEXT = {
  1760: 'Prussian small town Eberswalde in 1760, timber-framed houses, candlelight and lanterns, cobblestones',
  1860: 'German town Eberswalde in 1860, early industrial age, gas lanterns, railway smoke, brick buildings',
  1960: 'East German town Eberswalde in 1960, GDR era, neon signs, concrete, cranes and quiet optimism',
}

/**
 * Szenen: eine Datei je epoch×scene → src/assets/scenes/{key}.png (480x270).
 * Nur Kombinationen, die in src/game/campaigns/*.ts vorkommen.
 */
export const SCENES = [
  // --- 1760: "Die gestohlene Taschenuhr" + "Die Nacht des Hochwassers"
  { key: '1760-marktplatz', epoch: 1760, seed: 176001,
    prompt: 'market square at night, wooden market stalls with canvas roofs, church tower silhouette, warm lantern glow on cobblestones' },
  { key: '1760-werkstatt', epoch: 1760, seed: 176002, interior: true,
    prompt: 'clockmaker workshop interior, workbench with tiny tools and gears, pendulum wall clocks, candlelight, wooden beams' },
  { key: '1760-wachstube', epoch: 1760, seed: 176003, interior: true,
    prompt: 'town guard room interior, heavy wooden desk, halberds on the wall, barred window, single candle, stone floor' },
  { key: '1760-gasse', epoch: 1760, seed: 176004,
    prompt: 'row of crooked timber-framed fishermen house fronts facing the viewer along a narrow lane, hanging fishing nets, wet cobblestones running level across the foreground, single lantern' },
  { key: '1760-finale', epoch: 1760, seed: 176005, interior: true,
    prompt: 'old warehouse interior at night, stacked wooden crates and barrels, rope and pulley, moonlight through a high window' },
  { key: '1760-kanal', epoch: 1760, seed: 176006,
    prompt: 'canal embankment at night, wooden lock gate, moored flat barge, rising flood water, rain, lantern light reflections' },
  { key: '1760-muehle', epoch: 1760, seed: 176007, interior: true,
    prompt: 'watermill interior, large wooden gear wheels and millstones, flour sacks, dust in warm lantern light' },

  // --- 1860: "Die Lohnkasse aus dem Nachtzug" + "Funkenflug"
  { key: '1860-marktplatz', epoch: 1860, seed: 186001,
    prompt: 'market square at night, gas lanterns, brick town houses, church tower silhouette, closed market stalls' },
  { key: '1860-bahnhof', epoch: 1860, seed: 186002,
    prompt: 'railway station building facade facing the viewer, platform and tracks running horizontally across the foreground from left to right, steam locomotive standing in full side profile, gas lamps, luggage carts, smoke and fog' },
  { key: '1860-wachstube', epoch: 1860, seed: 186003, interior: true,
    prompt: 'police watch room interior, oil lamp on a heavy desk, wanted posters on the wall, iron stove, barred window' },
  { key: '1860-gasse', epoch: 1860, seed: 186104, // 186004: Fluchtpunkt-Tunnel
    prompt: 'row of brick and timber fishermen house fronts facing the viewer along a narrow lane, gas lantern, wet cobblestones running level across the foreground, hanging fishing nets' },
  { key: '1860-finale', epoch: 1860, seed: 186005, interior: true,
    prompt: 'railway goods warehouse interior at night, stacked freight crates, iron scales, oil lamp, sliding wooden door ajar' },
  { key: '1860-kanal', epoch: 1860, seed: 186106, // 186006: Kanal läuft in die Tiefe
    prompt: 'industrial canal running horizontally across the frame, stone quay wall facing the viewer, moored barges in side profile, iron footbridge, factory chimneys behind, gas lantern reflections on water' },
  { key: '1860-muehle', epoch: 1860, seed: 186007, interior: true,
    prompt: 'watermill interior, wooden gears and belt drives, millstones, flour sacks, oil lamp glow' },

  // --- 1960: "Die verschwundenen Blaupausen" + "Kohle auf dem Eis"
  { key: '1960-marktplatz', epoch: 1960, seed: 196001,
    prompt: 'town square at night, neon shop signs, concrete apartment blocks next to old brick houses, street lamps, parked motorcycles' },
  { key: '1960-fabrik', epoch: 1960, seed: 196002, interior: true,
    prompt: 'deserted crane factory hall interior, huge steel crane parts, welding sparks glow, industrial lamps, banners on the wall, completely empty of workers' },
  { key: '1960-wachstube', epoch: 1960, seed: 196003, interior: true,
    prompt: 'police station office interior, metal desk with rotary phone and typewriter, filing cabinets, fluorescent light, venetian blinds' },
  { key: '1960-gasse', epoch: 1960, seed: 196104, // 196004: Fluchtpunkt-Tunnel
    prompt: 'row of old brick house fronts with crumbling plaster facing the viewer along a narrow lane, single electric street lamp, bicycles leaning against the walls' },
  { key: '1960-finale', epoch: 1960, seed: 196005, interior: true,
    prompt: 'factory storage hall interior at night, steel shelves with crates, blueprint cabinets, single work lamp, long shadows' },
  { key: '1960-kanal', epoch: 1960, seed: 196006,
    prompt: 'frozen industrial canal running horizontally across the frame, ice on the water, coal barge in full side profile, quay in the foreground, cranes and chimneys behind, cold blue street lamps' },
  { key: '1960-muehle', epoch: 1960, seed: 196007, interior: true,
    prompt: 'old watermill interior converted to storage, wooden gears at rest, crates and tools, single electric bulb' },
]

/**
 * Story-Objekte: Exponate für die Galerie-Rahmen → src/assets/objects/{key}.png
 * (256x256, transparent, zentriert). Referenziert aus src/scene/gallerySets.ts.
 * Platzhalter, bis Originalfotos aus dem Museumsbestand vorliegen.
 */
export const OBJECTS = [
  { key: 'taschenuhr', seed: 800001,
    prompt: 'golden pocket watch with ornate engraved case and fine chain, open lid showing a roman numeral dial' },
  { key: 'lohnkasse', seed: 800002,
    prompt: 'heavy iron railway cash box with rivets and a brass lock, worn dark green paint' },
  { key: 'blaupausen', seed: 800003,
    prompt: 'rolled architectural blueprints on deep dark blue cyanotype paper, crisp white technical drawing lines, one sheet half unrolled' },
]

/**
 * Charaktere: eine Datei je Figur → src/assets/characters/{key}.png (128x192).
 * key = character.id (src/game/characters.ts) bzw. npc.id (src/game/npcs.ts).
 * Figuren treten epochenübergreifend auf — Kostüme bewusst zeitlos halten.
 * Hexfarben aus den SpriteSpecs dienen als Palettenhinweis.
 */
export const CHARACTERS = [
  // Spielfiguren
  { key: 'greta', seed: 900201, // Casting Juli 2026
    prompt: 'market woman with sharp watchful eyes, brown hair pinned up, rust-red dress (#8a4b3c) with golden-yellow shawl (#d9a441), apron' },
  { key: 'wilhelm', seed: 901202, // Casting: realistische Proportionen statt Chibi
    prompt: 'young clockmaker journeyman with calm curious face, dark hair, flat cap, steel-blue work coat (#33506b) with mint-green scarf (#7ec4a2), sturdy build' },
  { key: 'lotte', seed: 900203, // Casting: blickt mit neuem Prompt nach rechts, flip entfallen
    prompt: 'quick-witted messenger girl, slim, very dark hair, green jacket (#3f6b4a), brown trousers (#5a4632), coral-red scarf (#d96a5a), satchel' },

  // NPCs
  { key: 'npc-hanne', seed: 900101,
    prompt: 'old market woman with grey hair and knowing smile, mauve dress (#7a5a68) with beige shawl (#c9b089), apron' },
  { key: 'npc-karl', seed: 900102,
    prompt: 'nervous young apprentice, sandy-red hair (#c98a3a), plain drab work coat (#8a7a5a), distinctive green neckerchief (#3f8a5a), slight build' },
  { key: 'npc-wache', seed: 902103, // Casting: stämmig, Tschako, frontal-rechts
    prompt: 'stern town guard, broad shouldered, dark blue uniform coat (#2e4a6b) with brass-yellow trim (#d9a441), tall hat, dark moustache' },
  { key: 'npc-kraehe', seed: 902104, // Casting: lesbarere Silhouette auf dunkler Bühne
    prompt: 'shady thin informant called The Crow, long black coat (#1f1b26), wide-brimmed black hat casting shadow over the eyes, hunched posture' },
  { key: 'npc-mueller', seed: 901105, // Casting
    prompt: 'old sturdy miller with white hair, pale flour-dusted clothes (#cfc4ae), brown trousers (#6b5a42), rolled-up sleeves, good-natured face' },
  { key: 'npc-junge', seed: 900206, // Casting: mit neuem Prompt knackig, pixelate entfallen
    prompt: 'cheeky miller boy, about ten years old, brown tousled hair, blue-grey shirt (#5a6b7a), brown trousers, simple shoes, crisp pixel-art shading' },
  { key: 'npc-schaffner', seed: 900207, // Casting: mit neuem Prompt knackig, pixelate entfallen
    prompt: 'punctilious railway conductor, dark blue uniform (#26456b) with cap, red signal flag (#d94040) tucked in his belt, pocket watch' },
  { key: 'npc-brigadier', seed: 900108,
    prompt: 'burly factory foreman, grey work jacket (#5a6066), yellow hard hat (#e8a13a), confident stance, weathered face' },
  { key: 'npc-wachtmeister', seed: 900109,
    prompt: 'old constable with grey hair, dark green uniform coat (#3a4a2e) with brass buttons (#c9a441), peaked cap, broad build, tired eyes' },
  { key: 'npc-heizer', seed: 903110, // Casting: Hosenträger + Halstuch, klar Heizer
    prompt: 'muscular locomotive stoker, soot-blackened jacket (#3a3430) and face, dark red kerchief (#8a2f2a), shovel calluses, no hat' },
  { key: 'npc-neuling', seed: 901111, // Casting
    prompt: 'shy young factory worker, neat light blue-grey work smock (#6b7a8a), brown hair, cautious posture, hands in pockets' },
  { key: 'npc-staedter', seed: 900212, // Casting: blickt mit neuem Prompt nach rechts, flip entfallen
    prompt: 'aloof businessman from the big city, long dark tailored coat (#26262e), dark hat, thin briefcase, appraising look, crisp pixel-art shading' },
  { key: 'npc-schiffer', seed: 900113,
    prompt: 'old barge skipper with white hair and beard stubble, dark teal oilskin jacket (#2e4a5a), flat cap, broad build, pipe' },
  { key: 'npc-runge', seed: 900114,
    prompt: 'dignified old master clockmaker, fine dark purple coat (#4a3a5a), golden watch chain (#d9a441) across the vest, white hair, spectacles' },
]
