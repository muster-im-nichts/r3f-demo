import type { Character } from './types'

export const CHARACTERS: Character[] = [
  {
    id: 'greta',
    name: 'Greta',
    description: 'Marktfrau mit wachen Augen. Kennt jeden in der Innenstadt.',
    voice: 'narrator-female',
    sprite: {
      skin: '#e8b48a',
      hair: '#6b3a1f',
      coat: '#8a4b3c',
      trousers: '#4a3550',
      accent: '#d9a441',
      hat: false,
      skirt: true,
      broad: false,
    },
  },
  {
    id: 'wilhelm',
    name: 'Wilhelm',
    description: 'Uhrmachergeselle. Ruhige Hände, neugieriger Kopf.',
    voice: 'young-man',
    sprite: {
      skin: '#e8c49a',
      hair: '#2e2620',
      coat: '#33506b',
      trousers: '#26303a',
      accent: '#7ec4a2',
      hat: true,
      skirt: false,
      broad: true,
    },
  },
  {
    id: 'lotte',
    name: 'Lotte',
    description: 'Botenmädchen. Schnell zu Fuß, schneller im Denken.',
    voice: 'young-woman',
    sprite: {
      skin: '#dba578',
      hair: '#1f1a2e',
      coat: '#3f6b4a',
      trousers: '#5a4632',
      accent: '#d96a5a',
      hat: false,
      skirt: false,
      broad: false,
    },
  },
]

export function getCharacter(id: string): Character {
  const c = CHARACTERS.find(c => c.id === id)
  if (!c) throw new Error(`Unbekannter Charakter "${id}"`)
  return c
}
