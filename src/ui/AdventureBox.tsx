import { useEffect, useRef, useState } from 'react'
import type { StoryOption } from '../game/types'
import { useTypewriter } from './useTypewriter'
import { click } from '../audio/sfx'
import { MOVE_KEYS } from '../scene/moveKeys'
import { isNarrowScreen } from './responsive'

/**
 * Die klassische Adventure-Textbox am unteren Bühnenrand: Typewriter-Text,
 * "Was machst du?" und 2–3 Optionen. Tasten 1/2/3 wählen, jede andere Taste
 * oder ein Tap auf die Box überspringt den Typewriter. Über den Pfeil-Knopf
 * (oder eingeklappt: Tap auf die Leiste) lässt sie sich wegklappen, um in
 * die Szene einzutauchen.
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
  const [collapsed, setCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const narrow = isNarrowScreen()

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

  // Beim Tippen und beim Einblenden der Optionen ans Ende scrollen
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown, done])

  const frameStyle = {
    position: 'absolute' as const,
    left: '50%',
    bottom: 'max(12px, env(safe-area-inset-bottom))',
    transform: 'translateX(-50%)',
    width: 'min(720px, calc(100% - 24px))',
    background: 'rgba(23, 19, 31, 0.92)',
    border: '3px solid var(--color-panel-border)',
    borderRadius: '10px',
    boxShadow: '0 0 0 2px #000, 0 12px 30px rgba(0,0,0,0.6)',
    zIndex: 3,
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          ...frameStyle,
          padding: '10px 14px',
          color: 'var(--color-gold)',
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          textAlign: 'center',
        }}
      >
        ▲ Geschichte einblenden
      </button>
    )
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={() => !done && skip()}
      style={{
        ...frameStyle,
        padding: narrow ? '8px 12px 8px' : 'clamp(10px, 1.6vw, 14px) clamp(12px, 2vw, 18px) 12px',
        maxHeight: narrow ? '22dvh' : '34dvh',
        overflowY: 'auto',
      }}
    >
      {/* Einklappen, um die Szene freizugeben */}
      <button
        aria-label="Textbox einklappen"
        onClick={e => {
          e.stopPropagation()
          setCollapsed(true)
        }}
        style={{
          position: 'sticky',
          top: 0,
          float: 'right',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-dim)',
          fontSize: '14px',
          padding: '0 2px 4px 10px',
        }}
      >
        ▼
      </button>
      <p
        style={{
          fontFamily: 'var(--font-text)',
          fontSize: narrow ? '15px' : 'clamp(16px, 4.4vw, 24px)',
          lineHeight: 1.25,
          minHeight: '1.3em',
          color: 'var(--color-text)',
        }}
      >
        {shown}
        {!done && <span style={{ opacity: 0.7 }}>▌</span>}
      </p>
      {done && (
      <div style={{ marginTop: '8px', animation: 'fade-in 0.25s ease-out' }}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: narrow ? '9px' : '11px',
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
              fontSize: narrow ? '14px' : 'clamp(15px, 4vw, 22px)',
              padding: narrow ? '7px 8px' : '6px 10px',
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
      )}
    </div>
  )
}
