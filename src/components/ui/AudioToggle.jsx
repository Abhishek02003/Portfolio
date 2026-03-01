import { useRef, useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import useAudio from '../../hooks/useAudio'

export default function AudioToggle() {
  const audioEnabled = useStore((s) => s.audioEnabled)
  const { toggle } = useAudio()
  const [bars, setBars] = useState([0.3, 0.5, 0.7, 0.4, 0.6])

  useEffect(() => {
    if (!audioEnabled) return
    const interval = setInterval(() => {
      setBars((prev) => prev.map(() => 0.2 + Math.random() * 0.8))
    }, 200)
    return () => clearInterval(interval)
  }, [audioEnabled])

  return (
    <motion.button
      className="audio-toggle"
      onClick={toggle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={audioEnabled ? 'Mute Audio' : 'Enable Audio'}
    >
      <div className="audio-icon">
        {audioEnabled ? (
          <div className="audio-bars">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                className="audio-bar"
                animate={{ scaleY: h }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              />
            ))}
          </div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </div>
      <span className="audio-label">{audioEnabled ? 'ON' : 'OFF'}</span>
    </motion.button>
  )
}
