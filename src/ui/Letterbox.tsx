import { useState } from 'react'
import { isMuted, setMuted } from '../audio/audio'
import { stopSpeaking } from '../audio/voice'
import { SpeakerIcon } from './icons'

const barStyle = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  height: '5dvh',
  background: '#000',
  zIndex: 2,
}

/**
 * Proszenium: Letterbox-Balken mit Goldkante plus Vignette. Alles ohne
 * Pointer-Events, damit Parallax und Buttons ungestört bleiben — nur der
 * Mute-Knopf ist klickbar.
 */
export function Letterbox() {
  const [muted, setMutedState] = useState(isMuted)

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      <div style={{ ...barStyle, top: 0, borderBottom: '2px solid var(--color-gold-dim)' }} />
      <div style={{ ...barStyle, bottom: 0, borderTop: '2px solid var(--color-gold-dim)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <button
        onClick={() => {
          const next = !muted
          setMuted(next)
          setMutedState(next)
          // Der eine Schalter regelt alles: stumm heißt auch keine Sprache
          if (next) stopSpeaking()
        }}
        aria-label={muted ? 'Ton einschalten' : 'Ton ausschalten'}
        style={{
          position: 'absolute',
          top: 'calc(5dvh + 10px)',
          right: '12px',
          pointerEvents: 'auto',
          width: '44px',
          height: '44px',
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(23, 19, 31, 0.85)',
          border: '2px solid var(--color-panel-border)',
          borderRadius: '8px',
          color: muted ? 'var(--color-text-dim)' : 'var(--color-gold)',
        }}
      >
        <SpeakerIcon on={!muted} size={20} />
      </button>
    </div>
  )
}
