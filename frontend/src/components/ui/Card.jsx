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
        whileHover: { scale: 1.02, y: -4 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.3 },
      }
    : {}

  return (
    <motion.div
      className={`relative rounded-[28px] backdrop-blur-2xl ${interactive ? 'cursor-pointer' : ''} bg-white/85 dark:bg-slate-950/75 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.25)] dark:shadow-[0_30px_80px_-35px_rgba(0,0,0,0.55)] ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  )
}
