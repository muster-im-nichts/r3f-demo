import type { CSSProperties, PointerEvent } from 'react'
import { moveInput, type MoveDir } from '../scene/moveKeys'
import { isNarrowScreen } from './responsive'

const isTouchDevice =
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

const buttonStyle: CSSProperties = {
  width: '46px',
  height: '46px',
  borderRadius: '10px',
  background: 'rgba(23, 19, 31, 0.65)',
  border: '2px solid var(--color-gold-dim)',
  color: 'var(--color-gold)',
  fontSize: '18px',
  lineHeight: 1,
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

const LABELS: Record<MoveDir, string> = { back: '▲', front: '▼', left: '◀', right: '▶' }
const ARIA: Record<MoveDir, string> = {
  back: 'Nach hinten laufen',
  front: 'Nach vorn laufen',
  left: 'Nach links laufen',
  right: 'Nach rechts laufen',
}

function HoldButton({ dir, cell }: { dir: MoveDir; cell: CSSProperties }) {
  const press = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    moveInput.add(dir)
  }
  const release = () => moveInput.delete(dir)
  return (
    <button
      aria-label={ARIA[dir]}
      style={{ ...buttonStyle, ...cell }}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={e => e.preventDefault()}
    >
      {LABELS[dir]}
    </button>
  )
}

/** On-Screen-D-Pad (alle vier Richtungen) — nur auf Touch-Geräten sichtbar. */
export function TouchControls() {
  if (!isTouchDevice) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: '12px',
        bottom: isNarrowScreen() ? 'calc(26dvh + 20px)' : 'calc(42dvh + 20px)',
        zIndex: 3,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 46px)',
        gridTemplateRows: 'repeat(3, 46px)',
        gap: '4px',
        touchAction: 'none',
      }}
    >
      <HoldButton dir="back" cell={{ gridColumn: 2, gridRow: 1 }} />
      <HoldButton dir="left" cell={{ gridColumn: 1, gridRow: 2 }} />
      <HoldButton dir="right" cell={{ gridColumn: 3, gridRow: 2 }} />
      <HoldButton dir="front" cell={{ gridColumn: 2, gridRow: 3 }} />
    </div>
  )
}
