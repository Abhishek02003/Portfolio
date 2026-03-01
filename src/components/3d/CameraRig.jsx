import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { detectMobile } from '../../utils/deviceDetect'
import useStore from '../../store/useStore'
import { projectData } from '../../data/projectData'

const targetPosition = new THREE.Vector3()
const lookTarget = new THREE.Vector3()
const smoothLook = new THREE.Vector3()
const mouseTarget = new THREE.Vector2()
const currentMouse = new THREE.Vector2()

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function CameraRig() {
  const { camera } = useThree()
  const isMobile = detectMobile()
  const timeRef = useRef(0)
  const prevStateRef = useRef(null)
  const transitionProgress = useRef(1)
  const startPos = useRef(new THREE.Vector3())
  const startLook = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    timeRef.current += delta
    const storeState = useStore.getState()
    const { selectedProject, selectedNeural, selectedTimeline, transitioning } = storeState

    const currentState = selectedTimeline || selectedNeural || selectedProject || 'home'

    if (currentState !== prevStateRef.current) {
      startPos.current.copy(camera.position)
      camera.getWorldDirection(smoothLook)
      startLook.current.copy(camera.position).add(smoothLook.multiplyScalar(10))
      transitionProgress.current = 0
      prevStateRef.current = currentState
    }

    transitionProgress.current = Math.min(1, transitionProgress.current + delta * 1.2)
    const ease = easeInOutCubic(transitionProgress.current)
    const lerpSpeed = transitioning ? 0.01 : 0.02 + ease * 0.04

    if (selectedTimeline) {
      targetPosition.set(2, -2, 16)
      lookTarget.set(0, -4, 8)
    } else if (selectedNeural) {
      targetPosition.set(-4, 0, 2)
      lookTarget.set(-8, -2, -4)
    } else if (selectedProject) {
      const project = projectData.find((p) => p.id === selectedProject)
      if (project) {
        const nodePos = new THREE.Vector3(...project.position)
        const direction = nodePos.clone().normalize()
        const cameraOffset = nodePos.clone().add(direction.multiplyScalar(4))
        cameraOffset.y += 1.5
        targetPosition.copy(cameraOffset)
        lookTarget.copy(nodePos)
      }
    } else {
      const t = timeRef.current * 0.08
      const radius = 12
      targetPosition.set(
        Math.sin(t) * radius,
        2 + Math.sin(t * 0.5) * 1.5,
        Math.cos(t) * radius
      )

      if (!isMobile) {
        const pointer = state.pointer
        mouseTarget.set(pointer.x, pointer.y)
        currentMouse.lerp(mouseTarget, 0.05)
        targetPosition.x += currentMouse.x * 1.5
        targetPosition.y += currentMouse.y * 0.8
      }

      lookTarget.set(0, 0, 0)
    }

    camera.position.lerp(targetPosition, lerpSpeed)

    if (currentState !== 'home') {
      const currentLook = new THREE.Vector3()
      camera.getWorldDirection(currentLook)
      camera.lookAt(
        THREE.MathUtils.lerp(camera.position.x + currentLook.x, lookTarget.x, lerpSpeed * 1.5),
        THREE.MathUtils.lerp(camera.position.y + currentLook.y, lookTarget.y, lerpSpeed * 1.5),
        THREE.MathUtils.lerp(camera.position.z + currentLook.z, lookTarget.z, lerpSpeed * 1.5)
      )
    } else {
      camera.lookAt(0, 0, 0)
    }
  })

  return null
}
