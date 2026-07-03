import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MeshBasicMaterial } from 'three'
import { useSceneTexture } from './textures'
import type { EpochId } from '../game/types'
import { PARALLAX_X, PARALLAX_Y } from './CameraRig'

const BACKDROP_Z = -10
const FADE_Z = -9.98
const CAMERA_Z = 6
const FOV = 45
const TEX_ASPECT = 192 / 108 // 16:9, wie die Platzhalter und Szenen-PNGs
const FADE_SECONDS = 0.8

/**
 * Plane-Größe so, dass sie das Frustum plus Parallax-Spielraum in jedem
 * Seitenverhältnis abdeckt (cover), ohne die Textur zu verzerren.
 */
function usePlaneSize(): [number, number] {
  const viewportAspect = useThree(s => s.viewport.aspect)
  const dist = CAMERA_Z - BACKDROP_Z
  const neededH = 2 * Math.tan((FOV * Math.PI) / 360) * dist + PARALLAX_Y * 4
  const neededW = neededH * Math.max(viewportAspect, 1) + PARALLAX_X * 4
  const width = Math.max(neededW, neededH * TEX_ASPECT)
  return [width, width / TEX_ASPECT]
}

function BackdropPlane({ epoch, scene, z }: { epoch: EpochId; scene: string; z: number }) {
  const texture = useSceneTexture(epoch, scene)
  const [width, height] = usePlaneSize()
  return (
    <mesh position={[0, height / 2 - 1.5, z]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

function FadingPlane({ epoch, scene, onDone }: { epoch: EpochId; scene: string; onDone: () => void }) {
  const texture = useSceneTexture(epoch, scene)
  const [width, height] = usePlaneSize()
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
    <mesh position={[0, height / 2 - 1.5, FADE_Z]} renderOrder={1}>
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
