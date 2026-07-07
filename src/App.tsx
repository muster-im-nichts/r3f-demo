import { useEffect, useRef, useState } from 'react'
import type { Ending, GameSetup, NodeId } from './game/types'
import { getCampaign } from './game/campaigns'
import {
  collectScenes,
  deriveExits,
  getNode,
  nodeCast,
  nodeSegments,
  resolveText,
  type Segment,
} from './game/engine'
import { NPCS } from './game/npcs'
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
import { prefetchSpeech, speak } from './audio/voice'

type Phase =
  | { kind: 'start' }
  | { kind: 'playing'; nodeId: NodeId }
  | { kind: 'end'; nodeId: NodeId; ending: Ending }

/**
 * Story-Transit: Figur läuft zur Szene des gewählten Knotens. `manual` =
 * der Spieler ist zu Fuß hinausgelaufen und betritt die neue Szene auch
 * selbst — kein Auto-Walk, nur Ankunftserkennung.
 */
type Transit = { nodeId: NodeId; direction: 'left' | 'right'; manual?: boolean }

export default function App() {
  const [setup, setSetup] = useState<GameSetup | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'start' })
  // Szene, in die der Spieler zu Fuß gewandert ist (null = Szene des Knotens)
  const [walkScene, setWalkScene] = useState<string | null>(null)
  // Spieler ist gerade dabei, die Bühne zu verlassen (Props versinken schon)
  const [leaving, setLeaving] = useState(false)
  const [transit, setTransit] = useState<Transit | null>(null)
  // Knoten-Text wurde schon gelesen (Auto-Walk abgebrochen): sofort komplett zeigen
  const [instantText, setInstantText] = useState(false)
  // Dialog-Sprecher, die ihr Stichwort schon hatten und aufgetreten sind
  const [cuedCast, setCuedCast] = useState<string[]>([])
  // Angeklickte Plauderzeilen der Anwesenden (werden ans Drehbuch angehängt)
  const [chatter, setChatter] = useState<Segment[]>([])
  const chatterCount = useRef(new Map<string, number>())

  const nodeId = phase.kind === 'start' ? null : phase.nodeId
  useEffect(() => {
    setWalkScene(null) // Story-Fortschritt holt die Bühne zur Knoten-Szene zurück
    setInstantText(false) // neuer Knoten = neuer Text, wieder mit Typewriter
    setChatter([]) // Plaudereien gehören zur Textbox des Knotens
  }, [nodeId])

  // Auftritte gelten pro Szene: Wer einmal auf der Bühne steht (z.B. Meister
  // Runge), bleibt auch beim nächsten Knoten derselben Szene — erst der
  // Szenenwechsel räumt die Stichwort-Besetzung. (Hook vor dem StartScreen-
  // Return, damit die Hook-Reihenfolge stabil bleibt.)
  const currentScene =
    setup && phase.kind !== 'start'
      ? (walkScene ?? getNode(getCampaign(setup.epoch, setup.genre), phase.nodeId).scene)
      : null
  useEffect(() => {
    setCuedCast([])
  }, [currentScene])

  if (phase.kind === 'start' || !setup) {
    return (
      <StartScreen
        onStart={next => {
          // Audio synchron in der User-Geste initialisieren (Autoplay-Policy)
          ensureAudio()
          startMusic()
          const campaign = getCampaign(next.epoch, next.genre)
          preloadScenes(next.epoch, collectScenes(campaign))
          setSetup(next)
          setPhase({ kind: 'playing', nodeId: campaign.start })
        }}
      />
    )
  }

  const campaign = getCampaign(setup.epoch, setup.genre)
  const node = getNode(campaign, phase.nodeId)
  const scene = walkScene ?? node.scene
  const exits = phase.kind === 'playing' && !transit ? deriveExits(campaign, node) : {}
  // Das Drehbuch des Knotens: Erzähltext + Dialogzeilen + Plaudereien
  const segments = [...nodeSegments(node, setup), ...chatter]
  // Bühne = Grundbesetzung + alle Sprecher, die ihr Stichwort schon hatten;
  // beim Durchwandern fremder Szenen (Transit) gilt deren Standard-Besetzung
  const castOnStage = walkScene
    ? nodeCast({ ...node, scene, cast: undefined })
    : [...new Set([...nodeCast(node), ...cuedCast])]

  /** Dialog-Zeile beginnt: ihr Sprecher betritt die Bühne */
  const cueSpeaker = (by?: string) => {
    if (!by || by === 'player') return
    setCuedCast(current => (current.includes(by) ? current : [...current, by]))
  }

  /** Klick auf einen Anwesenden: eine Plauderzeile, angehängt ans Drehbuch */
  const talkTo = (npcKey: string) => {
    if (phase.kind !== 'playing' || transit) return
    const npc = NPCS[npcKey]
    if (!npc?.chatter?.length) return
    const count = chatterCount.current.get(npcKey) ?? 0
    chatterCount.current.set(npcKey, count + 1)
    const text = npc.chatter[count % npc.chatter.length].replaceAll(
      '{name}',
      setup.character.name,
    )
    const segment: Segment = { by: npcKey, name: npc.name, voice: npc.voice ?? 'narrator', text }
    setChatter(current => [...current, segment])
    speak(text, segment.voice) // prüft selbst, ob der Sound an ist
  }

  /** Knoten wirklich betreten (Text/Ende zeigen) */
  const finishNode = (target: NodeId) => {
    // Plaudereien synchron räumen: der Reset-Effekt käme erst NACH dem
    // Mount der neuen Textbox — die hätte die alten Zeilen dann schon in
    // ihrer Sprech-Sequenz und würde sie erneut abspielen
    setChatter([])
    const next = getNode(campaign, target)
    if (next.ending) {
      if (next.ending === 'success') success()
      else failure()
      setPhase({ kind: 'end', nodeId: target, ending: next.ending })
    } else {
      setPhase({ kind: 'playing', nodeId: target })
    }
  }

  /** Sprachausgabe des Zielknotens schon während Lauf/Übergang generieren */
  const prefetchNode = (target: NodeId) => {
    for (const segment of nodeSegments(getNode(campaign, target), setup)) {
      prefetchSpeech(segment.text, segment.voice)
    }
  }

  /** Option gewählt: liegt das Ziel woanders, läuft die Figur erst hin */
  const choose = (target: NodeId) => {
    prefetchNode(target)
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

  // Bühnenrand erreicht (zu Fuß oder im Transit). Ohne Story-Ausgang in der
  // Richtung stoppt der Avatar schon vorher am Bildrand — kein freies
  // Herauslaufen aus der Geschichte.
  const exitStage = (direction: 'left' | 'right') => {
    if (phase.kind !== 'playing') return
    if (transit) {
      // Transit: jetzt in die Zielszene umschalten, Figur läuft dort weiter
      setWalkScene(getNode(campaign, transit.nodeId).scene)
      return
    }
    const exit = exits[direction]
    if (!exit) return
    // Mit den Füßen entschieden: Ausgang gehört zu einer Story-Option —
    // aber der Spieler behält die Füße: Einlauf bleibt manuell
    prefetchNode(exit.target)
    setTransit({ nodeId: exit.target, direction, manual: true })
    setWalkScene(getNode(campaign, exit.target).scene)
  }

  const arrived = () => {
    if (!transit) return
    setTransit(null)
    setWalkScene(null)
    finishNode(transit.nodeId)
  }

  /** Bewegungstaste während des Auto-Walks: der Spieler übernimmt sofort */
  const interruptWalk = (stage: 'out' | 'in') => {
    if (!transit) return
    if (stage === 'out') {
      // Noch in der alten Szene: Wahl abbrechen, der Knoten bleibt aktiv —
      // sein Text wurde schon gelesen und erscheint sofort komplett
      setInstantText(true)
      setTransit(null)
      setWalkScene(null)
    } else {
      // Schon in der Zielszene: sofort ankommen statt weiterzulaufen
      arrived()
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }}>
      <Stage
        epoch={setup.epoch}
        scene={scene}
        character={setup.character}
        cast={castOnStage}
        curtainClosed={phase.kind === 'end'}
        exits={{ left: Boolean(exits.left), right: Boolean(exits.right) }}
        onExitStage={exitStage}
        onTalk={talkTo}
        leaving={leaving}
        onLeavingStage={setLeaving}
        autoWalk={transit && !transit.manual ? transit.direction : null}
        manualEntry={Boolean(transit?.manual)}
        onArrived={arrived}
        onWalkInterrupt={interruptWalk}
      />
      <Letterbox />

      {phase.kind === 'playing' && !transit && node.options && (
        <>
          <AdventureBox
            key={node.id}
            segments={segments}
            options={node.options}
            onChoose={choose}
            onCue={cueSpeaker}
            instant={instantText}
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
        </>
      )}
      {/* Joystick bleibt auch im Transit gemountet, sonst verschluckt ein
          laufender Drag sein pointerup und die Richtung klemmt */}
      {phase.kind === 'playing' && <TouchControls />}

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
