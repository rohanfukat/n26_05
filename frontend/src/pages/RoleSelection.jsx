import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Shield } from 'lucide-react'

// ── Particle Background (copied style) ──
function ParticleField() {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, opacity: 0.4 }}
    />
  )
}

export default function RoleSelection() {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'user',
      title: 'Citizen',
      description: 'File complaints, track progress, and receive updates.',
      icon: Users,
      path: '/user-auth',
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage complaints and oversee resolution workflows.',
      icon: Shield,
      path: '/admin-auth',
    },
  ]

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white relative flex items-center justify-center">

      {/* Background */}
      <ParticleField />

      {/* Gradient Orbs */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-6 max-w-5xl w-full"
      >
        {/* Heading */}
        <h2 className="text-5xl font-bold mb-4 tracking-tight">
          Choose your role
        </h2>
        <p className="text-white/60 mb-12">
          Select how you want to access the platform
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <motion.div
                key={role.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(role.path)}
                className="cursor-pointer rounded-2xl p-8 backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl hover:bg-white/10 transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 p-4 rounded-xl bg-white/10">
                    <Icon size={28} />
                  </div>

                  <h3 className="text-2xl font-semibold mb-2">
                    {role.title}
                  </h3>

                  <p className="text-white/60 text-sm">
                    {role.description}
                  </p>

                  <motion.div
                    className="mt-6 text-sm font-semibold"
                    animate={{ x: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Continue →
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}