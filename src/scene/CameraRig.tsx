import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

const BASE = { x: 0, y: 1.4, z: 6 }
const LOOK_AT = { x: 0, y: 1.2, z: 0 }
/** Maximale Kamera-Auslenkung in World-Units — klein halten = Guckkasten-Gefühl */
export const PARALLAX_X = 0.35
export const PARALLAX_Y = 0.15

/**
 * Feste Theater-Kamera mit sanftem Parallax: Pointer (Maus/Touch, von fiber
 * auf -1..1 normalisiert) lenkt die Kamera minimal aus, dazu ein langsamer
 * autonomer Drift, damit die Bühne auch ohne Eingabe lebt.
 */
export function CameraRig() {
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const drift = Math.sin(t * 0.25) * 0.05
    const targetX = BASE.x + MathUtils.clamp(state.pointer.x, -1, 1) * PARALLAX_X + drift
    const targetY = BASE.y + MathUtils.clamp(state.pointer.y, -1, 1) * PARALLAX_Y

    state.camera.position.x = MathUtils.damp(state.camera.position.x, targetX, 3, delta)
    state.camera.position.y = MathUtils.damp(state.camera.position.y, targetY, 3, delta)
    state.camera.position.z = BASE.z
    state.camera.lookAt(LOOK_AT.x, LOOK_AT.y, LOOK_AT.z)
  })
  return null
}
