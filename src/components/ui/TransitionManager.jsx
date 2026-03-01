import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'

export default function TransitionManager() {
  const transitioning = useStore((s) => s.transitioning)
  const transitionType = useStore((s) => s.transitionType)
  const [glitchLines, setGlitchLines] = useState([])

  useEffect(() => {
    if (transitioning && transitionType === 'glitch') {
      const lines = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        width: 30 + Math.random() * 70,
        left: Math.random() * 30,
        height: 1 + Math.random() * 3,
        delay: Math.random() * 0.15,
        duration: 0.1 + Math.random() * 0.2,
      }))
      setGlitchLines(lines)
    }
  }, [transitioning, transitionType])

  return (
    <>
      <AnimatePresence>
        {transitioning && transitionType === 'glitch' && (
          <motion.div
            className="transition-overlay glitch-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {glitchLines.map((line) => (
              <motion.div
                key={line.id}
                className="glitch-line"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: [0, 1, 0.6, 0] }}
                transition={{
                  delay: line.delay,
                  duration: line.duration,
                  ease: 'easeOut',
                }}
                style={{
                  top: `${line.top}%`,
                  left: `${line.left}%`,
                  width: `${line.width}%`,
                  height: `${line.height}px`,
                }}
              />
            ))}
            <motion.div
              className="glitch-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitioning && transitionType === 'sweep' && (
          <motion.div
            className="transition-overlay sweep-overlay"
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            animate={{ scaleX: [0, 1, 1, 0], transformOrigin: ['left', 'left', 'right', 'right'] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="transition-scanline"
            initial={{ top: '-5%' }}
            animate={{ top: '105%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
