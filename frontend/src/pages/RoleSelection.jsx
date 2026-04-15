import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Shield } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'

export default function RoleSelection() {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  }

  const roles = [
    {
      id: 'user',
      title: 'Citizen',
      description: 'File complaints, track progress, and receive official updates.',
      icon: Users,
      accent: 'from-slate-900 to-slate-700',
      path: '/user-auth',
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage complaints, assign priorities, and oversee resolution teams.',
      icon: Shield,
      accent: 'from-indigo-700 to-sky-600',
      path: '/admin-auth',
    },
  ]

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <motion.div
          className="max-w-6xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-14">
            <div className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-950/80 shadow-sm">
              Select the workflow that matches your role
            </div>
            <h2 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
              Choose your access path
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              The secure portal is tailored to citizens and administrators with distinct guardrails and clear task flows.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <motion.div
                  key={role.id}
                  variants={itemVariants}
                  className="group"
                >
                  <Card
                    interactive
                    className="h-full p-8 md:p-10 flex flex-col justify-between"
                    onClick={() => navigate(role.path)}
                  >
                    <div>
                      <motion.div
                        className={`inline-flex items-center justify-center rounded-3xl px-4 py-3 mb-6 bg-gradient-to-r ${role.accent} text-white shadow-lg shadow-slate-900/10`}
                        whileHover={{ scale: 1.02, rotate: 2 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>

                      <h3 className="text-3xl font-semibold text-slate-950 dark:text-slate-100 mb-3">
                        {role.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    <motion.div
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                    >
                      Continue
                      <span>→</span>
                    </motion.div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
