import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CanvasTexture, DoubleSide, MathUtils, type Group, type Mesh } from 'three'
import { spriteTexture, SPRITE_ASPECT } from './sprites'
import { MOVE_KEYS, moveInput } from './moveKeys'
import { getColliders } from './propSets'
import { avatarPos } from './avatarState'
import type { Character } from '../game/types'

const WALK_SPEED = 1.7
const DEPTH_SPEED = 1.2
const Z_MIN = -1.4 // hinten, kurz vor den Props
const Z_MAX = 0.9 // vorn an der Rampe
const AVATAR_RADIUS = 0.24
/** Wie weit man hinter dem Bühnenrand weiterläuft, bevor die Szene wechselt */
const EXIT_OVERSHOOT = 1.0

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
 * Pixel-Sprite-Billboard: läuft per Pfeiltasten/WASD/Touch über die Bühne
 * (mit Requisiten-Kollision), folgt der Maus mit leichter Neigung und kann
 * links/rechts aus dem Bild in die Nachbarszene laufen.
 */
export function Avatar({
  character,
  speech,
  scene,
  onExitStage,
}: {
  character: Character
  speech?: string
  scene: string
  onExitStage?: (direction: 'left' | 'right') => void
}) {
  const mesh = useRef<Mesh>(null)
  const texture = spriteTexture(character)
  // Auf schmalen Screens (Hochformat) rückt der Avatar Richtung Mitte,
  // sonst steht er außerhalb des Sichtfelds
  const viewportWidth = useThree(s => s.viewport.width)
  const x = MathUtils.clamp(-viewportWidth * 0.22, -1.1, -0.45)
  // Hochformat: Blase höher und kompakter, damit sie nicht in die Textbox ragt
  const narrow = viewportWidth < 3
  const bubbleY = narrow ? HEIGHT + 1.1 : HEIGHT + 0.45

  const pivot = useRef<Group>(null)
  const group = useRef<Group>(null)

  const pos = useRef({ x, z: 0.2 })
  const facing = useRef(1) // 1 = rechts, -1 = links
  const walkPhase = useRef(0)
  const walkAmp = useRef(0)
  const pendingExit = useRef<'left' | 'right' | null>(null)
  const xLimit = Math.min(3.2, Math.max(0.9, viewportWidth / 2 - 0.55))
  const colliders = useMemo(() => getColliders(scene), [scene])

  // Tastatur → gemeinsamer Bewegungs-Zustand (Touch-Buttons schreiben ihn auch)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const dir = MOVE_KEYS[e.key.toLowerCase()]
      if (!dir) return
      moveInput.add(dir)
      if (e.key.startsWith('Arrow')) e.preventDefault()
    }
    const up = (e: KeyboardEvent) => {
      const dir = MOVE_KEYS[e.key.toLowerCase()]
      if (dir) moveInput.delete(dir)
    }
    const clear = () => moveInput.clear()
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', clear)
    }
  }, [])

  // Nach einem Szenenwechsel durch Rauslaufen: von der Gegenseite auftreten
  useEffect(() => {
    if (!pendingExit.current) return
    pos.current.x = pendingExit.current === 'right' ? -(xLimit + 0.85) : xLimit + 0.85
    pendingExit.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene])

  useFrame((state, delta) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime

    // Bewegung integrieren
    const vx = (moveInput.has('right') ? 1 : 0) - (moveInput.has('left') ? 1 : 0)
    const vz = (moveInput.has('front') ? 1 : 0) - (moveInput.has('back') ? 1 : 0)
    pos.current.x = MathUtils.clamp(
      pos.current.x + vx * WALK_SPEED * delta,
      -(xLimit + EXIT_OVERSHOOT + 0.4),
      xLimit + EXIT_OVERSHOOT + 0.4,
    )
    pos.current.z = MathUtils.clamp(pos.current.z + vz * DEPTH_SPEED * delta, Z_MIN, Z_MAX)

    // Kollision: aus Requisiten-Kreisen herausschieben
    for (const c of colliders) {
      const dx = pos.current.x - c.x
      const dz = pos.current.z - c.z
      const rr = c.r + AVATAR_RADIUS
      const d2 = dx * dx + dz * dz
      if (d2 < rr * rr && d2 > 1e-6) {
        const d = Math.sqrt(d2)
        pos.current.x = c.x + (dx / d) * rr
        pos.current.z = MathUtils.clamp(c.z + (dz / d) * rr, Z_MIN, Z_MAX)
      }
    }

    // Aus dem Bild gelaufen → Nachbarszene anfordern
    if (!pendingExit.current && Math.abs(pos.current.x) > xLimit + EXIT_OVERSHOOT && onExitStage) {
      pendingExit.current = pos.current.x > 0 ? 'right' : 'left'
      onExitStage(pendingExit.current)
    }

    if (vx !== 0) facing.current = vx
    if (group.current) group.current.position.set(pos.current.x, 0, pos.current.z)
    avatarPos.x = pos.current.x
    avatarPos.z = pos.current.z

    // Geh-Wippen (weich ein-/ausblendend) + Atmen
    const moving = vx !== 0 || vz !== 0
    walkAmp.current = MathUtils.damp(walkAmp.current, moving ? 1 : 0, 8, delta)
    walkPhase.current += delta * 11 * walkAmp.current
    const bob = Math.abs(Math.sin(walkPhase.current)) * 0.06 * walkAmp.current
    const breathe = Math.sin(t * 2) * 0.012
    mesh.current.scale.y = 1 + breathe
    mesh.current.position.y = (HEIGHT / 2) * (1 + breathe) + bob
    mesh.current.rotation.z = Math.sin(t * 0.7) * 0.01

    // Der Maus folgen + in Laufrichtung drehen/lehnen. Der Papiertheater-Flip
    // läuft über scale.x, das beim Umdrehen kurz durch 0 geht.
    if (pivot.current) {
      const px = MathUtils.clamp(state.pointer.x, -1, 1)
      const py = MathUtils.clamp(state.pointer.y, -1, 1)
      pivot.current.rotation.z = MathUtils.damp(
        pivot.current.rotation.z,
        -px * 0.09 - vx * 0.07 * walkAmp.current,
        4,
        delta,
      )
      pivot.current.rotation.y = MathUtils.damp(pivot.current.rotation.y, px * 0.16, 4, delta)
      pivot.current.rotation.x = MathUtils.damp(pivot.current.rotation.x, -py * 0.05, 4, delta)
      pivot.current.scale.x = MathUtils.damp(pivot.current.scale.x, facing.current, 9, delta)
    }
  })

  return (
    <group ref={group} position={[x, 0, 0.2]}>
      {/* Pivot am Fußpunkt, damit die Neigung natürlich wirkt */}
      <group ref={pivot}>
        <mesh ref={mesh} position={[0, HEIGHT / 2, 0]}>
          <planeGeometry args={[WIDTH, HEIGHT]} />
          {/* DoubleSide: beim Flip (scale.x = -1) dreht sich die Winding-Order */}
          <meshBasicMaterial map={texture} transparent alphaTest={0.5} side={DoubleSide} />
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
          position={[narrow ? 0 : 0.35, bubbleY, 0.05]}
          distanceFactor={DISTANCE_FACTOR}
          pointerEvents="none"
          style={{ opacity: 0.95 }}
        >
          <div
            style={{
              maxWidth: `${Math.round(MathUtils.clamp((viewportWidth - 1.2) * PX_PER_UNIT, 140, 260))}px`,
              background: '#f5efdc',
              color: '#2a2118',
              border: '3px solid #2a2118',
              borderRadius: '10px',
              padding: narrow ? '7px 10px' : '10px 14px',
              fontFamily: 'var(--font-text)',
              fontSize: narrow ? '16px' : '20px',
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
