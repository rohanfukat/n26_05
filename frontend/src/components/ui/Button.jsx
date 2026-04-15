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
  const baseClasses = 'font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40'

  const variants = {
    primary: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white shadow-[0_18px_45px_-20px_rgba(15,23,42,0.45)] hover:shadow-[0_22px_55px_-30px_rgba(15,23,42,0.5)]',
    secondary: 'bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800',
    ghost: 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800',
    admin: 'bg-gradient-to-r from-indigo-700 to-sky-600 text-white shadow-[0_18px_45px_-20px_rgba(59,130,246,0.45)] hover:shadow-[0_22px_55px_-30px_rgba(59,130,246,0.5)]',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
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
