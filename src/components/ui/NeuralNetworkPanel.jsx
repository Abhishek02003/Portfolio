import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'

const skills = [
  { name: 'Machine Learning', level: 90 },
  { name: 'Deep Learning', level: 82 },
  { name: 'Neural Networks', level: 88 },
  { name: 'NLP', level: 75 },
  { name: 'Computer Vision', level: 70 },
  { name: 'Python / TensorFlow', level: 85 },
]

const highlights = [
  'Completed IBM SkillBuild AI/ML curriculum',
  'Built supervised & unsupervised ML models',
  'Applied neural networks to real-world problems',
  'Bridged theory → full-stack AI applications',
]

export default function NeuralNetworkPanel() {
  const selectedNeural = useStore((s) => s.selectedNeural)
  const clearSelectedNeural = useStore((s) => s.clearSelectedNeural)

  return (
    <AnimatePresence>
      {selectedNeural && (
        <motion.div
          className="project-panel neural-panel"
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <button className="panel-close" onClick={clearSelectedNeural}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="panel-header">
            <div
              className="panel-dot"
              style={{ background: '#00ff88', boxShadow: '0 0 12px rgba(0, 255, 136, 0.6)' }}
            />
            <div>
              <h2 className="panel-title" style={{ color: '#00ff88' }}>
                Neural Core
              </h2>
              <p className="panel-tagline">IBM SkillBuild AI Internship</p>
            </div>
          </div>

          <p className="panel-description">
            Completed IBM SkillBuild's intensive AI/ML program — mastering machine learning theoretical
            concepts and translating them into practical full-stack AI applications.
          </p>

          <div className="panel-section">
            <div className="section-label">KEY HIGHLIGHTS</div>
            <div className="neural-highlights">
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  className="highlight-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                >
                  <span className="highlight-arrow">▹</span>
                  <span>{h}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <div className="section-label">AI / ML SKILLS</div>
            <div className="skills-list">
              {skills.map((skill, i) => (
                <div key={skill.name} className="skill-row">
                  <div className="skill-info">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-percent">{skill.level}%</span>
                  </div>
                  <div className="skill-bar-bg">
                    <motion.div
                      className="skill-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ delay: 0.15 * i + 0.5, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-divider" style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent)' }} />

          <div className="panel-footer">
            <span className="panel-node-id">NODE.NEURAL</span>
            <span className="panel-status" style={{ color: '#00ff88' }}>● ACTIVE</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
