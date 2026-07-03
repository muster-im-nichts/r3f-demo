/**
 * WebAudio-Singleton außerhalb von React (StrictMode-immun). Der AudioContext
 * wird erst in einer User-Geste erzeugt (Autoplay-Policy) — ensureAudio()
 * gehört deshalb synchron in den Klick-Handler des Start-Buttons.
 */
const MUTE_KEY = 'ebw-muted'

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let muted = localStorage.getItem(MUTE_KEY) === '1'

export function ensureAudio(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
    masterGain = ctx.createGain()
    masterGain.gain.value = muted ? 0 : 1
    masterGain.connect(ctx.destination)
  }
  if (!muted && ctx.state === 'suspended') void ctx.resume()
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
