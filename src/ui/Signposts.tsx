import type { CSSProperties } from 'react'

const chipStyle: CSSProperties = {
  position: 'absolute',
  top: '38%',
  transform: 'translateY(-50%)',
  background: 'rgba(23, 19, 31, 0.8)',
  border: '2px solid var(--color-gold-dim)',
  borderRadius: '8px',
  color: 'var(--color-gold)',
  fontFamily: 'var(--font-pixel)',
  fontSize: 'clamp(8px, 2.2vw, 10px)',
  padding: '8px 10px',
  zIndex: 3,
  cursor: 'pointer',
}

/**
 * Wegweiser an den Bühnenrändern: zeigen, welche Story-Orte man "mit den
 * Füßen" wählen kann. Klick/Tap läuft ebenfalls los.
 */
export function Signposts({
  left,
  right,
  onGo,
}: {
  left?: string
  right?: string
  onGo: (direction: 'left' | 'right') => void
}) {
  return (
    <>
      {left && (
        <button style={{ ...chipStyle, left: '10px' }} onClick={() => onGo('left')}>
          ◀ {left}
        </button>
      )}
      {right && (
        <button style={{ ...chipStyle, right: '10px' }} onClick={() => onGo('right')}>
          {right} ▶
        </button>
      )}
    </>
  )
}
