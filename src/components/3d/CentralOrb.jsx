import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GlowRing({ radius, speed, color, opacity }) {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed * 0.3
      ref.current.rotation.y = state.clock.elapsedTime * speed * 0.5
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.2
    }
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function DataStream({ count = 60, radius = 2.5 }) {
  const ref = useRef()

  const { positions, scales } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = radius + (Math.random() - 0.5) * 0.5
      positions[i * 3] = Math.cos(angle) * r
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5
      positions[i * 3 + 2] = Math.sin(angle) * r
      scales[i] = Math.random() * 0.5 + 0.3
    }

    return { positions, scales }
  }, [count, radius])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#00d4ff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default function CentralOrb() {
  const coreRef = useRef()
  const outerRef = useRef()
  const pulseRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (coreRef.current) {
      coreRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.5
      coreRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05)
    }

    if (outerRef.current) {
      outerRef.current.material.opacity = 0.12 + Math.sin(t * 0.8) * 0.04
      outerRef.current.scale.setScalar(1 + Math.sin(t) * 0.08)
    }

    if (pulseRef.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.15
      pulseRef.current.scale.setScalar(pulse)
      pulseRef.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.04
    }
  })

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.6, 4]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.0, 2]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.12}
          wireframe
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={pulseRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <GlowRing radius={2.0} speed={0.3} color="#00d4ff" opacity={0.25} />
      <GlowRing radius={2.8} speed={-0.2} color="#8b5cf6" opacity={0.15} />
      <GlowRing radius={3.5} speed={0.12} color="#06b6d4" opacity={0.1} />

      <DataStream count={80} radius={2.2} />
      <DataStream count={50} radius={3.0} />

      <pointLight
        position={[0, 0, 0]}
        intensity={3}
        color="#00d4ff"
        distance={15}
        decay={2}
      />
    </group>
  )
}
