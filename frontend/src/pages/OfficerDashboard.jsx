import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Image as ImageIcon, ExternalLink } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useUser } from '../context/UserContext'
import { apiGetDepartmentGrievances, apiResolveDeptGrievance } from '../services/api'
import { getPriorityBadge } from '../utils/priorityCalculation'
import toast from 'react-hot-toast'

export default function OfficerDashboard() {
  const { user } = useUser()
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [viewFilter, setViewFilter] = useState('all')

  useEffect(() => {
    fetchGrievances()
  }, [])

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

  const handleResolve = async () => {
    if (!selectedComplaint) return
    setUpdating(true)
    try {
      const res = await apiResolveDeptGrievance(selectedComplaint.id)
      if (res.success) {
        toast.success('Complaint resolved successfully')
        setGrievances((prev) =>
          prev.map((g) => (g.id === selectedComplaint.id ? { ...g, status: 'resolved' } : g))
        )
        setSelectedComplaint(null)
      } else {
        toast.error(res.error || 'Failed to resolve complaint')
      }
    } catch (err) {
      toast.error('Failed to resolve complaint')
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  const visibleComplaints = grievances.filter((g) => {
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
                      className={`px-3 py-1.5 text-xs font-semibold transition ${
                        viewFilter === filter
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
              ) : visibleComplaints.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  No complaints found for this filter.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-zinc-700/60 bg-zinc-800/40 text-zinc-500 uppercase text-xs tracking-widest">
                    <tr>
                      <th className="py-4 px-4">Complaint ID</th>
                      <th className="py-4 px-4">Issue</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Priority</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4">Citizen</th>
                      <th className="py-4 px-4">Created</th>
                      <th className="py-4 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleComplaints.map((g) => (
                      <motion.tr
                        key={g.id}
                        className="border-b border-zinc-800/60 hover:bg-zinc-800/50 transition-colors"
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                      >
                        <td className="py-3 px-4 font-mono text-zinc-400 text-xs">
                          {g.complaint_id || g.id?.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4 max-w-[260px] truncate text-zinc-200">
                          {g.issue || '—'}
                        </td>
                        <td className="py-3 px-4 capitalize text-zinc-400">{g.category || '—'}</td>
                        <td className="py-3 px-4">{getPriorityBadge(g.priority)}</td>
                        <td className="py-3 px-4">
                          <span
                            style={{ borderRadius: '0.4rem' }}
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-zinc-700 text-zinc-200 capitalize"
                          >
                            {(g.status || 'pending').replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-400 max-w-[150px] truncate">
                          {g.citizen_name || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-600">
                          {g.created_at ? new Date(g.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button size="sm" onClick={() => setSelectedComplaint(g)}>
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
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
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Citizen Name</p>
                      <p className="mt-1 font-semibold text-zinc-200">{selectedComplaint.citizen_name || '—'}</p>
                    </div>
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Citizen Email</p>
                      <p className="mt-1 font-semibold text-zinc-200">{selectedComplaint.citizen_email || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
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
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Current Status</p>
                    <div className="mt-3">
                      <span
                        style={{ borderRadius: '0.4rem' }}
                        className="inline-flex px-3 py-1.5 text-sm font-semibold bg-zinc-700 text-zinc-200 capitalize"
                      >
                        {(selectedComplaint.status || 'pending').replace('_', ' ')}
                      </span>
                    </div>
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
                    {selectedComplaint.status !== 'resolved' && (
                      <Button className="w-full" onClick={handleResolve} isLoading={updating}>
                        Resolve
                      </Button>
                    )}
                    {selectedComplaint.status === 'resolved' && (
                      <div className="w-full py-3 text-center bg-green-700/20 border border-green-700/50 rounded text-green-300 text-sm font-semibold">
                        ✓ Already Resolved
                      </div>
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
