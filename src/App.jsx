import { useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import useStore from './store/useStore'
import { getQualitySettings, detectMobile } from './utils/deviceDetect'

import SpaceEnvironment from './components/3d/SpaceEnvironment'
import ParticleField from './components/3d/ParticleField'
import LightBeams from './components/3d/LightBeams'
import CameraRig from './components/3d/CameraRig'
import CentralOrb from './components/3d/CentralOrb'
import ProjectNodes from './components/3d/ProjectNodes'
import NeuralNetwork from './components/3d/NeuralNetwork'
import SkillTerminal from './components/3d/SkillTerminal'
import CircuitTimeline from './components/3d/CircuitTimeline'
import PostProcessing from './components/effects/PostProcessing'
import PerformanceMonitor from './components/effects/PerformanceMonitor'

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
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
      >
        <SpaceEnvironment />
        <ParticleField />
        <CentralOrb />

        <ProjectNodes />
        <NeuralNetwork />
        <SkillTerminal />
        <CircuitTimeline />

        <LightBeams />
        <CameraRig />
        <PostProcessing />
        <PerformanceMonitor />

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
