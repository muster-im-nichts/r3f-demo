import type { SpriteSpec } from './types'

/**
 * Gesprächspartner der Szenen. Szenen-gebunden statt kampagnen-gebunden:
 * dieselbe Figur funktioniert als Kulisse in beiden Geschichten.
 */
export interface NpcSpec {
  id: string
  name: string
  sprite: SpriteSpec
  scale?: number
  /** Semantischer Stimm-Key aus src/audio/voices.json */
  voice?: string
}

export const NPCS: Record<string, NpcSpec> = {
  hanne: {
    id: 'npc-hanne',
    voice: 'old-woman',
    name: 'Hanne',
    sprite: {
      skin: '#e0b18c',
      hair: '#b8b0a0',
      coat: '#7a5a68',
      trousers: '#4a3550',
      accent: '#c9b089',
      hat: false,
      skirt: true,
      broad: false,
    },
  },
  karl: {
    id: 'npc-karl',
    voice: 'young-man',
    name: 'Karl',
    sprite: {
      skin: '#ecc9a0',
      hair: '#c98a3a',
      coat: '#8a7a5a',
      trousers: '#3a4a5a',
      accent: '#3f8a5a', // das grüne Halstuch!
      hat: false,
      skirt: false,
      broad: false,
    },
    scale: 0.92,
  },
  wache: {
    id: 'npc-wache',
    voice: 'gruff-man',
    name: 'Wache',
    sprite: {
      skin: '#e0b18c',
      hair: '#2e2620',
      coat: '#2e4a6b',
      trousers: '#26303a',
      accent: '#d9a441',
      hat: true,
      skirt: false,
      broad: true,
    },
  },
  kraehe: {
    id: 'npc-kraehe',
    voice: 'gruff-man',
    name: 'die Krähe',
    sprite: {
      skin: '#d8c0a8',
      hair: '#1a161f',
      coat: '#1f1b26',
      trousers: '#1a161f',
      accent: '#3a3f4a',
      hat: true,
      skirt: false,
      broad: false,
    },
  },
  mueller: {
    id: 'npc-mueller',
    voice: 'old-man',
    name: 'Müller',
    sprite: {
      skin: '#e8c49a',
      hair: '#d8d0c0',
      coat: '#cfc4ae',
      trousers: '#6b5a42',
      accent: '#e3d5b8',
      hat: false,
      skirt: false,
      broad: true,
    },
  },
  junge: {
    id: 'npc-junge',
    voice: 'child',
    name: 'Müllerjunge',
    sprite: {
      skin: '#ecc9a0',
      hair: '#6b3a1f',
      coat: '#5a6b7a',
      trousers: '#4a3a2a',
      accent: '#c9b089',
      hat: false,
      skirt: false,
      broad: false,
    },
    scale: 0.8,
  },
  schaffner: {
    id: 'npc-schaffner',
    voice: 'narrator',
    name: 'Schaffner',
    sprite: {
      skin: '#e8c49a',
      hair: '#3a3028',
      coat: '#26456b',
      trousers: '#1f2733',
      accent: '#d94040', // die rote Signalfahne am Gürtel
      hat: true,
      skirt: false,
      broad: false,
    },
  },
  brigadier: {
    id: 'npc-brigadier',
    voice: 'gruff-man',
    name: 'Brigadier',
    sprite: {
      skin: '#dba578',
      hair: '#8a8378',
      coat: '#5a6066',
      trousers: '#3a4046',
      accent: '#e8a13a', // der gelbe Schutzhelm-Rand
      hat: true,
      skirt: false,
      broad: true,
    },
  },
  wachtmeister: {
    id: 'npc-wachtmeister',
    voice: 'old-man',
    name: 'Wachtmeister',
    sprite: {
      skin: '#e0b18c',
      hair: '#b0a898',
      coat: '#3a4a2e',
      trousers: '#26303a',
      accent: '#c9a441',
      hat: true,
      skirt: false,
      broad: true,
    },
  },
  heizer: {
    id: 'npc-heizer',
    voice: 'gruff-man',
    name: 'Heizer',
    sprite: {
      skin: '#c9a07a',
      hair: '#1f1a16',
      coat: '#3a3430', // rußgeschwärzte Jacke
      trousers: '#2a2622',
      accent: '#8a2f2a',
      hat: false,
      skirt: false,
      broad: true,
    },
  },
  neuling: {
    id: 'npc-neuling',
    voice: 'young-man',
    name: 'der Neue',
    sprite: {
      skin: '#ecc9a0',
      hair: '#4a3626',
      coat: '#6b7a8a', // adretter Werkskittel
      trousers: '#3a4046',
      accent: '#d9d0c0',
      hat: false,
      skirt: false,
      broad: false,
    },
  },
  staedter: {
    id: 'npc-staedter',
    voice: 'narrator',
    name: 'der Städter',
    sprite: {
      skin: '#e8c49a',
      hair: '#2e2a26',
      coat: '#26262e', // langer dunkler Mantel
      trousers: '#1f1f26',
      accent: '#5a5a6b',
      hat: true,
      skirt: false,
      broad: false,
    },
  },
  schiffer: {
    id: 'npc-schiffer',
    voice: 'old-man',
    name: 'Schiffer',
    sprite: {
      skin: '#d9a887',
      hair: '#d0c8b8',
      coat: '#2e4a5a', // Öljacke
      trousers: '#3a3430',
      accent: '#c9b089',
      hat: true,
      skirt: false,
      broad: true,
    },
  },
  runge: {
    id: 'npc-runge',
    voice: 'old-man',
    name: 'Meister Runge',
    sprite: {
      skin: '#e8c49a',
      hair: '#c8c0b0',
      coat: '#4a3a5a', // feiner Meistermantel
      trousers: '#2e2a3a',
      accent: '#d9a441', // die Uhrkette!
      hat: false,
      skirt: false,
      broad: false,
    },
  },
}

/**
 * Standard-Besetzung: wer ohne eigenes cast-Feld in der Szene steht.
 * Kampagnen überschreiben das pro Knoten mit `cast`, Dialog-Sprecher
 * treten automatisch zusätzlich auf.
 */
export const SCENE_DEFAULT_CAST: Record<string, string[]> = {
  marktplatz: ['hanne'],
  werkstatt: ['karl'],
  wachstube: ['wache'],
  gasse: ['kraehe'],
  finale: ['kraehe'],
  kanal: ['junge'],
  muehle: ['mueller'],
  bahnhof: ['schaffner'],
  fabrik: ['brigadier'],
}
