import { useLayoutEffect } from 'react'
import { useTexture } from '@react-three/drei'
import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three'
import { getEpoch } from '../game/epochs'
import { resolveSceneUrl } from './textures'
import { resolveCharacterUrl, } from './characterTextures'
import { labelTexture, type SpriteFigure } from './sprites'
import { CHARACTERS } from '../game/characters'
import { NPCS } from '../game/npcs'
import type { EpochId } from '../game/types'
import type { FrameSpec } from './gallerySets'

/**
 * Museumsraum statt Matte-Painting: dunkle Rückwand und Boden mit subtilen
 * Linien und einer Neon-Lichtleiste in der Epochen-Akzentfarbe; an der Wand
 * hängen Bilderrahmen (Szenengemälde, Porträts, später Originalfotos aus
 * dem Museumssbestand), an denen man entlangschreitet — das Spiel als
 * Museumsrundgang.
 */
const WALL_Z = -3.6
const WALL_W = 28
const WALL_H = 5.2
const HANG_Y = 2.5 // Standard-Hängehöhe (Rahmenmitte)
const BORDER = 0.08 // Rahmenleistenbreite

const FIGURES: Record<string, SpriteFigure> = {}
for (const c of CHARACTERS) FIGURES[c.id] = c
for (const n of Object.values(NPCS)) FIGURES[n.id] = n

/** Story-Exponate: src/assets/objects/{key}.png (aus der Art-Pipeline) */
const objectFiles = import.meta.glob('../assets/objects/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const objectUrls = new Map<string, string>()
for (const [path, url] of Object.entries(objectFiles)) {
  objectUrls.set(path.split('/').pop()!.replace(/\.png$/, ''), url)
}

// --- Prozedurale Wand-/Bodentexturen (pro Akzentfarbe gecacht) --------------

const wallCache = new Map<string, CanvasTexture>()
const floorCache = new Map<string, CanvasTexture>()

function pixelTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.magFilter = NearestFilter
  texture.minFilter = NearestFilter
  texture.generateMipmaps = false
  return texture
}

function wallTexture(accent: string): CanvasTexture {
  const cached = wallCache.get(accent)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 192
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#131020'
  ctx.fillRect(0, 0, 1024, 192)
  // Subtile Wandpaneele
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
  for (let x = 0; x < 1024; x += 128) ctx.fillRect(x, 0, 1, 192)
  // Neon-Lichtleiste oben
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.12
  ctx.fillRect(0, 18, 1024, 5)
  ctx.globalAlpha = 0.5
  ctx.fillRect(0, 20, 1024, 1)
  // Sockelleiste unten mit Akzentlinie
  ctx.globalAlpha = 1
  ctx.fillStyle = '#0c0a14'
  ctx.fillRect(0, 178, 1024, 14)
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.35
  ctx.fillRect(0, 177, 1024, 1)
  ctx.globalAlpha = 1
  const texture = pixelTexture(canvas)
  wallCache.set(accent, texture)
  return texture
}

function floorTexture(accent: string): CanvasTexture {
  const cached = floorCache.get(accent)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 192
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#15111f'
  ctx.fillRect(0, 0, 1024, 192)
  // Bodenplatten-Fugen
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)'
  for (let x = 0; x < 1024; x += 96) ctx.fillRect(x, 0, 1, 192)
  for (let y = 48; y < 192; y += 48) ctx.fillRect(0, y, 1024, 1)
  // Neon-Saum an der Wandkante (oben = hinten) mit auslaufendem Schein
  const grad = ctx.createLinearGradient(0, 0, 0, 36)
  grad.addColorStop(0, `${accent}22`)
  grad.addColorStop(1, `${accent}00`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 36)
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.3
  ctx.fillRect(0, 0, 1024, 1)
  ctx.globalAlpha = 1
  const texture = pixelTexture(canvas)
  floorCache.set(accent, texture)
  return texture
}

// --- Bilderrahmen ------------------------------------------------------------

function resolveFrameUrl(frame: FrameSpec, epoch: EpochId): string {
  if (frame.kind === 'scene') return resolveSceneUrl(epoch, frame.src)
  if (frame.kind === 'character') {
    const figure = FIGURES[frame.src]
    if (!figure) throw new Error(`Galerie: unbekannte Figur "${frame.src}"`)
    return resolveCharacterUrl(figure)
  }
  if (frame.kind === 'object') {
    const url = objectUrls.get(frame.src)
    if (!url) throw new Error(`Galerie: unbekanntes Exponat "${frame.src}"`)
    return url
  }
  return frame.src
}

function Frame({ frame, epoch, accent }: { frame: FrameSpec; epoch: EpochId; accent: string }) {
  const texture = useTexture(resolveFrameUrl(frame, epoch))
  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
  }, [texture])

  const img = texture.image as { width?: number; height?: number } | undefined
  const aspect = img?.width && img?.height ? img.width / img.height : 1
  const width = frame.width
  const height = width / aspect
  const y = frame.y ?? HANG_Y
  const label = frame.title ? labelTexture(frame.title) : null

  return (
    <group position={[frame.x, y, 0]}>
      {/* Neon-Schein hinter dem Rahmen */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + BORDER * 2 + 0.14, height + BORDER * 2 + 0.14]} />
        <meshBasicMaterial color={accent} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* Rahmenleiste */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width + BORDER * 2, height + BORDER * 2]} />
        <meshBasicMaterial color="#241c30" />
      </mesh>
      {/* Passepartout — trägt transparente Motive (Figuren-Porträts) */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#0d0b16" />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
      {/* Bildunterschrift wie ein Museumsschild */}
      {label && (
        <mesh position={[0, -height / 2 - BORDER - 0.16, 0]}>
          <planeGeometry args={[0.18 * label.aspect, 0.18]} />
          <meshBasicMaterial map={label.texture} transparent depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}

// --- Raum ---------------------------------------------------------------------

export function GalleryRoom({
  epoch,
  frames,
}: {
  epoch: EpochId
  frames: FrameSpec[]
}) {
  const accent = getEpoch(epoch).mood.light
  const hung = frames.filter(f => !f.epoch || f.epoch === epoch)
  return (
    <>
      {/* Rückwand */}
      <mesh position={[0, WALL_H / 2, WALL_Z]}>
        <planeGeometry args={[WALL_W, WALL_H]} />
        <meshBasicMaterial map={wallTexture(accent)} />
      </mesh>
      {/* Museumsboden von der Wand bis zur Rampe */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, (WALL_Z + 1.4) / 2]}>
        <planeGeometry args={[WALL_W, 1.4 - WALL_Z]} />
        <meshBasicMaterial map={floorTexture(accent)} />
      </mesh>
      {/* Die Galerie */}
      <group position={[0, 0, WALL_Z + 0.04]}>
        {hung.map((frame, i) => (
          <Frame key={`${frame.src}-${i}`} frame={frame} epoch={epoch} accent={accent} />
        ))}
      </group>
    </>
  )
}
