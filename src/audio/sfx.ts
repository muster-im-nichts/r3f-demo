import { getAudio } from './audio'

/** Kurze synthetische Effekte. Alle no-ops, solange kein AudioContext existiert. */

function tone(type: OscillatorType, frequency: number, duration: number, volume: number, when = 0) {
  const audio = getAudio()
  if (!audio) return
  const { ctx, master } = audio
  const t = ctx.currentTime + when
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + duration + 0.02)
}

let lastBlip = 0

/** Typewriter-Tick, gedrosselt auf ~15/s */
export function blip(): void {
  const now = performance.now()
  if (now - lastBlip < 66) return
  lastBlip = now
  tone('square', 820 + Math.random() * 160, 0.035, 0.02)
}

/** Auswahl-Klick: Zwei-Ton abwärts */
export function click(): void {
  tone('square', 660, 0.05, 0.05)
  tone('square', 440, 0.07, 0.05, 0.05)
}

/** Erfolgs-Arpeggio aufwärts */
export function success(): void {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => tone('square', f, 0.12, 0.06, i * 0.09))
}

/** Fehlschlag: kleines Motiv abwärts */
export function failure(): void {
  const notes = [392, 330, 262, 196]
  notes.forEach((f, i) => tone('triangle', f, 0.16, 0.08, i * 0.11))
}
