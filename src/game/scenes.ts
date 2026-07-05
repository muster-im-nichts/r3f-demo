/** Anzeigenamen der Szenen-Keys (für Wegweiser u.ä.) */
export const SCENE_LABELS: Record<string, string> = {
  marktplatz: 'Marktplatz',
  werkstatt: 'Werkstatt',
  wachstube: 'Wachstube',
  gasse: 'Fischergasse',
  finale: 'Lagerhaus',
  kanal: 'Kanal',
  muehle: 'Mühle',
  bahnhof: 'Bahnhof',
  fabrik: 'Kranwerk',
}

export function sceneLabel(key: string): string {
  return SCENE_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}
