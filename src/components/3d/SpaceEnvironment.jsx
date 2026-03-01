import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

export default function SpaceEnvironment() {
  const fogRef = useRef()

  useFrame((state) => {
    if (fogRef.current) {
      fogRef.current.density = 0.015 + Math.sin(state.clock.elapsedTime * 0.1) * 0.003
    }
  })

  return (
    <>
      <color attach="background" args={['#0A0A0A']} />
      <fogExp2 ref={fogRef} attach="fog" color="#0A0A0A" density={0.015} />

      <Stars
        radius={100}
        depth={80}
        count={3000}
        factor={4}
        saturation={0.2}
        fade
        speed={0.5}
      />

      <ambientLight intensity={0.15} color="#ffffff" />

      <directionalLight
        position={[10, 10, 5]}
        intensity={0.3}
        color="#00d4ff"
      />
      <directionalLight
        position={[-10, -5, -10]}
        intensity={0.2}
        color="#8b5cf6"
      />

      <pointLight
        position={[0, 5, 0]}
        intensity={0.5}
        color="#06b6d4"
        distance={30}
        decay={2}
      />
      <pointLight
        position={[0, -5, 0]}
        intensity={0.3}
        color="#7c3aed"
        distance={25}
        decay={2}
      />
    </>
  )
}
