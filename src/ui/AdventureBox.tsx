import { useEffect } from 'react'
import type { StoryOption } from '../game/types'
import { useTypewriter } from './useTypewriter'
import { click } from '../audio/sfx'
import { MOVE_KEYS } from '../scene/moveKeys'

/**
 * Die klassische Adventure-Textbox am unteren Bühnenrand: Typewriter-Text,
 * "Was machst du?" und 2–3 Optionen. Tasten 1/2/3 wählen, jede andere Taste
 * oder ein Tap auf die Box überspringt den Typewriter.
 */
export function AdventureBox({
  text,
  options,
  onChoose,
}: {
  text: string
  options: StoryOption[]
  onChoose: (target: string) => void
}) {
  const { shown, done, skip } = useTypewriter(text)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Lauf-Tasten steuern den Avatar, nicht die Textbox
      if (MOVE_KEYS[e.key.toLowerCase()]) return
      if (!done) {
        skip()
        return
      }
      const index = ['1', '2', '3'].indexOf(e.key)
      if (index >= 0 && options[index]) {
        click()
        onChoose(options[index].target)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, skip, options, onChoose])

  return (
    <div
      onPointerDown={() => !done && skip()}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 'max(12px, env(safe-area-inset-bottom))',
        transform: 'translateX(-50%)',
        width: 'min(720px, calc(100% - 24px))',
        background: 'rgba(23, 19, 31, 0.92)',
        border: '3px solid var(--color-panel-border)',
        borderRadius: '10px',
        boxShadow: '0 0 0 2px #000, 0 12px 30px rgba(0,0,0,0.6)',
        padding: 'clamp(10px, 1.6vw, 14px) clamp(12px, 2vw, 18px) 12px',
        maxHeight: '42dvh',
        overflowY: 'auto',
        zIndex: 3,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-text)',
          fontSize: 'clamp(16px, 4.4vw, 24px)',
          lineHeight: 1.25,
          minHeight: 'min(3.75em, 15dvh)',
          color: 'var(--color-text)',
        }}
      >
        {shown}
        {!done && <span style={{ opacity: 0.7 }}>▌</span>}
      </p>
      <div style={{ marginTop: '10px', opacity: done ? 1 : 0, transition: 'opacity 0.25s' }}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '11px',
            color: 'var(--color-gold)',
            margin: '2px 0 8px',
          }}
        >
          Was machst du?
        </div>
        {options.map((option, i) => (
          <button
            key={option.target + option.label}
            onClick={() => {
              if (!done) return
              click()
              onChoose(option.target)
            }}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: 'transparent',
              border: '2px solid transparent',
              borderRadius: '6px',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-text)',
              fontSize: 'clamp(15px, 4vw, 22px)',
              padding: '6px 10px',
              marginBottom: '2px',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-gold-dim)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <span style={{ color: 'var(--color-gold)', marginRight: '10px' }}>{i + 1}.</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
