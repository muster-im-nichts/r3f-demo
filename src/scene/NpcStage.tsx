import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { NpcFigure } from './NpcFigure'
import { NPCS } from '../game/npcs'
import { stageSqueeze } from './propSets'

/**
 * Der Bühnen-Choreograf: bespielt die Szene mit der aktuellen Besetzung.
 * Beim Szenenwechsel steht die neue Besetzung sofort an ihren Plätzen (die
 * Bühne ist nie leer); nur wer *innerhalb* einer Szene dazukommt — Auftritt
 * auf Stichwort — läuft von seiner Seite herein, und wer gestrichen wird,
 * geht ab. NPCs sind anklickbar (onTalk) für eine Plauderzeile.
 */

const WALK_SPEED = 1.5

/**
 * Feste Plätze pro Szene. Bewusst statisch so gelegt, dass niemand in der
 * Bildspalte der Avatar-Startposition (x ≈ -1.1, vorn) steht oder dahinter
 * verschwindet: Platz 1+2 rechts, Platz 3 weit links außen.
 */
const SLOTS: Record<string, [number, number][]> = {
  marktplatz: [
    [1.0, -0.85],
    // nicht weiter rechts: dort steht der Marktstand (x 2.0, r 0.95)
    [0.1, -1.2],
    [-2.4, -1.0],
  ],
  werkstatt: [
    [0.5, -0.95],
    [2.1, -1.15],
    [-2.4, -0.95],
  ],
  wachstube: [
    [0.9, -1.0],
    [2.3, -1.2],
    [-2.4, -0.95],
  ],
  gasse: [
    [0.7, -0.95],
    [2.1, -1.15],
    [-2.4, -1.0],
  ],
  finale: [
    [0.9, -1.05],
    [2.2, -1.2],
    [-2.4, -0.95],
  ],
  kanal: [
    [0.7, -0.85],
    [1.9, -1.05],
    [-2.4, -0.9],
  ],
  muehle: [
    [0.5, -0.9],
    [1.8, -1.1],
    [-2.4, -0.9],
  ],
  bahnhof: [
    [0.85, -0.9],
    // rechts liegen die Säcke (x 2.5, r 0.52)
    [1.5, -1.15],
    [-2.4, -0.95],
  ],
  fabrik: [
    [0.5, -0.95],
    // frei zwischen Werkbank (1.35/-0.7, r 0.78) und Kiste (2.3/0.1)
    [2.4, -0.45],
    [-2.4, -0.9],
  ],
}

const FALLBACK_SLOTS: [number, number][] = [
  [0.8, -0.9],
  [2.0, -1.1],
  [-2.4, -0.95],
]

function NpcActor({
  npcKey,
  slot,
  spawnInPlace,
  exiting,
  onGone,
  onTalk,
}: {
  npcKey: string
  slot: [number, number]
  /** Direkt am Platz erscheinen (Szenenwechsel) statt hereinzulaufen */
  spawnInPlace: boolean
  /** Aus der Besetzung gestrichen: abgehen und danach abbauen */
  exiting: boolean
  onGone?: () => void
  onTalk?: (npcKey: string) => void
}) {
  const npc = NPCS[npcKey]
  const group = useRef<Group>(null)
  const viewportWidth = useThree(s => s.viewport.width)
  const squeeze = stageSqueeze(viewportWidth)
  const homeX = slot[0] * squeeze
  const edgeX = Math.sign(homeX || 1) * (viewportWidth / 2 + 1.2)
  const pos = useRef({ x: spawnInPlace ? homeX : edgeX, z: slot[1] })
  const [walkDir, setWalkDir] = useState<1 | -1 | null>(null)
  const walkPhase = useRef(0)
  const gone = useRef(false)

  useFrame((_, delta) => {
    if (!group.current || gone.current) return
    const target = exiting ? edgeX : homeX
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
    <group
      ref={group}
      position={[pos.current.x, 0, pos.current.z]}
      onClick={e => {
        e.stopPropagation()
        onTalk?.(npcKey)
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <NpcFigure npc={npc} facing={walkDir} />
    </group>
  )
}

type Entry = { key: string; slot: [number, number]; spawnInPlace: boolean; exiting: boolean }

function buildEntries(scene: string, cast: string[]): Entry[] {
  const slots = SLOTS[scene] ?? FALLBACK_SLOTS
  return cast.map((key, i) => ({
    key,
    slot: slots[i] ?? FALLBACK_SLOTS[i % FALLBACK_SLOTS.length],
    spawnInPlace: true,
    exiting: false,
  }))
}

export function NpcStage({
  scene,
  cast,
  onTalk,
}: {
  scene: string
  cast: string[]
  onTalk?: (npcKey: string) => void
}) {
  const [entries, setEntries] = useState<Entry[]>(() => buildEntries(scene, cast))
  const shownScene = useRef(scene)

  useEffect(() => {
    if (scene !== shownScene.current) {
      // Szenenwechsel: neue Besetzung steht sofort — die Bühne ist nie leer
      shownScene.current = scene
      setEntries(buildEntries(scene, cast))
      return
    }
    // Gleiche Szene: Neuzugänge laufen auf ihr Stichwort herein,
    // Gestrichene gehen ab
    setEntries(current => {
      const slots = SLOTS[scene] ?? FALLBACK_SLOTS
      const kept = current.map(e =>
        cast.includes(e.key) ? (e.exiting ? { ...e, exiting: false } : e) : { ...e, exiting: true },
      )
      const present = new Set(kept.filter(e => !e.exiting).map(e => e.key))
      const used = new Set(kept.map(e => `${e.slot[0]}|${e.slot[1]}`))
      const additions: Entry[] = []
      for (const key of cast) {
        if (present.has(key)) continue
        const slot =
          [...slots, ...FALLBACK_SLOTS].find(s => !used.has(`${s[0]}|${s[1]}`)) ?? FALLBACK_SLOTS[0]
        used.add(`${slot[0]}|${slot[1]}`)
        additions.push({ key, slot, spawnInPlace: false, exiting: false })
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
          key={`${shownScene.current}-${entry.key}`}
          npcKey={entry.key}
          slot={entry.slot}
          spawnInPlace={entry.spawnInPlace}
          exiting={entry.exiting}
          onGone={() => remove(entry.key)}
          onTalk={onTalk}
        />
      ))}
    </>
  )
}
