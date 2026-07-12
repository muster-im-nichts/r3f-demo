import { StrictMode, useState, type CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'
import './viewer.css'
import { CHARACTERS } from '../game/characters'
import { NPCS } from '../game/npcs'

/**
 * Asset-Viewer (Dev-Werkzeug, nur im Dev-Server): http://localhost:5173/viewer.html
 *
 * Zeigt alle generierten Figuren und Kulissen samt Pipeline-Metadaten aus
 * den Sidecars ({name}.png.json): Seed, Modell, Flip-Zustand, Richter-Urteil.
 * Liegen lokal Audition-Kandidaten (scripts/.art-cache/auditions/), werden
 * sie als Versionen unter der Figur angezeigt — der aktive Seed ist markiert.
 */

interface Sidecar {
  params: {
    key: string
    model: string
    prompt: string
    seed: number
    flip?: boolean
    pixelate?: number
    colors?: number | null
  }
  judged?: { facing: string | null; votes: string[]; model: string; flipped: boolean }
  generatedAt: string
}

const asUrlMap = (files: Record<string, string>, strip: RegExp) => {
  const map = new Map<string, string>()
  for (const [path, url] of Object.entries(files)) map.set(path.split('/').pop()!.replace(strip, ''), url)
  return map
}

const charUrls = asUrlMap(
  import.meta.glob('../assets/characters/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>,
  /\.png$/,
)
const charMeta = new Map<string, Sidecar>()
for (const [path, json] of Object.entries(
  import.meta.glob('../assets/characters/*.png.json', { eager: true, import: 'default' }) as Record<string, Sidecar>,
)) charMeta.set(path.split('/').pop()!.replace(/\.png\.json$/, ''), json)

const sceneUrls = asUrlMap(
  import.meta.glob('../assets/scenes/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>,
  /\.png$/,
)
const sceneMeta = new Map<string, Sidecar>()
for (const [path, json] of Object.entries(
  import.meta.glob('../assets/scenes/*.png.json', { eager: true, import: 'default' }) as Record<string, Sidecar>,
)) sceneMeta.set(path.split('/').pop()!.replace(/\.png\.json$/, ''), json)

/** Audition-Versionen: {figurKey → [{seed, url}]} — nur lokal vorhanden */
const auditionsByChar = new Map<string, { seed: number; url: string }[]>()
for (const [path, url] of Object.entries(
  import.meta.glob('../../scripts/.art-cache/auditions/*/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>,
)) {
  const parts = path.split('/')
  const key = parts[parts.length - 2]
  const seed = Number(parts[parts.length - 1].replace(/\.png$/, ''))
  if (!auditionsByChar.has(key)) auditionsByChar.set(key, [])
  auditionsByChar.get(key)!.push({ seed, url })
}
for (const list of auditionsByChar.values()) list.sort((a, b) => a.seed - b.seed)

const FIGURES = [
  ...CHARACTERS.map(c => ({ id: c.id, name: c.name, note: c.description, scale: 1 })),
  ...Object.values(NPCS).map(n => ({ id: n.id, name: n.name, note: undefined as string | undefined, scale: n.scale ?? 1 })),
]

// --- Styles -----------------------------------------------------------------

const gold = '#d9a441'
const panel: CSSProperties = {
  background: 'rgba(23, 19, 31, 0.9)',
  border: '1px solid #3a2f4d',
  borderRadius: '8px',
  padding: '12px',
}
const badge: CSSProperties = {
  display: 'inline-block',
  padding: '1px 7px',
  margin: '0 4px 4px 0',
  border: '1px solid #3a2f4d',
  borderRadius: '4px',
  fontSize: '15px',
  color: '#cfc4ae',
}
const stage: CSSProperties = {
  background: 'linear-gradient(#1a1630 0%, #241c3a 70%, #0d0b16 70%, #17131f 100%)',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  padding: '10px 0 0',
}

function Badge({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <span style={{ ...badge, ...(warn ? { borderColor: '#8a2f2a', color: '#e08a7a' } : {}) }}>
      <span style={{ opacity: 0.6 }}>{label} </span>{value}
    </span>
  )
}

function FigureCard({ figure }: { figure: (typeof FIGURES)[number] }) {
  const meta = charMeta.get(figure.id)
  const versions = auditionsByChar.get(figure.id) ?? []
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mirrored, setMirrored] = useState(false)
  const url = previewUrl ?? charUrls.get(figure.id)
  const judged = meta?.judged

  return (
    <div style={panel}>
      <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: gold, marginBottom: '2px' }}>
        {figure.name}
      </div>
      <div style={{ fontSize: '15px', opacity: 0.6, marginBottom: '8px' }}>{figure.id}{figure.note ? ` — ${figure.note}` : ''}</div>
      <div style={stage}>
        {url ? (
          <img
            src={url}
            alt={figure.name}
            style={{
              height: `${Math.round(288 * figure.scale)}px`,
              imageRendering: 'pixelated',
              transform: mirrored ? 'scaleX(-1)' : undefined,
            }}
          />
        ) : (
          <div style={{ padding: '40px', opacity: 0.5 }}>kein Asset — prozeduraler Fallback</div>
        )}
      </div>
      <div style={{ margin: '8px 0 4px' }}>
        {meta && <Badge label="seed" value={String(meta.params.seed)} />}
        {meta && <Badge label="flip" value={meta.params.flip ? 'manifest' : judged?.flipped ? 'judge' : 'nein'} warn={Boolean(meta.params.flip || judged?.flipped)} />}
        {judged && <Badge label="blick" value={judged.facing ?? 'unklar'} warn={judged.facing === 'left'} />}
        {meta?.params.pixelate && meta.params.pixelate > 1 && <Badge label="pixelate" value={String(meta.params.pixelate)} />}
        {figure.scale !== 1 && <Badge label="bühne ×" value={figure.scale.toFixed(2)} />}
        <button
          onClick={() => setMirrored(m => !m)}
          style={{ ...badge, cursor: 'pointer', background: mirrored ? '#3a2f4d' : 'transparent', color: gold }}
        >
          ⇄ spiegeln
        </button>
      </div>
      {versions.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
          {versions.map(v => (
            <button
              key={v.seed}
              onClick={() => setPreviewUrl(previewUrl === v.url ? null : v.url)}
              title={`Audition-Seed ${v.seed}`}
              style={{
                padding: '2px',
                background: '#0d0b16',
                border: `2px solid ${v.seed === meta?.params.seed ? gold : previewUrl === v.url ? '#7ec4a2' : '#3a2f4d'}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <img src={v.url} alt={String(v.seed)} style={{ height: '72px', imageRendering: 'pixelated', display: 'block' }} />
              <div style={{ fontSize: '13px', color: v.seed === meta?.params.seed ? gold : '#cfc4ae' }}>{v.seed}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SceneCard({ sceneKey }: { sceneKey: string }) {
  const meta = sceneMeta.get(sceneKey)
  return (
    <div style={panel}>
      <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: gold, marginBottom: '8px' }}>
        {sceneKey}
      </div>
      <img
        src={sceneUrls.get(sceneKey)}
        alt={sceneKey}
        style={{ width: '100%', imageRendering: 'pixelated', borderRadius: '4px', display: 'block' }}
      />
      <div style={{ marginTop: '8px' }}>
        {meta && <Badge label="seed" value={String(meta.params.seed)} />}
        {meta && <Badge label="farben" value={String(meta.params.colors ?? '—')} />}
        {meta && (
          <details style={{ fontSize: '15px', color: '#cfc4ae', marginTop: '4px' }}>
            <summary style={{ cursor: 'pointer', opacity: 0.7 }}>Prompt</summary>
            <div style={{ opacity: 0.85, marginTop: '4px' }}>{meta.params.prompt}</div>
          </details>
        )}
      </div>
    </div>
  )
}

function App() {
  const [tab, setTab] = useState<'figuren' | 'kulissen'>('figuren')
  const epochs = [...new Set([...sceneUrls.keys()].map(k => k.split('-')[0]))].sort()

  return (
    <div style={{ minHeight: '100vh', background: '#0d0b16', color: '#e3d5b8', fontFamily: '"VT323", monospace', fontSize: '17px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '18px' }}>
        <h1 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: gold, margin: 0 }}>
          Asset-Viewer
        </h1>
        {(['figuren', 'kulissen'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...badge,
              cursor: 'pointer',
              fontSize: '17px',
              background: tab === t ? '#3a2f4d' : 'transparent',
              color: tab === t ? gold : '#cfc4ae',
            }}
          >
            {t === 'figuren' ? `Figuren (${FIGURES.length})` : `Kulissen (${sceneUrls.size})`}
          </button>
        ))}
        <span style={{ opacity: 0.5, fontSize: '15px' }}>
          Versionen erscheinen nach `npm run generate-art -- --audition n`
        </span>
      </div>

      {tab === 'figuren' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {FIGURES.map(f => <FigureCard key={f.id} figure={f} />)}
        </div>
      ) : (
        epochs.map(epoch => (
          <div key={epoch}>
            <h2 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: gold, margin: '18px 0 10px' }}>{epoch}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
              {[...sceneUrls.keys()].filter(k => k.startsWith(`${epoch}-`)).sort().map(k => <SceneCard key={k} sceneKey={k} />)}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
