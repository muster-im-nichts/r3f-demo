import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraRig } from './CameraRig'
import { Backdrop } from './Backdrop'
import { Avatar } from './Avatar'
import type { Character, EpochId } from '../game/types'
import { getEpoch } from '../game/epochs'

/**
 * Die Theaterbühne: Matte-Painting hinten, Bühnenboden, Avatar vorn.
 * `flat` (NoToneMapping), damit Pixel-Art-Farben unverfälscht bleiben.
 */
export function Stage({
  epoch,
  scene,
  character,
  speech,
}: {
  epoch: EpochId
  scene: string
  character: Character
  speech?: string
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
        <Avatar character={character} speech={speech} />

        {/* Bühnenboden: nimmt das warme Laternenlicht auf */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
          <planeGeometry args={[40, 18]} />
          <meshStandardMaterial color="#241d2e" />
        </mesh>
        <ambientLight intensity={0.7} />
        <pointLight position={[-2.5, 2.2, 1.5]} intensity={6} color={lightColor} />
        <pointLight position={[3, 1.8, 0.5]} intensity={3} color={lightColor} />
      </Suspense>
    </Canvas>
  )
}
