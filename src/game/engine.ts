import type { Campaign, GameSetup, NodeId, StoryNode, StoryOption, TextVariant } from './types'
import { NPCS, SCENE_DEFAULT_CAST } from './npcs'

export function getNode(campaign: Campaign, id: NodeId): StoryNode {
  const node = campaign.nodes[id]
  if (!node) throw new Error(`Story-Knoten "${id}" fehlt in Kampagne "${campaign.id}"`)
  return node
}

export function resolveText(variant: TextVariant, setup: GameSetup): string {
  const raw =
    variant.byCharacter?.[setup.character.id] ??
    variant.byEpoch?.[setup.epoch] ??
    variant.default
  return raw.replaceAll('{name}', setup.character.name)
}

/**
 * Prüft eine Kampagne auf strukturelle Fehler: tote Options-Ziele, Knoten die
 * weder Optionen noch Ende haben (oder beides), unerreichbare Knoten und
 * fehlende Enden. Wirft mit allen Befunden auf einmal.
 */
export function validateCampaign(campaign: Campaign): void {
  const errors: string[] = []
  const ids = Object.keys(campaign.nodes)

  if (!campaign.nodes[campaign.start]) {
    errors.push(`Startknoten "${campaign.start}" existiert nicht`)
  }

  for (const node of Object.values(campaign.nodes)) {
    if (node.id !== ids.find(id => campaign.nodes[id] === node)) {
      errors.push(`Knoten-Key und node.id weichen ab bei "${node.id}"`)
    }
    const isEnd = node.ending !== undefined
    const hasOptions = (node.options?.length ?? 0) > 0
    if (isEnd === hasOptions) {
      errors.push(`Knoten "${node.id}" muss entweder Optionen ODER ein Ende haben`)
    }
    if (hasOptions && (node.options!.length < 2 || node.options!.length > 3)) {
      errors.push(`Knoten "${node.id}" braucht 2–3 Optionen, hat ${node.options!.length}`)
    }
    for (const opt of node.options ?? []) {
      if (!campaign.nodes[opt.target]) {
        errors.push(`Knoten "${node.id}": Option "${opt.label}" zielt auf fehlendes "${opt.target}"`)
      }
    }
    for (const key of node.cast ?? []) {
      if (!NPCS[key]) errors.push(`Knoten "${node.id}": cast-Eintrag "${key}" ist kein bekannter NPC`)
    }
    for (const line of node.dialog ?? []) {
      if (line.by !== 'player' && line.by !== 'narrator' && !NPCS[line.by]) {
        errors.push(`Knoten "${node.id}": Dialog-Sprecher "${line.by}" ist kein bekannter NPC`)
      }
    }
  }

  const reachable = new Set<NodeId>()
  const queue: NodeId[] = [campaign.start]
  while (queue.length) {
    const id = queue.pop()!
    if (reachable.has(id) || !campaign.nodes[id]) continue
    reachable.add(id)
    for (const opt of campaign.nodes[id].options ?? []) queue.push(opt.target)
  }
  for (const id of ids) {
    if (!reachable.has(id)) errors.push(`Knoten "${id}" ist vom Start aus unerreichbar`)
  }
  const endings = [...reachable].filter(id => campaign.nodes[id]?.ending)
  if (!endings.some(id => campaign.nodes[id].ending === 'success')) {
    errors.push('Kein erreichbares Erfolgs-Ende')
  }

  if (errors.length) {
    throw new Error(`Kampagne "${campaign.id}" ist fehlerhaft:\n- ${errors.join('\n- ')}`)
  }
}

/**
 * Ein Sprech-Segment des Knoten-Drehbuchs: Erzähltext zuerst, dann die
 * Dialogzeilen. Textbox, Sprachausgabe und Bühnen-Auftritte arbeiten alle
 * auf dieser einen Liste — was gesagt wird, passiert.
 */
export interface Segment {
  /** Sprecher-Key (NPC oder 'player'); fehlt beim Erzähler */
  by?: string
  /** Anzeigename in der Textbox (fehlt beim Erzähler) */
  name?: string
  /** Stimm-Key aus voices.json */
  voice: string
  text: string
}

export function nodeSegments(node: StoryNode, setup: GameSetup): Segment[] {
  const segments: Segment[] = [{ voice: 'narrator', text: resolveText(node.text, setup) }]
  for (const line of node.dialog ?? []) {
    if (line.by === 'narrator') {
      // Erzähler-Zwischenzeile (z.B. Regieanweisung nach einer Dialogzeile)
      segments.push({ voice: 'narrator', text: resolveText(line.line, setup) })
    } else if (line.by === 'player') {
      segments.push({
        by: 'player',
        name: setup.character.name,
        voice: setup.character.voice,
        text: resolveText(line.line, setup),
      })
    } else {
      const npc = NPCS[line.by]
      segments.push({
        by: line.by,
        name: npc?.name ?? line.by,
        voice: npc?.voice ?? 'narrator',
        text: resolveText(line.line, setup),
      })
    }
  }
  return segments
}

/**
 * Grundbesetzung eines Knotens (ohne die erst auf Stichwort auftretenden
 * Dialog-Sprecher): eigenes cast-Feld oder Standard-Besetzung der Szene.
 */
export function nodeCast(node: StoryNode): string[] {
  return node.cast ?? SCENE_DEFAULT_CAST[node.scene] ?? []
}

/** Alle Szenen-Keys einer Kampagne (für das Vorladen der Hintergründe). */
export function collectScenes(campaign: Campaign): string[] {
  return [...new Set(Object.values(campaign.nodes).map(n => n.scene))]
}

/**
 * Bühnen-Ausgänge eines Knotens: Optionen, deren Ziel in einer anderen Szene
 * liegt, lassen sich auch "mit den Füßen" wählen — die erste führt nach
 * rechts, die zweite nach links. Rein abgeleitet, kein eigenes Datenfeld.
 */
export function deriveExits(
  campaign: Campaign,
  node: StoryNode,
): { right?: StoryOption; left?: StoryOption } {
  const moves = (node.options ?? []).filter(option => {
    const target = campaign.nodes[option.target]
    return target && target.scene !== node.scene
  })
  return { right: moves[0], left: moves[1] }
}
