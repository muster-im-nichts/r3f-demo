import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry } from 'three'

const COUNT = 28

/**
 * Treibende Lichtstäubchen/Glühwürmchen im Bühnenraum — billige Tiefe:
 * Partikel verteilen sich zwischen Backdrop und Rampe und driften langsam.
 */
export function Atmosphere({ color = '#ffd98a' }: { color?: string }) {
  const geometry = useRef<BufferGeometry>(null)

  const { base, phase, speed } = useMemo(() => {
    const base = new Float32Array(COUNT * 3)
    const phase = new Float32Array(COUNT)
    const speed = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      base[i * 3] = (Math.random() - 0.5) * 9
      base[i * 3 + 1] = 0.3 + Math.random() * 2.6
      base[i * 3 + 2] = -6.5 + Math.random() * 7
      phase[i] = Math.random() * Math.PI * 2
      speed[i] = 0.25 + Math.random() * 0.5
    }
    return { base, phase, speed }
  }, [])

  const positions = useMemo(() => new Float32Array(base), [base])

  useFrame(state => {
    if (!geometry.current) return
    const t = state.clock.elapsedTime
    const attr = geometry.current.getAttribute('position') as BufferAttribute
    for (let i = 0; i < COUNT; i++) {
      const p = phase[i]
      const s = speed[i]
      attr.array[i * 3] = base[i * 3] + Math.sin(t * s + p) * 0.5
      attr.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * s * 0.7 + p * 2) * 0.3
      attr.array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * s * 0.5 + p) * 0.4
    }
    attr.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry ref={geometry}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.045}
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
