import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { PROP_SETS, stageSqueeze, type PropDef } from './propSets'

/**
 * Szenen-Requisiten im Mittelgrund. Verlässt der Spieler die Bühne, versinken
 * die Props schon während er hinausläuft (Bühnenfalltür); die neuen kommen
 * erst, wenn die alten weg sind — gestaffelt und mit kleinem Überschwinger.
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
  // Auf schmalen Screens rücken die Props Richtung Bühnenmitte
  const squeeze = stageSqueeze(useThree(s => s.viewport.width))
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
      position={[
        def.position[0] * squeeze,
        def.position[1] - (mode === 'enter' ? SINK : 0),
        def.position[2],
      ]}
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

/**
 * Sequenzer: `leaving` (Spieler läuft gerade aus dem Bild) startet den
 * Abgang sofort — kehrt er um, kommen die Props zurück. Ein Szenenwechsel
 * wartet, bis die alte Bühne leer ist. Solange der Spieler noch im
 * Randbereich steht, bleibt die neue Bühne `hidden` (nichts poppt rein);
 * erst wenn er ins Bild läuft, fahren die neuen Props hoch.
 */
type StageMode = 'enter' | 'exit' | 'hidden'

export function Props({ scene, leaving }: { scene: string; leaving: boolean }) {
  const [shown, setShown] = useState(scene)
  const [mode, setMode] = useState<StageMode>('enter')
  const exited = useRef(false)

  useEffect(() => {
    if (scene === shown) {
      // gleiche Szene: Abgang beim Rauslaufen, Rückkehr beim Umkehren
      if (leaving && mode === 'enter') {
        exited.current = false
        setMode('exit')
      } else if (!leaving && mode !== 'enter') {
        exited.current = false
        setMode('enter')
      }
      return
    }
    // Szenenwechsel: erst die alte Bühne leeren; ist sie schon leer,
    // direkt umschalten
    if (exited.current || mode === 'hidden') {
      exited.current = false
      setShown(scene)
      setMode(leaving ? 'hidden' : 'enter')
    } else if (mode !== 'exit') {
      setMode('exit')
    }
  }, [scene, shown, leaving, mode])

  const handleExited = () => {
    exited.current = true
    if (scene !== shown) {
      exited.current = false
      setShown(scene)
      setMode(leaving ? 'hidden' : 'enter')
    } else if (leaving) {
      setMode('hidden')
    }
  }

  if (mode === 'hidden') return null
  return (
    <PropGroup
      key={`${shown}-${mode}`}
      scene={shown}
      mode={mode}
      delay={mode === 'enter' ? 0.15 : 0}
      onExited={mode === 'exit' ? handleExited : undefined}
    />
  )
}
