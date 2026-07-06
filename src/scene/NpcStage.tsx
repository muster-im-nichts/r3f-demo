import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { NpcFigure } from './NpcFigure'
import { NPCS } from '../game/npcs'
import { stageSqueeze } from './propSets'

/**
 * Der Bühnen-Choreograf: bespielt die Szene mit der aktuellen Besetzung.
 * Neue NPCs treten von der nächstgelegenen Seite auf und laufen zu ihrem
 * Platz (Auftritt auf Stichwort: der Wachtmeister kommt, wenn er im Text
 * kommt), gestrichene gehen ab. `leaving` (Spieler verlässt die Bühne)
 * schickt alle zum Rand, Umkehren holt sie zurück.
 */

const WALK_SPEED = 1.5

/** Feste Plätze pro Szene; weitere Auftritte nutzen die Reserve-Plätze */
const SLOTS: Record<string, [number, number][]> = {
  marktplatz: [
    [1.0, -0.85],
    [-1.8, -0.95],
    [2.2, -1.15],
  ],
  werkstatt: [
    [0.35, -0.95],
    [-1.9, -0.9],
    [1.9, -1.1],
  ],
  wachstube: [
    [2.2, -1.15],
    [-1.5, -0.9],
    [0.6, -1.0],
  ],
  gasse: [
    [-1.7, -1.0],
    [1.3, -0.9],
    [2.3, -1.15],
  ],
  finale: [
    [0.9, -1.05],
    [-1.9, -0.95],
    [2.2, -1.15],
  ],
  kanal: [
    [-1.5, -0.75],
    [1.4, -0.9],
    [2.4, -1.1],
  ],
  muehle: [
    [0.5, -0.9],
    [-1.8, -0.85],
    [1.7, -1.1],
  ],
  bahnhof: [
    [0.85, -0.9],
    [-1.9, -0.95],
    [2.1, -1.1],
  ],
  fabrik: [
    [0.3, -0.95],
    [-1.9, -0.9],
    [1.8, -1.1],
  ],
}

const FALLBACK_SLOTS: [number, number][] = [
  [0.9, -0.9],
  [-1.7, -0.9],
  [2.0, -1.1],
]

function NpcActor({
  npcKey,
  slot,
  exiting,
  offstage,
  onGone,
}: {
  npcKey: string
  slot: [number, number]
  /** Aus der Besetzung gestrichen: abgehen und danach abbauen */
  exiting: boolean
  /** Spieler verlässt die Bühne: zum Rand weichen, aber bleiben */
  offstage: boolean
  onGone?: () => void
}) {
  const npc = NPCS[npcKey]
  const group = useRef<Group>(null)
  const viewportWidth = useThree(s => s.viewport.width)
  const squeeze = stageSqueeze(viewportWidth)
  const homeX = slot[0] * squeeze
  const edgeX = (Math.sign(homeX || 1) * (viewportWidth / 2 + 1.2)) as number
  // Auftritt von der eigenen Seite, knapp außerhalb des Bilds
  const pos = useRef({ x: edgeX, z: slot[1] })
  const [walkDir, setWalkDir] = useState<1 | -1 | null>(homeX >= edgeX ? 1 : -1)
  const walkPhase = useRef(0)
  const gone = useRef(false)

  useFrame((_, delta) => {
    if (!group.current || gone.current) return
    const target = exiting || offstage ? edgeX : homeX
    const dx = target - pos.current.x
    const dist = Math.abs(dx)

    if (dist > 0.02) {
      const step = Math.min(dist, WALK_SPEED * delta)
      pos.current.x += Math.sign(dx) * step
      walkPhase.current += delta * 10
      if (walkDir !== Math.sign(dx)) setWalkDir(Math.sign(dx) as 1 | -1)
    } else if (walkDir !== null) {
      setWalkDir(null) // angekommen: wieder zum Avatar schauen
      walkPhase.current = 0
    }

    if (exiting && dist <= 0.05) {
      gone.current = true
      onGone?.()
      return
    }

    const bob = walkDir !== null ? Math.abs(Math.sin(walkPhase.current)) * 0.05 : 0
    group.current.position.set(pos.current.x, bob, pos.current.z)
  })

  if (!npc) return null
  return (
    <group ref={group} position={[pos.current.x, 0, pos.current.z]}>
      <NpcFigure npc={npc} facing={walkDir} />
    </group>
  )
}

type Entry = { key: string; slot: [number, number]; exiting: boolean }

export function NpcStage({
  scene,
  cast,
  leaving,
}: {
  scene: string
  cast: string[]
  leaving: boolean
}) {
  const [entries, setEntries] = useState<Entry[]>([])

  // Besetzung abgleichen: Neue bekommen den nächsten freien Platz,
  // Gestrichene werden zum Abgang markiert
  useEffect(() => {
    setEntries(current => {
      const slots = SLOTS[scene] ?? FALLBACK_SLOTS
      const kept = current.map(e => (cast.includes(e.key) ? { ...e, exiting: false } : { ...e, exiting: true }))
      const present = new Set(kept.filter(e => !e.exiting).map(e => e.key))
      const used = new Set(kept.map(e => `${e.slot[0]}`))
      const additions: Entry[] = []
      for (const key of cast) {
        if (present.has(key)) continue
        const slot =
          [...slots, ...FALLBACK_SLOTS].find(s => !used.has(`${s[0]}`)) ?? FALLBACK_SLOTS[0]
        used.add(`${slot[0]}`)
        additions.push({ key, slot, exiting: false })
      }
      return [...kept, ...additions]
    })
  }, [cast, scene])

  const remove = (key: string) => {
    setEntries(current => current.filter(e => e.key !== key))
  }

  return (
    <>
      {entries.map(entry => (
        <NpcActor
          key={entry.key}
          npcKey={entry.key}
          slot={entry.slot}
          exiting={entry.exiting}
          offstage={leaving}
          onGone={() => remove(entry.key)}
        />
      ))}
    </>
  )
}
