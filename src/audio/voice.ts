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
import { isMuted } from './audio'

const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
/** Optionaler Override für die Erzählstimme (sonst voices.json → narrator) */
const ENV_VOICE = import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined

/** Semantischer Stimm-Key ("narrator", "old-woman" …) aus src/audio/voices.json */
export type VoiceKey = keyof typeof VOICES

function resolveVoiceId(key: string): string {
  if (key === 'narrator' && ENV_VOICE) return ENV_VOICE
  return (VOICES as Record<string, { id: string }>)[key]?.id ?? VOICES.narrator.id
}

/** Nur mit ElevenLabs-Key gibt es das Sprachfeature überhaupt */
export function voiceAvailable(): boolean {
  return Boolean(ELEVEN_KEY)
}

/**
 * Sprache hängt am globalen Sound-Schalter (Letterbox, oben rechts):
 * Sound aus = keine Sprachausgabe und keine TTS-API-Aufrufe.
 */
export function isVoiceEnabled(): boolean {
  return Boolean(ELEVEN_KEY) && !isMuted()
}

// ---------------------------------------------------------------------------
// TTS

let currentAudio: HTMLAudioElement | null = null
/** Läufer-Token: stopSpeaking() entwertet laufende Sequenzen */
let sequenceToken = 0
/**
 * Cache pro (Stimme, Text) — hält die *Promises*, damit ein Prefetch und ein
 * direkt folgendes speak() dieselbe API-Anfrage teilen statt doppelt zu zahlen.
 */
const ttsCache = new Map<string, Promise<string>>()

export function stopSpeaking(): void {
  sequenceToken++
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

/**
 * TTS-Anfragen laufen strikt nacheinander: Prefetch eines dialogreichen
 * Knotens würde sonst 4–5 Anfragen parallel feuern — Free/Starter-Pläne
 * erlauben nur 2 gleichzeitige Requests, der Rest scheitert mit 429 und
 * die Zeilen blieben stumm.
 */
let fetchQueue: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = fetchQueue.then(task, task)
  fetchQueue = run.catch(() => {})
  return run
}

function ensureTtsUrl(text: string, voiceId: string): Promise<string> {
  const cacheKey = `${voiceId}|${text}`
  const cached = ttsCache.get(cacheKey)
  if (cached) return cached
  const pending = enqueue(async () => {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: { 'xi-api-key': ELEVEN_KEY!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
      },
    )
    if (!res.ok) {
      console.warn(`TTS fehlgeschlagen: HTTP ${res.status} für Stimme ${voiceId} — voices.json prüfen (npm run check-voices)`)
      throw new Error(`ElevenLabs TTS: HTTP ${res.status}`)
    }
    return URL.createObjectURL(await res.blob())
  })
  // Fehlgeschlagene Anfragen nicht cachen, sonst bleibt der Knoten für immer stumm
  pending.catch(() => ttsCache.delete(cacheKey))
  ttsCache.set(cacheKey, pending)
  return pending
}

/**
 * URL für eine Zeile beschaffen — scheitert die Wunschstimme (z.B. ID im
 * Account nicht verfügbar), spricht ersatzweise der Erzähler statt Stille.
 */
async function ttsUrlWithFallback(text: string, voiceId: string): Promise<string | null> {
  try {
    return await ensureTtsUrl(text, voiceId)
  } catch {
    const narratorId = resolveVoiceId('narrator')
    if (voiceId !== narratorId) {
      try {
        return await ensureTtsUrl(text, narratorId)
      } catch {
        return null
      }
    }
    return null
  }
}

/**
 * Generierung schon anstoßen, während die Figur noch zur Szene läuft —
 * das speak() beim Einblenden der Textbox trifft dann den Cache und startet
 * (nahezu) sofort mit dem Text zusammen.
 */
export function prefetchSpeech(text: string, voice: string = 'narrator'): void {
  if (!isVoiceEnabled()) return
  ensureTtsUrl(text, resolveVoiceId(voice)).catch(() => {})
}

/** Spielt eine URL ab; resolved erst, wenn die Wiedergabe zu Ende ist. */
function playToEnd(url: string): Promise<void> {
  return new Promise(resolve => {
    const audio = new Audio(url)
    currentAudio = audio
    audio.onended = () => resolve()
    audio.onpause = () => resolve() // stopSpeaking() bricht die Zeile ab
    audio.onerror = () => resolve()
    audio.play().catch(() => resolve())
  })
}

/**
 * Das Drehbuch vorlesen: jede Zeile mit ihrer Stimme, nacheinander.
 * onPartStart feuert, sobald eine Zeile wirklich zu spielen beginnt —
 * daran hängen Typewriter-Start und die Bühnen-Auftritte der Sprecher.
 * Scheitert eine Zeile (API), feuert der Cue trotzdem und es geht weiter.
 */
export async function speakSequence(
  parts: { text: string; voice?: string }[],
  onPartStart?: (index: number) => void,
): Promise<void> {
  stopSpeaking()
  if (!isVoiceEnabled()) return
  const token = sequenceToken
  for (let i = 0; i < parts.length; i++) {
    if (token !== sequenceToken) return
    // Wunschstimme, sonst Erzähler-Fallback; im schlimmsten Fall bleibt
    // nur diese eine Zeile stumm und der Text läuft weiter
    const url = await ttsUrlWithFallback(
      parts[i].text,
      resolveVoiceId(parts[i].voice ?? 'narrator'),
    )
    if (token !== sequenceToken) return
    onPartStart?.(i)
    if (url) await playToEnd(url)
  }
}

export async function speak(text: string, voice: string = 'narrator'): Promise<void> {
  await speakSequence([{ text, voice }])
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
