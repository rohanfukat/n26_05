import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Search, TrendingUp, AlertCircle, CheckCircle, Clock, Users, MessageSquare } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useComplaints } from '../hooks/useComplaints'
import { mockDepartments, mockComplaints } from '../data/mockData'
import { getPriorityColor, getPriorityBadge } from '../utils/priorityCalculation'

export default function DepartmentDashboard() {
  const { complaints, updateComplaint } = useComplaints()
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
  })
  const [selectedDepartment, setSelectedDepartment] = useState('roads')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [updateMessage, setUpdateMessage] = useState('')
  const [sortBy, setSortBy] = useState('priority')

  // Get department-specific complaints
  const deptComplaints = mockComplaints
    .filter(c => c.department === selectedDepartment)
    .filter(complaint => {
      if (filters.search && !complaint.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.status !== 'all' && complaint.status !== filters.status) return false
      if (filters.priority !== 'all' && complaint.priority !== filters.priority) return false
      return true
    })

  if (sortBy === 'priority') {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    deptComplaints.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  } else if (sortBy === 'date') {
    deptComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const deptStats = {
    total: deptComplaints.length,
    pending: deptComplaints.filter(c => c.status === 'pending').length,
    inProgress: deptComplaints.filter(c => c.status === 'in_progress').length,
    resolved: deptComplaints.filter(c => c.status === 'resolved').length,
    critical: deptComplaints.filter(c => c.priority === 'critical').length,
  }

  const handleStatusChange = async (complaintId, newStatus) => {
    if (selectedComplaint) {
      selectedComplaint.status = newStatus
      selectedComplaint.updates.push({
        date: new Date(),
        message: `Status updated to ${newStatus}`,
      })
    }
  }

  const handleAddUpdate = async () => {
    if (selectedComplaint && updateMessage.trim()) {
      selectedComplaint.updates.push({
        date: new Date(),
        message: updateMessage,
      })
      setUpdateMessage('')
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

  const dept = mockDepartments.find(d => d.id === selectedDepartment)

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
              Department Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and resolve complaints for your department
            </p>
          </motion.div>

          {/* Department Selection */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-wrap gap-2">
              {mockDepartments.map(dept => (
                <motion.button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedDepartment === dept.id
                      ? `bg-gradient-to-r ${dept.color.includes('#') ? '' : dept.color} text-white`
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={selectedDepartment === dept.id ? { backgroundColor: dept.color } : {}}
                >
                  {dept.icon} {dept.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { title: 'Total', value: deptStats.total, icon: Users, color: 'from-blue-500 to-cyan-500' },
              { title: 'Pending', value: deptStats.pending, icon: Clock, color: 'from-yellow-500 to-orange-500' },
              { title: 'In Progress', value: deptStats.inProgress, icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
              { title: 'Resolved', value: deptStats.resolved, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
              { title: 'Critical', value: deptStats.critical, icon: AlertCircle, color: 'from-red-500 to-orange-500' },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div key={i} whileHover={{ scale: 1.02, y: -4 }}>
                  <Card className={`p-4 bg-gradient-to-br ${stat.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-white/80">
                        <p className="text-xs font-semibold uppercase">{stat.title}</p>
                        <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                      </div>
                      <Icon className="h-10 w-10 text-white/20" />
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5" />
                <h3 className="text-lg font-bold">Filters & Search</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  placeholder="Search complaints..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  icon={Search}
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="date">Sort by Date</option>
                </select>
                <Button
                  type="button"
                  onClick={() => setFilters({ search: '', status: 'all', priority: 'all' })}
                  variant="secondary"
                  size="md"
                >
                  Clear
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Complaints List */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {dept?.name} - {deptComplaints.length} complaint{deptComplaints.length !== 1 ? 's' : ''}
            </h3>
            {deptComplaints.map((complaint) => (
              <motion.div key={complaint.id} whileHover={{ scale: 1.01 }}>
                <Card
                  className="p-6 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getPriorityBadge(complaint.priority)}</span>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {complaint.title}
                          </h4>
                          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {complaint.id}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        complaint.status === 'resolved' ? 'bg-green-500' :
                        complaint.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm line-clamp-2">
                    {complaint.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Location</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{complaint.pinCode || complaint.location}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Citizen</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{complaint.citizenName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Filed</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Assigned</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{complaint.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Updates</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{complaint.updates.length}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {deptComplaints.length === 0 && (
            <motion.div variants={itemVariants}>
              <Card className="p-12 text-center">
                <Users className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  No Complaints
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  No complaints found for {dept?.name}
                </p>
              </Card>
            </motion.div>
          )}

          {/* Complaint Detail Modal */}
          <AnimatePresence>
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
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-96 overflow-y-auto"
                >
                  <div className="sticky top-0 p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-10">
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
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Priority</p>
                        <p className="text-2xl">{getPriorityBadge(selectedComplaint.priority)} <span className="font-bold">{selectedComplaint.priority.toUpperCase()}</span></p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Status</p>
                        <select
                          value={selectedComplaint.status}
                          onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                          className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Description</p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">{selectedComplaint.description}</p>
                    </div>

                    {/* Citizen Info */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Citizen Information</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="font-semibold text-slate-900 dark:text-slate-100">{selectedComplaint.citizenName}</span></div>
                        <div><span className="text-slate-600 dark:text-slate-400">{selectedComplaint.citizenEmail}</span></div>
                        <div><span className="text-slate-600 dark:text-slate-400">{selectedComplaint.citizenPhone}</span></div>
                        <div><span className="font-semibold text-slate-900 dark:text-slate-100">{selectedComplaint.pinCode || selectedComplaint.location}</span></div>
                      </div>
                    </div>

                    {/* Updates Timeline */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Updates Timeline</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedComplaint.updates.map((update, i) => (
                          <div key={i} className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">
                              {new Date(update.date).toLocaleDateString()}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400">{update.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Update */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Add Update</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={updateMessage}
                          onChange={(e) => setUpdateMessage(e.target.value)}
                          placeholder="Add a status update..."
                          className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleAddUpdate}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageLayout>
  )
}
