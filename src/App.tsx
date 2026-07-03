import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls, Environment } from '@react-three/drei'
import { useState, type ReactNode } from 'react'

// drei <Html transform>: Pixel pro World-Unit = 400 / distanceFactor.
// Mit 100 px/Unit passt ein 200x200px-Div exakt auf eine 2x2-Würfelfläche.
const PX_PER_UNIT = 100
const DISTANCE_FACTOR = 400 / PX_PER_UNIT

/**
 * Ein Html-Panel, das exakt eine Fläche von `width` x `height` World-Units
 * abdeckt und von davorliegender Geometrie verdeckt wird (Raycast-Occlusion).
 * `interactive` steuert, ob das DOM Pointer-Events bekommt — ohne das würden
 * die Panels Klicks schlucken, bevor sie den Mesh-Raycast erreichen.
 */
function FacePanel({
  width,
  height,
  position,
  interactive = false,
  children,
}: {
  width: number
  height: number
  position: [number, number, number]
  interactive?: boolean
  children: ReactNode
}) {
  const [hidden, setHidden] = useState(false)

  return (
    <Html
      transform
      occlude
      onOcclude={setHidden}
      position={position}
      distanceFactor={DISTANCE_FACTOR}
      pointerEvents={interactive && !hidden ? 'auto' : 'none'}
      style={{
        width: width * PX_PER_UNIT,
        height: height * PX_PER_UNIT,
        boxSizing: 'border-box',
        transition: 'opacity 0.15s',
        opacity: hidden ? 0 : 1,
      }}
    >
      {children}
    </Html>
  )
}

function InteractiveBox({ position, color }: { position: [number, number, number], color: string }) {
  const [count, setCount] = useState(0)
  const [hovered, setHovered] = useState(false)

  return (
    <mesh
      position={position}
      onClick={() => setCount(c => c + 1)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
      {/* Panel ohne Pointer-Events: Klicks gehen durch aufs Mesh */}
      <FacePanel width={2} height={2} position={[0, 0, 1.01]}>
        <div style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '6px',
          padding: '16px',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          userSelect: 'none',
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '8px' }}>
            React auf 3D! 🎉
          </div>
          <div style={{ color: '#666', fontSize: '16px' }}>
            Klicks: {count}
          </div>
        </div>
      </FacePanel>
    </mesh>
  )
}

// Eigene Komponente, damit der Input-State im Html-Portal lebt: drei rendert
// den Inhalt in einen separaten React-Root, und ein controlled input, dessen
// State über den Parent-Root läuft, verliert beim schnellen Tippen Zeichen.
function CardContent() {
  const [input, setInput] = useState('')

  return (
    <div style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '6px',
          padding: '20px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', userSelect: 'none' }}>
            Echtes Input! ✨
          </h3>
          <input
            type="text"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tippe hier..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            marginTop: '10px',
            fontSize: '14px',
            opacity: input ? 0.9 : 0,
            minHeight: '17px',
            userSelect: 'none',
          }}>
            {input ? `Du schriebst: ${input}` : ' '}
          </div>
        </div>
  )
}

function FloatingCard() {
  return (
    <mesh position={[4, 1, 0]} rotation={[0, -0.5, 0]}>
      <boxGeometry args={[3, 2, 0.2]} />
      <meshStandardMaterial color="#667eea" />
      <FacePanel width={3} height={2} position={[0, 0, 0.11]} interactive>
        <CardContent />
      </FacePanel>
    </mesh>
  )
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <InteractiveBox position={[-2, 1, 0]} color="#4a9eff" />
        <InteractiveBox position={[0, 1, -3]} color="#ff6b6b" />
        <FloatingCard />

        {/* Boden */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        <Environment preset="city" />
      </Canvas>

      {/* Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
        background: 'rgba(0,0,0,0.5)',
        padding: '16px 20px',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>
          R3F Demo 🚀
        </h1>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
          React Three Fiber + drei<br/>
          Maus: Drehen | Scroll: Zoom | Click: Interagieren
        </p>
      </div>
    </div>
  )
}
