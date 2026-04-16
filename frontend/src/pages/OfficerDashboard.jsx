import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Image as ImageIcon, ExternalLink, ChevronDown } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useUser } from '../context/UserContext'
import { apiGetDepartmentGrievances, apiResolveDeptGrievance, apiUpdateComplaint } from '../services/api'
import { getPriorityBadge } from '../utils/priorityCalculation'
import toast from 'react-hot-toast'

export default function OfficerDashboard() {
  const { user } = useUser()
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [updating, setUpdating] = useState(false)
  const [viewFilter, setViewFilter] = useState('all')
  const [expandedCategories, setExpandedCategories] = useState({})
  const [togglingParent, setTogglingParent] = useState(null)

  const toggleCategory = (id) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    fetchGrievances()
  }, [])

  useEffect(() => {
    if (selectedComplaint) {
      setEditStatus(selectedComplaint.status || 'pending')
    }
  }, [selectedComplaint])

  const fetchGrievances = async () => {
    setLoading(true)
    try {
      const res = await apiGetDepartmentGrievances()
      if (res.success) {
        setGrievances(res.data || [])
      } else {
        toast.error('Failed to fetch assigned complaints')
      }
    } catch (err) {
      console.error('Failed to fetch department grievances:', err)
      toast.error('Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  // Master toggle: resolve/unresolve all children under a parent
  const handleMasterStatusToggle = async (parentGrievance) => {
    const newStatus = parentGrievance.status === 'resolved' ? 'pending' : 'resolved'
    setTogglingParent(parentGrievance.id)
    try {
      if (newStatus === 'resolved') {
        const res = await apiResolveDeptGrievance(parentGrievance.id)
        if (res.success) {
          toast.success('All complaints resolved successfully')
          setGrievances((prev) =>
            prev.map((g) =>
              g.id === parentGrievance.id
                ? { ...g, status: 'resolved', children: (g.children || []).map((c) => ({ ...c, status: 'resolved' })) }
                : g
            )
          )
        } else {
          toast.error('Failed to resolve complaints')
        }
      } else {
        const childIds = (parentGrievance.children || []).map((c) => c.id)
        await Promise.all(childIds.map((id) => apiUpdateComplaint(id, { status: 'pending' })))
        toast.success('All complaints set to pending')
        setGrievances((prev) =>
          prev.map((g) =>
            g.id === parentGrievance.id
              ? { ...g, status: 'pending', children: (g.children || []).map((c) => ({ ...c, status: 'pending' })) }
              : g
          )
        )
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    } finally {
      setTogglingParent(null)
    }
  }

  // Update individual child grievance status from modal
  const handleUpdateChildStatus = async () => {
    if (!selectedComplaint) return
    setUpdating(true)
    try {
      const res = await apiUpdateComplaint(selectedComplaint.id, { status: editStatus })
      if (res.success) {
        toast.success('Complaint status updated')
        setGrievances((prev) =>
          prev.map((parent) => {
            const updatedChildren = (parent.children || []).map((c) =>
              c.id === selectedComplaint.id ? { ...c, status: editStatus } : c
            )
            const hasChild = updatedChildren.some((c) => c.id === selectedComplaint.id)
            if (!hasChild) return parent
            const allResolved = updatedChildren.every((c) => c.status === 'resolved')
            return { ...parent, children: updatedChildren, status: allResolved ? 'resolved' : 'pending' }
          })
        )
        setSelectedComplaint(null)
      } else {
        toast.error(res.error || 'Failed to update status')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update complaint')
    } finally {
      setUpdating(false)
    }
  }

  const visibleGrievances = grievances.filter((g) => {
    if (viewFilter === 'solved') return g.status === 'resolved'
    if (viewFilter === 'unsolved') return g.status !== 'resolved'
    return true
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

  return (
    <PageLayout>
      <div className="w-full px-6 py-5 bg-[#080808]">
        <motion.div
          className="w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-emerald-100/10 border border-emerald-700/30">
                <Building2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Department Dashboard</h1>
                <p className="text-sm text-zinc-500">{user?.department || 'Department'} — Logged in as {user?.full_name || user?.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Complaint Logs Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-1">Assigned Complaints</h2>
              <p className="text-sm text-zinc-500">Complaints forwarded by admin for your department</p>
            </div>

            <Card className="p-5 overflow-x-auto border border-zinc-700/60 bg-zinc-900/70">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-base font-bold text-white">Complaint Log</h3>
                <div className="flex flex-wrap gap-2">
                  {['all', 'solved', 'unsolved'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setViewFilter(filter)}
                      style={{ borderRadius: '0.4rem' }}
                      className={`px-3 py-1.5 text-xs font-semibold transition ${viewFilter === filter
                        ? 'bg-zinc-700 text-white border border-zinc-500'
                        : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/60 hover:text-zinc-200'
                        }`}
                    >
                      {filter === 'all' ? 'All' : filter === 'solved' ? 'Solved' : 'Unsolved'}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-zinc-500">Loading complaints...</div>
              ) : visibleGrievances.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  No complaints found for this filter.
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleGrievances.map((parent) => {
                    const children = parent.children || []
                    const isExpanded = expandedCategories[parent.id]
                    const resolvedCount = children.filter((c) => c.status === 'resolved').length

                    return (
                      <div key={parent.id} style={{ borderRadius: '0.4rem' }} className="border border-zinc-700/60 overflow-hidden">
                        {/* Parent Category Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-800/70">
                          <button
                            type="button"
                            onClick={() => toggleCategory(parent.id)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-4 w-4 text-zinc-400" />
                            </motion.div>
                            <span className="capitalize text-sm font-semibold text-white">{parent.parent_issue || parent.category || 'Uncategorized'}</span>
                            <span className="text-[10px] font-medium text-zinc-500 bg-zinc-700/60 px-2 py-0.5 rounded-full">
                              {children.length} complaint{children.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-500 bg-zinc-700/60 px-2 py-0.5 rounded-full">
                              {resolvedCount}/{children.length} resolved
                            </span>
                            <span className="ml-1">{getPriorityBadge(parent.priority)}</span>
                          </button>

                          {/* Master Status Toggle */}
                          <button
                            type="button"
                            disabled={togglingParent === parent.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMasterStatusToggle(parent)
                            }}
                            style={{ borderRadius: '0.4rem' }}
                            className={`ml-3 px-3 py-1.5 text-xs font-semibold transition border whitespace-nowrap ${parent.status === 'resolved'
                              ? 'bg-green-700/20 border-green-700/50 text-green-300 hover:bg-green-700/30'
                              : 'bg-amber-700/20 border-amber-700/50 text-amber-300 hover:bg-amber-700/30'
                              } ${togglingParent === parent.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {togglingParent === parent.id
                              ? 'Updating...'
                              : parent.status === 'resolved'
                                ? '✓ Resolved — Set Pending'
                                : 'Resolve All'}
                          </button>
                        </div>

                        {/* Collapsible Children Table */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              {children.length === 0 ? (
                                <div className="py-6 text-center text-zinc-500 text-sm">No child complaints.</div>
                              ) : (
                                <table className="w-full text-sm text-left">
                                  <thead className="border-b border-zinc-700/60 bg-zinc-800/40 text-zinc-500 uppercase text-xs tracking-widest">
                                    <tr>
                                      <th className="py-3 px-4">Complaint ID</th>
                                      <th className="py-3 px-4">Issue</th>
                                      <th className="py-3 px-4">Location</th>
                                      <th className="py-3 px-4">Priority</th>
                                      <th className="py-3 px-4">Status</th>
                                      <th className="py-3 px-4">Source</th>
                                      <th className="py-3 px-4">Created</th>
                                      <th className="py-3 px-4 text-center">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {children.map((child) => (
                                      <motion.tr
                                        key={child.id}
                                        className="border-b border-zinc-800/60 hover:bg-zinc-800/50 transition-colors"
                                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                                      >
                                        <td className="py-3 px-4 font-mono text-zinc-400 text-xs">
                                          {child.complaint_id || child.id?.slice(0, 8)}
                                        </td>
                                        <td className="py-3 px-4 max-w-[220px] truncate text-zinc-200">
                                          {child.issue || '—'}
                                        </td>
                                        <td className="py-3 px-4 text-xs text-zinc-400">
                                          {child.location || '—'}
                                        </td>
                                        <td className="py-3 px-4">{getPriorityBadge(child.priority)}</td>
                                        <td className="py-3 px-4">
                                          <span
                                            style={{ borderRadius: '0.4rem' }}
                                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize ${child.status === 'resolved'
                                              ? 'bg-green-700/20 text-green-300 border border-green-700/40'
                                              : 'bg-zinc-700 text-zinc-200'
                                              }`}
                                          >
                                            {(child.status || 'pending').replace('_', ' ')}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4">
                                          <span style={{ borderRadius: '0.4rem' }} className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 capitalize">
                                            {child.source || '—'}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-zinc-600">
                                          {child.created_at ? new Date(child.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <Button size="sm" onClick={() => setSelectedComplaint(child)}>
                                            View
                                          </Button>
                                        </td>
                                      </motion.tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Review Modal */}
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
            style={{ borderRadius: '0.4rem' }}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-zinc-900 border border-zinc-700/60 shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 border-b border-zinc-800 p-5 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">Complaint Details</h2>
                <p className="text-xs text-zinc-500 font-mono">
                  {selectedComplaint.complaint_id || selectedComplaint.id}
                </p>
              </div>
              <button
                className="text-zinc-500 hover:text-white text-lg"
                onClick={() => setSelectedComplaint(null)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Issue</p>
                    <p className="mt-1 text-lg font-semibold text-white">{selectedComplaint.issue || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Description</p>
                    <p className="mt-1 text-sm text-zinc-400">{selectedComplaint.description || '—'}</p>
                  </div>

                  {/* Evidence Image */}
                  <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Evidence Image</p>
                    {selectedComplaint.before_photo ? (
                      <div className="space-y-3">
                        <div
                          style={{ borderRadius: '0.4rem' }}
                          className="overflow-hidden border border-zinc-700 max-h-52 bg-zinc-800"
                        >
                          <img
                            src={selectedComplaint.before_photo}
                            alt="Complaint evidence"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <a
                          href={selectedComplaint.before_photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" /> Open full image
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-zinc-600">
                        <ImageIcon className="h-8 w-8" />
                        <p className="text-sm italic">No image attached.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Location</p>
                      <p className="mt-1 font-semibold text-zinc-200">{selectedComplaint.location || '—'}</p>
                    </div>
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Source</p>
                      <p className="mt-1 font-semibold text-zinc-200 capitalize">{selectedComplaint.source || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Complainant Info */}
                  <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Complainant Info</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Name</span>
                        <span className="text-sm font-semibold text-zinc-200">{selectedComplaint.user_name || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Phone</span>
                        <span className="text-sm font-semibold text-zinc-200">{selectedComplaint.user_phone || '—'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Category</p>
                    <p className="mt-2 capitalize text-zinc-200 font-semibold">
                      {selectedComplaint.category || '—'}
                    </p>
                  </div>
                  <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Priority</p>
                    <p className="mt-2">{getPriorityBadge(selectedComplaint.priority)}</p>
                  </div>
                  <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-5">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Status</p>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ borderRadius: '0.4rem' }}
                      className="w-full bg-zinc-700 text-zinc-200 text-sm px-3 py-2 border border-zinc-600 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Timestamps */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Created</p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {selectedComplaint.created_at
                          ? new Date(selectedComplaint.created_at).toLocaleString()
                          : '—'}
                      </p>
                    </div>
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Updated</p>
                      <p className="mt-1 text-sm text-zinc-300">
                        {selectedComplaint.updated_at
                          ? new Date(selectedComplaint.updated_at).toLocaleString()
                          : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  <div>
                    {editStatus !== selectedComplaint.status ? (
                      <Button className="w-full" onClick={handleUpdateChildStatus} isLoading={updating}>
                        Update Status
                      </Button>
                    ) : selectedComplaint.status === 'resolved' ? (
                      <div className="w-full py-3 text-center bg-green-700/20 border border-green-700/50 rounded text-green-300 text-sm font-semibold">
                        ✓ Already Resolved
                      </div>
                    ) : (
                      <Button className="w-full" onClick={() => setEditStatus('resolved')}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </PageLayout>
  )
}
