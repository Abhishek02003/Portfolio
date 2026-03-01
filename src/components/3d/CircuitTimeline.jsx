import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/useStore'
import { timelineMilestones } from '../../data/timelineData'
import { detectMobile } from '../../utils/deviceDetect'

function createCircuitPath() {
  const points = [
    new THREE.Vector3(-6, 0, 0),
    new THREE.Vector3(-4, 0, 1),
    new THREE.Vector3(-2, 0.5, 0),
    new THREE.Vector3(0, 0.5, -1),
    new THREE.Vector3(2, 1, 0),
    new THREE.Vector3(4, 0.5, 1),
    new THREE.Vector3(6, 0, 0),
  ]
  return new THREE.CatmullRomCurve3(points)
}

function CircuitPath({ curve }) {
  const lineRef = useRef()
  const pulseRef1 = useRef()
  const pulseRef2 = useRef()
  const pulseRef3 = useRef()

  const lineGeometry = useMemo(() => {
    const points = curve.getPoints(200)
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [curve])

  const branchGeometries = useMemo(() => {
    const branches = []
    timelineMilestones.forEach((m) => {
      const pos = curve.getPoint(m.position)
      const branchPoints = [
        pos.clone(),
        pos.clone().add(new THREE.Vector3(0, 1.2, 0)),
      ]
      branches.push(new THREE.BufferGeometry().setFromPoints(branchPoints))
    })
    return branches
  }, [curve])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulses = [pulseRef1, pulseRef2, pulseRef3]
    pulses.forEach((ref, i) => {
      if (ref.current) {
        const progress = ((t * 0.15 + i * 0.33) % 1.0)
        const pos = curve.getPoint(progress)
        ref.current.position.copy(pos)
        const glowScale = 0.8 + Math.sin(t * 4 + i) * 0.3
        ref.current.scale.setScalar(glowScale)
      }
    })
  })

  return (
    <group>
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      <line geometry={lineGeometry}>
        <lineBasicMaterial
          color="#00d4ff"
          transparent
          opacity={0.08}
          linewidth={2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </line>

      {branchGeometries.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial
            color={timelineMilestones[i].color}
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </line>
      ))}

      {[pulseRef1, pulseRef2, pulseRef3].map((ref, i) => (
        <mesh key={i} ref={ref}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      <pointLight position={[0, 0.5, 0]} intensity={0.8} color="#00d4ff" distance={15} decay={2} />
    </group>
  )
}

function MilestoneNode({ milestone, curve }) {
  const groupRef = useRef()
  const dotRef = useRef()
  const [hovered, setHovered] = useState(false)
  const pathPos = useMemo(() => curve.getPoint(milestone.position), [curve, milestone.position])
  const panelPos = useMemo(() => pathPos.clone().add(new THREE.Vector3(0, 1.6, 0)), [pathPos])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = panelPos.y + Math.sin(t * 0.6 + milestone.position * 10) * 0.08
    }
    if (dotRef.current) {
      const pulse = 0.7 + Math.sin(t * 2 + milestone.position * 8) * 0.3
      dotRef.current.scale.setScalar(pulse)
    }
  })

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    const store = useStore.getState()
    if (store.selectedTimeline === milestone.id) {
      store.clearSelectedTimeline()
    } else {
      store.setSelectedTimeline(milestone.id)
    }
  }, [milestone.id])

  return (
    <group>
      <mesh ref={dotRef} position={pathPos}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial
          color={milestone.color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        position={pathPos}
        intensity={hovered ? 2 : 0.8}
        color={milestone.color}
        distance={4}
        decay={2}
      />

      <group ref={groupRef} position={panelPos}>
        <Html center distanceFactor={10}>
          <div
            className="timeline-card"
            style={{ borderColor: `${milestone.color}30` }}
            onClick={handleClick}
            onMouseEnter={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
            onMouseLeave={() => { setHovered(false); document.body.style.cursor = 'crosshair' }}
          >
            <div className="tl-icon">{milestone.icon}</div>
            <div className="tl-content">
              <div className="tl-title" style={{ color: milestone.color }}>
                {milestone.title}
              </div>
              <div className="tl-subtitle">{milestone.subtitle}</div>
              <div className="tl-detail">{milestone.detail}</div>
            </div>
            <div className="tl-year" style={{ color: milestone.color }}>{milestone.year}</div>
          </div>
        </Html>
      </group>
    </group>
  )
}

export default function CircuitTimeline() {
  const groupRef = useRef()
  const isMobile = detectMobile()
  const selectedProject = useStore((s) => s.selectedProject)
  const selectedNeural = useStore((s) => s.selectedNeural)

  const curve = useMemo(() => createCircuitPath(), [])

  useFrame(() => {
    if (groupRef.current) {
      const hasFocus = selectedProject || selectedNeural
      const targetScale = hasFocus ? 0.4 : 1.0
      const s = groupRef.current.scale.x
      groupRef.current.scale.setScalar(s + (targetScale - s) * 0.04)
    }
  })

  return (
    <group ref={groupRef} position={[0, -5, 8]} rotation={[0, 0.4, 0]}>
      <CircuitPath curve={curve} />
      {timelineMilestones.map((milestone) => (
        <MilestoneNode key={milestone.id} milestone={milestone} curve={curve} />
      ))}
    </group>
  )
}
