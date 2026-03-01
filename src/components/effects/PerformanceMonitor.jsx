import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore from '../../store/useStore'

let qualityDowngraded = false

export default function PerformanceMonitor() {
  const frameTimesRef = useRef([])
  const lastCheckRef = useRef(0)
  const lowFpsCountRef = useRef(0)

  const downgradeQuality = useCallback(() => {
    if (qualityDowngraded) return
    qualityDowngraded = true
    const store = useStore.getState()
    if (store.setPerformanceMode) {
      store.setPerformanceMode('low')
    }
  }, [])

  useFrame((state) => {
    const now = state.clock.elapsedTime
    const delta = state.clock.getDelta ? 1 / 60 : state.clock.elapsedTime - (frameTimesRef.current[frameTimesRef.current.length - 1] || now)

    frameTimesRef.current.push(now)

    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift()
    }

    if (now - lastCheckRef.current > 2 && frameTimesRef.current.length >= 30) {
      lastCheckRef.current = now
      const times = frameTimesRef.current
      const avgDelta = (times[times.length - 1] - times[0]) / (times.length - 1)
      const avgFps = 1 / avgDelta

      if (avgFps < 24) {
        lowFpsCountRef.current++
        if (lowFpsCountRef.current >= 2) {
          downgradeQuality()
        }
      } else {
        lowFpsCountRef.current = Math.max(0, lowFpsCountRef.current - 1)
      }
    }
  })

  return null
}
