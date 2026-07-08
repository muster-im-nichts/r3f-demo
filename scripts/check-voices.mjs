/**
 * Prüft alle Stimmen aus src/audio/voices.json gegen den ElevenLabs-Account:
 *   npm run check-voices
 * Liest den Key aus .env (VITE_ELEVENLABS_API_KEY).
 */
import { readFileSync } from 'node:fs'

let key = process.env.VITE_ELEVENLABS_API_KEY
if (!key) {
  try {
    const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
    key = env.match(/^VITE_ELEVENLABS_API_KEY=(.+)$/m)?.[1]?.trim()
  } catch {
    // keine .env — unten gemeldet
  }
}
if (!key) {
  console.error('Kein Key: VITE_ELEVENLABS_API_KEY in .env (oder als Umgebungsvariable) setzen.')
  process.exit(1)
}

const voices = JSON.parse(
  readFileSync(new URL('../src/audio/voices.json', import.meta.url), 'utf8'),
)

let failures = 0
for (const [voiceKey, entry] of Object.entries(voices)) {
  const res = await fetch(`https://api.elevenlabs.io/v1/voices/${entry.id}`, {
    headers: { 'xi-api-key': key },
  })
  if (res.ok) {
    console.log(`✔ ${voiceKey.padEnd(16)} ${entry.name.padEnd(10)} verfügbar`)
  } else {
    failures++
    console.log(
      `✘ ${voiceKey.padEnd(16)} ${entry.name.padEnd(10)} NICHT verfügbar (HTTP ${res.status}) — ID in voices.json tauschen`,
    )
  }
}

if (failures) {
  console.log(
    `\n${failures} Stimme(n) fehlen. Verfügbare Stimmen des Accounts zeigt:\n  curl -s -H "xi-api-key: $KEY" https://api.elevenlabs.io/v1/voices | jq '.voices[] | {name, voice_id}'`,
  )
  process.exit(1)
}
console.log('\nAlle Stimmen verfügbar.')
