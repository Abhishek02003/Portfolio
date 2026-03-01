import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'
import { getQualitySettings } from '../../utils/deviceDetect'
import useStore from '../../store/useStore'

export default function PostProcessing() {
  const settings = useMemo(() => getQualitySettings(), [])
  const chromaticRef = useRef()
  const bloomRef = useRef()
  const vignetteRef = useRef()

  useFrame(() => {
    const transitioning = useStore.getState().transitioning
    const performanceMode = useStore.getState().performanceMode

    if (bloomRef.current) {
      const baseBloom = performanceMode === 'low' ? settings.bloomIntensity * 0.5 : settings.bloomIntensity
      const targetIntensity = transitioning ? baseBloom * 2.0 : baseBloom
      bloomRef.current.intensity += (targetIntensity - bloomRef.current.intensity) * 0.08
    }

    if (chromaticRef.current) {
      const targetOffset = transitioning ? 0.004 : 0.0006
      const current = chromaticRef.current.offset.x
      const newVal = current + (targetOffset - current) * 0.1
      chromaticRef.current.offset.set(newVal, newVal)
    }

    if (vignetteRef.current) {
      const targetDarkness = transitioning ? 0.9 : 0.7
      vignetteRef.current.darkness += (targetDarkness - vignetteRef.current.darkness) * 0.08
    }
  })

  if (!settings.enablePostProcessing) return null

  return (
    <EffectComposer multisampling={0}>
      {settings.enableBloom && (
        <Bloom
          ref={bloomRef}
          intensity={settings.bloomIntensity}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.95}
          mipmapBlur
        />
      )}
      {settings.enableVignette && (
        <Vignette
          ref={vignetteRef}
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
      )}
      {settings.enableChromatic && (
        <ChromaticAberration
          ref={chromaticRef}
          offset={new Vector2(0.0006, 0.0006)}
          blendFunction={BlendFunction.NORMAL}
          radialModulation={false}
          modulationOffset={0.5}
        />
      )}
    </EffectComposer>
  )
}
