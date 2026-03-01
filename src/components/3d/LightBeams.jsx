import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function LightBeam({ position, color, rotationSpeed, initialAngle = 0 }) {
  const groupRef = useRef()
  const meshRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = initialAngle + state.clock.elapsedTime * rotationSpeed
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * rotationSpeed * 0.5) * 0.3
    }
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.8) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[8, 30, 32, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function LightBeams() {
  return (
    <>
      <LightBeam
        position={[0, 15, 0]}
        color="#00d4ff"
        rotationSpeed={0.15}
        initialAngle={0}
      />
      <LightBeam
        position={[5, 12, -5]}
        color="#8b5cf6"
        rotationSpeed={-0.1}
        initialAngle={Math.PI / 3}
      />
      <LightBeam
        position={[-5, 18, 5]}
        color="#06b6d4"
        rotationSpeed={0.08}
        initialAngle={(Math.PI * 2) / 3}
      />
    </>
  )
}
