import { getAudio } from './audio'

/**
 * Chiptune-Loop nach dem Lookahead-Muster ("A Tale of Two Clocks"):
 * ein 25ms-Tick plant alle Noten, die in den nächsten ~120ms fällig sind,
 * sample-genau auf der AudioContext-Uhr. Drei Stimmen: Triangle-Bass,
 * Square-Lead, Noise-Hat. Vier Takte Am | F | C | G in Achteln.
 */
const BPM = 112
const STEP = 60 / BPM / 2
const LOOKAHEAD_MS = 25
const HORIZON = 0.12

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

// 32 Steps = 4 Takte à 8 Achtel. null = Pause.
// Bass: Grundton-Quint-Pendel je Akkord (A2/E3, F2/C3, C3/G3, G2/D3)
const BASS: (number | null)[] = [
  45, null, 52, null, 45, null, 52, 45,
  41, null, 48, null, 41, null, 48, 41,
  48, null, 55, null, 48, null, 55, 48,
  43, null, 50, null, 43, null, 50, 43,
]
// Lead: kurze melancholische Phrase in a-Moll
const LEAD: (number | null)[] = [
  69, null, 72, null, 76, null, 74, 72,
  null, 72, 71, null, 69, null, null, null,
  67, null, 72, null, 76, null, 79, 76,
  74, null, 71, null, 69, null, null, null,
]

let timer: ReturnType<typeof setInterval> | null = null
let nextTime = 0
let step = 0
let noiseBuffer: AudioBuffer | null = null

function getNoise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

function tone(
  ctx: AudioContext,
  out: AudioNode,
  type: OscillatorType,
  frequency: number,
  time: number,
  duration: number,
  volume: number,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration)
  osc.connect(gain).connect(out)
  osc.start(time)
  osc.stop(time + duration + 0.02)
}

function scheduleStep(ctx: AudioContext, out: AudioNode, index: number, time: number) {
  const bass = BASS[index]
  if (bass !== null) tone(ctx, out, 'triangle', freq(bass), time, STEP * 0.9, 0.14)

  const lead = LEAD[index]
  if (lead !== null) tone(ctx, out, 'square', freq(lead), time, STEP * 0.85, 0.045)

  if (index % 2 === 1) {
    const src = ctx.createBufferSource()
    const gain = ctx.createGain()
    src.buffer = getNoise(ctx)
    gain.gain.setValueAtTime(0.025, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03)
    src.connect(gain).connect(out)
    src.start(time)
    src.stop(time + 0.05)
  }
}

export function startMusic(): void {
  const audio = getAudio()
  if (!audio || timer !== null) return
  const { ctx, master } = audio
  nextTime = ctx.currentTime + 0.05
  step = 0
  timer = setInterval(() => {
    while (nextTime < ctx.currentTime + HORIZON) {
      scheduleStep(ctx, master, step % BASS.length, nextTime)
      nextTime += STEP
      step++
    }
  }, LOOKAHEAD_MS)
}

export function stopMusic(): void {
  if (timer !== null) clearInterval(timer)
  timer = null
}

// Im Dev: HMR darf keine parallelen Loops stapeln
if (import.meta.hot) {
  import.meta.hot.dispose(() => stopMusic())
}
