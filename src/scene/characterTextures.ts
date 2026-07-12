import { useLayoutEffect } from 'react'
import { useTexture } from '@react-three/drei'
import { NearestFilter, SRGBColorSpace, type Texture } from 'three'
import { spritePreviewUrl, type SpriteFigure } from './sprites'

/**
 * KI-generierte Charakter-Sprites liegen als PNGs unter src/assets/characters/
 * mit dem Namensschema `${id}.png` (z.B. greta.png, npc-hanne.png; erzeugt
 * von `npm run generate-art`). Fehlt die Datei, greift der prozedurale
 * Pixel-Platzhalter aus sprites.ts. Alles läuft über URLs (Datei-URL oder
 * gecachte Data-URL), damit useTexture einen einheitlichen, Suspense-fähigen
 * Pfad hat — Spiegel von textures.ts für Szenenbilder.
 */
const files = import.meta.glob('../assets/characters/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const fileUrls = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  fileUrls.set(path.split('/').pop()!.replace(/\.png$/, ''), url)
}

export function resolveCharacterUrl(figure: SpriteFigure): string {
  return fileUrls.get(figure.id) ?? spritePreviewUrl(figure, 1)
}

export function useCharacterTexture(figure: SpriteFigure): Texture {
  const texture = useTexture(resolveCharacterUrl(figure))
  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
  }, [texture])
  return texture
}

/** Vorschau-URL für DOM-<img> (Startbildschirm): Datei oder Platzhalter. */
export function characterPreviewUrl(figure: SpriteFigure, scale = 3): string {
  return fileUrls.get(figure.id) ?? spritePreviewUrl(figure, scale)
}

export function preloadCharacters(figures: SpriteFigure[]): void {
  for (const figure of figures) useTexture.preload(resolveCharacterUrl(figure))
}
