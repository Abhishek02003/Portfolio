import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/useStore'
import { detectMobile } from '../../utils/deviceDetect'

function generateNetworkData(layerConfig) {
  const nodes = []
  const edges = []
  let nodeIndex = 0
  const layerSpacing = 2.2
  const totalWidth = (layerConfig.length - 1) * layerSpacing

  layerConfig.forEach((count, layerIdx) => {
    const x = layerIdx * layerSpacing - totalWidth / 2
    const layerNodes = []

    for (let i = 0; i < count; i++) {
      const ySpread = (count - 1) * 0.6
      const y = i * 0.6 - ySpread / 2
      const z = (Math.random() - 0.5) * 1.5

      layerNodes.push({
        id: nodeIndex,
        position: [x, y, z],
        layer: layerIdx / (layerConfig.length - 1),
        activation: Math.random(),
      })
      nodeIndex++
    }
    nodes.push(...layerNodes)

    if (layerIdx > 0) {
      const prevLayerStart = nodes.length - count - layerConfig[layerIdx - 1]
      const prevLayerEnd = nodes.length - count

      for (let i = 0; i < count; i++) {
        const currentNode = nodes[prevLayerEnd + i]
        const connectionCount = Math.min(3, layerConfig[layerIdx - 1])

        const prevIndices = Array.from({ length: layerConfig[layerIdx - 1] }, (_, k) => k)
        for (let c = prevIndices.length - 1; c > 0; c--) {
          const j = Math.floor(Math.random() * (c + 1));
          [prevIndices[c], prevIndices[j]] = [prevIndices[j], prevIndices[c]]
        }

        for (let c = 0; c < connectionCount; c++) {
          const prevNode = nodes[prevLayerStart + prevIndices[c]]
          edges.push({
            from: prevNode.position,
            to: currentNode.position,
            speed: 0.3 + Math.random() * 0.7,
          })
        }
      }
    }
  })

  return { nodes, edges }
}

function NeuralNodes({ nodes }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const { nodeIndices, layers, activations } = useMemo(() => {
    const nodeIndices = new Float32Array(nodes.length)
    const layers = new Float32Array(nodes.length)
    const activations = new Float32Array(nodes.length)

    nodes.forEach((node, i) => {
      nodeIndices[i] = node.id
      layers[i] = node.layer
      activations[i] = node.activation
    })

    return { nodeIndices, layers, activations }
  }, [nodes])

  useEffect(() => {
    if (!meshRef.current) return

    nodes.forEach((node, i) => {
      dummy.position.set(...node.position)
      dummy.scale.setScalar(0.08)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [nodes, dummy])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWaveOrigin: { value: 0 },
    uWaveProgress: { value: 0 },
  }), [])

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime
      meshRef.current.material.uniforms.uTime.value = t
      meshRef.current.material.uniforms.uWaveProgress.value = (t * 0.15) % 1.2

      nodes.forEach((node, i) => {
        const wavePos = (t * 0.15) % 1.2
        const distFromWave = Math.abs(node.layer - wavePos)
        const wave = Math.exp(-distFromWave * distFromWave * 8)
        const activation = node.activation * (0.5 + wave * 0.5)

        dummy.position.set(
          node.position[0],
          node.position[1] + Math.sin(t * 0.5 + node.id * 0.3) * 0.05,
          node.position[2]
        )
        dummy.scale.setScalar(0.08 + activation * 0.04 + wave * 0.03)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      })
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, nodes.length]}>
      <icosahedronGeometry args={[1, 2]} />
      <meshBasicMaterial
        color="#00ff88"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

function NeuralEdges({ edges }) {
  const linesRef = useRef()

  const geometry = useMemo(() => {
    const positions = []
    const progresses = []
    const speeds = []

    edges.forEach((edge) => {
      const segments = 10
      for (let i = 0; i < segments; i++) {
        const t1 = i / segments
        const t2 = (i + 1) / segments

        const x1 = edge.from[0] + (edge.to[0] - edge.from[0]) * t1
        const y1 = edge.from[1] + (edge.to[1] - edge.from[1]) * t1
        const z1 = edge.from[2] + (edge.to[2] - edge.from[2]) * t1

        const x2 = edge.from[0] + (edge.to[0] - edge.from[0]) * t2
        const y2 = edge.from[1] + (edge.to[1] - edge.from[1]) * t2
        const z2 = edge.from[2] + (edge.to[2] - edge.from[2]) * t2

        positions.push(x1, y1, z1, x2, y2, z2)
        progresses.push(t1, t2)
        speeds.push(edge.speed, edge.speed)
      }
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('aEdgeProgress', new THREE.Float32BufferAttribute(progresses, 1))
    geo.setAttribute('aEdgeSpeed', new THREE.Float32BufferAttribute(speeds, 1))
    return geo
  }, [edges])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), [])

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={`
          uniform float uTime;
          attribute float aEdgeProgress;
          attribute float aEdgeSpeed;
          varying float vProgress;
          varying float vSpeed;
          void main() {
            vProgress = aEdgeProgress;
            vSpeed = aEdgeSpeed;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying float vProgress;
          varying float vSpeed;
          void main() {
            vec3 matrixGreen = vec3(0.0, 1.0, 0.53);
            vec3 dimGreen = vec3(0.0, 0.15, 0.08);
            float dataPulse = exp(-pow((fract(vProgress - uTime * vSpeed * 0.4) - 0.5) * 5.0, 2.0));
            float baseDim = 0.15;
            float glow = baseDim + dataPulse * 0.85;
            vec3 color = mix(dimGreen, matrixGreen, glow);
            float alpha = 0.06 + glow * 0.35;
            gl_FragColor = vec4(color, alpha);
          }
        `}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

export default function NeuralNetwork() {
  const groupRef = useRef()
  const isMobile = detectMobile()
  const selectedProject = useStore((s) => s.selectedProject)
  const selectedNeural = useStore((s) => s.selectedNeural)

  const layerConfig = useMemo(() => {
    if (isMobile) return [4, 6, 8, 6, 4, 3]
    return [6, 10, 14, 12, 10, 8, 5, 3]
  }, [isMobile])

  const { nodes, edges } = useMemo(() => generateNetworkData(layerConfig), [layerConfig])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02
      const targetOpacity = selectedProject && !selectedNeural ? 0.3 : 1.0
      groupRef.current.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = THREE.MathUtils.lerp(child.material.opacity || 1, targetOpacity, 0.05)
        }
      })
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    const store = useStore.getState()
    if (store.selectedNeural) {
      store.clearSelectedNeural()
    } else {
      store.setSelectedNeural(true)
      store.setSelectedProject(null)
    }
  }

  return (
    <group
      ref={groupRef}
      position={[-8, -2, -4]}
      rotation={[0.1, 0.3, 0]}
      scale={1.2}
      onClick={handleClick}
    >
      <NeuralNodes nodes={nodes} />
      <NeuralEdges edges={edges} />

      <mesh visible={false} onClick={handleClick}>
        <sphereGeometry args={[5, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Html position={[0, -4, 0]} center distanceFactor={12}>
        <div
          style={{
            cursor: 'pointer',
            userSelect: 'none',
            textAlign: 'center',
          }}
          onClick={(e) => {
            e.stopPropagation()
            const store = useStore.getState()
            if (store.selectedNeural) {
              store.clearSelectedNeural()
            } else {
              store.setSelectedNeural(true)
              store.setSelectedProject(null)
            }
          }}
        >
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            color: '#00ff88',
            letterSpacing: '2px',
            textShadow: '0 0 12px rgba(0, 255, 136, 0.6)',
            whiteSpace: 'nowrap',
          }}>
            NEURAL CORE
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '7px',
            color: '#666',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            marginTop: '3px',
          }}>
            IBM SkillBuild AI
          </div>
        </div>
      </Html>

      <pointLight
        position={[0, 0, 2]}
        intensity={1.5}
        color="#00ff88"
        distance={12}
        decay={2}
      />
    </group>
  )
}
