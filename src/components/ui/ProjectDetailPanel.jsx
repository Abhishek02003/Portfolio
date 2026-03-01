import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import { projectData } from '../../data/projectData'

function AnimatedCounter({ value, duration = 1500 }) {
  const [display, setDisplay] = useState('0')
  const numMatch = value.match(/^([\d.]+)(.*)$/)

  useEffect(() => {
    if (!numMatch) {
      setDisplay(value)
      return
    }
    const target = parseFloat(numMatch[1])
    const suffix = numMatch[2]
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * target * 10) / 10

      if (Number.isInteger(target)) {
        setDisplay(Math.round(eased * target) + suffix)
      } else {
        setDisplay(current.toFixed(1) + suffix)
      }

      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span className="metric-value">{display}</span>
}

export default function ProjectDetailPanel() {
  const selectedProject = useStore((s) => s.selectedProject)
  const clearSelectedProject = useStore((s) => s.clearSelectedProject)

  const project = projectData.find((p) => p.id === selectedProject)

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key={project.id}
          className="project-panel"
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <button className="panel-close" onClick={clearSelectedProject}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="panel-header">
            <div
              className="panel-dot"
              style={{ background: project.color, boxShadow: `0 0 12px ${project.color}` }}
            />
            <div>
              <h2 className="panel-title" style={{ color: project.color }}>
                {project.name}
              </h2>
              <p className="panel-tagline">{project.tagline}</p>
            </div>
          </div>

          <p className="panel-description">{project.description}</p>

          <div className="panel-section">
            <div className="section-label">TECH STACK</div>
            <div className="tech-tags">
              {project.techStack.map((tech) => (
                <span
                  key={tech.name}
                  className="tech-tag"
                  style={{ borderColor: tech.color, color: tech.color }}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <div className="section-label">METRICS</div>
            <div className="metrics-grid">
              {project.metrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <span className="metric-icon">{metric.icon}</span>
                  <AnimatedCounter value={metric.value} />
                  <span className="metric-label">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-divider" style={{ background: `linear-gradient(90deg, transparent, ${project.color}40, transparent)` }} />

          <div className="panel-footer">
            <span className="panel-node-id">NODE.{project.id.toUpperCase()}</span>
            <span className="panel-status" style={{ color: project.color }}>● ACTIVE</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
