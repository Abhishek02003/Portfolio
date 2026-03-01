import { motion } from 'framer-motion'

export default function SystemHUD() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false })
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })

  return (
    <motion.div
      className="system-hud"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5, duration: 1 }}
    >
      <div className="hud-top-left">
        <div className="hud-label">ABHISHEK.OS</div>
        <div className="hud-sublabel">CYBER ENGINEER WORKSPACE</div>
      </div>

      <div className="hud-top-right">
        <div className="hud-stat">
          <span className="stat-label">STATUS</span>
          <span className="stat-value online">ONLINE</span>
        </div>
        <div className="hud-stat">
          <span className="stat-label">NODE</span>
          <span className="stat-value">ALPHA-7</span>
        </div>
      </div>

      <div className="hud-bottom-left">
        <div className="hud-coords">
          <span className="coord-label">SYS.TIME</span>
          <span className="coord-value">{timeStr}</span>
        </div>
      </div>

      <div className="hud-scan-line" />
    </motion.div>
  )
}
