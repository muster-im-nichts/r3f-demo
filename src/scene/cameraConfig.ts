import { MathUtils } from 'three'

/** Maximale Parallax-Auslenkung in World-Units — klein halten = Guckkasten-Gefühl */
export const PARALLAX_X = 0.35
export const PARALLAX_Y = 0.15

/**
 * Wie weit die Kamera der Figur seitlich folgen darf, bevor der Backdrop-Rand
 * sichtbar würde. Schmale Screens brauchen mehr Spielraum, breite weniger.
 * Backdrop.tsx reserviert exakt diese Reserve in der Plane-Breite.
 */
export function followRange(aspect: number): number {
  return MathUtils.clamp(2.2 - aspect * 0.75, 0.9, 1.6)
}
