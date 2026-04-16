import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, Lock, Building2 } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useUser } from '../context/UserContext'

export default function OfficerAuth() {
    const navigate = useNavigate()
    const { login, isAuthenticated, user, error, clearError } = useUser()
    const [formData, setFormData] = useState({
        emailOrId: '',
        password: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isAuthenticated && user?.role === 'officer') {
            navigate('/officer-dashboard')
        }
    }, [isAuthenticated, user, navigate])

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
        if (!formData.emailOrId) newErrors.emailOrId = 'Email is required'
        if (!formData.password) newErrors.password = 'Password is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        try {
            const result = await login(formData.emailOrId, formData.password, 'officer')
            if (result.success) {
                toast.success('Login Successful')
                setTimeout(() => {
                    navigate('/officer-dashboard')
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
                            className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-950/30"
                        >
                            <Building2 className="h-4 w-4" />
                            Department Portal
                        </motion.div>

                        <motion.div variants={itemVariants} className="mb-8">
                            <div className="text-sm uppercase tracking-[0.28em] text-emerald-500 dark:text-emerald-300 mb-3">
                                Department access
                            </div>
                            <h2 className="text-4xl font-semibold text-slate-950 dark:text-slate-100 mb-3">
                                Officer Sign In
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                                Access your department dashboard with your official credentials.
                            </p>
                        </motion.div>

                        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Department Email"
                                name="emailOrId"
                                value={formData.emailOrId}
                                onChange={handleChange}
                                placeholder="waterdept@email.com"
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

                    </Card>
                </motion.div>
            </div>
        </PageLayout>
    )
}
