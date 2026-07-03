import { useState } from 'react'
import type { Ending, GameSetup, NodeId } from './game/types'
import { CAMPAIGNS } from './game/campaigns'
import { collectScenes, getNode, resolveText } from './game/engine'
import { preloadScenes } from './scene/textures'
import { Stage } from './scene/Stage'
import { StartScreen } from './ui/StartScreen'
import { AdventureBox } from './ui/AdventureBox'
import { EndScreen } from './ui/EndScreen'
import { Letterbox } from './ui/Letterbox'
import { ensureAudio } from './audio/audio'
import { startMusic } from './audio/sequencer'
import { success, failure } from './audio/sfx'

type Phase =
  | { kind: 'start' }
  | { kind: 'playing'; nodeId: NodeId }
  | { kind: 'end'; nodeId: NodeId; ending: Ending }

export default function App() {
  const [setup, setSetup] = useState<GameSetup | null>(null)
  const [phase, setPhase] = useState<Phase>({ kind: 'start' })

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

  const choose = (target: NodeId) => {
    const next = getNode(campaign, target)
    if (next.ending) {
      if (next.ending === 'success') success()
      else failure()
      setPhase({ kind: 'end', nodeId: target, ending: next.ending })
    } else {
      setPhase({ kind: 'playing', nodeId: target })
    }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }}>
      <Stage
        epoch={setup.epoch}
        scene={node.scene}
        character={setup.character}
        speech={
          phase.kind === 'playing' && node.speech ? resolveText(node.speech, setup) : undefined
        }
        curtainClosed={phase.kind === 'end'}
      />
      <Letterbox />

      {phase.kind === 'playing' && node.options && (
        <AdventureBox
          key={node.id}
          text={resolveText(node.text, setup)}
          options={node.options}
          onChoose={choose}
        />
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
