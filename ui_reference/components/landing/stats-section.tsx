"use client"

import { useRef } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useCountUp } from "@/hooks/use-count-up"

const stats = [
  {
    value: 98,
    suffix: "%",
    label: "Resolution Rate",
    description: "Complaints resolved within SLA",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    value: 24,
    suffix: "hrs",
    label: "Avg Response",
    description: "Down from 7 days manual",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    value: 1.2,
    suffix: "M+",
    label: "Processed",
    description: "Across all channels",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: 500,
    suffix: "+",
    label: "Agencies",
    description: "Government departments",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
]

function StatCard({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const count = useCountUp(stat.value, isInView, 2000)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -10 }}
      className="relative group"
    >
      {/* Card background with gradient border */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] bg-background rounded-3xl" />

      <div className="relative p-8 lg:p-10">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
          className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-white/70 group-hover:text-white group-hover:bg-white/20 transition-all duration-300"
        >
          {stat.icon}
        </motion.div>

        {/* Counter with glowing effect */}
        <div className="relative">
          <motion.div
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-3 tracking-tight"
            initial={{ scale: 0.5 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 + 0.4 }}
          >
            <span className="relative">
              {count.toFixed(stat.value % 1 !== 0 ? 1 : 0)}
              {stat.suffix}
              {/* Glow effect on hover */}
              <motion.span
                className="absolute inset-0 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                style={{ background: "white" }}
              />
            </span>
          </motion.div>
        </div>

        <p className="text-xl font-semibold text-white mb-2">{stat.label}</p>
        <p className="text-sm text-white/40">{stat.description}</p>

        {/* Animated progress bar */}
        <motion.div
          className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden"
          initial={{ width: 0 }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: index * 0.15 + 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-white/40 to-white rounded-full"
            initial={{ width: "0%" }}
            whileInView={{ width: `${Math.min(stat.value, 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: index * 0.15 + 0.7 }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100])

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Animated background */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)`,
          }}
        />
      </motion.div>

      {/* Glowing orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.1, 0.15] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/2 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-white/50 uppercase tracking-widest mb-4"
          >
            Proven Impact
          </motion.span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-balance leading-tight">
            Numbers that speak
            <br />
            <span className="text-white/50">for themselves</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
