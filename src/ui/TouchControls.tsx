import type { CSSProperties, PointerEvent } from 'react'
import { moveInput, type MoveDir } from '../scene/moveKeys'
import { isNarrowScreen } from './responsive'

const isTouchDevice =
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

const buttonStyle: CSSProperties = {
  position: 'absolute',
  bottom: isNarrowScreen() ? 'calc(26dvh + 24px)' : 'calc(42dvh + 18px)',
  width: '58px',
  height: '58px',
  borderRadius: '50%',
  background: 'rgba(23, 19, 31, 0.65)',
  border: '2px solid var(--color-gold-dim)',
  color: 'var(--color-gold)',
  fontSize: '24px',
  lineHeight: 1,
  zIndex: 3,
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

function HoldButton({ dir, label, side }: { dir: MoveDir; label: string; side: 'left' | 'right' }) {
  const press = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    moveInput.add(dir)
  }
  const release = () => moveInput.delete(dir)
  return (
    <button
      aria-label={dir === 'left' ? 'Nach links laufen' : 'Nach rechts laufen'}
      style={{ ...buttonStyle, [side]: '14px' }}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={e => e.preventDefault()}
    >
      {label}
    </button>
  )
}

/** On-Screen-Lauftasten — nur auf Touch-Geräten sichtbar. */
export function TouchControls() {
  if (!isTouchDevice) return null
  return (
    <>
      <HoldButton dir="left" label="◀" side="left" />
      <HoldButton dir="right" label="▶" side="right" />
    </>
  )
}
