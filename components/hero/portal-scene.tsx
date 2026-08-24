'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Icosahedron, Torus } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

const CRIMSON = '#e01e37'
const EMBER = '#ff5c39'

/* ---------------- Energy portal ring ---------------- */
function PortalRings() {
  const outer = useRef<THREE.Mesh>(null)
  const mid = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (outer.current) outer.current.rotation.z += delta * 0.18
    if (mid.current) mid.current.rotation.z -= delta * 0.32
    if (inner.current) inner.current.rotation.z += delta * 0.5
  })

  return (
    <group rotation={[Math.PI / 2.6, 0, 0]}>
      <Torus ref={outer} args={[2.6, 0.045, 16, 120]}>
        <meshStandardMaterial
          color={CRIMSON}
          emissive={CRIMSON}
          emissiveIntensity={4}
          toneMapped={false}
        />
      </Torus>
      <Torus ref={mid} args={[2.15, 0.03, 16, 120]}>
        <meshStandardMaterial
          color={EMBER}
          emissive={EMBER}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </Torus>
      <Torus ref={inner} args={[1.7, 0.02, 16, 120]}>
        <meshStandardMaterial
          color={CRIMSON}
          emissive={CRIMSON}
          emissiveIntensity={5}
          toneMapped={false}
        />
      </Torus>
      {/* glowing core disc */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[1.62, 64]} />
        <meshBasicMaterial color={'#3a0510'} transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ---------------- Particle vortex being pulled into the portal ---------------- */
function Vortex({ count = 1400 }: { count?: number }) {
  const points = useRef<THREE.Points>(null)

  const { positions, speeds, radii, angles } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    const radii = new Float32Array(count)
    const angles = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 6
      const a = Math.random() * Math.PI * 2
      radii[i] = r
      angles[i] = a
      speeds[i] = 0.15 + Math.random() * 0.5
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = Math.sin(a) * r
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3
    }
    return { positions, speeds, radii, angles }
  }, [count])

  useFrame((_, delta) => {
    if (!points.current) return
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      angles[i] += speeds[i] * delta
      radii[i] -= speeds[i] * delta * 0.6
      if (radii[i] < 1.5) radii[i] = 8
      const x = Math.cos(angles[i]) * radii[i]
      const y = Math.sin(angles[i]) * radii[i]
      pos.setX(i, x)
      pos.setY(i, y)
    }
    pos.needsUpdate = true
    points.current.rotation.z += delta * 0.05
  })

  return (
    <points ref={points} rotation={[Math.PI / 2.6, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={EMBER}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

/* ---------------- Floating metallic debris ---------------- */
function Debris() {
  const shards = useMemo(
    () =>
      Array.from({ length: 9 }).map(() => ({
        pos: [
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 5,
          -1 - Math.random() * 3,
        ] as [number, number, number],
        scale: 0.12 + Math.random() * 0.28,
        speed: 0.5 + Math.random(),
      })),
    [],
  )

  return (
    <>
      {shards.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={1.5} floatIntensity={1.2}>
          <Icosahedron args={[s.scale, 0]} position={s.pos}>
            <meshStandardMaterial
              color={'#2a2427'}
              metalness={1}
              roughness={0.25}
              emissive={CRIMSON}
              emissiveIntensity={0.35}
            />
          </Icosahedron>
        </Float>
      ))}
    </>
  )
}

function Rig() {
  const { current: v } = useRef(new THREE.Vector2())
  useFrame((state) => {
    v.lerp(state.pointer, 0.04)
    state.camera.position.x = v.x * 0.6
    state.camera.position.y = v.y * 0.4
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function PortalScene({ dpr = [1, 1.5] }: { dpr?: [number, number] }) {
  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      camera={{ position: [0, 0, 8], fov: 45 }}
    >
      <color attach="background" args={['#120406']} />
      <fog attach="fog" args={['#120406', 8, 18]} />

      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 2]} intensity={40} color={CRIMSON} distance={20} />
      <pointLight position={[4, 3, 4]} intensity={12} color={EMBER} />
      <pointLight position={[-4, -2, 3]} intensity={8} color={'#8a1020'} />

      <PortalRings />
      <Vortex />
      <Debris />
      <Rig />

      <EffectComposer>
        <Bloom
          intensity={1.35}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0009, 0.0012]}
        />
        <Vignette eskil={false} offset={0.15} darkness={1.05} />
      </EffectComposer>
    </Canvas>
  )
}
