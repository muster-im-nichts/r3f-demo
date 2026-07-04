import type { ReactNode } from 'react'
import {
  Barrel,
  Bollard,
  Crate,
  Desk,
  Gear,
  GrandfatherClock,
  Lantern,
  MarketStall,
  Sacks,
  Stool,
  Workbench,
} from './propMeshes'
import { NpcFigure } from './NpcFigure'
import { NPCS } from '../game/npcs'

export type PropDef = {
  node: ReactNode
  position: [number, number, number]
  rotationY?: number
  scale?: number
  /** Kollisionsradius in x/z; fehlt er, kann man durchlaufen */
  r?: number
}

export const PROP_SETS: Record<string, PropDef[]> = {
  marktplatz: [
    { node: <MarketStall />, position: [2.0, 0, -1.3], rotationY: -0.25, r: 0.95 },
    { node: <Barrel />, position: [0.75, 0, 0.35], r: 0.38 },
    // Kiste hinten lassen: vorn an der Rampe muss eine Lauf-Gasse frei bleiben
    { node: <Crate />, position: [2.9, 0, -0.55], rotationY: 0.4, r: 0.42 },
    { node: <Lantern />, position: [-2.8, 0, -1.0], r: 0.22 },
    { node: <NpcFigure npc={NPCS.hanne} />, position: [1.0, 0, -0.85], r: 0.3 },
  ],
  werkstatt: [
    { node: <Workbench />, position: [1.5, 0, -0.6], rotationY: 0.15, r: 0.78 },
    { node: <GrandfatherClock />, position: [2.7, 0, -1.4], rotationY: -0.3, r: 0.42 },
    { node: <Stool />, position: [0.65, 0, 0.35], r: 0.3 },
    { node: <NpcFigure npc={NPCS.karl} />, position: [0.35, 0, -0.95], r: 0.3 },
  ],
  wachstube: [
    { node: <Desk />, position: [1.7, 0, -0.8], rotationY: -0.2, r: 0.62 },
    { node: <Crate />, position: [2.8, 0, -0.1], rotationY: 0.7, r: 0.42 },
    { node: <Lantern />, position: [-2.8, 0, -1.2], r: 0.22 },
    { node: <NpcFigure npc={NPCS.wache} />, position: [2.2, 0, -1.15], r: 0.3 },
  ],
  gasse: [
    { node: <Barrel />, position: [1.15, 0, -0.35], r: 0.38 },
    { node: <Barrel />, position: [1.75, 0, -0.85], scale: 0.85, r: 0.38 },
    { node: <Crate />, position: [2.5, 0, 0.1], rotationY: 0.3, r: 0.42 },
    { node: <Lantern />, position: [-2.7, 0, -1.3], r: 0.22 },
    { node: <NpcFigure npc={NPCS.kraehe} />, position: [-1.7, 0, -1.0], r: 0.3 },
  ],
  finale: [
    { node: <Crate />, position: [1.35, 0, -0.5], rotationY: 0.2, r: 0.42 },
    { node: <Crate />, position: [1.95, 0, -0.25], rotationY: -0.35, r: 0.42 },
    { node: <Crate />, position: [1.65, 0.52, -0.4], rotationY: 0.55, scale: 0.9 },
    { node: <Barrel />, position: [2.85, 0, -1.0], r: 0.38 },
    { node: <Lantern />, position: [-2.8, 0, -1.1], r: 0.22 },
    { node: <NpcFigure npc={NPCS.kraehe} />, position: [0.9, 0, -1.05], r: 0.3 },
  ],
  kanal: [
    { node: <Bollard />, position: [0.9, 0, 0.5], r: 0.2 },
    { node: <Bollard />, position: [2.1, 0, 0.15], r: 0.2 },
    { node: <Crate />, position: [2.9, 0, -0.7], rotationY: 0.5, r: 0.42 },
    { node: <Lantern />, position: [-2.8, 0, -0.9], r: 0.22 },
    { node: <NpcFigure npc={NPCS.junge} />, position: [-1.5, 0, -0.75], r: 0.28 },
  ],
  muehle: [
    { node: <Gear />, position: [2.7, 0, -1.3], r: 0.6 },
    { node: <Sacks />, position: [1.25, 0, -0.25], r: 0.52 },
    { node: <Barrel />, position: [2.0, 0, 0.35], scale: 0.9, r: 0.38 },
    { node: <NpcFigure npc={NPCS.mueller} />, position: [0.5, 0, -0.9], r: 0.3 },
  ],
}

export type Collider = { x: number; z: number; r: number }

/**
 * Die Prop-Positionen sind für die breite Desktop-Bühne gesetzt. Auf schmalen
 * Screens rücken sie horizontal Richtung Mitte, damit NPCs & Co. nicht am
 * oder hinterm Bildrand stehen. Muss überall gleich verwendet werden
 * (Darstellung + Collider), sonst stimmen die Kollisionen nicht.
 */
export function stageSqueeze(viewportWidth: number): number {
  return Math.min(1, Math.max(0.55, viewportWidth / 8))
}

/** x/z-Kreis-Collider der Szene (für die Avatar-Bewegung). */
export function getColliders(scene: string, squeeze = 1): Collider[] {
  return (PROP_SETS[scene] ?? [])
    .filter(def => def.r !== undefined)
    .map(def => ({
      x: def.position[0] * squeeze,
      z: def.position[2],
      r: def.r! * (def.scale ?? 1),
    }))
}

