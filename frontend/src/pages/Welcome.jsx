import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Button from '../components/ui/Button'

export default function Welcome() {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  }

  return (
    <PageLayout showNav={false}>
      <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
        <motion.div
          className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center max-w-7xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-8">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 bg-white/85 dark:bg-slate-900/80 shadow-sm">
                Secure governance, streamlined resolution
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold tracking-tight leading-tight text-slate-950 dark:text-slate-100"
            >
              Formal grievance management built for institutions.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-lg text-slate-600 dark:text-slate-400"
            >
              GrievanceFlow helps public agencies capture, prioritize, and resolve complaints with clarity, accountability and elegant reporting.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              <Button size="lg" onClick={() => navigate('/role-selection')}>
                Get Started
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/analytics')}>
                Explore Analytics
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Institution-ready', desc: 'Polished workflows for compliance and case tracking' },
                { title: 'Trusted transparency', desc: 'Every complaint logged with audit-ready detail' },
                { title: 'Priority-led action', desc: 'Risk-based assignment and escalation built in' },
                { title: 'Modern reporting', desc: 'Clear dashboards for leadership and officers' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 dark:border-slate-700/70 bg-white/90 dark:bg-slate-950/80 p-6 shadow-[0_26px_70px_-40px_rgba(15,23,42,0.2)]">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="relative rounded-[32px] border border-slate-200 dark:border-slate-700/70 bg-slate-950/90 p-8 shadow-[0_36px_90px_-45px_rgba(15,23,42,0.35)]">
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-full bg-gradient-to-r from-sky-500 to-indigo-500" />
            <div className="relative space-y-6 pt-8">
              <div className="text-sm uppercase tracking-[0.28em] text-sky-300">Governance portal</div>
              <div>
                <p className="text-slate-300 text-lg font-semibold">Built for structured public sector workflows and executive oversight.</p>
              </div>
              <div className="grid gap-4">
                {[
                  'Case intake & categorization',
                  'Transparent complaint lifecycle',
                  'Role-based administrative controls',
                  'Rich analytics for hotspots',
                ].map((text) => (
                  <div key={text} className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4">
                    <p className="text-sm text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
