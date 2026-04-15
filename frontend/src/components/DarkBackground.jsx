import React, { useEffect, useRef } from 'react'

export default function DarkBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let w, h

    const particles = []
    const PARTICLE_COUNT = 90

    function resize() {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    function randomBetween(a, b) {
      return a + Math.random() * (b - a)
    }

    function init() {
      particles.length = 0
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: randomBetween(0, w),
          y: randomBetween(0, h),
          r: randomBetween(0.4, 1.6),
          vx: randomBetween(-0.12, 0.12),
          vy: randomBetween(-0.12, 0.12),
          alpha: randomBetween(0.25, 0.75),
          pulse: randomBetween(0, Math.PI * 2),
          pulseSpeed: randomBetween(0.003, 0.009),
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)

      // Base deep dark gradient
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.85)
      bg.addColorStop(0, '#0a0f1e')
      bg.addColorStop(0.45, '#060c18')
      bg.addColorStop(1, '#020408')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Aurora blob — top-left teal
      const a1 = ctx.createRadialGradient(w * 0.12, h * 0.18, 0, w * 0.12, h * 0.18, w * 0.38)
      a1.addColorStop(0, 'rgba(20,184,166,0.11)')
      a1.addColorStop(0.55, 'rgba(6,182,212,0.06)')
      a1.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = a1
      ctx.fillRect(0, 0, w, h)

      // Aurora blob — center-right indigo
      const a2 = ctx.createRadialGradient(w * 0.78, h * 0.32, 0, w * 0.78, h * 0.32, w * 0.42)
      a2.addColorStop(0, 'rgba(99,102,241,0.13)')
      a2.addColorStop(0.5, 'rgba(139,92,246,0.07)')
      a2.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = a2
      ctx.fillRect(0, 0, w, h)

      // Aurora blob — bottom-center blue
      const a3 = ctx.createRadialGradient(w * 0.48, h * 0.88, 0, w * 0.48, h * 0.88, w * 0.35)
      a3.addColorStop(0, 'rgba(59,130,246,0.10)')
      a3.addColorStop(0.6, 'rgba(37,99,235,0.05)')
      a3.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = a3
      ctx.fillRect(0, 0, w, h)

      // Fine grid mesh overlay
      ctx.save()
      ctx.strokeStyle = 'rgba(99,102,241,0.04)'
      ctx.lineWidth = 0.5
      const gridSize = 48
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }
      ctx.restore()

      // Star-dust particles
      for (const p of particles) {
        p.pulse += p.pulseSpeed
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(186,230,253,${a})`
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.x < -2) p.x = w + 2
        if (p.x > w + 2) p.x = -2
        if (p.y < -2) p.y = h + 2
        if (p.y > h + 2) p.y = -2
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()

    window.addEventListener('resize', () => { resize(); init() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', () => { resize(); init() })
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle top vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Horizontal scan-line texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  )
}
