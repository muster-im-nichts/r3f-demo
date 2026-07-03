import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CanvasTexture, MathUtils, type Group, type Mesh } from 'three'
import { spriteTexture, SPRITE_ASPECT } from './sprites'
import type { Character } from '../game/types'

let shadowTexture: CanvasTexture | null = null

function getShadowTexture(): CanvasTexture {
  if (shadowTexture) return shadowTexture
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30)
  grad.addColorStop(0, 'rgba(0,0,0,0.55)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  shadowTexture = new CanvasTexture(canvas)
  return shadowTexture
}

const HEIGHT = 1.5
const WIDTH = HEIGHT * SPRITE_ASPECT

// drei <Html transform>: px pro World-Unit = 400 / distanceFactor
const PX_PER_UNIT = 100
const DISTANCE_FACTOR = 400 / PX_PER_UNIT

/**
 * Pixel-Sprite-Billboard auf dem Bühnenboden, mit leichter Idle-Animation
 * (Atmen mit Boden-Kompensation + minimales Sway) und optionaler Sprechblase.
 */
export function Avatar({ character, speech }: { character: Character; speech?: string }) {
  const mesh = useRef<Mesh>(null)
  const texture = spriteTexture(character)
  // Auf schmalen Screens (Hochformat) rückt der Avatar Richtung Mitte,
  // sonst steht er außerhalb des Sichtfelds
  const viewportWidth = useThree(s => s.viewport.width)
  const x = MathUtils.clamp(-viewportWidth * 0.22, -1.1, -0.45)
  // Hochformat: Blase höher, damit sie nicht in die Textbox ragt
  const narrow = viewportWidth < 3
  const bubbleY = narrow ? HEIGHT + 0.95 : HEIGHT + 0.45

  const pivot = useRef<Group>(null)

  useFrame((state, delta) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    const breathe = Math.sin(t * 2) * 0.012
    mesh.current.scale.y = 1 + breathe
    mesh.current.position.y = (HEIGHT / 2) * (1 + breathe)
    mesh.current.rotation.z = Math.sin(t * 0.7) * 0.01

    // Der Maus folgen: gedämpfte Neigung um den Fußpunkt — links/rechts als
    // Schräglage + leichte Drehung, oben/unten als minimales Kippen
    if (pivot.current) {
      const px = MathUtils.clamp(state.pointer.x, -1, 1)
      const py = MathUtils.clamp(state.pointer.y, -1, 1)
      pivot.current.rotation.z = MathUtils.damp(pivot.current.rotation.z, -px * 0.09, 4, delta)
      pivot.current.rotation.y = MathUtils.damp(pivot.current.rotation.y, px * 0.16, 4, delta)
      pivot.current.rotation.x = MathUtils.damp(pivot.current.rotation.x, -py * 0.05, 4, delta)
    }
  })

  return (
    <group position={[x, 0, 0.2]}>
      {/* Pivot am Fußpunkt, damit die Neigung natürlich wirkt */}
      <group ref={pivot}>
        <mesh ref={mesh} position={[0, HEIGHT / 2, 0]}>
          <planeGeometry args={[WIDTH, HEIGHT]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.5} />
        </mesh>
      </group>
      {/* Kontaktschatten */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[1.0, 0.5]} />
        <meshBasicMaterial map={getShadowTexture()} transparent depthWrite={false} />
      </mesh>
      {speech && (
        <Html
          transform
          position={[0.35, bubbleY, 0.05]}
          distanceFactor={DISTANCE_FACTOR}
          pointerEvents="none"
          style={{ opacity: 0.95 }}
        >
          <div
            style={{
              maxWidth: `${Math.round(MathUtils.clamp((viewportWidth - 1) * PX_PER_UNIT, 170, 260))}px`,
              background: '#f5efdc',
              color: '#2a2118',
              border: '3px solid #2a2118',
              borderRadius: '10px',
              padding: '10px 14px',
              fontFamily: 'var(--font-text)',
              fontSize: '20px',
              lineHeight: 1.15,
              textAlign: 'center',
              whiteSpace: 'normal',
              width: 'max-content',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {speech}
            <div
              style={{
                position: 'absolute',
                left: '28px',
                bottom: '-12px',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '12px solid #2a2118',
              }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
