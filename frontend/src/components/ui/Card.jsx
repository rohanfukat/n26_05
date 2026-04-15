import React from 'react'
import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  interactive = false,
  ...props
}) {
  const motionProps = interactive
    ? {
        whileHover: { scale: 1.02, y: -3 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2, ease: 'easeOut' },
      }
    : {}

  return (
    <motion.div
      style={{ borderRadius: '0.4rem' }}
      className={`relative backdrop-blur-sm ${
        interactive ? 'cursor-pointer' : ''
      } bg-zinc-900/80 border border-zinc-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:border-zinc-500/60 transition-colors duration-200 ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  )
}
