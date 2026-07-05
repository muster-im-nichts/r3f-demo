/**
 * Sprachausgabe (TTS) und Spracheingabe (STT) für den Prototyp.
 *
 * TTS: Mit gesetztem VITE_ELEVENLABS_API_KEY spricht ElevenLabs
 * (eleven_multilingual_v2, deutsche Aussprache), ohne Key die Web Speech API
 * des Browsers. Achtung: Der Key landet im Client-Bundle — für Demo/Kiosk
 * vertretbar, in Produktion gehört ein kleiner Proxy davor.
 *
 * STT: Web Speech API (de-DE) — latenzfrei und ohne Upload, im Chrome-Kiosk
 * zuverlässig. ElevenLabs Scribe kann später hinter dieselbe Schnittstelle
 * (listenOnce) gelegt werden, ohne dass die UI sich ändert.
 */

const ELEVEN_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
const ELEVEN_VOICE =
  (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) ?? '21m00Tcm4TlvDq8ikWAM'

const VOICE_KEY = 'ebw-voice'

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
let speakingViaBrowser = false
/** Wiederholtes Vorlesen desselben Textes trifft den Cache statt die API */
const ttsCache = new Map<string, string>()

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  if (speakingViaBrowser) {
    window.speechSynthesis?.cancel()
    speakingViaBrowser = false
  }
}

export async function speak(text: string): Promise<void> {
  stopSpeaking()
  if (ELEVEN_KEY) {
    try {
      await speakEleven(text)
      return
    } catch {
      // API nicht erreichbar/Quota: leise auf die Browser-Stimme ausweichen
    }
  }
  speakBrowser(text)
}

async function speakEleven(text: string): Promise<void> {
  let url = ttsCache.get(text)
  if (!url) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: { 'xi-api-key': ELEVEN_KEY!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
      },
    )
    if (!res.ok) throw new Error(`ElevenLabs TTS: HTTP ${res.status}`)
    url = URL.createObjectURL(await res.blob())
    ttsCache.set(text, url)
  }
  const audio = new Audio(url)
  currentAudio = audio
  await audio.play()
}

function speakBrowser(text: string): void {
  const synth = window.speechSynthesis
  if (!synth) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'de-DE'
  const voice = synth.getVoices().find(v => v.lang.startsWith('de'))
  if (voice) utterance.voice = voice
  speakingViaBrowser = true
  utterance.onend = () => {
    speakingViaBrowser = false
  }
  synth.speak(utterance)
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
