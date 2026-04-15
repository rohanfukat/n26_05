import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, AlertTriangle, BarChart3, Clock, Users, PieChart, Image as ImageIcon, ExternalLink } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AdminMumbaiMap from '../components/AdminMumbaiMap'
import { useComplaints } from '../hooks/useComplaints'
import { useDashboard } from '../hooks/useDashboard'
import { getPriorityColor, getPriorityBadge } from '../utils/priorityCalculation'
import { BarChart, PieChart as PieChartComponent, LineChart } from '../components/Charts/Charts'

export default function AdminDashboard() {
  const { complaints, fetchComplaints, updateComplaint } = useComplaints()
  const { stats, fetchStatistics } = useDashboard()
  const [activeSection, setActiveSection] = useState('overview')
  const [viewFilter, setViewFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [reviewRisk, setReviewRisk] = useState('')

  useEffect(() => {
    fetchComplaints({ sortBy: 'priority' })
    fetchStatistics()
  }, [fetchComplaints, fetchStatistics])

  useEffect(() => {
    if (selectedComplaint) {
      setReviewRisk(selectedComplaint.priority)
    }
  }, [selectedComplaint])

  const visibleComplaints = complaints.filter((complaint) => {
    if (activeSection !== 'complaints') return true
    if (viewFilter === 'solved') return complaint.status === 'resolved'
    if (viewFilter === 'unsolved') return complaint.status !== 'resolved'
    return true
  })

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats?.totalComplaints || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      trend: '+12%',
    },
    {
      title: 'Critical Priority',
      value: stats?.criticalComplaints || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      trend: '-5%',
    },
    {
      title: 'Resolved',
      value: stats?.resolvedComplaints || 0,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      trend: '+18%',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressComplaints || 0,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      trend: '+8%',
    },
  ]

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

  const statusColor = (status) => {
    if (status === 'resolved') return 'bg-green-500'
    if (status === 'in_progress') return 'bg-blue-500'
    return 'bg-yellow-400'
  }

  const handleResolve = async () => {
    if (!selectedComplaint) return
    const updated = await updateComplaint(selectedComplaint.id, { status: 'resolved', priority: reviewRisk })
    if (updated) {
      setSelectedComplaint(updated)
      fetchStatistics()
    }
  }

  const handleRiskChange = async (newPriority) => {
    if (!selectedComplaint) return
    setReviewRisk(newPriority)
    const updated = await updateComplaint(selectedComplaint.id, { priority: newPriority })
    if (updated) {
      setSelectedComplaint(updated)
      fetchStatistics()
    }
  }

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] px-4 py-8 bg-slate-50 dark:bg-slate-900">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and track all citizen complaints in real-time
            </p>
          </motion.div>

          {/* Mumbai Map */}
          <motion.div variants={itemVariants} className="mb-8">
            <AdminMumbaiMap />
          </motion.div>

          {/* Charts Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Status Distribution - Pie Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Status Distribution</h3>
              <div className="flex justify-center mb-4">
                <PieChartComponent
                  data={['resolved', 'in_progress', 'pending'].map(status => ({
                    label: status.replace('_', ' '),
                    value: stats?.byStatus?.[status] || 0,
                    color: status === 'resolved' ? '#10b981' : status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                  }))}
                  size={120}
                />
              </div>
              <div className="text-xs space-y-1">
                {['resolved', 'in_progress', 'pending'].map(status => (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                    <span className="font-bold">{stats?.byStatus?.[status] || 0}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Priority Distribution - Bar Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Priority Distribution</h3>
              <div className="flex justify-center">
                <BarChart
                  data={['critical', 'high', 'medium', 'low'].map(priority => ({
                    label: priority.substring(0, 3).toUpperCase(),
                    value: stats?.byPriority?.[priority] || 0,
                    color: getPriorityColor(priority),
                  }))}
                  width={280}
                  height={160}
                />
              </div>
            </Card>

            {/* Category Distribution - Bar Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Top Categories</h3>
              <div className="flex justify-center">
                <BarChart
                  data={stats?.byCategory ? Object.entries(stats.byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => ({
                      label: category.substring(0, 3).toUpperCase(),
                      value: count,
                      color: '#8b5cf6',
                    })) : []}
                  width={280}
                  height={160}
                />
              </div>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative overflow-hidden"
                >
                  <Card className={`p-6 bg-gradient-to-br ${stat.color}`}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white/80 text-sm font-semibold">{stat.title}</h3>
                        <span className="text-green-400 text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                          {stat.trend}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-4xl font-bold text-white">{stat.value}</p>
                        </div>
                        <Icon className="h-12 w-12 text-white/20" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Complaint review */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-lg font-bold">Complaint review</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Filter solved and unsolved complaints, then review details.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['all', 'solved', 'unsolved'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setViewFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${viewFilter === filter ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'}`}
                    >
                      {filter === 'all' ? 'All' : filter === 'solved' ? 'Solved' : 'Unsolved'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Visible complaints</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{visibleComplaints.length}</p>
                </div>
                <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Current view</p>
                  <p className="mt-2 text-lg font-semibold">{viewFilter === 'all' ? 'All complaints' : viewFilter === 'solved' ? 'Solved' : 'Unsolved'}</p>
                </div>
                <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Quick actions</p>
                  <p className="mt-2 text-lg font-semibold">Review latest issues and update risk.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
              <h3 className="text-lg font-bold mb-4">Complaint log</h3>
              <table className="w-full text-sm text-left">
                <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 uppercase text-xs tracking-[0.1em]">
                  <tr>
                    <th className="py-4 px-4">ID</th>
                    <th className="py-4 px-4">Title</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Priority</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Assigned</th>
                    <th className="py-4 px-4">Created</th>
                    <th className="py-4 px-4 text-center">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleComplaints.map((complaint) => (
                    <motion.tr
                      key={complaint.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                    >
                      <td className="py-4 px-4 font-mono text-blue-600 dark:text-blue-400">{complaint.id}</td>
                      <td className="py-4 px-4 max-w-[260px] truncate">{complaint.title}</td>
                      <td className="py-4 px-4 capitalize">{complaint.category}</td>
                      <td className="py-4 px-4">{getPriorityBadge(complaint.priority)}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${statusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">{complaint.assignedTo || '-'}</td>
                      <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-center">
                        <Button size="sm" onClick={() => setSelectedComplaint(complaint)}>
                          Review
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </motion.div>

          {selectedComplaint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedComplaint(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-slate-950 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 p-6 flex-shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Review Complaint</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedComplaint.id}</p>
                  </div>
                  <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" onClick={() => setSelectedComplaint(null)}>
                    Close
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Title</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{selectedComplaint.title}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Description</p>
                        <p className="mt-2 text-slate-700 dark:text-slate-300">{selectedComplaint.description}</p>
                      </div>
                      {/* Evidence Image */}
                      <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Evidence Image</p>
                        {selectedComplaint.imageUrl ? (
                          <div className="space-y-3">
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-52 bg-slate-200 dark:bg-slate-800">
                              <img
                                src={selectedComplaint.imageUrl}
                                alt="Complaint evidence"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <a
                              href={selectedComplaint.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open full image
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                            <ImageIcon className="h-8 w-8" />
                            <p className="text-sm italic">No image attached to this complaint.</p>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Citizen</p>
                          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{selectedComplaint.citizenName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedComplaint.citizenEmail}</p>
                        </div>
                        <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Location</p>
                          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{selectedComplaint.location || selectedComplaint.pinCode}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedComplaint.category}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Current status</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white ${statusColor(selectedComplaint.status)}`}>
                            {selectedComplaint.status.replace('_', ' ')}
                          </span>
                          <span className="inline-flex rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{getPriorityBadge(selectedComplaint.priority)}</span>
                        </div>
                      </div>
                      <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Risk management</p>
                        <div className="flex flex-wrap gap-2">
                          {['critical', 'high', 'medium', 'low'].map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => handleRiskChange(level)}
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${reviewRisk === level ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Updates</p>
                        <div className="mt-4 space-y-3">
                          {selectedComplaint.updates.map((update, index) => (
                            <div key={index} className="rounded-2xl bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{new Date(update.date).toLocaleDateString()}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{update.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full" onClick={handleResolve}>
                        Mark as Solved
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  )
}
