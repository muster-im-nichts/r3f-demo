import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, MathUtils, NearestFilter, SRGBColorSpace, type Mesh } from 'three'

/**
 * Roter Theatervorhang: zwei Falten-Panels nah an der Kamera. Beim Spielstart
 * fahren sie zur Seite ("Vorhang auf!"), am Ende der Geschichte schließen sie
 * sich hinter dem Abspann.
 */
const CURTAIN_Z = 2.6
const CAMERA_Z = 6
const FOV = 45
const PANEL_W = 4.4
const PANEL_H = 5.2
const PANEL_Y = 1.3

let curtainTexture: CanvasTexture | null = null

function getCurtainTexture(): CanvasTexture {
  if (curtainTexture) return curtainTexture
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  for (let x = 0; x < 128; x++) {
    const fold = Math.sin((x / 128) * Math.PI * 10)
    const base = 0.72 + fold * 0.28
    ctx.fillStyle = `rgb(${Math.round(122 * base)}, ${Math.round(26 * base)}, ${Math.round(34 * base)})`
    ctx.fillRect(x, 0, 1, 128)
  }
  // Abdunklung nach unten + Goldsaum
  const grad = ctx.createLinearGradient(0, 0, 0, 128)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  ctx.fillStyle = '#d9a441'
  ctx.fillRect(0, 124, 128, 2)

  curtainTexture = new CanvasTexture(canvas)
  curtainTexture.colorSpace = SRGBColorSpace
  curtainTexture.magFilter = NearestFilter
  curtainTexture.minFilter = NearestFilter
  curtainTexture.generateMipmaps = false
  return curtainTexture
}

function Panel({ side, closed }: { side: -1 | 1; closed: boolean }) {
  const mesh = useRef<Mesh>(null)
  const viewportAspect = useThree(s => s.viewport.aspect)
  const texture = useMemo(getCurtainTexture, [])

  // Sichtbare halbe Breite auf Vorhang-Tiefe (+ Parallax-/Rand-Reserve)
  const halfVisible =
    Math.tan((FOV * Math.PI) / 360) * (CAMERA_Z - CURTAIN_Z) * Math.max(viewportAspect, 0.4)
  const xOpen = side * (halfVisible + PANEL_W / 2 + 0.9)
  const xClosed = side * (PANEL_W / 2 - 0.15)

  useFrame((state, delta) => {
    if (!mesh.current) return
    const target = closed ? xClosed : xOpen
    mesh.current.position.x = MathUtils.damp(mesh.current.position.x, target, closed ? 2.6 : 1.7, delta)
    // Leichtes Stoff-Schwingen, solange der Vorhang in Bewegung ist
    const moving = Math.abs(mesh.current.position.x - target) > 0.05
    mesh.current.rotation.y = moving ? Math.sin(state.clock.elapsedTime * 6) * 0.02 : 0
  })

  return (
    <mesh ref={mesh} position={[xClosed, PANEL_Y, CURTAIN_Z]}>
      <planeGeometry args={[PANEL_W, PANEL_H]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

export function Curtain({ closed }: { closed: boolean }) {
  return (
    <>
      <Panel side={-1} closed={closed} />
      <Panel side={1} closed={closed} />
    </>
  )
}
