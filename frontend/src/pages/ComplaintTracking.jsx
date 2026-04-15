import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, MapPin, User, Phone, Mail, FileText, Clock, CheckCircle, AlertCircle, MessageSquare, Share2 } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { mockComplaints } from '../data/mockData'
import { getPriorityBadge, getPriorityColor } from '../utils/priorityCalculation'

export default function ComplaintTracking() {
  const navigate = useNavigate()
  const { complaintId } = useParams()
  const [newUpdate, setNewUpdate] = useState('')

  // In a real app, this would fetch from backend using complaintId
  // For now, using mock data
  const complaint = mockComplaints.find(c => c.id === complaintId) || mockComplaints[0]

  const getStatusStep = (status) => {
    const steps = { pending: 1, in_progress: 2, resolved: 3 }
    return steps[status] || 1
  }

  const estimatedDaysRemaining = complaint.resolutionDeadline
    ? Math.ceil((new Date(complaint.resolutionDeadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

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
      <div className="min-h-[calc(100vh-80px)] px-4 py-8 bg-slate-50 dark:bg-slate-900">
        <motion.div
          className="max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div variants={itemVariants} className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {complaint.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-mono text-lg">
                  {complaint.id}
                </p>
              </div>
              <span className="text-4xl">{getPriorityBadge(complaint.priority)}</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-lg">
              {complaint.description}
            </p>
          </motion.div>

          {/* Status Overview */}
          <motion.div variants={itemVariants} className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-bold mb-6">Progress Timeline</h3>
              
              {/* Progress Steps */}
              <div className="relative">
                {/* Visual Timeline */}
                <div className="flex justify-between mb-8">
                  {[
                    { step: 1, label: 'Submitted', icon: '📝', date: complaint.createdAt },
                    { step: 2, label: 'In Progress', icon: '⚙️', date: complaint.updates[1]?.date },
                    { step: 3, label: 'Resolved', icon: '✅', date: complaint.status === 'resolved' ? complaint.updatedAt : null },
                  ].map((item, i, arr) => {
                    const isActive = getStatusStep(complaint.status) >= item.step
                    return (
                      <div key={item.step} className="flex flex-col items-center flex-1">
                        <motion.div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-2 relative z-10 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.2 }}
                        >
                          {item.icon}
                        </motion.div>
                        <p className="text-sm font-semibold text-center text-slate-900 dark:text-slate-100">
                          {item.label}
                        </p>
                        {item.date && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        )}
                        
                        {/* Connecting Line */}
                        {i < arr.length - 1 && (
                          <motion.div
                            className={`absolute top-6 left-1/2 w-full h-1 -z-0 ${
                              isActive ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: (i + 0.5) * 0.2 }}
                            style={{ left: '50%', top: '24px' }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Hidden connector lines SVG for better UX */}
                <svg className="absolute inset-0 w-full h-16 pointer-events-none" style={{ top: '-20px' }}>
                  {getStatusStep(complaint.status) >= 2 && (
                    <line x1="33%" y1="24" x2="66%" y2="24" stroke="url(#gradient)" strokeWidth="4" />
                  )}
                  {getStatusStep(complaint.status) >= 3 && (
                    <line x1="66%" y1="24" x2="99%" y2="24" stroke="url(#gradient)" strokeWidth="4" />
                  )}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </Card>

            {/* Status Card */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Current Status</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</p>
                  <p className="text-2xl font-bold capitalize text-slate-900 dark:text-slate-100 mt-1">
                    {complaint.status.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Priority</p>
                  <p className="text-2xl font-bold capitalize text-slate-900 dark:text-slate-100 mt-1">
                    {complaint.priority}
                  </p>
                </div>
                {estimatedDaysRemaining && estimatedDaysRemaining > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Days Remaining</p>
                    <p className={`text-2xl font-bold mt-1 ${estimatedDaysRemaining <= 3 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {estimatedDaysRemaining}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Details Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Citizen Information */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Citizen Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Name</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{complaint.citizenName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </p>
                  <a href={`mailto:${complaint.citizenEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline mt-1">
                    {complaint.citizenEmail}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </p>
                  <a href={`tel:${complaint.citizenPhone}`} className="text-blue-600 dark:text-blue-400 hover:underline mt-1">
                    {complaint.citizenPhone}
                  </a>
                </div>
              </div>
            </Card>

            {/* Location & Department */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Department
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Location</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {complaint.location}
                    {complaint.pinCode && ` (${complaint.pinCode})`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize mt-1">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Department</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize mt-1">
                    {complaint.department || 'Not Assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assigned To</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {complaint.assignedTo || 'Unassigned'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Update History
              </h3>
              <div className="relative">
                {/* Timeline */}
                <div className="space-y-6">
                  {complaint.updates.map((update, i) => (
                    <motion.div
                      key={i}
                      className="relative flex gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {/* Timeline dot and line */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          ✓
                        </motion.div>
                        {i < complaint.updates.length - 1 && (
                          <motion.div
                            className="w-1 bg-gradient-to-b from-blue-500 to-slate-300 dark:to-slate-700 flex-1 min-h-12"
                            initial={{ height: 0 }}
                            animate={{ height: '100%' }}
                            transition={{ delay: i * 0.1 }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {update.message}
                            </p>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap ml-2">
                              {new Date(update.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(update.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {complaint.attachments.map((file, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className="flex-1 font-medium text-slate-900 dark:text-slate-100">{file}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">Download</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Share & Actions */}
          <motion.div variants={itemVariants} className="flex gap-4">
            <Button variant="secondary" className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contact Department
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
