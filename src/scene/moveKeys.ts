/** Tasten, die den Avatar bewegen — die AdventureBox ignoriert genau diese. */
export const MOVE_KEYS: Record<string, 'left' | 'right' | 'back' | 'front'> = {
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
  arrowup: 'back',
  w: 'back',
  arrowdown: 'front',
  s: 'front',
}
