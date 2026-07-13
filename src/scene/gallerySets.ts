import type { EpochId } from '../game/types'

/**
 * Galerie-Bestückung pro Szene: Jede Szene wird als Museumsraum inszeniert
 * (GalleryRoom: dunkle Wand + Boden mit Epochen-Neon-Linien) — die Rahmen
 * an der Wand erzählen die Szene, das Spiel ist ein Museumsrundgang.
 * Rahmen-Quellen:
 *   kind 'scene'     — ein Szenengemälde aus src/assets/scenes/ (Panorama;
 *                      die Epoche wählt automatisch die passende Fassung)
 *   kind 'character' — Figuren-Porträt aus src/assets/characters/
 *   kind 'object'    — Story-Exponat aus src/assets/objects/
 *   kind 'image'     — direkte URL (später: Originalfotos aus dem Museumsbestand)
 *
 * x ist die Wandposition in Weltkoordinaten (0 = Bühnenmitte), width die
 * Rahmenbreite; die Höhe folgt dem Seitenverhältnis des Bildes. `epoch`
 * beschränkt einen Rahmen auf eine Epoche (z.B. Kampagnen-Ankerobjekte).
 */
export interface FrameSpec {
  kind: 'scene' | 'character' | 'object' | 'image'
  src: string
  x: number
  width: number
  /** Mittelpunkthöhe über dem Boden (Default: Galerie-Hängung) */
  y?: number
  title?: string
  /** Nur in dieser Epoche hängen (Default: alle) */
  epoch?: EpochId
}

const PANORAMA = { kind: 'scene' as const, x: 0, width: 4.6 }
const PORTRAIT = { kind: 'character' as const, width: 1.05 }
const EXPONAT = { kind: 'object' as const, width: 1.15, y: 2.35 }

export const GALLERY_SETS: Record<string, FrameSpec[]> = {
  marktplatz: [
    { ...PORTRAIT, src: 'npc-hanne', x: -3.4, title: 'Hanne, Marktfrau' },
    { ...PANORAMA, src: 'marktplatz', title: 'Der Marktplatz' },
    { ...PORTRAIT, src: 'npc-staedter', x: 3.4, title: 'Ein Besucher' },
  ],
  werkstatt: [
    { ...PORTRAIT, src: 'npc-runge', x: -4.1, title: 'Meister Runge' },
    { ...EXPONAT, src: 'taschenuhr', x: -2.9, title: 'Die goldene Taschenuhr' },
    { ...PANORAMA, src: 'werkstatt', x: 0.2, title: 'Die Uhrmacherwerkstatt' },
    { ...PORTRAIT, src: 'npc-karl', x: 3.6, title: 'Karl, der Geselle' },
  ],
  wachstube: [
    { ...PORTRAIT, src: 'npc-wache', x: -3.4, title: 'Die Wache' },
    { ...PANORAMA, src: 'wachstube', title: 'Die Wachstube' },
    { ...PORTRAIT, src: 'npc-wachtmeister', x: 3.4, title: 'Der Wachtmeister' },
  ],
  gasse: [
    { ...PORTRAIT, src: 'npc-kraehe', x: -3.4, title: 'Die Krähe' },
    { ...PANORAMA, src: 'gasse', title: 'Die Fischergasse' },
    { ...PORTRAIT, src: 'npc-neuling', x: 3.4, title: 'Der Neue' },
  ],
  finale: [
    // Das Ankerobjekt der jeweiligen Kampagne hängt im Showdown-Raum
    { ...EXPONAT, src: 'taschenuhr', x: -3.4, title: 'Die goldene Taschenuhr', epoch: '1760' },
    { ...EXPONAT, src: 'lohnkasse', x: -3.4, title: 'Die Lohnkasse', epoch: '1860' },
    { ...EXPONAT, src: 'blaupausen', x: -3.4, title: 'Die Blaupausen', epoch: '1960' },
    { ...PANORAMA, src: 'finale', title: 'Das Lagerhaus' },
    { ...PORTRAIT, src: 'npc-kraehe', x: 3.4, title: 'Die Krähe' },
  ],
  kanal: [
    { ...PORTRAIT, src: 'npc-schiffer', x: -3.4, title: 'Der Schiffer' },
    { ...PANORAMA, src: 'kanal', title: 'Der Finowkanal' },
    { ...PORTRAIT, src: 'npc-junge', x: 3.4, title: 'Der Müllerjunge' },
  ],
  muehle: [
    { ...PORTRAIT, src: 'npc-mueller', x: -3.4, title: 'Der Müller' },
    { ...PANORAMA, src: 'muehle', title: 'Die Mühle' },
    { ...PORTRAIT, src: 'npc-junge', x: 3.4, title: 'Der Müllerjunge' },
  ],
  bahnhof: [
    { ...PORTRAIT, src: 'npc-schaffner', x: -4.1, title: 'Der Schaffner' },
    { ...EXPONAT, src: 'lohnkasse', x: -2.9, title: 'Die eiserne Lohnkasse' },
    { ...PANORAMA, src: 'bahnhof', x: 0.2, title: 'Der Bahnhof' },
    { ...PORTRAIT, src: 'npc-heizer', x: 3.6, title: 'Der Heizer' },
  ],
  fabrik: [
    { ...PORTRAIT, src: 'npc-brigadier', x: -4.1, title: 'Der Brigadier' },
    { ...EXPONAT, src: 'blaupausen', x: -2.9, title: 'Die Blaupausen' },
    { ...PANORAMA, src: 'fabrik', x: 0.2, title: 'Das Kranwerk' },
    { ...PORTRAIT, src: 'npc-neuling', x: 3.6, title: 'Der Neue' },
  ],
}
