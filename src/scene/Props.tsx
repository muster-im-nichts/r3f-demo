import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { PROP_SETS, type PropDef } from './propSets'

/**
 * Szenen-Requisiten im Mittelgrund. Beim Szenenwechsel fahren die alten Props
 * in die Versenkung (Bühnenfalltür), die neuen kommen gestaffelt mit kleinem
 * Überschwinger hoch.
 */

// --- Rein-/Raus-Animation (Bühnenfalltür) -----------------------------------

const SINK = 2.6
const ENTER_SECONDS = 0.7
const EXIT_SECONDS = 0.35
const ENTER_STAGGER = 0.16
const EXIT_STAGGER = 0.07

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function AnimatedProp({
  def,
  index,
  mode,
  delay,
  onDone,
}: {
  def: PropDef
  index: number
  mode: 'enter' | 'exit'
  delay: number
  onDone?: () => void
}) {
  const group = useRef<Group>(null)
  const elapsed = useRef(0)
  const finished = useRef(false)

  useFrame((_, delta) => {
    if (!group.current || finished.current) return
    elapsed.current += delta
    const stagger = mode === 'enter' ? ENTER_STAGGER : EXIT_STAGGER
    const duration = mode === 'enter' ? ENTER_SECONDS : EXIT_SECONDS
    const local = Math.min(1, Math.max(0, (elapsed.current - delay - index * stagger) / duration))

    const sunk = mode === 'enter' ? 1 - easeOutBack(local) : local * local * local
    group.current.position.y = def.position[1] - SINK * sunk
    group.current.visible = mode === 'enter' ? local > 0 : local < 1

    if (local >= 1) {
      finished.current = true
      onDone?.()
    }
  })

  return (
    <group
      ref={group}
      position={[def.position[0], def.position[1] - (mode === 'enter' ? SINK : 0), def.position[2]]}
      rotation={[0, def.rotationY ?? 0, 0]}
      scale={def.scale ?? 1}
      visible={mode === 'exit'}
    >
      {def.node}
    </group>
  )
}

function PropGroup({
  scene,
  mode,
  delay,
  onExited,
}: {
  scene: string
  mode: 'enter' | 'exit'
  delay: number
  onExited?: () => void
}) {
  const defs = PROP_SETS[scene] ?? []

  // Szenen ohne Props sofort als "abgeräumt" melden
  useEffect(() => {
    if (defs.length === 0) onExited?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <group>
      {defs.map((def, i) => (
        <AnimatedProp
          key={i}
          def={def}
          index={i}
          mode={mode}
          delay={delay}
          onDone={mode === 'exit' && i === defs.length - 1 ? onExited : undefined}
        />
      ))}
    </group>
  )
}

/** Verwaltet den Requisiten-Wechsel: alte Szene versenken, neue hochfahren. */
export function Props({ scene }: { scene: string }) {
  const [current, setCurrent] = useState(scene)
  const [exiting, setExiting] = useState<string | null>(null)

  useEffect(() => {
    if (scene === current || scene === exiting) return
    setExiting(current)
    setCurrent(scene)
  }, [scene, current, exiting])

  return (
    <>
      {exiting && (
        <PropGroup
          key={`exit-${exiting}`}
          scene={exiting}
          mode="exit"
          delay={0}
          onExited={() => setExiting(null)}
        />
      )}
      <PropGroup key={current} scene={current} mode="enter" delay={exiting ? 0.5 : 0.2} />
    </>
  )
}
