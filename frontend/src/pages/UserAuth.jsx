import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Lock, MapPin } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useUser } from '../context/UserContext'

export default function UserAuth() {
  const navigate = useNavigate()
  const { login, register, isAuthenticated, error, clearError } = useUser()

  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    // Login fields
    emailOrPhone: '',
    password: '',
    rememberMe: false,
    // Register fields
    fullName: '',
    email: '',
    phone: '',
    confirmPassword: '',
    city: '',
    pinCode: '',
  })

  // Redirect if already authenticated as user
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user-dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (mode === 'login') {
      if (!formData.emailOrPhone) newErrors.emailOrPhone = 'Email or phone is required'
      if (!formData.password) newErrors.password = 'Password is required'
    } else {
      if (!formData.fullName) newErrors.fullName = 'Full name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
      if (formData.phone.length < 10) newErrors.phone = 'Phone number must be at least 10 digits'
      if (!formData.password) newErrors.password = 'Password is required'
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.pinCode) newErrors.pinCode = 'PIN code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      let result
      if (mode === 'login') {
        result = await login(formData.emailOrPhone, formData.password, 'user', formData.rememberMe)
      } else {
        result = await register({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
      }

      if (result.success) {
        if (mode === 'login') {
          toast.success('Login Successful')
          setTimeout(() => {
            navigate('/user-dashboard')
          }, 800)
        } else {
          toast.success('Account created! Please log in with your credentials.')
          setMode('login')
          setFormData(prev => ({
            ...prev,
            emailOrPhone: formData.email,
            password: '',
            confirmPassword: '',
          }))
        }
      } else {
        toast.error(result.error || 'Something went wrong.')
        setErrors({ form: result.error })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="p-8 md:p-10">
            {/* Heading */}
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-3xl font-bold text-center mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Join GrievanceFlow'}
              </h2>
              <p className="text-center text-slate-600 dark:text-slate-400">
                {mode === 'login'
                  ? 'Sign in to your account'
                  : 'Create your account to get started'}
              </p>
            </motion.div>

            {/* Toggle Tabs */}
            <motion.div
              variants={itemVariants}
              className="flex gap-2 mb-8 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg"
            >
              {['login', 'register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setMode(tab)
                    setErrors({})
                    clearError()
                  }}
                  className="flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 relative"
                >
                  {mode === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-md"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 text-slate-700 dark:text-slate-300">
                    {tab === 'login' ? 'Login' : 'Register'}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* Form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <AnimatePresence mode="wait">
                {mode === 'login' ? (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Input
                      label="Email or Phone"
                      name="emailOrPhone"
                      value={formData.emailOrPhone}
                      onChange={handleChange}
                      placeholder="your@email.com or 9876543210"
                      icon={Mail}
                      error={errors.emailOrPhone}
                    />
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      icon={Lock}
                      error={errors.password}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleChange}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          Remember me
                        </span>
                      </label>
                      <a href="#" className="text-sm text-blue-500 hover:text-blue-600">
                        Forgot password?
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <Input
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      icon={User}
                      error={errors.fullName}
                    />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      icon={Mail}
                      error={errors.email}
                    />
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      icon={Phone}
                      error={errors.phone}
                    />
                    <Input
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      icon={MapPin}
                      error={errors.city}
                    />
                    <Input
                      label="PIN Code"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      placeholder="400001"
                      error={errors.pinCode}
                    />
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      icon={Lock}
                      error={errors.password}
                    />
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      icon={Lock}
                      error={errors.confirmPassword}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  size="md"
                  className="w-full mt-6"
                  isLoading={isLoading}
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </motion.div>
            </motion.form>

            {/* Divider */}
            <motion.div variants={itemVariants} className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-sm text-slate-500">Or continue with</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </motion.div>

            {/* Social buttons */}
            <motion.div variants={itemVariants} className="flex gap-4">
              {['Google', 'GitHub'].map(provider => (
                <button
                  key={provider}
                  type="button"
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  {provider}
                </button>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  )
}
