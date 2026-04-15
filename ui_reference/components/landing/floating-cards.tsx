"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"
import { AlertCircle, CheckCircle, Clock, TrendingUp, Users, MessageSquare, Zap, Shield } from "lucide-react"

const cards = [
  {
    icon: AlertCircle,
    title: "New Complaint",
    subtitle: "Water Supply Issue",
    status: "urgent",
    position: { top: "12%", left: "3%" },
    delay: 0,
    rotation: -12,
  },
  {
    icon: CheckCircle,
    title: "Resolved",
    subtitle: "Road Repair #4521",
    status: "success",
    position: { top: "20%", right: "5%" },
    delay: 0.2,
    rotation: 8,
  },
  {
    icon: Clock,
    title: "In Progress",
    subtitle: "Street Light #7823",
    status: "pending",
    position: { bottom: "35%", left: "2%" },
    delay: 0.4,
    rotation: -6,
  },
  {
    icon: TrendingUp,
    title: "Priority: High",
    subtitle: "Healthcare Access",
    status: "high",
    position: { bottom: "28%", right: "3%" },
    delay: 0.6,
    rotation: 10,
  },
  {
    icon: Users,
    title: "2.4K Citizens",
    subtitle: "Active Today",
    status: "info",
    position: { top: "45%", left: "5%" },
    delay: 0.8,
    rotation: -4,
  },
  {
    icon: MessageSquare,
    title: "Social Media",
    subtitle: "12 New Mentions",
    status: "info",
    position: { top: "38%", right: "2%" },
    delay: 1,
    rotation: 6,
  },
  {
    icon: Zap,
    title: "AI Processing",
    subtitle: "47 Auto-routed",
    status: "success",
    position: { top: "60%", right: "8%" },
    delay: 1.2,
    rotation: -8,
  },
  {
    icon: Shield,
    title: "SLA Met",
    subtitle: "99.2% Compliance",
    status: "success",
    position: { bottom: "15%", left: "8%" },
    delay: 1.4,
    rotation: 5,
  },
]

const statusColors = {
  urgent: "border-white/40",
  success: "border-white/30",
  pending: "border-white/20",
  high: "border-white/35",
  info: "border-white/15",
}

function Card3D({ card, index }: { card: (typeof cards)[0]; index: number }) {
  const Icon = card.icon
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const normalX = (e.clientX - centerX) / (window.innerWidth / 2)
      const normalY = (e.clientY - centerY) / (window.innerHeight / 2)
      mouseX.set(normalX * 0.3)
      mouseY.set(normalY * 0.3)
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.5, y: 80 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 1,
        delay: card.delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="absolute"
      style={{
        ...card.position,
        perspective: "1000px",
      }}
    >
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [card.rotation, card.rotation + 3, card.rotation],
        }}
        transition={{
          duration: 5 + index * 0.7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative cursor-pointer"
        whileHover={{ scale: 1.1, z: 50 }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute -inset-2 bg-white/10 rounded-2xl blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Card Shadow */}
        <div className="absolute inset-0 bg-black/40 blur-2xl rounded-2xl transform translate-y-6 translate-x-2 scale-90" />

        {/* Card */}
        <div
          className={`relative bg-gradient-to-br from-white/10 to-white/5 border ${
            statusColors[card.status as keyof typeof statusColors]
          } rounded-2xl p-4 backdrop-blur-xl shadow-2xl`}
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-white">{card.title}</p>
              <p className="text-xs text-white/50">{card.subtitle}</p>
            </div>
          </div>

          {/* Animated status indicator */}
          {card.status === "urgent" && (
            <motion.div
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Reflection */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 rounded-2xl pointer-events-none"
          style={{ transform: "translateZ(25px)" }}
        />
      </motion.div>
    </motion.div>
  )
}

export function FloatingCards() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block">
      {cards.map((card, index) => (
        <Card3D key={index} card={card} index={index} />
      ))}
    </div>
  )
}
