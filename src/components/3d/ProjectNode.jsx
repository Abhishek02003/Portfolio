import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/useStore'
import TechOrbit from './TechOrbit'

import holoVertex from '../../shaders/holoVertex.glsl?raw'
import holoFragment from '../../shaders/holoFragment.glsl?raw'

export default function ProjectNode({ project }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const glowRef = useRef()
  const [hovered, setHovered] = useState(false)
  const selectedProject = useStore((s) => s.selectedProject)
  const setSelectedProject = useStore((s) => s.setSelectedProject)
  const clearSelectedProject = useStore((s) => s.clearSelectedProject)

  const isSelected = selectedProject === project.id
  const hasSelection = selectedProject !== null

  const color = useMemo(() => new THREE.Color(project.color), [project.color])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: color },
    uSelected: { value: 0 },
    uHover: { value: 0 },
  }), [color])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (isSelected) {
      clearSelectedProject()
    } else {
      setSelectedProject(project.id)
    }
  }, [isSelected, project.id, setSelectedProject, clearSelectedProject])

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    document.body.style.cursor = 'crosshair'
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = t

      const targetHover = hovered ? 1.0 : 0.0
      meshRef.current.material.uniforms.uHover.value +=
        (targetHover - meshRef.current.material.uniforms.uHover.value) * 0.08

      const targetSelected = isSelected ? 1.0 : 0.0
      meshRef.current.material.uniforms.uSelected.value +=
        (targetSelected - meshRef.current.material.uniforms.uSelected.value) * 0.06
    }

    if (groupRef.current) {
      const baseY = project.position[1]
      groupRef.current.position.y = baseY + Math.sin(t * 0.8 + project.position[0]) * 0.3

      const targetScale = isSelected ? 1.6 : (hasSelection && !isSelected ? 0.6 : 1.0)
      const currentScale = groupRef.current.scale.x
      const newScale = currentScale + (targetScale - currentScale) * 0.04
      groupRef.current.scale.setScalar(newScale)
    }

    if (glowRef.current) {
      const glowIntensity = isSelected ? 4 : (hovered ? 2.5 : 1.5)
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, glowIntensity, 0.05)
    }
  })

  return (
    <group
      ref={groupRef}
      position={project.position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.8, 4]} />
        <shaderMaterial
          vertexShader={holoVertex}
          fragmentShader={holoFragment}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshBasicMaterial
          color={project.color}
          transparent
          opacity={0.08}
          wireframe
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Html position={[0, -1.4, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          color: project.color,
          letterSpacing: '2px',
          textShadow: `0 0 10px ${project.color}`,
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          {project.name}
        </div>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '8px',
          color: '#888',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          marginTop: '4px',
        }}>
          {project.tagline}
        </div>
      </Html>

      <pointLight
        ref={glowRef}
        position={[0, 0, 0]}
        intensity={1.5}
        color={project.color}
        distance={8}
        decay={2}
      />

      {isSelected && <TechOrbit techStack={project.techStack} color={project.color} />}
    </group>
  )
}
