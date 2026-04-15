"use client"

import { useRef, useState } from "react"
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Layers, Brain, Zap, Shield, BarChart3, Globe, ArrowUpRight, Sparkles } from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Multi-Channel Aggregation",
    description: "Collect complaints from web portals, mobile apps, social media, and call centers into a unified dashboard.",
    highlight: "Unified inbox",
    gradient: "from-white/20 to-white/5",
  },
  {
    icon: Brain,
    title: "AI-Powered Categorization",
    description: "Automatically classify and route complaints using machine learning trained on millions of past cases.",
    highlight: "98% accuracy",
    gradient: "from-white/15 to-white/5",
  },
  {
    icon: Zap,
    title: "Smart Priority Assignment",
    description: "Prioritize based on urgency, location density, historical patterns, and potential impact.",
    highlight: "Real-time",
    gradient: "from-white/20 to-white/5",
  },
  {
    icon: Shield,
    title: "Transparent Tracking",
    description: "Give citizens real-time visibility into their complaint status with automated updates.",
    highlight: "Full transparency",
    gradient: "from-white/15 to-white/5",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics for identifying trends, bottlenecks, and improvement opportunities.",
    highlight: "Actionable insights",
    gradient: "from-white/20 to-white/5",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Process complaints in 20+ languages with automatic translation and sentiment analysis.",
    highlight: "Global reach",
    gradient: "from-white/15 to-white/5",
  },
]

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const Icon = feature.icon
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="group relative"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        animate={{ opacity: isHovered ? 0.5 : 0 }}
      />

      {/* Card */}
      <div
        className={`relative h-full p-8 rounded-3xl border border-white/10 bg-gradient-to-b ${feature.gradient} backdrop-blur-xl overflow-hidden`}
        style={{ transform: "translateZ(0)" }}
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />

        {/* Sparkle effect on hover */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
          className="absolute top-4 right-4"
        >
          <Sparkles className="w-5 h-5 text-white/40" />
        </motion.div>

        {/* Icon with 3D transform */}
        <motion.div
          className="relative w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors duration-300"
          style={{ transform: "translateZ(30px)" }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
        </motion.div>

        {/* Highlight Badge */}
        <motion.span
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 bg-white/10 px-3 py-1.5 rounded-full mb-4"
          style={{ transform: "translateZ(20px)" }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {feature.highlight}
        </motion.span>

        {/* Content */}
        <h3
          className="text-2xl font-bold text-white mb-3 flex items-center gap-2 group-hover:gap-3 transition-all"
          style={{ transform: "translateZ(15px)" }}
        >
          {feature.title}
          <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
        </h3>
        <p className="text-white/50 leading-relaxed group-hover:text-white/70 transition-colors" style={{ transform: "translateZ(10px)" }}>
          {feature.description}
        </p>

        {/* Bottom shine effect */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  )
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section id="platform" ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] border border-white/5 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 250, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] border border-white/5 rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-20"
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block text-sm font-medium text-white/50 uppercase tracking-widest mb-4"
          >
            Platform Capabilities
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="block"
            >
              Built for scale.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="block text-white/40"
            >
              Designed for impact.
            </motion.span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-lg text-white/50 max-w-2xl"
          >
            The platform for rapid resolution. Let your team focus on solving problems
            instead of managing tickets with automated workflows and AI assistance.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
