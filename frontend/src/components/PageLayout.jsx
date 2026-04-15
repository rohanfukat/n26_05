import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'
import AnimatedBackground from './AnimatedBackground'
import DarkBackground from './DarkBackground'
import ThemeToggle from './ThemeToggle'
import Notifications from './Notifications'
import Button from './ui/Button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

export default function PageLayout({
  children,
  showNav = true,
}) {
  const { isAuthenticated, logout } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const GLOBE_ROUTES = ['/', '/role-selection']
  const showGlobe = GLOBE_ROUTES.includes(location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/')
    rea
  }
  const nav = useNavigation()

  // keyboard shortcuts: Alt+Left = back, Alt+Right = forward
  React.useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        nav.goBack()
      }
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault()
        nav.goForward()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nav])
  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {showGlobe ? <AnimatedBackground /> : <DarkBackground />}

      <div className="relative z-50 mx-auto w-full max-w-7xl px-4">
        {/* Chrome-like back/forward controls at top-left */}
        <div className="fixed top-4 left-4 z-60 flex items-center gap-2">
          <button
            aria-label="Back"
            onClick={() => nav.goBack()}
            disabled={!nav.canGoBack()}
            className={`h-9 w-9 rounded-full flex items-center justify-center shadow-md transition-colors ${nav.canGoBack() ? 'bg-white hover:bg-slate-100 dark:bg-slate-800' : 'bg-slate-200 dark:bg-slate-800/60 opacity-50 cursor-not-allowed'}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Forward"
            onClick={() => nav.goForward()}
            disabled={!nav.canGoForward()}
            className={`h-9 w-9 rounded-full flex items-center justify-center shadow-md transition-colors ${nav.canGoForward() ? 'bg-white hover:bg-slate-100 dark:bg-slate-800' : 'bg-slate-200 dark:bg-slate-800/60 opacity-50 cursor-not-allowed'}`}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {showNav && (
          <motion.nav
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-700/60 py-5"
          >
            <div className="space-y-1">
              <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                GrievanceFlow
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Formal grievance management for trusted institutions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Notifications />
              <ThemeToggle />
              {isAuthenticated && (
                <Button type="button" size="sm" variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </div>
          </motion.nav>
        )}
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex-1"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
