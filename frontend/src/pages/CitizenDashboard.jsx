import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, FileText, Calendar, MapPin, User, Phone, Mail, BarChart3, PieChart } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useComplaints } from '../hooks/useComplaints'
import { useUser } from '../context/UserContext'
import { getPriorityColor, getPriorityBadge } from '../utils/priorityCalculation'
import { BarChart, PieChart as PieChartComponent } from '../components/Charts/Charts'

export default function CitizenDashboard() {
  const navigate = useNavigate()
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const { user } = useUser()
  const { complaints, fetchComplaints, loading } = useComplaints()
  const citizenEmail = user?.email || 'raj@example.com'

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  // Match citizen email case-insensitively to ensure complaints filed with
  // different casing still show up in the user's view.
  const myComplaints = complaints.filter(c => {
    const complaintEmail = c?.citizenEmail || ''
    const userEmail = citizenEmail || ''
    return complaintEmail.toLowerCase() === userEmail.toLowerCase()
  })

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

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      in_progress: '#3b82f6',
      resolved: '#10b981',
    }
    return colors[status] || '#6b7280'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      in_progress: '⚙️',
      resolved: '✅',
    }
    return icons[status] || '❓'
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
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  My Complaints
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Track and manage all your filed complaints in one place
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/complaint')}
                  className="rounded-2xl border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-700"
                >
                  Add Complaint
                </button>
                <button
                  onClick={() => navigate('/user-dashboard')}
                  className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  View Complaints
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{myComplaints.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Complaints</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {myComplaints.filter(c => c.status === 'resolved').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Resolved</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {myComplaints.filter(c => c.status === 'in_progress').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {myComplaints.filter(c => c.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
            </Card>
          </motion.div>

          {/* Charts Section */}
          {myComplaints.length > 0 && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Status Distribution - Bar Chart */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-bold">Status Distribution</h3>
                </div>
                <div className="flex justify-center">
                  <BarChart
                    data={['resolved', 'in_progress', 'pending'].map(status => ({
                      label: status.replace('_', ' ').substring(0, 3).toUpperCase(),
                      value: myComplaints.filter(c => c.status === status).length,
                      color: status === 'resolved' ? '#10b981' : status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                    }))}
                    width={280}
                    height={160}
                  />
                </div>
              </Card>

              {/* Priority Distribution - Pie Chart */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-bold">Priority Breakdown</h3>
                </div>
                <div className="flex justify-center mb-4">
                  <PieChartComponent
                    data={['critical', 'high', 'medium', 'low'].map(priority => ({
                      label: priority,
                      value: myComplaints.filter(c => c.priority === priority).length,
                      color: getPriorityColor(priority),
                    }))}
                    size={120}
                  />
                </div>
                <div className="text-xs space-y-1">
                  {['critical', 'high', 'medium', 'low'].map(p => (
                    <div key={p} className="flex justify-between">
                      <span className="capitalize">{p}</span>
                      <span className="font-bold">{myComplaints.filter(c => c.priority === p).length}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Category Distribution - Bar Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Top Categories</h3>
                <div className="flex justify-center">
                  <BarChart
                    data={Object.entries(
                      myComplaints.reduce((acc, c) => {
                        acc[c.category] = (acc[c.category] || 0) + 1
                        return acc
                      }, {})
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([category, count]) => ({
                        label: category.substring(0, 3).toUpperCase(),
                        value: count,
                        color: '#8b5cf6',
                      }))}
                    width={280}
                    height={160}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Complaints List */}
          {myComplaints.length > 0 ? (
            <motion.div variants={itemVariants} className="space-y-4">
              {myComplaints.map((complaint) => (
                <motion.div
                  key={complaint.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => setSelectedComplaint(complaint)}
                  className="cursor-pointer"
                >
                  <Card className="p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getPriorityBadge(complaint.priority)}</span>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                              {complaint.title}
                            </h3>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                              {complaint.id}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white`}
                          style={{ backgroundColor: getStatusColor(complaint.status) }}>
                          {getStatusIcon(complaint.status)} {complaint.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {complaint.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{complaint.category}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Location</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{complaint.pinCode || complaint.location}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Filed On</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Department</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                          {complaint.department || 'Not Assigned'}
                        </p>
                      </div>
                    </div>

                    {/* Status Progress */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex gap-1">
                          {['submitted', 'assigned', 'in_progress', 'resolved'].map((step, i) => (
                            <div key={i} className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700">
                              {['pending', 'in_progress', 'resolved'].indexOf(complaint.status) >= i && (
                                <motion.div
                                  className="h-full rounded-full bg-blue-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ delay: i * 0.1, duration: 0.5 }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">
                        {complaint.updates.length} updates
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  No Complaints Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  You haven't filed any complaints yet. Start by filing your first complaint.
                </p>
                <Button onClick={() => navigate('/complaint')} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  File First Complaint
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Complaint Detail Modal */}
          {selectedComplaint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedComplaint(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedComplaint.title}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
                        {selectedComplaint.id}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedComplaint.description}</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Status & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Priority
                      </p>
                      <p className="text-2xl">
                        {getPriorityBadge(selectedComplaint.priority)}
                        <span className="ml-2 font-bold">{selectedComplaint.priority.toUpperCase()}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Status
                      </p>
                      <p className="text-lg font-bold capitalize">
                        {getStatusIcon(selectedComplaint.status)} {selectedComplaint.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Filed On
                      </p>
                      <p className="font-semibold">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Location
                      </p>
                      <p className="font-semibold">{selectedComplaint.pinCode || selectedComplaint.location}</p>
                    </div>
                  </div>

                  {/* Citizen Info */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Your Information</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        <span>{selectedComplaint.citizenName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-500" />
                        <span>{selectedComplaint.citizenEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span>{selectedComplaint.citizenPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">
                      Timeline & Updates
                    </p>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedComplaint.updates.map((update, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-3"
                        >
                          <div className="flex-shrink-0">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs">
                              ✓
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {new Date(update.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                              {update.message}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Close Button */}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedComplaint(null)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  )
}
