import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { CanvasTexture } from 'three'
import { CameraRig } from './CameraRig'
import { Backdrop } from './Backdrop'
import { Avatar } from './Avatar'
import { Props } from './Props'
import { Curtain } from './Curtain'
import { Atmosphere } from './Atmosphere'
import type { Character, EpochId } from '../game/types'
import { getEpoch } from '../game/epochs'

// Dunkler Verlauf, der die Kante zwischen Hintergrundbild und Bühnenboden
// kaschiert (liegt flach auf dem Boden, hinten satt, nach vorn auslaufend)
let apronTexture: CanvasTexture | null = null

function getApronTexture(): CanvasTexture {
  if (apronTexture) return apronTexture
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 64)
  grad.addColorStop(0, 'rgba(8, 6, 14, 0.95)')
  grad.addColorStop(1, 'rgba(8, 6, 14, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 8, 64)
  apronTexture = new CanvasTexture(canvas)
  return apronTexture
}

/**
 * Die Theaterbühne: Matte-Painting hinten, Requisiten im Mittelgrund,
 * Avatar vorn, Vorhang ganz vorn. `flat` (NoToneMapping), damit
 * Pixel-Art-Farben unverfälscht bleiben.
 */
export function Stage({
  epoch,
  scene,
  character,
  speech,
  curtainClosed,
  onExitStage,
  leaving,
  onLeavingStage,
  autoWalk,
  onArrived,
}: {
  epoch: EpochId
  scene: string
  character: Character
  speech?: string
  curtainClosed: boolean
  onExitStage?: (direction: 'left' | 'right') => void
  leaving: boolean
  onLeavingStage?: (leaving: boolean) => void
  autoWalk?: 'left' | 'right' | null
  onArrived?: () => void
}) {
  const lightColor = getEpoch(epoch).mood.light
  return (
    <Canvas
      flat
      camera={{ position: [0, 1.4, 6], fov: 45 }}
      style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }}
    >
      <Suspense fallback={null}>
        <CameraRig />
        <Backdrop epoch={epoch} scene={scene} />
        <Props scene={scene} leaving={leaving} />
        <Avatar
          character={character}
          speech={speech}
          scene={scene}
          onExitStage={onExitStage}
          onLeavingStage={onLeavingStage}
          autoWalk={autoWalk}
          onArrived={onArrived}
        />
        <Atmosphere color={lightColor} />
        <Curtain closed={curtainClosed} />

        {/* Bühnenboden: dunkel, endet am Backdrop */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[40, 14]} />
          <meshStandardMaterial color="#171221" />
        </mesh>
        {/* Kaschier-Verlauf vor dem Hintergrundbild */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -5.4]} renderOrder={1}>
          <planeGeometry args={[40, 3.2]} />
          <meshBasicMaterial map={getApronTexture()} transparent depthWrite={false} />
        </mesh>

        <ambientLight intensity={0.7} />
        <pointLight position={[-2.5, 2.2, 1.5]} intensity={6} color={lightColor} />
        <pointLight position={[3, 1.8, 0.5]} intensity={3} color={lightColor} />
      </Suspense>
    </Canvas>
  )
}
