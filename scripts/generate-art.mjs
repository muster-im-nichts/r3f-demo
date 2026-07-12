/**
 * KI-Art-Pipeline: generiert Szenen-Hintergründe und Charakter-Sprites
 * über fal.ai (Flux) und bereitet sie als feines Pixel-Art auf:
 *
 *   npm run generate-art                          # alles Fehlende/Veraltete
 *   npm run generate-art -- --dry-run             # nur Prompts/Ziele zeigen
 *   npm run generate-art -- --only greta --only 1760-marktplatz
 *   npm run generate-art -- --force --type scene  # Szenen neu generieren
 *   npm run generate-art -- --model schnell       # billige Iteration
 *   npm run generate-art -- --keep-raw            # Rohbilder archivieren
 *   npm run generate-art -- --audition 4          # Kandidaten-Casting
 *
 * --audition n generiert je Charakter n Seed-Varianten (Manifest-Seed
 * + k*1000) nach scripts/.art-cache/auditions/{key}/{seed}.png — ohne
 * die Assets oder Sidecars anzufassen. Manifest-flip/pixelate werden
 * dabei ignoriert; der Blick-Richter läuft aber auch hier, Kandidaten
 * erscheinen also bereits in End-Orientierung (Blick nach rechts).
 *
 * Blick-Richter (Standard an, --no-judge schaltet ab): ein günstiges
 * VLM über fal (any-llm, Mehrheit aus 3 Stimmen) prüft je Figur die
 * Blickrichtung des Kopfes; bei "left" wird automatisch gespiegelt
 * (Basis-Blickrichtung im Spiel ist rechts). Explizites flip im
 * Manifest gewinnt — dann wird nicht juriert. Urteil landet im Sidecar.
 *
 * Liest den Key aus .env / .env.local (FAL_KEY — bewusst ohne VITE_-Präfix,
 * der Key darf nie ins Client-Bundle). Quelle der Wahrheit für Prompts und
 * Seeds ist scripts/art-manifest.mjs; neben jedem PNG liegt ein Sidecar
 * ({name}.png.json) mit den Generierungsparametern. Weicht das Sidecar vom
 * Manifest ab (Prompt-/Seed-Änderung), wird das Asset neu generiert.
 *
 * Szenen:  Flux 1024x576  → Lanczos-Downscale 480x270 → 64-Farben-Palette
 * Sprites: Flux 640x960   → BiRefNet-Freistellung → Trim → 128x192 (2:3,
 *          Fußpunkt unten-mittig) → Alpha binarisiert (passend zu alphaTest 0.5)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { STYLE, EPOCH_CONTEXT, SCENES, CHARACTERS } from './art-manifest.mjs'

// --- Konfiguration ---------------------------------------------------------

const QUEUE_BASE = 'https://queue.fal.run'
const SYNC_BASE = 'https://fal.run'
const FLUX_MODELS = { dev: 'fal-ai/flux/dev', schnell: 'fal-ai/flux/schnell' }
const REMBG_MODEL = 'fal-ai/birefnet/v2'
// Blick-Richter: günstiges VLM über fal (any-llm), 3 Stimmen Mehrheitsentscheid
const JUDGE_ENDPOINT = 'fal-ai/any-llm/vision'
const JUDGE_MODEL = 'google/gemini-2.5-flash'
const JUDGE_VOTES = 3
const JUDGE_PROMPT =
  'This is a video game character sprite. In which horizontal direction does the character LOOK — ' +
  'where does their nose/gaze point? Ignore the body, judge only the head. ' +
  'Reply with exactly one word: "left", "right" or "front".'

const SCENE_GEN_SIZE = { width: 1024, height: 576 }
const SCENE_OUT_SIZE = { width: 480, height: 270 }
const SPRITE_GEN_SIZE = { width: 640, height: 960 }
const SPRITE_OUT_SIZE = { width: 128, height: 192 } // 2:3 — muss SPRITE_ASPECT entsprechen
const SPRITE_FIGURE = { width: 120, height: 186, floor: 2 } // Figur-Box + Bodenabstand

const SCENES_DIR = new URL('../src/assets/scenes/', import.meta.url)
const CHARS_DIR = new URL('../src/assets/characters/', import.meta.url)
const RAW_DIR = new URL('./.art-cache/', import.meta.url)

const CONCURRENCY = 3
const RETRIES = 3
const POLL_INTERVAL_MS = 1000
// Großzügig: nach einem Top-up arbeitet die fal-Queue erst Job-Rückstau ab
const POLL_TIMEOUT_MS = 300000

// --- CLI -------------------------------------------------------------------

const argv = process.argv.slice(2)
const flags = { only: [], force: false, dryRun: false, model: 'dev', type: null, keepRaw: false, audition: 0, judge: true }
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--only') flags.only.push(argv[++i])
  else if (a === '--force') flags.force = true
  else if (a === '--dry-run') flags.dryRun = true
  else if (a === '--model') flags.model = argv[++i]
  else if (a === '--type') flags.type = argv[++i]
  else if (a === '--keep-raw') flags.keepRaw = true
  else if (a === '--audition') flags.audition = Number(argv[++i])
  else if (a === '--no-judge') flags.judge = false
  else {
    console.error(`Unbekanntes Argument: ${a}`)
    process.exit(1)
  }
}
if (!FLUX_MODELS[flags.model]) {
  console.error(`Unbekanntes Modell "${flags.model}" — erlaubt: ${Object.keys(FLUX_MODELS).join(', ')}`)
  process.exit(1)
}

// --- API-Key (Muster: check-voices.mjs) --------------------------------------

let key = process.env.FAL_KEY
if (!key) {
  for (const file of ['../.env', '../.env.local']) {
    try {
      const env = readFileSync(new URL(file, import.meta.url), 'utf8')
      key ??= env.match(/^FAL_KEY=(.+)$/m)?.[1]?.trim()
    } catch {
      // Datei fehlt — unten gemeldet
    }
  }
}
if (!key && !flags.dryRun) {
  console.error('Kein Key: FAL_KEY in .env / .env.local (oder als Umgebungsvariable) setzen.')
  console.error('Key anlegen unter https://fal.ai/dashboard/keys')
  process.exit(1)
}

// --- Asset-Liste aus dem Manifest -------------------------------------------

/** Ein Job pro Asset: alles, was Generierung + Sidecar-Vergleich braucht. */
function buildJobs() {
  const jobs = []
  for (const s of SCENES) {
    jobs.push({
      key: s.key,
      type: 'scene',
      prompt: `${s.interior ? STYLE.sceneInterior : STYLE.scene}. ${EPOCH_CONTEXT[s.epoch]}. ${s.prompt}`,
      seed: s.seed,
      model: FLUX_MODELS[s.model ?? flags.model],
      steps: s.steps ?? (flags.model === 'schnell' ? 4 : 28),
      genSize: SCENE_GEN_SIZE,
      outSize: SCENE_OUT_SIZE,
      colors: s.colors ?? 64,
      kernel: s.kernel ?? 'lanczos3',
      target: new URL(`${s.key}.png`, SCENES_DIR),
    })
  }
  for (const c of CHARACTERS) {
    jobs.push({
      key: c.key,
      type: 'character',
      prompt: `${STYLE.character}. ${c.prompt}`,
      seed: c.seed,
      model: FLUX_MODELS[c.model ?? flags.model],
      steps: c.steps ?? (flags.model === 'schnell' ? 4 : 28),
      genSize: SPRITE_GEN_SIZE,
      outSize: SPRITE_OUT_SIZE,
      kernel: c.kernel ?? 'lanczos3',
      flip: c.flip ?? false,
      // Explizites flip im Manifest ist Handkuration — der Richter schweigt dann
      flipExplicit: c.flip !== undefined,
      pixelate: c.pixelate ?? 1,
      target: new URL(`${c.key}.png`, CHARS_DIR),
    })
  }
  return jobs
}

/** Parameter, deren Änderung eine Neugenerierung auslöst (Sidecar-Vergleich). */
function fingerprint(job) {
  return {
    key: job.key,
    type: job.type,
    model: job.model,
    prompt: job.prompt,
    seed: job.seed,
    steps: job.steps,
    genSize: job.genSize,
    outSize: job.outSize,
    colors: job.colors ?? null,
    kernel: job.kernel,
    flip: job.flip ?? false,
    pixelate: job.pixelate ?? 1,
  }
}

function isFresh(job) {
  if (!existsSync(job.target)) return false
  try {
    const sidecar = JSON.parse(readFileSync(new URL(`${job.target.href}.json`), 'utf8'))
    if (JSON.stringify(sidecar.params) !== JSON.stringify(fingerprint(job))) return false
    // Figur ohne (erfolgreiches) Richter-Urteil — z.B. weil das Guthaben
    // mittendrin ausging — gilt als veraltet, damit ein normaler Lauf sie
    // nachjuriert. Bewusst nicht bei explizitem Manifest-flip (kein Urteil
    // nötig) und nicht bei "unklar trotz Stimmen" (sonst Endlosschleife).
    if (job.type === 'character' && flags.judge && !job.flipExplicit) {
      const j = sidecar.judged
      if (!j || (j.facing === null && (j.votes?.length ?? 0) === 0)) return false
    }
    return true
  } catch {
    return false // Sidecar fehlt/kaputt → als veraltet behandeln
  }
}

// --- fal.ai Queue-REST -------------------------------------------------------

/**
 * Konto laut fal gesperrt (Guthaben leer). Achtung: fal meldet das auch
 * sporadisch als Falschmeldung kurz nach Top-up/Abrechnung — deshalb wird
 * eine Sperre wie ein transienter Fehler mit langem Backoff wiederholt
 * und erst als echt behandelt, wenn sie über alle Versuche bestehen bleibt.
 */
let accountLocked = false
const LOCK_BACKOFF_MS = 15000

/**
 * Drossel: fal meldet unter Burst-Last (3 Worker × Flux/BiRefNet/Richter)
 * sporadisch Kontosperren, die eher ein Rate-/Abrechnungslimit sind.
 * Kostende Aufrufe (POST) halten deshalb globalen Mindestabstand;
 * Status-Polls (GET) bleiben ungedrosselt.
 */
const REQUEST_GAP_MS = 3000
let nextRequestAt = 0
async function throttle() {
  const wait = nextRequestAt - Date.now()
  nextRequestAt = Math.max(nextRequestAt, Date.now()) + REQUEST_GAP_MS
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
}

async function falFetch(url, init) {
  let lastError
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    if (accountLocked) throw Object.assign(new Error('fal-Guthaben aufgebraucht'), { fatal: true })
    if (init?.method === 'POST') await throttle()
    try {
      const res = await fetch(url, {
        ...init,
        headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json', ...init?.headers },
      })
      if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status}`)
      if (!res.ok) {
        const body = await res.text()
        if (body.includes('Exhausted balance') || body.includes('User is locked')) {
          if (attempt === RETRIES) {
            accountLocked = true
            throw Object.assign(new Error('fal-Guthaben aufgebraucht (Sperre blieb über alle Versuche bestehen)'), { fatal: true })
          }
          console.warn(`  fal meldet Kontosperre — warte ${LOCK_BACKOFF_MS / 1000}s und versuche erneut (${attempt}/${RETRIES})`)
          await new Promise(r => setTimeout(r, LOCK_BACKOFF_MS))
          continue
        }
        throw Object.assign(new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`), { fatal: true })
      }
      return res.json()
    } catch (err) {
      lastError = err
      if (err.fatal || attempt === RETRIES) throw err
      await new Promise(r => setTimeout(r, attempt * 4000)) // Backoff 4s/8s
    }
  }
  throw lastError
}

/** Job in die fal-Queue stellen, Status pollen, Ergebnis-JSON zurückgeben. */
async function runFalJob(model, input) {
  const submitted = await falFetch(`${QUEUE_BASE}/${model}`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const statusUrl = submitted.status_url
  const responseUrl = submitted.response_url
  const deadline = Date.now() + POLL_TIMEOUT_MS
  for (;;) {
    if (accountLocked) throw new Error('fal-Guthaben aufgebraucht — Job bleibt in der Queue hängen')
    if (Date.now() > deadline) {
      throw new Error(
        `Timeout nach ${POLL_TIMEOUT_MS / 1000}s (${model}) — bei gesperrtem Konto (leeres Guthaben) bleiben Queue-Jobs ewig hängen`,
      )
    }
    const status = await falFetch(statusUrl, { method: 'GET' })
    if (status.status === 'COMPLETED') break
    if (status.status === 'FAILED' || status.status === 'CANCELLED') {
      throw new Error(`fal-Job ${status.status} (${model})`)
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
  }
  return falFetch(responseUrl, { method: 'GET' })
}

async function generateImage(job) {
  const input = {
    prompt: job.prompt,
    image_size: job.genSize,
    seed: job.seed,
    num_inference_steps: job.steps,
    num_images: 1,
    output_format: 'png',
    enable_safety_checker: true,
  }
  if (job.model === FLUX_MODELS.dev) input.guidance_scale = 3.5
  const result = await runFalJob(job.model, input)
  const url = result.images?.[0]?.url
  if (!url) throw new Error(`Keine Bild-URL in der fal-Antwort (${JSON.stringify(result).slice(0, 200)})`)
  return url
}

/** Freistellung: Flux-CDN-URL direkt durchreichen, PNG mit Alpha zurück. */
async function removeBackground(imageUrl) {
  const result = await runFalJob(REMBG_MODEL, { image_url: imageUrl, output_format: 'png' })
  const url = result.image?.url ?? result.images?.[0]?.url
  if (!url) throw new Error(`Keine Bild-URL in der BiRefNet-Antwort (${JSON.stringify(result).slice(0, 200)})`)
  return url
}

async function download(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download fehlgeschlagen: HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/**
 * Blickrichtung jurieren: 'left' | 'right' | 'front'. Mehrheit aus
 * JUDGE_VOTES Aufrufen; unklare Antworten zählen nicht. Liefert null,
 * wenn keine Mehrheit zustande kommt (dann wird nicht geflippt).
 */
async function judgeFacing(imageUrl) {
  const votes = []
  for (let i = 0; i < JUDGE_VOTES; i++) {
    try {
      const json = await falFetch(`${SYNC_BASE}/${JUDGE_ENDPOINT}`, {
        method: 'POST',
        body: JSON.stringify({ model: JUDGE_MODEL, prompt: JUDGE_PROMPT, image_url: imageUrl }),
      })
      const word = (json.output ?? '').toLowerCase().match(/left|right|front/)?.[0]
      if (word) votes.push(word)
    } catch (err) {
      console.warn(`  Richter-Aufruf fehlgeschlagen: ${err.message.slice(0, 120)}`)
    }
  }
  const counts = {}
  for (const v of votes) counts[v] = (counts[v] ?? 0) + 1
  const [winner, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? []
  return n > JUDGE_VOTES / 2 ? { facing: winner, votes } : { facing: null, votes }
}

// --- Post-Processing (sharp) -------------------------------------------------

/** Szene: Downscale + harte Palettenquantisierung → hi-bit Pixel-Look. */
async function processScene(job, raw) {
  return sharp(raw)
    .resize(job.outSize.width, job.outSize.height, { fit: 'fill', kernel: job.kernel })
    .png({ palette: true, colors: job.colors, dither: 0 })
    .toBuffer()
}

/**
 * Sprite: Trim auf die Figur, Downscale, unten-mittig auf die 128x192-
 * Leinwand (einheitlicher Fußpunkt — die Plane pivotiert am Fuß), dann
 * Alpha binarisieren (deckungsgleich mit alphaTest 0.5, killt Halo-Säume).
 *
 * Kurations-Optionen aus dem Manifest:
 * - flip: horizontal spiegeln — für gute Bilder mit Blick nach links
 *   (Basis-Blickrichtung muss rechts sein), statt Seed-Roulette.
 * - pixelate: n baut das Sprite bei 1/n-Auflösung und skaliert nearest
 *   hoch — erzwingt knackige Pixel-Cluster bei weich geratenen Bildern.
 */
async function processSprite(job, raw) {
  const p = job.pixelate ?? 1
  const outW = job.outSize.width / p
  const outH = job.outSize.height / p
  const floor = Math.max(1, Math.round(SPRITE_FIGURE.floor / p))

  let source = sharp(raw).trim()
  if (job.flip) source = source.flop()
  const figure = await source
    .resize(Math.round(SPRITE_FIGURE.width / p), Math.round(SPRITE_FIGURE.height / p), {
      fit: 'inside',
      kernel: job.kernel,
    })
    .png()
    .toBuffer()
  const meta = await sharp(figure).metadata()

  const canvas = await sharp({
    create: {
      width: outW,
      height: outH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{
      input: figure,
      left: Math.round((outW - meta.width) / 2),
      top: outH - meta.height - floor,
    }])
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { data, info } = canvas
  for (let i = 3; i < data.length; i += 4) data[i] = data[i] >= 128 ? 255 : 0
  let result = sharp(data, { raw: info })
  if (p > 1) {
    result = result.resize(job.outSize.width, job.outSize.height, { kernel: 'nearest' })
  }
  return result.png().toBuffer()
}

// --- Ein Asset komplett ------------------------------------------------------

async function generateAsset(job) {
  const fluxUrl = await generateImage(job)
  const sourceUrl = job.type === 'character' ? await removeBackground(fluxUrl) : fluxUrl
  const raw = await download(sourceUrl)

  // Blick-Richter: Basis-Blickrichtung im Spiel ist rechts; blickt die
  // Figur laut VLM-Mehrheit nach links, wird gespiegelt. Der effektive
  // Flip bleibt vom Manifest-Flip getrennt (der steckt im Fingerprint).
  let judged = null
  let flip = job.flip
  if (job.type === 'character' && flags.judge && !job.flipExplicit) {
    judged = await judgeFacing(sourceUrl)
    if (judged.facing === 'left') flip = true
  }

  if (flags.keepRaw) {
    mkdirSync(RAW_DIR, { recursive: true })
    writeFileSync(new URL(`${job.key}.png`, RAW_DIR), raw)
  }

  const processed =
    job.type === 'scene' ? await processScene(job, raw) : await processSprite({ ...job, flip }, raw)

  // Zielmaße validieren, bevor irgendwas geschrieben wird
  const meta = await sharp(processed).metadata()
  if (meta.width !== job.outSize.width || meta.height !== job.outSize.height) {
    throw new Error(`Zielmaße falsch: ${meta.width}x${meta.height} statt ${job.outSize.width}x${job.outSize.height}`)
  }

  writeFileSync(job.target, processed)
  if (!job.audition) {
    writeFileSync(
      new URL(`${job.target.href}.json`),
      JSON.stringify(
        {
          params: fingerprint(job),
          ...(judged && { judged: { ...judged, model: JUDGE_MODEL, flipped: flip } }),
          sourceUrl,
          generatedAt: new Date().toISOString(),
        },
        null,
        2,
      ) + '\n',
    )
  }
}

// --- Ablauf --------------------------------------------------------------------

let jobs = buildJobs()
  .filter(j => !flags.type || j.type === flags.type)
  .filter(j => flags.only.length === 0 || flags.only.includes(j.key))

if (flags.audition > 0) {
  // Casting: je Charakter n Seed-Varianten in den Cache, Assets unberührt
  jobs = jobs
    .filter(j => j.type === 'character')
    .flatMap(job =>
      Array.from({ length: flags.audition }, (_, k) => {
        const seed = job.seed + k * 1000
        return {
          ...job,
          seed,
          flip: false,
          flipExplicit: false,
          pixelate: 1,
          audition: true,
          target: new URL(`./.art-cache/auditions/${job.key}/${seed}.png`, import.meta.url),
        }
      }),
    )
  for (const job of jobs) mkdirSync(new URL('.', job.target), { recursive: true })
}

if (flags.only.length) {
  const known = new Set(jobs.map(j => j.key))
  for (const k of flags.only) {
    if (!known.has(k)) {
      console.error(`Unbekannter Asset-Key "${k}" — Keys stehen in scripts/art-manifest.mjs`)
      process.exit(1)
    }
  }
}

const pending = flags.force ? jobs : jobs.filter(j => !isFresh(j))
const skipped = jobs.length - pending.length

if (flags.dryRun) {
  for (const job of pending) {
    console.log(`— ${job.key} (${job.type}, seed ${job.seed}, ${job.model})`)
    console.log(`  → ${fileURLToPath(job.target)}`)
    console.log(`  ${job.prompt}\n`)
  }
  console.log(`${pending.length} zu generieren, ${skipped} aktuell.`)
  process.exit(0)
}

mkdirSync(SCENES_DIR, { recursive: true })
mkdirSync(CHARS_DIR, { recursive: true })

let done = 0
let failed = 0
const queue = [...pending]
async function worker() {
  for (;;) {
    if (accountLocked) return
    const job = queue.shift()
    if (!job) return
    try {
      await generateAsset(job)
      done++
      console.log(`✔ ${job.key.padEnd(18)} → ${fileURLToPath(job.target)}`)
    } catch (err) {
      failed++
      console.error(`✘ ${job.key.padEnd(18)} ${err.message}`)
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

console.log(`\n${done} generiert, ${skipped} übersprungen, ${failed} fehlgeschlagen.`)
if (accountLocked) {
  console.error(
    '\nfal-Guthaben aufgebraucht — Lauf abgebrochen. Aufladen unter https://fal.ai/dashboard/billing,' +
    '\ndann denselben Befehl erneut ausführen (Fertiges wird übersprungen).',
  )
}
if (failed) process.exit(1)
