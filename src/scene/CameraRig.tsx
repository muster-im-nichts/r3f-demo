import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import { avatarPos } from './avatarState'
import { followRange, PARALLAX_X, PARALLAX_Y } from './cameraConfig'

const BASE = { x: 0, y: 1.4, z: 6 }
const LOOK_AT_Y = 1.2
const FOV = 45

/**
 * Theater-Kamera: folgt der Hauptfigur mit Totzone — sie darf Richtung
 * Bildrand laufen, und erst kurz bevor sie rausläuft, schwenkt die Bühne mit.
 * Obendrauf der sanfte Pointer-Parallax und ein langsamer Eigen-Drift.
 */
export function CameraRig() {
  const follow = useRef(0)
  const look = useRef(0)

  useFrame((state, delta) => {
    const aspect = state.viewport.aspect
    // Totzone: halbe Sichtbreite auf Avatar-Tiefe, davon ~55 %
    const halfW = Math.tan((FOV * Math.PI) / 360) * (BASE.z - avatarPos.z) * aspect
    const margin = halfW * 0.55
    let f = follow.current
    if (avatarPos.x - f > margin) f = avatarPos.x - margin
    else if (avatarPos.x - f < -margin) f = avatarPos.x + margin
    follow.current = MathUtils.clamp(f, -followRange(aspect), followRange(aspect))
    look.current = MathUtils.damp(look.current, follow.current, 3, delta)

    const t = state.clock.elapsedTime
    const drift = Math.sin(t * 0.25) * 0.05
    const targetX =
      look.current + MathUtils.clamp(state.pointer.x, -1, 1) * PARALLAX_X + drift
    const targetY = BASE.y + MathUtils.clamp(state.pointer.y, -1, 1) * PARALLAX_Y

    state.camera.position.x = MathUtils.damp(state.camera.position.x, targetX, 3, delta)
    state.camera.position.y = MathUtils.damp(state.camera.position.y, targetY, 3, delta)
    state.camera.position.z = BASE.z
    state.camera.lookAt(look.current, LOOK_AT_Y, 0)
  })
  return null
}
