import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MeshBasicMaterial, Texture } from 'three'
import { useSceneTexture } from './textures'
import type { EpochId } from '../game/types'
import { followRange, PARALLAX_X } from './cameraConfig'

export const BACKDROP_Z = -7
const FADE_Z = -6.98
const CAMERA_Z = 6
const FOV = 45
const FADE_SECONDS = 0.8
/** Unterkante des Bilds knapp unter dem Bühnenboden — kaum toter Boden davor */
const BOTTOM_Y = -0.35
/** Mindesthöhe, damit breite Bilder im Hochformat nicht zum Streifen werden */
const MIN_HEIGHT = 5.6

/**
 * Das Bild wird an der Breite ausgerichtet (Sichtfeld + Parallax-Reserve)
 * statt das ganze Frustum zu füllen — deutlich weniger gezoomt. Das
 * Seitenverhältnis kommt aus der geladenen Textur, nichts wird verzerrt.
 */
function usePlaneSize(texture: Texture): [number, number] {
  const viewportAspect = useThree(s => s.viewport.aspect)
  const img = texture.image as { width?: number; height?: number } | undefined
  const texAspect = img?.width && img?.height ? img.width / img.height : 16 / 9
  const dist = CAMERA_Z - BACKDROP_Z
  const halfH = Math.tan((FOV * Math.PI) / 360) * dist
  const fitWidth =
    2 * halfH * Math.max(viewportAspect, 0.4) +
    PARALLAX_X * 4 +
    0.8 +
    2 * followRange(viewportAspect) // Schwenk-Reserve der Follow-Kamera
  const width = Math.max(fitWidth, MIN_HEIGHT * texAspect)
  return [width, width / texAspect]
}

function BackdropPlane({ epoch, scene, z }: { epoch: EpochId; scene: string; z: number }) {
  const texture = useSceneTexture(epoch, scene)
  const [width, height] = usePlaneSize(texture)
  return (
    <mesh position={[0, height / 2 + BOTTOM_Y, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

function FadingPlane({ epoch, scene, onDone }: { epoch: EpochId; scene: string; onDone: () => void }) {
  const texture = useSceneTexture(epoch, scene)
  const [width, height] = usePlaneSize(texture)
  const material = useRef<MeshBasicMaterial>(null)
  const done = useRef(false)

  useFrame((_, delta) => {
    if (!material.current || done.current) return
    material.current.opacity = Math.min(1, material.current.opacity + delta / FADE_SECONDS)
    if (material.current.opacity >= 1) {
      done.current = true
      onDone()
    }
  })

  return (
    <mesh position={[0, height / 2 + BOTTOM_Y, FADE_Z]} renderOrder={1}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial ref={material} map={texture} transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

/**
 * Matte-Painting-Hintergrund mit Zwei-Planes-Crossfade: Die alte Szene bleibt
 * voll opak stehen, die neue blendet davor ein und wird danach zur aktuellen.
 */
export function Backdrop({ epoch, scene }: { epoch: EpochId; scene: string }) {
  const [current, setCurrent] = useState(scene)
  const [incoming, setIncoming] = useState<string | null>(null)

  useEffect(() => {
    if (scene === current || scene === incoming) return
    if (incoming) setCurrent(incoming) // laufenden Fade abkürzen
    setIncoming(scene)
  }, [scene, current, incoming])

  return (
    <>
      <BackdropPlane epoch={epoch} scene={current} z={BACKDROP_Z} />
      {incoming && (
        <FadingPlane
          key={incoming}
          epoch={epoch}
          scene={incoming}
          onDone={() => {
            setCurrent(incoming)
            setIncoming(null)
          }}
        />
      )}
    </>
  )
}
