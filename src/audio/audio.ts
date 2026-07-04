/**
 * WebAudio-Singleton außerhalb von React (StrictMode-immun). Der AudioContext
 * wird erst in einer User-Geste erzeugt (Autoplay-Policy) — ensureAudio()
 * gehört deshalb synchron in den Klick-Handler des Start-Buttons.
 *
 * iOS/WebKit-Besonderheiten (Safari und Chrome auf dem iPhone sind beide
 * WebKit): ohne "playback"-Audio-Session schaltet der Klingelschalter auf
 * lautlos auch WebAudio stumm; außerdem braucht es den klassischen
 * Silent-Buffer-Unlock und ein Auto-Resume nach Unterbrechungen.
 */
const MUTE_KEY = 'ebw-muted'

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let muted = localStorage.getItem(MUTE_KEY) === '1'

function resumeIfNeeded(): void {
  if (ctx && !muted && ctx.state !== 'running') void ctx.resume()
}

export function ensureAudio(): AudioContext {
  if (!ctx) {
    // iOS: Audio-Session auf "playback", damit der Lautlos-Schalter
    // WebAudio nicht stummschaltet (Safari 16.4+ / Chrome iOS)
    const nav = navigator as Navigator & { audioSession?: { type: string } }
    if (nav.audioSession) {
      try {
        nav.audioSession.type = 'playback'
      } catch {
        // ältere WebKit-Versionen: Property vorhanden, aber read-only
      }
    }

    const Ctor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!
    ctx = new Ctor()
    masterGain = ctx.createGain()
    masterGain.gain.value = muted ? 0 : 1
    masterGain.connect(ctx.destination)

    // Klassischer iOS-Unlock: einen stummen Buffer in der User-Geste abspielen
    const silent = ctx.createBuffer(1, 1, 22050)
    const source = ctx.createBufferSource()
    source.buffer = silent
    source.connect(ctx.destination)
    source.start(0)

    // Nach Unterbrechungen (Anruf, Tab-Wechsel, Sperren) wieder aufwachen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') resumeIfNeeded()
    })
    window.addEventListener('pointerdown', resumeIfNeeded)
    window.addEventListener('keydown', resumeIfNeeded)
  }
  resumeIfNeeded()
  return ctx
}

export function getAudio(): { ctx: AudioContext; master: GainNode } | null {
  return ctx && masterGain ? { ctx, master: masterGain } : null
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  if (masterGain) masterGain.gain.value = value ? 0 : 1
  if (ctx) {
    if (value) void ctx.suspend()
    else void ctx.resume()
  }
}
