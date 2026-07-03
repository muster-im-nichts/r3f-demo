import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, PointLight } from 'three'

/**
 * Szenen-Requisiten als chunky Voxel-Objekte im Mittelgrund. Beim
 * Szenenwechsel fahren die alten Props in die Versenkung (Bühnenfalltür),
 * die neuen kommen gestaffelt mit kleinem Überschwinger hoch.
 */

// --- Einzel-Requisiten (Ursprung = Bodenkontakt bei y=0) -------------------

const WOOD = '#6b4a2f'
const WOOD_DARK = '#463019'
const METAL = '#3a3f4a'

function Barrel() {
  return (
    <group>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.56, 10]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {[0.12, 0.44].map(y => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.295, 0.295, 0.04, 10]} />
          <meshStandardMaterial color={METAL} />
        </mesh>
      ))}
    </group>
  )
}

function Crate() {
  return (
    <group>
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[0.52, 0.52, 0.52]} />
        <meshStandardMaterial color="#7a5a38" />
      </mesh>
      <mesh position={[0, 0.26, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.72, 1.04, 0.72]}>
        <boxGeometry args={[0.52, 0.02, 0.52]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
    </group>
  )
}

function Lantern({ color = '#ffb84d' }: { color?: string }) {
  const light = useRef<PointLight>(null)
  const phase = useRef(Math.random() * 10)
  useFrame(state => {
    if (!light.current) return
    const t = state.clock.elapsedTime + phase.current
    light.current.intensity = 2.6 + Math.sin(t * 11) * 0.25 + Math.sin(t * 23) * 0.15
  })
  return (
    <group>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 1.6, 6]} />
        <meshStandardMaterial color="#20242c" />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <boxGeometry args={[0.18, 0.22, 0.18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.22, 0.06, 0.22]} />
        <meshStandardMaterial color="#20242c" />
      </mesh>
      <pointLight ref={light} position={[0, 1.62, 0]} color={color} distance={7} decay={1.6} />
    </group>
  )
}

function MarketStall() {
  return (
    <group>
      {/* Vordere Beine kurz, hintere Pfosten tragen die Markise */}
      {[[-0.6, 0.35, 0.9], [0.6, 0.35, 0.9], [-0.6, -0.35, 1.62], [0.6, -0.35, 1.62]].map(
        ([x, z, h], i) => (
          <mesh key={i} position={[x, h / 2, z]}>
            <boxGeometry args={[0.08, h, 0.08]} />
            <meshStandardMaterial color={WOOD_DARK} />
          </mesh>
        ),
      )}
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[1.4, 0.1, 0.85]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      {/* Markise aus gestreiften Latten */}
      <group position={[0, 1.5, 0.15]} rotation={[-0.35, 0, 0]}>
        {[0, 1, 2, 3, 4].map(i => (
          <mesh key={i} position={[-0.56 + i * 0.28, 0, 0]}>
            <boxGeometry args={[0.28, 0.03, 1.05]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#a8433a' : '#e3d5b8'} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 1.0, 0.1]}>
        <boxGeometry args={[0.35, 0.18, 0.35]} />
        <meshStandardMaterial color="#8a9a4a" />
      </mesh>
    </group>
  )
}

function GrandfatherClock() {
  const pendulum = useRef<Group>(null)
  useFrame(state => {
    if (pendulum.current) pendulum.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.4) * 0.28
  })
  return (
    <group>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.46, 1.7, 0.3]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[0, 1.38, 0.16]}>
        <cylinderGeometry args={[0.15, 0.15, 0.03, 12]} />
        <meshStandardMaterial color="#e8dcc0" />
      </mesh>
      <mesh position={[0, 1.38, 0.18]}>
        <boxGeometry args={[0.02, 0.1, 0.01]} />
        <meshStandardMaterial color="#1c1710" />
      </mesh>
      {/* Pendel, am oberen Ende aufgehängt */}
      <group ref={pendulum} position={[0, 1.15, 0.17]}>
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[0.03, 0.5, 0.02]} />
          <meshStandardMaterial color="#d9a441" />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 10]} />
          <meshStandardMaterial color="#d9a441" />
        </mesh>
      </group>
    </group>
  )
}

function Workbench() {
  return (
    <group>
      {[[-0.55, -0.2], [0.55, -0.2], [-0.55, 0.2], [0.55, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.35, z]}>
          <boxGeometry args={[0.09, 0.7, 0.09]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
      ))}
      <mesh position={[0, 0.74, 0]}>
        <boxGeometry args={[1.3, 0.09, 0.55]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh position={[0.3, 0.83, 0.05]}>
        <boxGeometry args={[0.2, 0.08, 0.14]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
      <mesh position={[-0.35, 0.82, -0.05]}>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 8]} />
        <meshStandardMaterial color="#d9a441" />
      </mesh>
    </group>
  )
}

function Stool() {
  return (
    <group>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.06, 8]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.4, 6]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
    </group>
  )
}

function Desk() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.95, 0.8, 0.5]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
      <mesh position={[0, 0.86, 0]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[0.98, 0.06, 0.52]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh position={[0.25, 0.98, 0]}>
        <boxGeometry args={[0.04, 0.14, 0.04]} />
        <meshStandardMaterial color="#e8dcc0" emissive="#ffb84d" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

function Gear() {
  const gear = useRef<Group>(null)
  useFrame(state => {
    if (gear.current) gear.current.rotation.z = state.clock.elapsedTime * 0.45
  })
  return (
    <group position={[0, 1.05, 0]}>
      <group ref={gear}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.14, 12]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.16, 0.14, 0.12]} />
              <meshStandardMaterial color={WOOD_DARK} />
            </mesh>
          )
        })}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.14, 1.0, 0.14]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
    </group>
  )
}

function Sacks() {
  return (
    <group>
      {[[-0.22, 0.22, 0], [0.24, 0.22, 0.1], [0.0, 0.58, 0.02]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 0.78, 0.9]}>
          <sphereGeometry args={[0.28, 8, 6]} />
          <meshStandardMaterial color="#c9b089" flatShading />
        </mesh>
      ))}
    </group>
  )
}

function Bollard() {
  return (
    <group>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.52, 8]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
    </group>
  )
}

// --- Szenen-Zuordnung -------------------------------------------------------

type PropDef = {
  node: ReactNode
  position: [number, number, number]
  rotationY?: number
  scale?: number
}

const PROP_SETS: Record<string, PropDef[]> = {
  marktplatz: [
    { node: <MarketStall />, position: [2.0, 0, -1.3], rotationY: -0.25 },
    { node: <Barrel />, position: [0.75, 0, 0.35] },
    { node: <Crate />, position: [2.8, 0, 0.1], rotationY: 0.4 },
    { node: <Lantern />, position: [-2.8, 0, -1.0] },
  ],
  werkstatt: [
    { node: <Workbench />, position: [1.5, 0, -0.6], rotationY: 0.15 },
    { node: <GrandfatherClock />, position: [2.7, 0, -1.4], rotationY: -0.3 },
    { node: <Stool />, position: [0.65, 0, 0.35] },
  ],
  wachstube: [
    { node: <Desk />, position: [1.7, 0, -0.8], rotationY: -0.2 },
    { node: <Crate />, position: [2.8, 0, -0.1], rotationY: 0.7 },
    { node: <Lantern />, position: [-2.8, 0, -1.2] },
  ],
  gasse: [
    { node: <Barrel />, position: [1.15, 0, -0.35] },
    { node: <Barrel />, position: [1.75, 0, -0.85], scale: 0.85 },
    { node: <Crate />, position: [2.5, 0, 0.1], rotationY: 0.3 },
    { node: <Lantern />, position: [-2.7, 0, -1.3] },
  ],
  finale: [
    { node: <Crate />, position: [1.35, 0, -0.5], rotationY: 0.2 },
    { node: <Crate />, position: [1.95, 0, -0.25], rotationY: -0.35 },
    { node: <Crate />, position: [1.65, 0.52, -0.4], rotationY: 0.55, scale: 0.9 },
    { node: <Barrel />, position: [2.85, 0, -1.0] },
    { node: <Lantern />, position: [-2.8, 0, -1.1] },
  ],
  kanal: [
    { node: <Bollard />, position: [0.9, 0, 0.5] },
    { node: <Bollard />, position: [2.1, 0, 0.15] },
    { node: <Crate />, position: [2.9, 0, -0.7], rotationY: 0.5 },
    { node: <Lantern />, position: [-2.8, 0, -0.9] },
  ],
  muehle: [
    { node: <Gear />, position: [2.7, 0, -1.3] },
    { node: <Sacks />, position: [1.25, 0, -0.25] },
    { node: <Barrel />, position: [2.0, 0, 0.35], scale: 0.9 },
  ],
}

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
