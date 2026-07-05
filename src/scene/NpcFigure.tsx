import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, MathUtils, Vector3, type Group, type Mesh } from 'three'
import { spriteTexture, labelTexture, SPRITE_ASPECT } from './sprites'
import { avatarPos } from './avatarState'
import type { NpcSpec } from '../game/npcs'

const BASE_HEIGHT = 1.42
const LABEL_HEIGHT = 0.2
const worldPos = new Vector3()

/**
 * Gesprächspartner: Pixel-Figur mit Namensschild, atmet leicht und dreht sich
 * (Papiertheater-Flip) immer zur Hauptfigur. Wird über propSets.tsx in die
 * Szenen gestellt und macht dadurch die Falltür-Animation mit.
 */
export function NpcFigure({ npc }: { npc: NpcSpec }) {
  const mesh = useRef<Mesh>(null)
  const flip = useRef<Group>(null)
  const texture = spriteTexture(npc)
  const label = labelTexture(npc.name)
  const height = BASE_HEIGHT * (npc.scale ?? 1)
  const width = height * SPRITE_ASPECT
  const phase = useRef(npc.id.length * 1.37)

  useFrame((state, delta) => {
    if (!mesh.current || !flip.current) return
    const t = state.clock.elapsedTime + phase.current
    const breathe = Math.sin(t * 1.7) * 0.01
    mesh.current.scale.y = 1 + breathe
    mesh.current.position.y = (height / 2) * (1 + breathe)

    flip.current.getWorldPosition(worldPos)
    const facing = avatarPos.x >= worldPos.x ? 1 : -1
    flip.current.scale.x = MathUtils.damp(flip.current.scale.x, facing, 6, delta)
  })

  return (
    <group>
      <group ref={flip}>
        <mesh ref={mesh} position={[0, height / 2, 0]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.5} side={DoubleSide} />
        </mesh>
      </group>
      {/* Namensschild — dauerhaft sichtbar, immer im Vordergrund */}
      <mesh position={[0, height + 0.22, 0]} renderOrder={10}>
        <planeGeometry args={[LABEL_HEIGHT * label.aspect, LABEL_HEIGHT]} />
        <meshBasicMaterial map={label.texture} transparent depthWrite={false} depthTest={false} />
      </mesh>
    </group>
  )
}
