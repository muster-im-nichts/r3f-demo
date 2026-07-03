import type { Campaign, GenreId } from '../types'
import { validateCampaign } from '../engine'
import { taschenuhr } from './taschenuhr'
import { hochwasser } from './heldengeschichte'

export const CAMPAIGNS: Record<GenreId, Campaign> = {
  krimi: taschenuhr,
  helden: hochwasser,
}

if (import.meta.env.DEV) {
  for (const campaign of Object.values(CAMPAIGNS)) validateCampaign(campaign)
}

export const GENRES: { id: GenreId; label: string; description: string }[] = [
  { id: 'krimi', label: 'Krimi', description: 'Etwas ist verschwunden. Finde es.' },
  { id: 'helden', label: 'Heldengeschichte', description: 'Ein großes Problem. Sei schlau.' },
]
