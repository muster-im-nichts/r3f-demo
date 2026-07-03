export type EpochId = '1760' | '1860' | '1960'
export type GenreId = 'krimi' | 'helden'
export type CharacterId = 'greta' | 'wilhelm' | 'lotte'
export type NodeId = string
export type Ending = 'success' | 'failure'

/**
 * Textbaustein mit optionalen Varianten. Auflösung: byCharacter > byEpoch >
 * default. Im Text ersetzt die Engine {name} durch den Charakternamen.
 */
export interface TextVariant {
  default: string
  byEpoch?: Partial<Record<EpochId, string>>
  byCharacter?: Partial<Record<CharacterId, string>>
}

export interface StoryOption {
  label: string
  target: NodeId
}

export interface StoryNode {
  id: NodeId
  /** Szenen-Key, wird zu `${epoche}-${scene}` aufgelöst (z.B. "1760-marktplatz") */
  scene: string
  text: TextVariant
  /** Optionale Sprechblase über dem Avatar */
  speech?: TextVariant
  /** 2–3 Optionen; fehlt genau bei Endknoten */
  options?: StoryOption[]
  /** Gesetzt genau dann, wenn options fehlt */
  ending?: Ending
}

export interface Campaign {
  id: string
  title: string
  genre: GenreId
  start: NodeId
  nodes: Record<NodeId, StoryNode>
}

export interface SpriteSpec {
  skin: string
  hair: string
  coat: string
  trousers: string
  accent: string
  hat: boolean
  skirt: boolean
  broad: boolean
}

export interface Character {
  id: CharacterId
  name: string
  description: string
  sprite: SpriteSpec
}

export interface EpochInfo {
  id: EpochId
  label: string
  tagline: string
  /** Farbstimmung für prozedurale Platzhalter-Szenen */
  mood: { sky: [string, string]; building: string; light: string }
}

export interface GameSetup {
  epoch: EpochId
  character: Character
  genre: GenreId
}
