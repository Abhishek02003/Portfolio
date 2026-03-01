import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'

const bootMessages = [
  'BOOTING ABHISHEK.OS v2.0...',
  'LOADING NEURAL CORES...',
  'INITIALIZING 3D ENGINE...',
  'CONNECTING DATA NODES...',
  'CALIBRATING WORKSPACE...',
  'SYSTEM READY.',
]

export default function LoadingScreen() {
  const isLoaded = useStore((s) => s.isLoaded)
  const [visible, setVisible] = useState(true)
  const [currentLine, setCurrentLine] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const charIndexRef = useRef(0)

  useEffect(() => {
    if (currentLine >= bootMessages.length) return

    charIndexRef.current = 0
    setDisplayText('')

    const interval = setInterval(() => {
      const msg = bootMessages[currentLine]
      if (charIndexRef.current < msg.length) {
        setDisplayText(msg.slice(0, charIndexRef.current + 1))
        charIndexRef.current++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setCurrentLine((prev) => prev + 1)
        }, 50)
      }
    }, 5)

    return () => clearInterval(interval)
  }, [currentLine])

  useEffect(() => {
    if (isLoaded && currentLine >= bootMessages.length) {
      const timer = setTimeout(() => setVisible(false), 600)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, currentLine])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <div className="loading-container">
            <div className="loading-logo">
              <span className="logo-bracket">[</span>
              <span className="logo-text">ABHISHEK.OS</span>
              <span className="logo-bracket">]</span>
            </div>

            <div className="boot-log">
              {bootMessages.slice(0, currentLine).map((msg, i) => (
                <div key={i} className="boot-line completed">
                  <span className="boot-prefix">&gt;</span> {msg}
                </div>
              ))}
              {currentLine < bootMessages.length && (
                <div className="boot-line active">
                  <span className="boot-prefix">&gt;</span> {displayText}
                  <span className="cursor-blink">_</span>
                </div>
              )}
            </div>

            <div className="loading-bar-container">
              <motion.div
                className="loading-bar"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min((currentLine / bootMessages.length) * 100, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="loading-status">
              {currentLine < bootMessages.length ? 'INITIALIZING SYSTEM...' : 'LAUNCHING WORKSPACE...'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
