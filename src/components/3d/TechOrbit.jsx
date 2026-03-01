import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

function TechItem({ tech, index, total, radius }) {
  const groupRef = useRef()
  const dotRef = useRef()
  const angle = (index / total) * Math.PI * 2

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const speed = 0.3 + index * 0.05
    const currentAngle = angle + t * speed

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(currentAngle) * radius
      groupRef.current.position.z = Math.sin(currentAngle) * radius
      groupRef.current.position.y = Math.sin(t * 0.5 + index) * 0.2
    }

    if (dotRef.current) {
      dotRef.current.material.opacity = 0.6 + Math.sin(t * 2 + index) * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial
          color={tech.color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Html position={[0, 0.2, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          color: tech.color,
          whiteSpace: 'nowrap',
          letterSpacing: '0.5px',
          textShadow: `0 0 6px ${tech.color}`,
        }}>
          {tech.name}
        </div>
      </Html>
    </group>
  )
}

function OrbitRing({ radius, color }) {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.03
    }
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function TechOrbit({ techStack, color }) {
  const radius = 1.8

  return (
    <group>
      <OrbitRing radius={radius} color={color} />
      <OrbitRing radius={radius + 0.4} color={color} />
      {techStack.map((tech, i) => (
        <TechItem
          key={tech.name}
          tech={tech}
          index={i}
          total={techStack.length}
          radius={radius}
        />
      ))}
    </group>
  )
}
