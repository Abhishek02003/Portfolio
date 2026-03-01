import { Suspense, lazy, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import useStore from './store/useStore'
import { getQualitySettings, detectMobile } from './utils/deviceDetect'

const SpaceEnvironment = lazy(() => import('./components/3d/SpaceEnvironment'))
const ParticleField = lazy(() => import('./components/3d/ParticleField'))
const LightBeams = lazy(() => import('./components/3d/LightBeams'))
const CameraRig = lazy(() => import('./components/3d/CameraRig'))
const CentralOrb = lazy(() => import('./components/3d/CentralOrb'))
const ProjectNodes = lazy(() => import('./components/3d/ProjectNodes'))
const NeuralNetwork = lazy(() => import('./components/3d/NeuralNetwork'))
const SkillTerminal = lazy(() => import('./components/3d/SkillTerminal'))
const CircuitTimeline = lazy(() => import('./components/3d/CircuitTimeline'))
const PostProcessing = lazy(() => import('./components/effects/PostProcessing'))
const PerformanceMonitor = lazy(() => import('./components/effects/PerformanceMonitor'))

import LoadingScreen from './components/ui/LoadingScreen'
import AudioToggle from './components/ui/AudioToggle'
import SystemHUD from './components/ui/SystemHUD'
import ProjectDetailPanel from './components/ui/ProjectDetailPanel'
import NeuralNetworkPanel from './components/ui/NeuralNetworkPanel'
import TransitionManager from './components/ui/TransitionManager'

function SceneReady() {
  const setLoaded = useStore((s) => s.setLoaded)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(), 500)
    return () => clearTimeout(timer)
  }, [setLoaded])

  return null
}

function ForceLoadTimeout() {
  const setLoaded = useStore((s) => s.setLoaded)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useStore.getState().isLoaded) {
        setLoaded()
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [setLoaded])

  return null
}

export default function App() {
  const settings = getQualitySettings()
  const setInteracted = useStore((s) => s.setInteracted)
  const enableAudio = useStore((s) => s.enableAudio)
  const interacted = useStore((s) => s.interacted)
  const setMobile = useStore((s) => s.setMobile)

  useEffect(() => {
    setMobile(detectMobile())
  }, [setMobile])

  const handleFirstInteraction = useCallback(() => {
    if (!interacted) {
      setInteracted()
      enableAudio()
    }
  }, [interacted, setInteracted, enableAudio])

  return (
    <div
      className="app-container"
      onClick={handleFirstInteraction}
      onKeyDown={handleFirstInteraction}
    >
      <Canvas
        dpr={settings.dpr}
        camera={{ position: [12, 2, 0], fov: 60, near: 0.1, far: 200 }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          <SpaceEnvironment />
          <ParticleField />
          <CentralOrb />
        </Suspense>

        <Suspense fallback={null}>
          <ProjectNodes />
          <NeuralNetwork />
          <SkillTerminal />
          <CircuitTimeline />
        </Suspense>

        <Suspense fallback={null}>
          <LightBeams />
          <CameraRig />
          <PostProcessing />
          <PerformanceMonitor />
        </Suspense>

        <SceneReady />
      </Canvas>

      <ForceLoadTimeout />

      <LoadingScreen />
      <SystemHUD />
      <ProjectDetailPanel />
      <NeuralNetworkPanel />
      <TransitionManager />
      <AudioToggle />
    </div>
  )
}
