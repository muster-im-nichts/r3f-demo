export type MoveDir = 'left' | 'right' | 'back' | 'front'

/** Tasten, die den Avatar bewegen — die AdventureBox ignoriert genau diese. */
export const MOVE_KEYS: Record<string, MoveDir> = {
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
  arrowup: 'back',
  w: 'back',
  arrowdown: 'front',
  s: 'front',
}

/**
 * Gemeinsamer Eingabe-Zustand: Tastatur (Avatar) und On-Screen-Tasten
 * (TouchControls) schreiben hinein, der Avatar liest ihn pro Frame.
 */
export const moveInput = new Set<MoveDir>()
