import { useEffect, useRef, useState } from 'react'
import type { StoryOption } from '../game/types'
import { useTypewriter } from './useTypewriter'
import { click, blip } from '../audio/sfx'
import { MOVE_KEYS } from '../scene/moveKeys'
import { isNarrowScreen } from './responsive'
import {
  voiceAvailable,
  isVoiceEnabled,
  setVoiceEnabled,
  speak,
  stopSpeaking,
  listenOnce,
  sttAvailable,
  matchChoice,
} from '../audio/voice'
import { SpeakerIcon, MicIcon } from './icons'

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
  instant = false,
}: {
  text: string
  options: StoryOption[]
  onChoose: (target: string) => void
  /** Text sofort komplett zeigen (Knoten wurde schon einmal gelesen) */
  instant?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [voiceOn, setVoiceOn] = useState(isVoiceEnabled)
  // Typewriter erst starten, wenn die Stimme wirklich spielt — sonst liest
  // man schon und die Stimme setzt verspätet ein
  const [voiceHold, setVoiceHold] = useState(
    () => voiceAvailable() && isVoiceEnabled() && !instant,
  )
  const [listening, setListening] = useState(false)
  const [heard, setHeard] = useState<string | null>(null)
  const { shown, done, skip } = useTypewriter(text, instant, voiceHold)
  const scrollRef = useRef<HTMLDivElement>(null)
  const narrow = isNarrowScreen()

  // Vorlesen: die Box wird pro Story-Knoten neu gemountet (key=node.id),
  // also einmal beim Erscheinen sprechen; beim Abbau verstummen. Bereits
  // gelesene Knoten (instant) werden nicht erneut vorgelesen. speak()
  // resolved beim Wiedergabestart und löst dann den Typewriter aus; ein
  // Timeout verhindert, dass eine lahme API das Lesen blockiert.
  useEffect(() => {
    if (!voiceOn || instant) {
      setVoiceHold(false)
      return
    }
    let active = true
    const release = () => active && setVoiceHold(false)
    const fallback = setTimeout(release, 3000)
    speak(text).finally(release)
    return () => {
      active = false
      clearTimeout(fallback)
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn])

  const choose = (target: string) => {
    stopSpeaking()
    click()
    onChoose(target)
  }

  const listenForChoice = async () => {
    if (listening) return
    stopSpeaking() // die eigene Vorlesestimme nicht mit aufnehmen
    setListening(true)
    setHeard(null)
    const transcript = await listenOnce()
    setListening(false)
    if (!transcript) return
    const index = matchChoice(transcript, options.map(o => o.label))
    if (index >= 0 && options[index]) {
      choose(options[index].target)
    } else {
      blip()
      setHeard(transcript)
    }
  }

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
        stopSpeaking()
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
    // Volle Bildschirmbreite (mit Rand): eine flache Box lässt mehr Bühne frei
    width: 'calc(100% - 24px)',
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
      {/* Vorlesen an/aus + Einklappen, um die Szene freizugeben */}
      <div style={{ position: 'sticky', top: 0, float: 'right', display: 'flex', gap: '2px' }}>
        {voiceAvailable() && (
          <button
            aria-label={voiceOn ? 'Vorlesen ausschalten' : 'Vorlesen einschalten'}
            onClick={e => {
              e.stopPropagation()
              const next = !voiceOn
              setVoiceEnabled(next)
              setVoiceOn(next)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: voiceOn ? 'var(--color-gold)' : 'var(--color-text-dim)',
              padding: '2px 2px 4px 10px',
            }}
          >
            <SpeakerIcon on={voiceOn} size={15} />
          </button>
        )}
        <button
          aria-label="Textbox einklappen"
          onClick={e => {
            e.stopPropagation()
            setCollapsed(true)
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-dim)',
            fontSize: '14px',
            padding: '0 2px 4px 10px',
          }}
        >
          ▼
        </button>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-text)',
          fontSize: narrow ? '16px' : 'clamp(17px, 4.4vw, 28px)',
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
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-pixel)',
            fontSize: narrow ? '9px' : '11px',
            color: 'var(--color-gold)',
            margin: '2px 0 8px',
          }}
        >
          <span>Was machst du?</span>
          {voiceAvailable() && sttAvailable() && (
            <button
              aria-label="Antwort sprechen"
              onClick={e => {
                e.stopPropagation()
                listenForChoice()
              }}
              style={{
                background: 'transparent',
                border: `2px solid ${listening ? 'var(--color-gold)' : 'transparent'}`,
                borderRadius: '6px',
                color: 'var(--color-gold)',
                padding: '2px 4px',
                animation: listening ? 'pulse 1s infinite' : undefined,
              }}
            >
              <MicIcon size={14} />
            </button>
          )}
          {listening && (
            <span style={{ color: 'var(--color-text-dim)' }}>Ich höre …</span>
          )}
          {heard && !listening && (
            <span style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-text)', fontSize: '14px' }}>
              „{heard}“ — sag z.B. „die Erste“
            </span>
          )}
        </div>
        {/* Schaltflächen, die sich bei Platz nebeneinander aufreihen */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: narrow ? '6px' : '10px' }}>
          {options.map((option, i) => (
            <button
              key={option.target + option.label}
              onClick={() => {
                if (!done) return
                choose(option.target)
              }}
              style={{
                flex: '1 1 240px',
                minHeight: '44px',
                textAlign: 'center',
                background: 'var(--color-panel)',
                border: '2px solid var(--color-panel-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-text)',
                fontSize: narrow ? '15px' : 'clamp(16px, 4vw, 24px)',
                lineHeight: 1.15,
                padding: narrow ? '8px 10px' : '8px 14px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-gold)'
                e.currentTarget.style.background = 'rgba(217, 164, 65, 0.14)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-panel-border)'
                e.currentTarget.style.background = 'var(--color-panel)'
              }}
            >
              <span style={{ color: 'var(--color-gold)', marginRight: '10px' }}>{i + 1}.</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}
