import React from 'react'
import { motion } from 'framer-motion'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  ...props
}) {
  const base = 'font-semibold transition-all duration-200 flex items-center justify-center gap-2 outline-none focus-visible:ring-1 focus-visible:ring-zinc-400/40'

  const variants = {
    primary:   'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600/60 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_6px_28px_rgba(255,255,255,0.06)] hover:border-zinc-500/60',
    secondary: 'bg-zinc-900 text-zinc-200 border border-zinc-700/60 hover:bg-zinc-800 hover:border-zinc-500/60',
    ghost:     'text-zinc-300 hover:bg-zinc-800/60',
    admin:     'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600/60',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
    xl: 'px-9 py-4 text-lg',
  }

  return (
    <motion.button
      style={{ borderRadius: '0.4rem' }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={!isLoading ? { scale: 1.03 } : {}}
      whileTap={!isLoading ? { scale: 0.97 } : {}}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
