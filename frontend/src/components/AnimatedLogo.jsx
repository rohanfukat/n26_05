import React from 'react'
import { motion } from 'framer-motion'

export default function AnimatedLogo() {
  return (
    <motion.div style={{ position: 'relative', width: 40, height: 40 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <motion.div
        style={{ position: 'absolute', inset: 0, borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        style={{ position: 'absolute', inset: 6, background: 'white', borderRadius: 8 }}
        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </motion.div>
      <motion.div
        style={{ position: 'absolute', inset: -4, background: 'rgba(255,255,255,0.2)', borderRadius: 16, filter: 'blur(12px)' }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}
