import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls, Environment } from '@react-three/drei'
import { useState, useRef } from 'react'
import * as THREE from 'three'

function InteractiveBox({ position, color }: { position: [number, number, number], color: string }) {
  const [count, setCount] = useState(0)
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => setCount(c => c + 1)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : color} />
      <Html
        transform
        occlude="blending"
        position={[0, 0, 1.001]}
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '120px',
          textAlign: 'center',
          userSelect: 'none'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            React auf 3D! 🎉
          </div>
          <div style={{ color: '#666' }}>
            Klicks: {count}
          </div>
        </div>
      </Html>
    </mesh>
  )
}

function FloatingCard() {
  const [input, setInput] = useState('')
  const meshRef = useRef<THREE.Mesh>(null)
  
  return (
    <mesh ref={meshRef} position={[4, 1, 0]} rotation={[0, -0.5, 0]}>
      <boxGeometry args={[3, 2, 0.2]} />
      <meshStandardMaterial color="#667eea" />
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0.11]}
        distanceFactor={8}
      >
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          width: '200px',
          userSelect: 'none'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            Echtes Input! ✨
          </h3>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tippe hier..."
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          {input && (
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>
              Du schriebst: {input}
            </div>
          )}
        </div>
      </Html>
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
