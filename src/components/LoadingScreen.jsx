import { motion } from 'framer-motion'

function LoadingScreen() {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">Loading Songs</h2>
        <p className="loading-subtitle">Connecting to database...</p>
      </div>
    </motion.div>
  )
}

export default LoadingScreen