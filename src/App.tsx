import { useEffect, useState } from 'react'
import type { Ending, GameSetup, NodeId } from './game/types'
import { CAMPAIGNS } from './game/campaigns'
import { collectScenes, deriveExits, getNode, resolveText } from './game/engine'
import { sceneLabel } from './game/scenes'
import { preloadScenes } from './scene/textures'
import { Stage } from './scene/Stage'
import { StartScreen } from './ui/StartScreen'
import { AdventureBox } from './ui/AdventureBox'
import { EndScreen } from './ui/EndScreen'
import { Letterbox } from './ui/Letterbox'
import { TouchControls } from './ui/TouchControls'
import { Signposts } from './ui/Signposts'
import { ensureAudio } from './audio/audio'
import { startMusic } from './audio/sequencer'
import { success, failure } from './audio/sfx'

type Phase =
  | { kind: 'start' }
  | { kind: 'playing'; nodeId: NodeId }
  | { kind: 'end'; nodeId: NodeId; ending: Ending }

/** Story-Transit: Figur läuft gerade zur Szene des gewählten Knotens */
type Transit = { nodeId: NodeId; direction: 'left' | 'right' }

export default function App() {
  const [setup, setSetup] = useState<GameSetup | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'start' })
  // Szene, in die der Spieler zu Fuß gewandert ist (null = Szene des Knotens)
  const [walkScene, setWalkScene] = useState<string | null>(null)
  // Spieler ist gerade dabei, die Bühne zu verlassen (Props versinken schon)
  const [leaving, setLeaving] = useState(false)
  const [transit, setTransit] = useState<Transit | null>(null)

  const nodeId = phase.kind === 'start' ? null : phase.nodeId
  useEffect(() => {
    setWalkScene(null) // Story-Fortschritt holt die Bühne zur Knoten-Szene zurück
  }, [nodeId])

  if (phase.kind === 'start' || !setup) {
    return (
      <StartScreen
        onStart={next => {
          // Audio synchron in der User-Geste initialisieren (Autoplay-Policy)
          ensureAudio()
          startMusic()
          preloadScenes(next.epoch, collectScenes(CAMPAIGNS[next.genre]))
          setSetup(next)
          setPhase({ kind: 'playing', nodeId: CAMPAIGNS[next.genre].start })
        }}
      />
    )
  }

  const campaign = CAMPAIGNS[setup.genre]
  const node = getNode(campaign, phase.nodeId)
  const scene = walkScene ?? node.scene
  const exits = phase.kind === 'playing' && !transit ? deriveExits(campaign, node) : {}

  /** Knoten wirklich betreten (Text/Ende zeigen) */
  const finishNode = (target: NodeId) => {
    const next = getNode(campaign, target)
    if (next.ending) {
      if (next.ending === 'success') success()
      else failure()
      setPhase({ kind: 'end', nodeId: target, ending: next.ending })
    } else {
      setPhase({ kind: 'playing', nodeId: target })
    }
  }

  /** Option gewählt: liegt das Ziel woanders, läuft die Figur erst hin */
  const choose = (target: NodeId) => {
    const targetScene = getNode(campaign, target).scene
    if (targetScene === scene) {
      finishNode(target)
      return
    }
    // Richtung: aus den abgeleiteten Ausgängen, sonst nach Szenen-Reihenfolge
    let direction: 'left' | 'right' = 'right'
    if (exits.left?.target === target) direction = 'left'
    else if (exits.right?.target === target) direction = 'right'
    else {
      const order = collectScenes(campaign)
      direction = order.indexOf(targetScene) >= order.indexOf(scene) ? 'right' : 'left'
    }
    setTransit({ nodeId: target, direction })
  }

  // Bühnenrand erreicht (zu Fuß oder im Transit)
  const exitStage = (direction: 'left' | 'right') => {
    if (phase.kind !== 'playing') return
    if (transit) {
      // Transit: jetzt in die Zielszene umschalten, Figur läuft dort weiter
      setWalkScene(getNode(campaign, transit.nodeId).scene)
      return
    }
    const exit = exits[direction]
    if (exit) {
      // Mit den Füßen entschieden: Ausgang gehört zu einer Story-Option
      setTransit({ nodeId: exit.target, direction })
      setWalkScene(getNode(campaign, exit.target).scene)
      return
    }
    // Freies Erkunden: zur Nachbarszene der Kampagne (mit Umlauf)
    const scenes = collectScenes(campaign)
    const index = scenes.indexOf(scene)
    const step = direction === 'right' ? 1 : -1
    setWalkScene(scenes[(index + step + scenes.length) % scenes.length])
  }

  const arrived = () => {
    if (!transit) return
    setTransit(null)
    setWalkScene(null)
    finishNode(transit.nodeId)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }}>
      <Stage
        epoch={setup.epoch}
        scene={scene}
        character={setup.character}
        speech={
          phase.kind === 'playing' && !transit && node.speech
            ? resolveText(node.speech, setup)
            : undefined
        }
        curtainClosed={phase.kind === 'end'}
        onExitStage={exitStage}
        leaving={leaving}
        onLeavingStage={setLeaving}
        autoWalk={transit?.direction ?? null}
        onArrived={arrived}
      />
      <Letterbox />

      {phase.kind === 'playing' && !transit && node.options && (
        <>
          <AdventureBox
            key={node.id}
            text={resolveText(node.text, setup)}
            options={node.options}
            onChoose={choose}
          />
          <Signposts
            left={exits.left ? sceneLabel(getNode(campaign, exits.left.target).scene) : undefined}
            right={
              exits.right ? sceneLabel(getNode(campaign, exits.right.target).scene) : undefined
            }
            onGo={direction => {
              const exit = exits[direction]
              if (exit) choose(exit.target)
            }}
          />
          <TouchControls />
        </>
      )}

      {phase.kind === 'end' && (
        <EndScreen
          ending={phase.ending}
          epilog={resolveText(node.text, setup)}
          setup={setup}
          campaignId={campaign.id}
          onRestart={() => setPhase({ kind: 'start' })}
        />
      )}
    </div>
  )
}
