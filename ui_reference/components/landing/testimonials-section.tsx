"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote: "GrievanceIQ reduced our average resolution time from 7 days to just 24 hours. Citizens can now track their complaints in real-time.",
    author: "Dr. Sarah Chen",
    role: "Secretary, Ministry of Urban Development",
    org: "Federal Government",
  },
  {
    quote: "The AI categorization is incredibly accurate. Our officers spend less time sorting and more time solving real problems.",
    author: "Michael Torres",
    role: "Director of Citizen Services",
    org: "Metro City Council",
  },
  {
    quote: "We processed over 500,000 complaints last year with a 98% satisfaction rate. This platform transformed our department.",
    author: "Priya Sharma",
    role: "Chief Technology Officer",
    org: "State IT Department",
  },
  {
    quote: "The transparency features have rebuilt trust between citizens and local government. Complaints are no longer black holes.",
    author: "James Okonkwo",
    role: "Municipal Commissioner",
    org: "Central District",
  },
  {
    quote: "Integration was seamless. Within weeks, we had all channels unified and our team was more productive than ever.",
    author: "Elena Rodriguez",
    role: "Head of Digital Services",
    org: "Regional Administration",
  },
  {
    quote: "The analytics dashboard helps us identify systemic issues before they become crises. Proactive governance is now possible.",
    author: "David Kim",
    role: "Deputy Secretary",
    org: "Public Works Department",
  },
]

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let startTime: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      
      if (!isPaused) {
        scrollContainer.scrollLeft += 0.5
        
        // Reset scroll when reaching the end
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0
        }
      }
      
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [isPaused])

  // Duplicate testimonials for infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="py-24 lg:py-32 bg-card/30 border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Trusted by government leaders
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See how agencies worldwide are transforming citizen services with GrievanceIQ
          </p>
        </motion.div>
      </div>

      {/* Scrolling Testimonials */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex-shrink-0 w-[350px] md:w-[450px]"
          >
            <div className="h-full p-8 rounded-2xl border border-border bg-background hover:border-muted-foreground/30 transition-colors">
              <Quote className="w-10 h-10 text-muted-foreground/30 mb-4" />
              <p className="text-foreground leading-relaxed mb-6">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold">
                  {testimonial.author.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.org}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
