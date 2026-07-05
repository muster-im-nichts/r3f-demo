import type { Campaign, EpochId, GenreId } from '../types'
import { validateCampaign } from '../engine'
import { taschenuhr } from './taschenuhr'
import { hochwasser } from './heldengeschichte'
import { nachtzug } from './nachtzug'
import { funkenflug } from './funkenflug'
import { blaupausen } from './blaupausen'
import { eisfahrt } from './eisfahrt'

/** Jede Kombination aus Epoche und Genre erzählt ihre eigene Geschichte. */
export const CAMPAIGNS: Record<EpochId, Record<GenreId, Campaign>> = {
  '1760': { krimi: taschenuhr, helden: hochwasser },
  '1860': { krimi: nachtzug, helden: funkenflug },
  '1960': { krimi: blaupausen, helden: eisfahrt },
}

export function getCampaign(epoch: EpochId, genre: GenreId): Campaign {
  return CAMPAIGNS[epoch][genre]
}

if (import.meta.env.DEV) {
  for (const byGenre of Object.values(CAMPAIGNS)) {
    for (const campaign of Object.values(byGenre)) validateCampaign(campaign)
  }
}

export const GENRES: { id: GenreId; label: string; description: string }[] = [
  { id: 'krimi', label: 'Krimi', description: 'Etwas ist verschwunden. Finde es.' },
  { id: 'helden', label: 'Heldengeschichte', description: 'Ein großes Problem. Sei schlau.' },
]
