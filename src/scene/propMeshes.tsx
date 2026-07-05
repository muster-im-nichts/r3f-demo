import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, PointLight } from 'three'

/**
 * Einzel-Requisiten als chunky Voxel-Objekte (Ursprung = Bodenkontakt bei y=0),
 * teils mit Mikro-Animation (Pendel, Zahnrad, Laternen-Flackern).
 */
const WOOD = '#6b4a2f'
const WOOD_DARK = '#463019'
const METAL = '#3a3f4a'

export function Barrel() {
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

export function Crate() {
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

export function Lantern({ color = '#ffb84d' }: { color?: string }) {
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

export function MarketStall() {
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

export function GrandfatherClock() {
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

export function Workbench() {
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

export function Stool() {
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

export function Desk() {
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

export function Gear() {
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
      {/* Achse reicht nach hinten bis in den Ständer */}
      <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
        <meshStandardMaterial color={METAL} />
      </mesh>
      {/* Ständer hinter dem Rad, damit die Zähne nicht durchschlagen */}
      <mesh position={[0, -0.55, -0.18]}>
        <boxGeometry args={[0.14, 1.0, 0.14]} />
        <meshStandardMaterial color={WOOD_DARK} />
      </mesh>
    </group>
  )
}

export function Sacks() {
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

export function Bollard() {
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

