import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { moveInput, type MoveDir } from '../scene/moveKeys'
import { isNarrowScreen } from './responsive'

const isTouchDevice =
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

const BASE = 112
const KNOB = 48
const MAX_OFFSET = (BASE - KNOB) / 2
const DEADZONE = 12

function applyVector(dx: number, dy: number): void {
  const set = (dir: MoveDir, active: boolean) =>
    active ? moveInput.add(dir) : moveInput.delete(dir)
  set('left', dx < -DEADZONE)
  set('right', dx > DEADZONE)
  set('back', dy < -DEADZONE)
  set('front', dy > DEADZONE)
}

function clearAll(): void {
  moveInput.delete('left')
  moveInput.delete('right')
  moveInput.delete('back')
  moveInput.delete('front')
}

/**
 * Virtueller Joystick (rechts, verblasst bei Nichtbenutzung) —
 * nur auf Touch-Geräten sichtbar.
 */
export function TouchControls() {
  const [active, setActive] = useState(false)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const origin = useRef({ x: 0, y: 0 })

  // Beim Unmount (z.B. Spielende) darf keine Richtung hängen bleiben
  useEffect(() => clearAll, [])

  if (!isTouchDevice) return null

  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const rect = e.currentTarget.getBoundingClientRect()
    origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    setActive(true)
    move(e)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    let dx = e.clientX - origin.current.x
    let dy = e.clientY - origin.current.y
    const len = Math.hypot(dx, dy)
    if (len > MAX_OFFSET) {
      dx = (dx / len) * MAX_OFFSET
      dy = (dy / len) * MAX_OFFSET
    }
    setKnob({ x: dx, y: dy })
    applyVector(dx, dy)
  }
  const up = () => {
    setActive(false)
    setKnob({ x: 0, y: 0 })
    clearAll()
  }

  return (
    <div
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onLostPointerCapture={up}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: 'absolute',
        right: '16px',
        bottom: isNarrowScreen() ? 'calc(26dvh + 24px)' : 'calc(42dvh + 24px)',
        width: `${BASE}px`,
        height: `${BASE}px`,
        borderRadius: '50%',
        background: 'rgba(23, 19, 31, 0.5)',
        border: '2px solid var(--color-gold-dim)',
        opacity: active ? 0.95 : 0.35,
        transition: 'opacity 0.35s',
        zIndex: 3,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${KNOB}px`,
          height: `${KNOB}px`,
          borderRadius: '50%',
          background: 'rgba(217, 164, 65, 0.85)',
          border: '2px solid #000',
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
          transition: active ? 'none' : 'transform 0.2s',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
