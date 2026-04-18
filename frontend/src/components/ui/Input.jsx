import React from 'react'
import { motion } from 'framer-motion'

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  as,
  ...props
}) {
  const isTextarea = as === 'textarea'
  const Component = isTextarea ? 'textarea' : 'input'

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold uppercase tracking-[0.03em] text-slate-600 dark:text-slate-400 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-4 h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
        )}
        <Component
          className={`w-full px-5 py-4 ${Icon ? 'pl-12' : ''} rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-300/10 transition-all duration-300 ${isTextarea ? 'resize-y text-start align-top' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
