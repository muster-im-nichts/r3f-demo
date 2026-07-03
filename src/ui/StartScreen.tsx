import { useState, type CSSProperties, type ReactNode } from 'react'
import { CHARACTERS } from '../game/characters'
import { EPOCHS } from '../game/epochs'
import { GENRES } from '../game/campaigns'
import { spritePreviewUrl } from '../scene/sprites'
import type { CharacterId, EpochId, GameSetup, GenreId } from '../game/types'
import { getCharacter } from '../game/characters'

const optionStyle = (active: boolean): CSSProperties => ({
  flex: '1 1 0',
  minWidth: 0,
  minHeight: '44px',
  padding: '10px 8px',
  background: active ? 'rgba(217, 164, 65, 0.14)' : 'var(--color-panel)',
  border: `2px solid ${active ? 'var(--color-gold)' : 'var(--color-panel-border)'}`,
  borderRadius: '8px',
  color: active ? 'var(--color-gold)' : 'var(--color-text)',
  fontFamily: 'var(--font-text)',
  fontSize: '20px',
  lineHeight: 1.1,
})

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '11px',
          color: 'var(--color-text-dim)',
          marginBottom: '8px',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>{children}</div>
    </div>
  )
}

export function StartScreen({ onStart }: { onStart: (setup: GameSetup) => void }) {
  const [epoch, setEpoch] = useState<EpochId>('1760')
  const [characterId, setCharacterId] = useState<CharacterId>('greta')
  const [genre, setGenre] = useState<GenreId>('krimi')

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(ellipse at 50% 30%, #1d1530 0%, var(--color-bg) 70%)',
        zIndex: 5,
      }}
    >
      <div style={{ width: 'min(560px, calc(100% - 32px))', padding: '24px 0' }}>
        <h1
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'clamp(16px, 4vw, 24px)',
            color: 'var(--color-gold)',
            textShadow: '3px 3px 0 #000',
            marginBottom: '6px',
            lineHeight: 1.4,
          }}
        >
          Eberswalder
          <br />
          Zeitreise
        </h1>
        <p style={{ fontSize: '21px', color: 'var(--color-text-dim)', marginBottom: '24px' }}>
          Wähle Zeit, Person und Geschichte — und entscheide selbst, wie sie ausgeht.
        </p>

        <Section title="ZEIT">
          {EPOCHS.map(e => (
            <button key={e.id} style={optionStyle(epoch === e.id)} onClick={() => setEpoch(e.id)}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '13px', marginBottom: '4px' }}>
                {e.label}
              </div>
              <div style={{ fontSize: '15px', opacity: 0.75 }}>{e.tagline}</div>
            </button>
          ))}
        </Section>

        <Section title="PERSON">
          {CHARACTERS.map(c => (
            <button
              key={c.id}
              style={optionStyle(characterId === c.id)}
              onClick={() => setCharacterId(c.id)}
            >
              <img
                src={spritePreviewUrl(c)}
                alt={c.name}
                style={{ height: '64px', imageRendering: 'pixelated', display: 'block', margin: '0 auto 6px' }}
              />
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', marginBottom: '4px' }}>
                {c.name}
              </div>
              <div style={{ fontSize: '15px', opacity: 0.75 }}>{c.description}</div>
            </button>
          ))}
        </Section>

        <Section title="GESCHICHTE">
          {GENRES.map(g => (
            <button key={g.id} style={optionStyle(genre === g.id)} onClick={() => setGenre(g.id)}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '12px', marginBottom: '4px' }}>
                {g.label}
              </div>
              <div style={{ fontSize: '15px', opacity: 0.75 }}>{g.description}</div>
            </button>
          ))}
        </Section>

        <button
          onClick={() => onStart({ epoch, character: getCharacter(characterId), genre })}
          style={{
            width: '100%',
            minHeight: '54px',
            marginTop: '6px',
            background: 'var(--color-gold)',
            color: '#1c1408',
            border: '3px solid #000',
            borderRadius: '8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '14px',
            boxShadow: '0 4px 0 #000',
          }}
        >
          ▶ Vorhang auf!
        </button>
      </div>
    </div>
  )
}
