import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import AnimatedLogoShared from '../components/AnimatedLogo'
import {
  Sparkles, ArrowRight, Play, AlertCircle, CheckCircle,
  Clock, TrendingUp, Users, MessageSquare, Zap, Shield,
  ChevronDown, Menu, X
} from 'lucide-react'

// ── CSS Variables & Global Styles ─────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    :root {
      --background: oklch(0.08 0 0);
      --foreground: oklch(0.98 0 0);
      --card: oklch(0.12 0 0);
      --border: oklch(0.25 0 0);
      --muted-foreground: oklch(0.65 0 0);
      --radius: 0.75rem;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { min-height: 100%; min-width: 100%; height: 100%; width: 100%; overflow: hidden; }
    body { background: var(--background); color: var(--foreground); font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; min-width: 100vw; overflow: hidden; }
    @keyframes ping {
      75%, 100% { transform: scale(2); opacity: 0; }
    }
    .animate-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
  `}</style>
)
// ── Particle Field ─────────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    particlesRef.current = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.45 + 0.2,
    }))

    const onMouseMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy
        const dx = mouseRef.current.x - p.x
        const dy = mouseRef.current.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = (150 - dist) / 150
          p.vx -= (dx / dist) * force * 0.02
          p.vy -= (dy / dist) * force * 0.02
        }
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        p.vx *= 0.99; p.vy *= 0.99
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx.fill()
        particlesRef.current.slice(i + 1).forEach((o) => {
          const dx2 = p.x - o.x; const dy2 = p.y - o.y
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d2 < 90) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(o.x, o.y)
ctx.strokeStyle = `rgba(255,255,255,${0.09 * (1 - d2 / 90)})`
            ctx.stroke()
          }
        })
      })
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }}
    />
  )
}

// ── Floating Cards ─────────────────────────────────────────────────────────────
const floatingCards = [
  { icon: AlertCircle, title: 'New Complaint', subtitle: 'Water Supply Issue', status: 'urgent', position: { top: '12%', left: '3%' }, delay: 0, rotation: -12 },
  { icon: CheckCircle, title: 'Resolved', subtitle: 'Road Repair #4521', status: 'success', position: { top: '20%', right: '5%' }, delay: 0.2, rotation: 8 },
  { icon: Clock, title: 'In Progress', subtitle: 'Street Light #7823', status: 'pending', position: { bottom: '35%', left: '2%' }, delay: 0.4, rotation: -6 },
  { icon: TrendingUp, title: 'Priority: High', subtitle: 'Healthcare Access', status: 'high', position: { bottom: '28%', right: '3%' }, delay: 0.6, rotation: 10 },
  { icon: Users, title: '2.4K Citizens', subtitle: 'Active Today', status: 'info', position: { top: '45%', left: '5%' }, delay: 0.8, rotation: -4 },
  { icon: MessageSquare, title: 'Social Media', subtitle: '12 New Mentions', status: 'info', position: { top: '38%', right: '2%' }, delay: 1, rotation: 6 },
  { icon: Zap, title: 'AI Processing', subtitle: '47 Auto-routed', status: 'success', position: { top: '60%', right: '8%' }, delay: 1.2, rotation: -8 },
  { icon: Shield, title: 'SLA Met', subtitle: '99.2% Compliance', status: 'success', position: { bottom: '15%', left: '8%' }, delay: 1.4, rotation: 5 },
]

const statusBorder = {
  urgent: 'rgba(255,255,255,0.4)', success: 'rgba(255,255,255,0.3)',
  pending: 'rgba(255,255,255,0.2)', high: 'rgba(255,255,255,0.35)', info: 'rgba(255,255,255,0.15)',
}

function Card3D({ card, index }) {
  const Icon = card.icon
  const rotateX = 0
  const rotateY = 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 80 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, delay: card.delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', ...card.position, perspective: '1000px' }}
    >
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [card.rotation, card.rotation + 3, card.rotation] }}
        transition={{ duration: 5 + index * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', position: 'relative', cursor: 'pointer' }}
        whileHover={{ scale: 1.1 }}
      >
        <motion.div
          style={{ position: 'absolute', inset: -8, background: 'rgba(255,255,255,0.1)', borderRadius: 16, filter: 'blur(16px)' }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
          filter: 'blur(20px)', borderRadius: 16, transform: 'translateY(24px) translateX(8px) scale(0.9)'
        }} />
        <div style={{
          position: 'relative', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          border: `1px solid ${statusBorder[card.status]}`, borderRadius: 16, padding: '16px',
          backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          transform: 'translateZ(20px)', minWidth: 160
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div
              style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Icon size={20} color="white" />
            </motion.div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{card.title}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{card.subtitle}</p>
            </div>
          </div>
          {card.status === 'urgent' && (
            <motion.div
              style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: 'white' }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function FloatingCards() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'none' }} className="lg-floating-cards">
      {floatingCards.map((card, i) => <Card3D key={i} card={card} index={i} />)}
    </div>
  )
}

// ── Animated Logo ──────────────────────────────────────────────────────────────
const AnimatedLogo = AnimatedLogoShared

// ── Header ─────────────────────────────────────────────────────────────────────
const navItems = [
  
]

function Header({ onGetStarted, onAnalytics }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 1])

  return (
    <>
      <style>{`
        @media (min-width: 1024px) {
          .lg-floating-cards { display: block !important; }
          .lg-nav { display: flex !important; }
          .lg-cta { display: flex !important; }
          .mobile-btn { display: none !important; }
        }
      `}</style>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        <motion.div
          style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', opacity: bgOpacity
          }}
        />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AnimatedLogo />
              <motion.span
                style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em', color: 'white' }}
                whileHover={{ letterSpacing: '0.05em' }}
                transition={{ duration: 0.3 }}
              >
                GrievanceFlow
              </motion.span>
            </div>

            <nav className="lg-nav" style={{ display: 'none', alignItems: 'center', gap: 4 }}>
              {navItems.map((item, i) => (
                <motion.div key={item.name} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px',
                    fontSize: 14, color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none',
                    cursor: 'pointer', borderRadius: 8, transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'none' }}
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown size={14} />}
                  </button>
                </motion.div>
              ))}
            </nav>

            <div className="lg-cta" style={{ display: 'none', alignItems: 'center', gap: 12 }}>
              <motion.button
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px',
                  background: 'white', color: 'black', border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', position: 'relative', overflow: 'hidden'
                }}
              >
                <motion.span
                  style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <Sparkles size={16} style={{ position: 'relative', zIndex: 1 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>Get Started</span>
              </motion.button>
            </div>

            <motion.button
              className="mobile-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ padding: 8, color: 'white', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mobileOpen
                  ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X size={24} /></motion.div>
                  : <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu size={24} /></motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 40 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 360, background: 'rgba(0,0,0,0.95)', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '96px 24px 24px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {navItems.map((item, i) => (
                  <motion.div key={item.name} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ delay: i * 0.05 }}>
                    <button onClick={() => setMobileOpen(false)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                      padding: '16px 0', fontSize: 20, color: 'white', background: 'none', border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                    }}>
                      {item.name}
                      {item.hasDropdown && <ChevronDown size={20} color="rgba(255,255,255,0.4)" />}
                    </button>
                  </motion.div>
                ))}
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ delay: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
                <button onClick={onGetStarted} style={{ height: 48, background: 'white', color: 'black', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>Get Started</button>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Main Welcome Page ──────────────────────────────────────────────────────────
const cyclingWords = ['resolution', 'transparency', 'efficiency', 'trust']

export default function Welcome() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [wordIndex, setWordIndex] = useState(0)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 300])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 100])

  const springCfg = { damping: 25, stiffness: 150 }
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), springCfg)
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), springCfg)

  useEffect(() => {
    const id = setInterval(() => setWordIndex(p => (p + 1) % cyclingWords.length), 2500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [mouseX, mouseY])

  return (
    <>
      <GlobalStyles />
      <main style={{ height: '100vh', minHeight: '100vh', minWidth: '100vw', width: '100%', background: 'var(--background)', color: 'var(--foreground)', overflow: 'hidden' }}>
        <Header onGetStarted={() => navigate('/role-selection')} onAnalytics={() => navigate('/analytics')} />

        {/* Hero Section */}
        <section
          ref={containerRef}
          style={{ position: 'relative', height: '100vh', minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 96, overflow: 'hidden' }}
        >
          <ParticleField />

          {/* Animated Orbs */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <motion.div
              animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', top: '25%', left: '25%', width: 384, height: 384, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(48px)' }}
            />
            <motion.div
              animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1.2, 1, 1.2] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', bottom: '25%', right: '25%', width: 384, height: 384, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(48px)' }}
            />
          </div>

          {/* Grid Background */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <motion.div style={{ position: 'absolute', inset: 0, y: gridY }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
                backgroundSize: '80px 80px'
              }} />
            </motion.div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(20,20,20,0.5), rgb(20,20,20))' }} />
          </div>

          <FloatingCards />

          {/* Main Content */}
          <motion.div
            style={{ y: parallaxY, opacity: heroOpacity, scale: heroScale, rotateX, rotateY, position: 'relative', zIndex: 10, maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', marginBottom: 32, borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
            >
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={16} color="white" />
              </motion.span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Secure governance, Whatsapp-integrated solution
              </span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}
              >
                <span className="animate-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'white', opacity: 0.75 }} />
                <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
              </motion.span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'white' }}
            >
              <span style={{ display: 'block' }}>Citizen grievance management for</span>
              <span style={{ display: 'inline-block', marginTop: 8, position: 'relative' }}>
                {' '}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ y: 40, opacity: 0, rotateX: -90 }}
                    animate={{ y: 0, opacity: 1, rotateX: 0 }}
                    exit={{ y: -40, opacity: 0, rotateX: 90 }}
                    transition={{ duration: 0.5 }}
                    style={{ display: 'inline-block', background: 'linear-gradient(135deg, white, rgba(255,255,255,0.8))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {cyclingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
                <motion.div
                  layoutId="underline"
                  style={{ position: 'absolute', bottom: -8, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, white, transparent)', borderRadius: 999, boxShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                />
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ marginTop: 32, fontSize: 'clamp(16px, 2.5vw, 22px)', color: 'rgba(255,255,255,0.6)', maxWidth: 640, margin: '32px auto 0', lineHeight: 1.7 }}
            >
              GrievanceFlow helps public agencies capture, prioritize, and resolve complaints with clarity, accountability and elegant reporting.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 48 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/role-selection')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '16px 32px',
                  background: 'white', color: 'black', border: 'none', borderRadius: 12,
                  fontSize: 16, fontWeight: 600, cursor: 'pointer', position: 'relative', overflow: 'hidden'
                }}
              >
                <motion.span
                  style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Get Started
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowRight size={18} />
                  </motion.span>
                </span>
              </motion.button>

              {/* <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/analytics')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '16px 32px',
                  background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 12, fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(8px)',
                  transition: 'border-color 0.2s'
                }}
                onHoverStart={e => e.target.style && (e.target.style.borderColor = 'rgba(255,255,255,0.4)')}
                onHoverEnd={e => e.target.style && (e.target.style.borderColor = 'rgba(255,255,255,0.2)')}
              >
                <Play size={16} fill="currentColor" />
                Explore Analytics
              </motion.button> */}
            </motion.div>

          </motion.div>

          {/* Bottom Fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 192, background: 'linear-gradient(to top, rgb(20,20,20) 0%, rgba(20,20,20,0.8) 50%, transparent 100%)', pointerEvents: 'none' }} />
        </section>
      </main>
    </>
  )
}