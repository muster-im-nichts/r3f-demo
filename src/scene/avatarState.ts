/**
 * Position der Hauptfigur, pro Frame vom Avatar geschrieben. Kamera (Follow)
 * und NPCs (Blickrichtung) lesen sie, ohne React-State zu bemühen.
 */
export const avatarPos = { x: -1.1, z: 0.2 }

/**
 * Signal an die Kamera: Die Figur wurde gerade auf die Gegenseite teleportiert
 * (Szenenwechsel zu Fuß) — bitte hart auf die Eintrittsseite schneiden statt
 * gegen die Laufrichtung zu schwenken.
 */
export const cameraCut = { pending: false }
