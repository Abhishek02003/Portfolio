import { useEffect, useRef, useCallback } from 'react'
import useStore from '../store/useStore'
import AmbientSynth from '../audio/AmbientSynth'

export default function useAudio() {
  const synthRef = useRef(null)
  const audioEnabled = useStore((s) => s.audioEnabled)
  const interacted = useStore((s) => s.interacted)

  useEffect(() => {
    synthRef.current = new AmbientSynth()
    return () => {
      if (synthRef.current) {
        synthRef.current.destroy()
      }
    }
  }, [])

  useEffect(() => {
    const synth = synthRef.current
    if (!synth) return

    if (audioEnabled && interacted) {
      synth.fadeIn(3)
    } else {
      synth.fadeOut(2)
    }
  }, [audioEnabled, interacted])

  const toggle = useCallback(() => {
    useStore.getState().toggleAudio()
  }, [])

  const playGlitch = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.playGlitchSFX()
    }
  }, [])

  return { toggle, playGlitch }
}
