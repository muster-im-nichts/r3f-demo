import { useState } from 'react'
import type { Ending, GameSetup } from '../game/types'
import { click } from '../audio/sfx'

const FEEDBACK_KEY = 'ebw-feedback'

function saveFeedback(setup: GameSetup, campaignId: string, ending: Ending, rating: number): void {
  try {
    const list = JSON.parse(localStorage.getItem(FEEDBACK_KEY) ?? '[]') as unknown[]
    list.push({
      ts: Date.now(),
      campaignId,
      epoch: setup.epoch,
      character: setup.character.id,
      ending,
      rating,
    })
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list))
  } catch {
    // localStorage voll oder blockiert — Feedback ist nice-to-have
  }
}

/**
 * Abspann über der weiterlaufenden Bühne: Ausgang, Sterne-Feedback (lokal
 * gespeichert) und Neustart.
 */
export function EndScreen({
  ending,
  epilog,
  setup,
  campaignId,
  onRestart,
}: {
  ending: Ending
  epilog: string
  setup: GameSetup
  campaignId: string
  onRestart: () => void
}) {
  const [rating, setRating] = useState<number | null>(null)
  const won = ending === 'success'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5, 3, 10, 0.82)',
        zIndex: 4,
      }}
    >
      <div
        style={{
          width: 'min(560px, calc(100% - 32px))',
          maxHeight: 'calc(100dvh - 48px)',
          overflowY: 'auto',
          background: 'var(--color-panel)',
          border: '3px solid var(--color-panel-border)',
          borderRadius: '12px',
          boxShadow: '0 0 0 2px #000, 0 16px 40px rgba(0,0,0,0.7)',
          padding: '26px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(14px, 3.5vw, 20px)',
            lineHeight: 1.5,
            color: won ? 'var(--color-accent)' : 'var(--color-danger)',
            textShadow: '3px 3px 0 #000',
            marginBottom: '16px',
          }}
        >
          {won ? '★ GESCHAFFT! ★' : 'GESCHEITERT …'}
        </div>
        <p style={{ fontSize: '21px', lineHeight: 1.3, color: 'var(--color-text)', marginBottom: '22px', textAlign: 'left' }}>
          {epilog}
        </p>

        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--color-text-dim)', marginBottom: '10px' }}>
          {rating === null ? 'WIE WAR DEINE GESCHICHTE?' : 'DANKE FÜR DEIN FEEDBACK!'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              disabled={rating !== null}
              onClick={() => {
                click()
                setRating(n)
                saveFeedback(setup, campaignId, ending, n)
              }}
              style={{
                width: '46px',
                height: '46px',
                fontSize: '24px',
                background: 'transparent',
                border: 'none',
                cursor: rating === null ? 'pointer' : 'default',
                color: rating !== null && n <= rating ? 'var(--color-gold)' : 'var(--color-text-dim)',
                opacity: rating === null || n <= rating ? 1 : 0.35,
              }}
            >
              {rating !== null && n <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>

        <button
          onClick={onRestart}
          style={{
            minHeight: '50px',
            padding: '0 28px',
            background: 'var(--color-gold)',
            color: '#1c1408',
            border: '3px solid #000',
            borderRadius: '8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '13px',
            boxShadow: '0 4px 0 #000',
          }}
        >
          ↻ Nochmal spielen
        </button>
      </div>
    </div>
  )
}
