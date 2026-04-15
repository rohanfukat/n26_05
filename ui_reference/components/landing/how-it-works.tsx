"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Upload, Brain, Route, CheckCircle, BarChart } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Aggregate",
    description: "Complaints flow in from web portals, mobile apps, social media, call centers, and physical offices into a single unified inbox.",
  },
  {
    number: "02",
    icon: Brain,
    title: "Analyze",
    description: "Our AI engine automatically categorizes complaints, detects urgency signals, and identifies patterns across submissions.",
  },
  {
    number: "03",
    icon: Route,
    title: "Route",
    description: "Smart routing assigns each complaint to the right department and officer based on category, location, and workload.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Resolve",
    description: "Officers work through prioritized queues with all context at hand. Citizens receive real-time updates at every stage.",
  },
  {
    number: "05",
    icon: BarChart,
    title: "Improve",
    description: "Analytics dashboards reveal trends, bottlenecks, and opportunities. Continuous learning improves accuracy over time.",
  },
]

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"])

  return (
    <section className="py-24 lg:py-32 overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance">
            From complaint to resolution
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A seamless end-to-end workflow that transforms how governments handle citizen grievances
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-border lg:-translate-x-px">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-foreground origin-top"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isLeft = index % 2 === 0

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex items-center gap-8 ${
                    isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Content */}
                  <div className={`flex-1 pl-20 lg:pl-0 ${isLeft ? "lg:pr-16 lg:text-right" : "lg:pl-16"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="inline-block"
                    >
                      <span className="text-6xl lg:text-8xl font-bold text-border">
                        {step.number}
                      </span>
                    </motion.div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-foreground mt-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 max-w-md inline-block leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Icon Node */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="absolute left-8 lg:left-1/2 lg:-translate-x-1/2 z-10"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-background border-2 border-foreground flex items-center justify-center shadow-xl">
                        <Icon className="w-7 h-7 text-foreground" />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-foreground/20 blur-xl" />
                    </div>
                  </motion.div>

                  {/* Empty space for alignment */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
