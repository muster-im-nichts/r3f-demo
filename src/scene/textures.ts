import { useLayoutEffect } from 'react'
import { useTexture } from '@react-three/drei'
import { NearestFilter, SRGBColorSpace, type Texture } from 'three'
import { getEpoch } from '../game/epochs'
import type { EpochId } from '../game/types'

/**
 * Szenenbilder liegen als PNGs unter src/assets/scenes/ mit dem Namensschema
 * `${epoche}-${scene}.png` (z.B. 1760-marktplatz.png) oder `default-${scene}.png`
 * als epochenübergreifender Fallback. Fehlt beides, wird ein deterministisch
 * geseedeter Pixel-Platzhalter generiert. Alles läuft über URLs (Datei-URL
 * oder gecachte Data-URL), damit useTexture einen einheitlichen, Suspense-
 * fähigen Pfad hat.
 */
const files = import.meta.glob('../assets/scenes/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const fileUrls = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  fileUrls.set(path.split('/').pop()!.replace(/\.png$/, ''), url)
}

const placeholderCache = new Map<string, string>()

/** Szenen, die als Innenraum gezeichnet werden (nur für Platzhalter relevant) */
const INTERIOR_SCENES = new Set(['werkstatt', 'wachstube', 'muehle', 'finale', 'fabrik'])

export function resolveSceneUrl(epoch: EpochId, scene: string): string {
  return (
    fileUrls.get(`${epoch}-${scene}`) ??
    fileUrls.get(`default-${scene}`) ??
    placeholderUrl(epoch, scene)
  )
}

export function useSceneTexture(epoch: EpochId, scene: string): Texture {
  const texture = useTexture(resolveSceneUrl(epoch, scene))
  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
  }, [texture])
  return texture
}

export function preloadScenes(epoch: EpochId, scenes: string[]): void {
  for (const scene of scenes) useTexture.preload(resolveSceneUrl(epoch, scene))
}

// ---------------------------------------------------------------------------
// Prozeduraler Platzhalter: 192x108 Logikpixel, NearestFilter macht den Rest.

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function placeholderUrl(epoch: EpochId, scene: string): string {
  const key = `${epoch}-${scene}`
  const cached = placeholderCache.get(key)
  if (cached) return cached

  const W = 192
  const H = 108
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const rnd = mulberry32(hashSeed(key))
  const mood = getEpoch(epoch).mood

  if (INTERIOR_SCENES.has(scene)) {
    drawInterior(ctx, W, H, rnd, mood)
  } else {
    drawExterior(ctx, W, H, rnd, mood)
  }

  const url = canvas.toDataURL('image/png')
  placeholderCache.set(key, url)
  return url
}

type Mood = { sky: [string, string]; building: string; light: string }

function drawExterior(ctx: CanvasRenderingContext2D, W: number, H: number, rnd: () => number, mood: Mood): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, mood.sky[0])
  sky.addColorStop(1, mood.sky[1])
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#e8e0cc'
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.3 + rnd() * 0.7
    ctx.fillRect(Math.floor(rnd() * W), Math.floor(rnd() * H * 0.5), 1, 1)
  }
  ctx.globalAlpha = 0.9
  const moonX = Math.floor(20 + rnd() * (W - 40))
  ctx.fillStyle = '#f0ead6'
  ctx.beginPath()
  ctx.arc(moonX, 18, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Zwei Silhouetten-Reihen Giebelhäuser
  drawSkyline(ctx, W, rnd, shade(mood.building, -0.4), H * 0.45, H * 0.62, false, mood.light)
  drawSkyline(ctx, W, rnd, mood.building, H * 0.55, H * 0.72, true, mood.light)

  // Straße
  const street = ctx.createLinearGradient(0, H * 0.72, 0, H)
  street.addColorStop(0, shade(mood.building, -0.55))
  street.addColorStop(1, shade(mood.building, -0.75))
  ctx.fillStyle = street
  ctx.fillRect(0, Math.floor(H * 0.72), W, H)

  // Laternen mit Glow
  const lanternCount = 2
  for (let i = 0; i < lanternCount; i++) {
    const x = Math.floor(W * (0.2 + i * 0.55) + rnd() * 12)
    const y = Math.floor(H * 0.72)
    const glow = ctx.createRadialGradient(x, y - 14, 1, x, y - 14, 18)
    glow.addColorStop(0, mood.light)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalAlpha = 0.5
    ctx.fillStyle = glow
    ctx.fillRect(x - 18, y - 32, 36, 40)
    ctx.globalAlpha = 1
    ctx.fillStyle = '#111'
    ctx.fillRect(x, y - 12, 1, 12)
    ctx.fillStyle = mood.light
    ctx.fillRect(x - 1, y - 14, 3, 3)
  }
}

function drawSkyline(
  ctx: CanvasRenderingContext2D,
  W: number,
  rnd: () => number,
  color: string,
  topMin: number,
  base: number,
  windows: boolean,
  light: string,
): void {
  let x = 0
  while (x < W) {
    const w = 14 + Math.floor(rnd() * 18)
    const top = topMin + rnd() * (base - topMin) * 0.5
    ctx.fillStyle = color
    ctx.fillRect(x, Math.floor(top), w, Math.ceil(base - top) + 40)
    // Giebel
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x + w / 2, top - 5 - rnd() * 6)
    ctx.lineTo(x + w, top)
    ctx.fill()
    if (windows) {
      ctx.fillStyle = light
      for (let wx = x + 3; wx < x + w - 3; wx += 5) {
        for (let wy = top + 4; wy < base - 4; wy += 7) {
          if (rnd() < 0.4) ctx.fillRect(Math.floor(wx), Math.floor(wy), 2, 3)
        }
      }
    }
    x += w + 1
  }
}

function drawInterior(ctx: CanvasRenderingContext2D, W: number, H: number, rnd: () => number, mood: Mood): void {
  const wall = ctx.createLinearGradient(0, 0, 0, H)
  wall.addColorStop(0, shade(mood.building, -0.15))
  wall.addColorStop(1, shade(mood.building, -0.5))
  ctx.fillStyle = wall
  ctx.fillRect(0, 0, W, H)

  // Deckenbalken
  ctx.fillStyle = shade(mood.building, -0.6)
  for (let x = 8; x < W; x += 34) ctx.fillRect(x, 0, 5, Math.floor(H * 0.16))
  ctx.fillRect(0, Math.floor(H * 0.15), W, 3)

  // Fenster mit Nachthimmel
  const wx = Math.floor(W * (0.15 + rnd() * 0.5))
  ctx.fillStyle = mood.sky[0]
  ctx.fillRect(wx, Math.floor(H * 0.26), 26, 22)
  ctx.fillStyle = shade(mood.building, -0.65)
  ctx.fillRect(wx + 12, Math.floor(H * 0.26), 2, 22)
  ctx.fillRect(wx, Math.floor(H * 0.36), 26, 2)
  ctx.fillStyle = '#e8e0cc'
  ctx.fillRect(wx + 5, Math.floor(H * 0.3), 1, 1)
  ctx.fillRect(wx + 19, Math.floor(H * 0.29), 1, 1)

  // Boden
  ctx.fillStyle = shade(mood.building, -0.7)
  ctx.fillRect(0, Math.floor(H * 0.68), W, H)
  ctx.fillStyle = shade(mood.building, -0.62)
  for (let y = Math.floor(H * 0.7); y < H; y += 6) ctx.fillRect(0, y, W, 1)

  // Möbel-Silhouetten (Tisch, Regal)
  ctx.fillStyle = shade(mood.building, -0.55)
  const tx = Math.floor(W * (0.55 + rnd() * 0.2))
  ctx.fillRect(tx, Math.floor(H * 0.56), 36, 4)
  ctx.fillRect(tx + 2, Math.floor(H * 0.56), 3, Math.floor(H * 0.14))
  ctx.fillRect(tx + 31, Math.floor(H * 0.56), 3, Math.floor(H * 0.14))
  const sx = Math.floor(W * 0.06)
  ctx.fillRect(sx, Math.floor(H * 0.3), 24, Math.floor(H * 0.38))
  ctx.fillStyle = shade(mood.building, -0.4)
  for (let sy = 0; sy < 4; sy++) {
    ctx.fillRect(sx + 2, Math.floor(H * 0.33) + sy * 9, 20, 2)
  }

  // Warmes Lichtfeld einer Lampe/Kerze
  const lx = tx + 18
  const ly = Math.floor(H * 0.52)
  const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 30)
  glow.addColorStop(0, mood.light)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalAlpha = 0.45
  ctx.fillStyle = glow
  ctx.fillRect(lx - 30, ly - 30, 60, 60)
  ctx.globalAlpha = 1
  ctx.fillStyle = mood.light
  ctx.fillRect(lx - 1, ly - 2, 2, 3)
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 + amount))))
  const r = f((n >> 16) & 255)
  const g = f((n >> 8) & 255)
  const b = f(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
