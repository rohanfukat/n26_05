import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUser } from '../context/UserContext'
import AnimatedBackground from './AnimatedBackground'
import DarkBackground from './DarkBackground'
import Notifications from './Notifications'
import Button from './ui/Button'
import CitizenNav from './CitizenNav'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useNavigation } from '../context/NavigationContext'

const CITIZEN_ROUTES = ['/complaint', '/user-dashboard', '/neighborhood', '/complaint/']

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

  React.useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); nav.goBack() }
      if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); nav.goForward() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nav])

  const isCitizenRoute = CITIZEN_ROUTES.some(r => location.pathname === r || location.pathname.startsWith(r))

  return (
    <div className="relative h-screen w-full bg-[#080808] text-zinc-100 overflow-hidden flex flex-col">
      {showGlobe ? <AnimatedBackground /> : <DarkBackground />}

      {/* Top bar â€” full width */}
      <div className="relative z-50 w-full">
        {/* Back / Forward â€” fixed top-left */}
        <div className="fixed top-3 left-3 z-[60] flex items-center gap-1.5">
          <button
            aria-label="Back"
            onClick={() => nav.goBack()}
            disabled={!nav.canGoBack()}
            style={{ borderRadius: '0.4rem' }}
            className={`h-8 w-8 flex items-center justify-center border transition-colors duration-150 ${
              nav.canGoBack()
                ? 'bg-zinc-800 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-40'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            aria-label="Forward"
            onClick={() => nav.goForward()}
            disabled={!nav.canGoForward()}
            style={{ borderRadius: '0.4rem' }}
            className={`h-8 w-8 flex items-center justify-center border transition-colors duration-150 ${
              nav.canGoForward()
                ? 'bg-zinc-800 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-40'
            }`}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {showNav && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center justify-between px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md"
          >
            <div className="pl-14">
              <span className="text-lg font-semibold tracking-tight text-white">GrievanceFlow</span>
            </div>

            <div className="flex items-center gap-3">
              <Notifications />
              {isAuthenticated && (
                <Button type="button" size="sm" variant="secondary" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </div>
          </motion.nav>
        )}

        {/* Citizen sub-nav — always same position on citizen routes */}
        {showNav && isCitizenRoute && (
          <div className="px-6 py-2 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-md">
            <CitizenNav />
          </div>
        )}
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full flex-1 min-h-0 flex flex-col overflow-y-auto"
      >
        {children}
      </motion.main>
    </div>
  )
}
