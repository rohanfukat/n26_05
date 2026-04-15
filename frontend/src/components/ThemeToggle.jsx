import React from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-3 rounded-2xl bg-slate-900/90 dark:bg-slate-200/15 border border-slate-200/20 dark:border-slate-700/40 text-slate-100 dark:text-slate-200 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.45)] hover:bg-slate-800/95 dark:hover:bg-slate-200/25 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.35 }}
      >
        {isDark ? (
          <Moon className="h-5 w-5 text-sky-300" />
        ) : (
          <Sun className="h-5 w-5 text-amber-400" />
        )}
      </motion.div>
    </motion.button>
  )
}
