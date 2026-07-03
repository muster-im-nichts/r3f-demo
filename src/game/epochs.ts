import type { EpochInfo } from './types'

export const EPOCHS: EpochInfo[] = [
  {
    id: '1760',
    label: '1760',
    tagline: 'Preußische Kleinstadt, Kerzen und Kopfsteinpflaster',
    mood: {
      sky: ['#0d0b26', '#2a1f4d'],
      building: '#3a2c22',
      light: '#ffb84d',
    },
  },
  {
    id: '1860',
    label: '1860',
    tagline: 'Bürgerzeit, Gaslaternen und Eisenbahnrauch',
    mood: {
      sky: ['#101226', '#33334d'],
      building: '#2e2e33',
      light: '#ffd98a',
    },
  },
  {
    id: '1960',
    label: '1960',
    tagline: 'Neonlicht, Umbruch und leise Aufbruchstimmung',
    mood: {
      sky: ['#0a1420', '#1f3a4d'],
      building: '#26333a',
      light: '#9adcff',
    },
  },
]

export function getEpoch(id: string): EpochInfo {
  const e = EPOCHS.find(e => e.id === id)
  if (!e) throw new Error(`Unbekannte Epoche "${id}"`)
  return e
}
