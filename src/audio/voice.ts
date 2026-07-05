/**
 * Sprachausgabe (TTS) und Spracheingabe (STT) für den Prototyp.
 *
 * Das gesamte Sprachfeature existiert nur mit gesetztem
 * VITE_ELEVENLABS_API_KEY (voiceAvailable) — ohne Key zeigt die UI keine
 * Sprach-Knöpfe und es gibt keinen Browser-Stimmen-Fallback. Achtung: Der
 * Key landet im Client-Bundle — für Demo/Kiosk vertretbar, in Produktion
 * gehört ein kleiner Proxy davor.
 *
 * STT läuft (hinterm Key-Gate) über die Web Speech API (de-DE) — latenzfrei
 * und ohne Upload. ElevenLabs Scribe kann später hinter dieselbe
 * Schnittstelle (listenOnce) gelegt werden, ohne dass die UI sich ändert.
 */

import VOICES from './voices.json'

const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
/** Optionaler Override für die Erzählstimme (sonst voices.json → narrator) */
const ENV_VOICE = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined

/** Semantischer Stimm-Key ("narrator", "old-woman" …) aus src/audio/voices.json */
export type VoiceKey = keyof typeof VOICES

function resolveVoiceId(key: string): string {
  if (key === 'narrator' && ENV_VOICE) return ENV_VOICE
  return (VOICES as Record<string, { id: string }>)[key]?.id ?? VOICES.narrator.id
}

const VOICE_KEY = 'ebw-voice'

/** Nur mit ElevenLabs-Key gibt es das Sprachfeature überhaupt */
export function voiceAvailable(): boolean {
  return Boolean(ELEVEN_KEY)
}

export function isVoiceEnabled(): boolean {
  return localStorage.getItem(VOICE_KEY) === '1'
}

export function setVoiceEnabled(value: boolean): void {
  localStorage.setItem(VOICE_KEY, value ? '1' : '0')
  if (!value) stopSpeaking()
}

// ---------------------------------------------------------------------------
// TTS

let currentAudio: HTMLAudioElement | null = null
/**
 * Cache pro (Stimme, Text) — hält die *Promises*, damit ein Prefetch und ein
 * direkt folgendes speak() dieselbe API-Anfrage teilen statt doppelt zu zahlen.
 */
const ttsCache = new Map<string, Promise<string>>()

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

function ensureTtsUrl(text: string, voiceId: string): Promise<string> {
  const cacheKey = `${voiceId}|${text}`
  const cached = ttsCache.get(cacheKey)
  if (cached) return cached
  const pending = (async () => {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: { 'xi-api-key': ELEVEN_KEY!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
      },
    )
    if (!res.ok) throw new Error(`ElevenLabs TTS: HTTP ${res.status}`)
    return URL.createObjectURL(await res.blob())
  })()
  // Fehlgeschlagene Anfragen nicht cachen, sonst bleibt der Knoten für immer stumm
  pending.catch(() => ttsCache.delete(cacheKey))
  ttsCache.set(cacheKey, pending)
  return pending
}

/**
 * Generierung schon anstoßen, während die Figur noch zur Szene läuft —
 * das speak() beim Einblenden der Textbox trifft dann den Cache und startet
 * (nahezu) sofort mit dem Text zusammen.
 */
export function prefetchSpeech(text: string, voice: string = 'narrator'): void {
  if (!ELEVEN_KEY || !isVoiceEnabled()) return
  ensureTtsUrl(text, resolveVoiceId(voice)).catch(() => {})
}

export async function speak(text: string, voice: string = 'narrator'): Promise<void> {
  stopSpeaking()
  if (!ELEVEN_KEY) return
  try {
    const url = await ensureTtsUrl(text, resolveVoiceId(voice))
    const audio = new Audio(url)
    currentAudio = audio
    await audio.play()
  } catch {
    // API nicht erreichbar/Quota: still bleiben statt Stilbruch per Browser-Stimme
  }
}

// ---------------------------------------------------------------------------
// STT (Web Speech API; nicht in allen Browsern vorhanden)

type Recognition = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
}

function recognitionCtor(): (new () => Recognition) | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => Recognition)
    | null
}

export function sttAvailable(): boolean {
  return recognitionCtor() !== null
}

/** Hört genau eine Äußerung ab; null bei Fehler, Stille oder fehlender API. */
export function listenOnce(): Promise<string | null> {
  const Ctor = recognitionCtor()
  if (!Ctor) return Promise.resolve(null)
  return new Promise(resolve => {
    const recognition = new Ctor()
    recognition.lang = 'de-DE'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    let settled = false
    const finish = (value: string | null) => {
      if (!settled) {
        settled = true
        resolve(value)
      }
    }
    recognition.onresult = e => finish(e.results[0]?.[0]?.transcript ?? null)
    recognition.onerror = () => finish(null)
    recognition.onend = () => finish(null)
    recognition.start()
  })
}

/**
 * Ordnet eine gesprochene Antwort einer Option zu: erst Ordnungswörter
 * ("eins", "die zweite" …), dann Wort-Überlappung mit den Labels.
 * Liefert -1, wenn nichts passt.
 */
export function matchChoice(transcript: string, labels: string[]): number {
  const heard = transcript.toLowerCase()
  const ordinals = [
    ['1', 'eins', 'erste', 'erstens'],
    ['2', 'zwei', 'zweite', 'zweitens'],
    ['3', 'drei', 'dritte', 'drittens'],
  ]
  for (let i = 0; i < labels.length; i++) {
    if (ordinals[i]?.some(word => heard.includes(word))) return i
  }
  const heardWords = new Set(heard.split(/[^a-zäöüß]+/).filter(w => w.length > 3))
  let best = -1
  let bestScore = 0
  labels.forEach((label, i) => {
    const score = label
      .toLowerCase()
      .split(/[^a-zäöüß]+/)
      .filter(w => w.length > 3 && heardWords.has(w)).length
    if (score > bestScore) {
      best = i
      bestScore = score
    }
  })
  return best
}
