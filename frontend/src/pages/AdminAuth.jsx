import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, Lock, Shield } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useUser } from '../context/UserContext'

export default function AdminAuth() {
  const navigate = useNavigate()
  const { login, isAuthenticated, error, clearError } = useUser()
  const [formData, setFormData] = useState({
    emailOrId: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin-dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.emailOrId) newErrors.emailOrId = 'Email or Employee ID is required'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const result = await login(formData.emailOrId, formData.password, 'admin')
      if (result.success) {
        toast.success('Login Successful')
        setTimeout(() => {
          navigate('/admin-dashboard')
        }, 800)
      } else {
        toast.error(result.error || 'Login failed.')
        setErrors({ form: result.error })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="overflow-hidden p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-slate-950/30"
            >
              <Shield className="h-4 w-4" />
              Admin Portal
            </motion.div>

            <motion.div variants={itemVariants} className="mb-8">
              <div className="text-sm uppercase tracking-[0.28em] text-sky-500 dark:text-sky-300 mb-3">
                Secure access
              </div>
              <h2 className="text-4xl font-semibold text-slate-950 dark:text-slate-100 mb-3">
                Administrative Sign In
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                Access the management dashboard with your official credentials.
              </p>
            </motion.div>

            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Official Email or Employee ID"
                name="emailOrId"
                value={formData.emailOrId}
                onChange={handleChange}
                placeholder="admin@govt.in or ADM001"
                icon={Mail}
                error={errors.emailOrId}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                icon={Lock}
                error={errors.password}
              />
              <Button type="submit" className="w-full" loading={isLoading} variant="admin">
                Sign In
              </Button>
            </motion.form>

            <motion.div variants={itemVariants} className="mt-8 rounded-3xl border border-slate-200/70 bg-slate-50/90 p-4 text-sm text-slate-600 dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-400">
              Use your official employee ID and password for secure dashboard access.
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  )
}
