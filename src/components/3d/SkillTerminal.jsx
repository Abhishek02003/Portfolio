import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/useStore'
import { terminalCommands } from '../../data/terminalCommands'

function useTypingAnimation() {
  const [displayedLines, setDisplayedLines] = useState([])
  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const startedRef = useRef(false)
  const audioEnabled = useStore((s) => s.audioEnabled)
  const typeSoundRef = useRef(null)

  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      typeSoundRef.current = audioCtx
    } catch (e) {}
    return () => {
      if (typeSoundRef.current) typeSoundRef.current.close()
    }
  }, [])

  const playTypeSound = useCallback(() => {
    if (!audioEnabled || !typeSoundRef.current) return
    try {
      const ctx = typeSoundRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800 + Math.random() * 400
      osc.type = 'square'
      gain.gain.value = 0.015
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.05)
    } catch (e) {}
  }, [audioEnabled])

  const startTyping = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    setIsTyping(true)
  }, [])

  useEffect(() => {
    if (!isTyping || isComplete) return

    const cmd = terminalCommands[currentLine]
    if (!cmd) {
      setIsComplete(true)
      return
    }

    if (cmd.final) {
      setDisplayedLines((prev) => [...prev, { type: cmd.type, text: '> ', isCurrent: true }])
      setIsComplete(true)
      return
    }

    if (cmd.type === 'blank') {
      setDisplayedLines((prev) => [...prev, { type: 'blank', text: '' }])
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1)
        setCurrentChar(0)
      }, 200)
      return () => clearTimeout(timer)
    }

    if (cmd.type === 'output') {
      setDisplayedLines((prev) => [...prev, { type: 'output', text: cmd.text }])
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1)
        setCurrentChar(0)
      }, 80 + Math.random() * 60)
      return () => clearTimeout(timer)
    }

    if (cmd.type === 'command') {
      if (currentChar === 0) {
        setDisplayedLines((prev) => [...prev, { type: 'command', text: '', isCurrent: true }])
      }

      if (currentChar < cmd.text.length) {
        const timer = setTimeout(() => {
          setDisplayedLines((prev) => {
            const updated = [...prev]
            const last = updated.length - 1
            updated[last] = { ...updated[last], text: cmd.text.slice(0, currentChar + 1) }
            return updated
          })
          playTypeSound()
          setCurrentChar((c) => c + 1)
        }, cmd.delay + Math.random() * 20)
        return () => clearTimeout(timer)
      } else {
        setDisplayedLines((prev) => {
          const updated = [...prev]
          const last = updated.length - 1
          updated[last] = { ...updated[last], isCurrent: false }
          return updated
        })
        const timer = setTimeout(() => {
          setCurrentLine((l) => l + 1)
          setCurrentChar(0)
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [isTyping, isComplete, currentLine, currentChar, playTypeSound])

  return { displayedLines, startTyping, isComplete }
}

export default function SkillTerminal() {
  const groupRef = useRef()
  const isLoaded = useStore((s) => s.isLoaded)
  const selectedProject = useStore((s) => s.selectedProject)
  const selectedNeural = useStore((s) => s.selectedNeural)
  const { displayedLines, startTyping, isComplete } = useTypingAnimation()
  const terminalRef = useRef()

  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(startTyping, 2000)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, startTyping])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [displayedLines])

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime
      groupRef.current.position.y = 2 + Math.sin(t * 0.4) * 0.15

      const pointer = state.pointer
      const targetRotX = -pointer.y * 0.06
      const targetRotY = pointer.x * 0.08
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.03
      groupRef.current.rotation.y += (targetRotY + 0.2 - groupRef.current.rotation.y) * 0.03

      const hasFocus = selectedProject || selectedNeural
      const targetScale = hasFocus ? 0.5 : 1.0
      const currentScale = groupRef.current.scale.x
      groupRef.current.scale.setScalar(currentScale + (targetScale - currentScale) * 0.04)
    }
  })

  return (
    <group ref={groupRef} position={[8, 2, -5]}>
      <Html
        transform
        distanceFactor={6}
        position={[0, 0, 0]}
        rotation={[0, -0.3, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="skill-terminal">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="terminal-title">abhishek@workspace ~ skills</span>
            <div className="terminal-dots" style={{ visibility: 'hidden' }}>
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
          <div className="terminal-body" ref={terminalRef}>
            {displayedLines.map((line, i) => {
              if (line.type === 'blank') {
                return <div key={i} className="term-line blank">&nbsp;</div>
              }
              if (line.type === 'command') {
                return (
                  <div key={i} className="term-line command">
                    <span className="term-text">{line.text}</span>
                    {line.isCurrent && <span className="term-cursor">█</span>}
                  </div>
                )
              }
              return (
                <div key={i} className="term-line output">
                  <span className="term-text">{line.text}</span>
                </div>
              )
            })}
            {isComplete && displayedLines.length > 0 && (
              <div className="term-line command">
                <span className="term-cursor blink">█</span>
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  )
}
