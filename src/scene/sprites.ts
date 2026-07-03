import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three'
import type { Character } from '../game/types'

/**
 * Prozeduraler Pixel-Figuren-Generator: 32x48 Logikpixel je Charakter,
 * aus der SpriteSpec (Palette + Silhouette). Platzhalter, bis echte
 * KI-generierte Sprites im SCUMM-Stil vorliegen.
 */
const SPRITE_W = 32
const SPRITE_H = 48

const canvasCache = new Map<string, HTMLCanvasElement>()
const textureCache = new Map<string, CanvasTexture>()
const dataUrlCache = new Map<string, string>()

function drawSprite(character: Character): HTMLCanvasElement {
  const cached = canvasCache.get(character.id)
  if (cached) return cached

  const { skin, hair, coat, trousers, accent, hat, skirt, broad } = character.sprite
  const canvas = document.createElement('canvas')
  canvas.width = SPRITE_W
  canvas.height = SPRITE_H
  const ctx = canvas.getContext('2d')!
  const cx = SPRITE_W / 2
  const px = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
  }
  const darker = (hex: string) => {
    const n = parseInt(hex.slice(1), 16)
    const f = (c: number) => Math.max(0, Math.round(c * 0.65))
    const r = f((n >> 16) & 255)
    const g = f((n >> 8) & 255)
    const b = f(n & 255)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  const bodyW = broad ? 16 : 12
  const headW = broad ? 12 : 10

  // Beine / Rock
  if (skirt) {
    px(cx - bodyW / 2 - 2, 30, bodyW + 4, 12, darker(coat))
    px(cx - bodyW / 2 - 1, 29, bodyW + 2, 3, coat)
    px(cx - 4, 42, 3, 3, skin)
    px(cx + 1, 42, 3, 3, skin)
  } else {
    px(cx - bodyW / 2 + 1, 30, bodyW / 2 - 2, 13, trousers)
    px(cx + 1, 30, bodyW / 2 - 2, 13, trousers)
  }
  // Schuhe
  px(cx - bodyW / 2, 44, bodyW / 2 - 1, 3, '#1c1710')
  px(cx + 1, 44, bodyW / 2 - 1, 3, '#1c1710')

  // Rumpf
  px(cx - bodyW / 2, 15, bodyW, 16, coat)
  px(cx - bodyW / 2, 15, 2, 16, darker(coat))
  // Arme
  px(cx - bodyW / 2 - 3, 16, 3, 12, coat)
  px(cx + bodyW / 2, 16, 3, 12, coat)
  px(cx - bodyW / 2 - 3, 28, 3, 3, skin)
  px(cx + bodyW / 2, 28, 3, 3, skin)
  // Halstuch/Kragen-Akzent
  px(cx - bodyW / 2 + 1, 14, bodyW - 2, 3, accent)

  // Kopf
  px(cx - headW / 2, 4, headW, 10, skin)
  // Haare
  px(cx - headW / 2, 3, headW, 3, hair)
  px(cx - headW / 2, 5, 2, 5, hair)
  px(cx + headW / 2 - 2, 5, 2, 5, hair)
  // Augen
  px(cx - 3, 8, 1, 2, '#1c1710')
  px(cx + 2, 8, 1, 2, '#1c1710')
  // Hut
  if (hat) {
    px(cx - headW / 2 - 2, 3, headW + 4, 2, darker(coat))
    px(cx - headW / 2 + 1, 0, headW - 2, 4, darker(coat))
  }

  canvasCache.set(character.id, canvas)
  return canvas
}

export function spriteTexture(character: Character): CanvasTexture {
  const cached = textureCache.get(character.id)
  if (cached) return cached
  const texture = new CanvasTexture(drawSprite(character))
  texture.colorSpace = SRGBColorSpace
  texture.magFilter = NearestFilter
  texture.minFilter = NearestFilter
  texture.generateMipmaps = false
  textureCache.set(character.id, texture)
  return texture
}

/** Hochskalierte Vorschau (Data-URL) für den Startbildschirm. */
export function spritePreviewUrl(character: Character, scale = 3): string {
  const key = `${character.id}@${scale}`
  const cached = dataUrlCache.get(key)
  if (cached) return cached
  const src = drawSprite(character)
  const canvas = document.createElement('canvas')
  canvas.width = SPRITE_W * scale
  canvas.height = SPRITE_H * scale
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height)
  const url = canvas.toDataURL('image/png')
  dataUrlCache.set(key, url)
  return url
}

/** Seitenverhältnis der Sprite-Plane (Breite/Höhe) */
export const SPRITE_ASPECT = SPRITE_W / SPRITE_H
