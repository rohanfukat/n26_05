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
import {
  AreaChart, Area,
  BarChart as ReBarChart, Bar,
  XAxis, YAxis, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
  Tooltip,
} from 'recharts'

const PIE_COLORS = ['#f4f4f5', '#71717a', '#3f3f46']

export default function AdminDashboard() {
  const { complaints, grievanceLogs, fetchComplaints, fetchGrievanceLogs, updateComplaint } = useComplaints()
  const { stats, fetchStatistics } = useDashboard()
  const [activeTab, setActiveTab] = useState('maps')
  const [viewFilter, setViewFilter] = useState('all')
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [reviewRisk, setReviewRisk] = useState('')
  // Editable fields for review modal
  const [editCategory, setEditCategory] = useState('')
  const [editPriority, setEditPriority] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchComplaints({ sortBy: 'priority' })
    fetchGrievanceLogs()
    fetchStatistics()
  }, [fetchComplaints, fetchGrievanceLogs, fetchStatistics])

  useEffect(() => {
    if (selectedComplaint) {
      setReviewRisk(selectedComplaint.priority || '')
      setEditCategory(selectedComplaint.category || '')
      setEditPriority(selectedComplaint.priority || '')
      setEditStatus(selectedComplaint.status || '')
    }
  }, [selectedComplaint])

  const visibleComplaints = complaints.filter((complaint) => {
    if (viewFilter === 'solved') return complaint.status === 'resolved'
    if (viewFilter === 'unsolved') return complaint.status !== 'resolved'
    return true
  })

  const visibleLogs = grievanceLogs.filter((g) => {
    if (viewFilter === 'solved') return g.status === 'resolved'
    if (viewFilter === 'unsolved') return g.status !== 'resolved'
    return true
  })

  const statCards = [
    { title: 'Total Complaints', value: stats?.totalComplaints ?? 0, icon: Users },
    { title: 'Critical Priority', value: stats?.criticalComplaints ?? 0, icon: AlertTriangle },
    { title: 'Resolved', value: stats?.resolvedComplaints ?? 0, icon: TrendingUp },
    { title: 'In Progress', value: stats?.inProgressComplaints ?? 0, icon: Clock },
  ]

  // Dynamic chart data from stats (falls back to empty arrays)
  const monthlyData = stats?.monthlyData ?? []
  const categoryData = stats?.categoryData ?? []
  const avgResolutionDays = stats?.avgResolutionDays ?? 0

  // Compute month-over-month trend for area chart
  const computeMonthTrend = () => {
    if (monthlyData.length < 2) return null
    const curr = monthlyData[monthlyData.length - 1]?.complaints || 0
    const prev = monthlyData[monthlyData.length - 2]?.complaints || 0
    if (prev === 0) return null
    const pct = (((curr - prev) / prev) * 100).toFixed(1)
    return pct >= 0 ? `+${pct}%` : `${pct}%`
  }
  const monthTrend = computeMonthTrend()

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
    if (status === 'resolved') return 'bg-zinc-400'
    if (status === 'in_progress') return 'bg-zinc-600'
    return 'bg-yellow-400'
  }

  const handleResolve = async () => {
    if (!selectedComplaint) return
    setUpdating(true)
    const updated = await updateComplaint(selectedComplaint.id, { status: 'resolved', priority: reviewRisk })
    if (updated) {
      setSelectedComplaint(updated)
      fetchGrievanceLogs()
      fetchStatistics()
    }
    setUpdating(false)
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

  const handleUpdateGrievance = async () => {
    if (!selectedComplaint) return
    setUpdating(true)
    const payload = {}
    if (editCategory !== (selectedComplaint.category || '')) payload.category = editCategory
    if (editPriority !== (selectedComplaint.priority || '')) payload.priority = editPriority
    if (editStatus !== (selectedComplaint.status || '')) payload.status = editStatus
    if (Object.keys(payload).length === 0) { setUpdating(false); return }
    const updated = await updateComplaint(selectedComplaint.id, payload)
    if (updated) {
      setSelectedComplaint(updated)
      fetchGrievanceLogs()
      fetchStatistics()
    }
    setUpdating(false)
  }

  const ADMIN_TABS = [
    { key: 'maps', label: 'Maps' },
    { key: 'charts', label: 'Graphical Representation' },
    { key: 'logs', label: 'Complaint Logs' },
  ]

  return (
    <PageLayout>
      <div className="flex flex-col h-full">
        {/* Tab bar */}
        <div className="px-6 py-3 border-b border-zinc-800/60 bg-[#080808]/90 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-0.5 p-1 bg-zinc-900 border border-zinc-700/50 w-fit" style={{ borderRadius: '0.4rem' }}>
            {ADMIN_TABS.map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{ borderRadius: '0.3rem' }}
                  className={`px-4 py-1.5 text-sm font-medium transition-all duration-150 whitespace-nowrap outline-none focus:outline-none ${isActive
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className={`flex-1 min-h-0 px-6 py-5 bg-[#080808] ${activeTab === 'maps' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          <motion.div
            className={`w-full ${activeTab === 'maps' ? 'flex flex-col flex-1 min-h-0' : ''}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >

            {/* ── TAB: Maps ─────────────────────────────────────────────── */}
            {activeTab === 'maps' && (
              <motion.div variants={itemVariants} className="flex flex-col flex-1 min-h-0">
                <div className="mb-3 flex-shrink-0">
                  <h1 className="text-2xl font-bold text-white mb-1">Mumbai Complaint Map</h1>
                  <p className="text-sm text-zinc-500">Live geographic view of all citizen grievances</p>
                </div>
                <div className="flex-1 min-h-0">
                  <AdminMumbaiMap />
                </div>
              </motion.div>
            )}

            {/* ── TAB: Graphical Representation ─────────────────────────── */}
            {activeTab === 'charts' && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-white mb-1">Graphical Representation</h1>
                  <p className="text-sm text-zinc-500">Charts, stats and complaint review at a glance</p>
                </div>

                {/* Row 1: Area chart (2/3) + Pie + Quick Stats (1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Area chart */}
                  <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Complaint Volume</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Monthly complaints vs resolutions</p>
                      </div>
                      {monthTrend && (
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="text-white font-medium">{monthTrend}</span>
                          <span>vs last month</span>
                        </div>
                      )}
                    </div>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <defs>
                            <linearGradient id="gcmp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f4f4f5" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#f4f4f5" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gres" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#71717a" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.4rem', fontSize: 12 }} labelStyle={{ color: '#f4f4f5' }} itemStyle={{ color: '#a1a1aa' }} />
                          <Area type="monotone" dataKey="complaints" stroke="#f4f4f5" strokeWidth={2} fill="url(#gcmp)" name="Complaints" />
                          <Area type="monotone" dataKey="resolved" stroke="#71717a" strokeWidth={2} fill="url(#gres)" name="Resolved" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-zinc-100" /><span className="text-xs text-zinc-400">Complaints</span></div>
                      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-zinc-500" /><span className="text-xs text-zinc-400">Resolved</span></div>
                    </div>
                  </Card>

                  {/* Right column: Pie + Quick stats */}
                  <div className="flex flex-col gap-6">
                    <Card className="p-6 flex-1">
                      <h3 className="text-base font-semibold text-white mb-4">Status Distribution</h3>
                      {(() => {
                        const pieData = [
                          { name: 'Resolved', value: stats?.byStatus?.resolved ?? 0 },
                          { name: 'In Progress', value: stats?.byStatus?.in_progress ?? 0 },
                          { name: 'Pending', value: stats?.byStatus?.pending ?? 0 },
                        ]
                        const hasData = pieData.some(d => d.value > 0)
                        return (
                          <>
                            {hasData ? (
                              <>
                                <div className="h-[150px]">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                                        {pieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx]} />)}
                                      </Pie>
                                      <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.4rem', fontSize: 12 }} />
                                    </RePieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-4 mt-3">
                                  {pieData.map((item, idx) => (
                                    <div key={item.name} className="flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[idx] }} />
                                      <span className="text-xs text-zinc-400">{item.name} ({item.value})</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="h-[150px] flex items-center justify-center text-zinc-500 text-sm">No data yet</div>
                            )}
                          </>
                        )
                      })()}
                    </Card>
                    <Card className="p-6">
                      <h3 className="text-base font-semibold text-white mb-4">Quick Stats</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Avg Resolution Time', value: avgResolutionDays > 0 ? `${avgResolutionDays} days` : '—' },
                          { label: 'Resolution Rate', value: stats?.totalComplaints ? `${Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100)}%` : '—' },
                          { label: 'Active Cases', value: (stats?.inProgressComplaints ?? 0).toLocaleString() },
                          { label: 'Pending Cases', value: (stats?.pendingComplaints ?? 0).toLocaleString() },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500">{label}</span>
                            <span className="text-sm font-semibold text-zinc-200">{value}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Horizontal category bar */}
                <Card className="p-6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-white">Complaints by Category</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Top categories</p>
                  </div>
                  {categoryData.length > 0 ? (
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ReBarChart data={categoryData} layout="vertical">
                          <XAxis type="number" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="category" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} width={90} />
                          <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.4rem', fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                          <Bar dataKey="count" fill="#71717a" radius={[0, 4, 4, 0]} name="Complaints" />
                        </ReBarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-zinc-500 text-sm">No category data yet</div>
                  )}
                </Card>

                {/* Total Complaints stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                      <motion.div key={i} whileHover={{ scale: 1.02, y: -3 }}>
                        <Card className="p-5 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-zinc-500 font-medium mb-1">{stat.title}</p>
                            <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
                          </div>
                          <Icon className="h-10 w-10 text-zinc-700" />
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Complaint Review */}
                <Card className="p-5 bg-zinc-900/70 border border-zinc-700/60">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Complaint Review</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Filter solved and unsolved complaints, then review details.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'solved', 'unsolved'].map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setViewFilter(filter)}
                          style={{ borderRadius: '0.4rem' }}
                          className={`px-4 py-2 text-sm font-semibold transition ${viewFilter === filter
                            ? 'bg-zinc-700 text-white border border-zinc-500'
                            : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-700/60 hover:text-zinc-200'
                            }`}
                        >
                          {filter === 'all' ? 'All' : filter === 'solved' ? 'Solved' : 'Unsolved'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Visible complaints</p>
                      <p className="mt-1.5 text-3xl font-semibold text-white">{visibleLogs.length}</p>
                    </div>
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Current view</p>
                      <p className="mt-1.5 text-base font-semibold text-zinc-200">{viewFilter === 'all' ? 'All complaints' : viewFilter === 'solved' ? 'Solved' : 'Unsolved'}</p>
                    </div>
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Quick actions</p>
                      <p className="mt-1.5 text-sm text-zinc-400">Review latest issues and update risk.</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── TAB: Complaint Logs ───────────────────────────────────── */}
            {activeTab === 'logs' && (
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="mb-2">
                  <h1 className="text-2xl font-bold text-white mb-1">Complaint Logs</h1>
                  <p className="text-sm text-zinc-500">AI-categorized complaints and social media signals</p>
                </div>

                {/* AI-categorized Complaint Log */}
                <Card className="p-5 overflow-x-auto border border-zinc-700/60 bg-zinc-900/70">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h3 className="text-base font-bold text-white">AI-categorized Complaint Log</h3>
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

                  {visibleLogs.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-sm">No grievance logs found.</div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="border-b border-zinc-700/60 bg-zinc-800/40 text-zinc-500 uppercase text-xs tracking-widest">
                        <tr>
                          <th className="py-4 px-4">Complaint ID</th>
                          <th className="py-4 px-4">Issue</th>
                          <th className="py-4 px-4">Category</th>
                          <th className="py-4 px-4">Priority</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4">Source</th>
                          <th className="py-4 px-4">Created</th>
                          <th className="py-4 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleLogs.map((g) => (
                          <motion.tr
                            key={g.id}
                            className="border-b border-zinc-800/60 hover:bg-zinc-800/50 transition-colors"
                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                          >
                            <td className="py-3 px-4 font-mono text-zinc-400 text-xs">{g.complaint_id || g.id?.slice(0, 8)}</td>
                            <td className="py-3 px-4 max-w-[260px] truncate text-zinc-200">{g.issue || '—'}</td>
                            <td className="py-3 px-4 capitalize text-zinc-400">{g.category || '—'}</td>
                            <td className="py-3 px-4">{getPriorityBadge(g.priority)}</td>
                            <td className="py-3 px-4">
                              <span style={{ borderRadius: '0.4rem' }} className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-zinc-700 text-zinc-200 capitalize">
                                {(g.status || 'pending').replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span style={{ borderRadius: '0.4rem' }} className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 capitalize">
                                {g.source || '—'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-xs text-zinc-600">{g.created_at ? new Date(g.created_at).toLocaleDateString() : '—'}</td>
                            <td className="py-3 px-4 text-center">
                              <Button size="sm" onClick={() => setSelectedComplaint(g)}>View</Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>

                {/* Social Media Complaints */}
                <Card className="p-5 overflow-x-auto border border-zinc-700/60 bg-zinc-900/70">
                  <h3 className="text-base font-bold text-white mb-1">Social Media Complaints</h3>
                  <p className="text-xs text-zinc-500 mb-4">Aggregated from public social platforms</p>
                  <table className="w-full text-sm text-left">
                    <thead className="border-b border-zinc-700/60 bg-zinc-800/40 text-zinc-500 uppercase text-xs tracking-widest">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Post Summary</th>
                        <th className="py-3 px-4">Platform</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Sentiment</th>
                        <th className="py-3 px-4">Reach</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'SM001', title: 'Pothole complaint thread', platform: 'Twitter/X', category: 'roads', sentiment: 'negative', reach: '1.2K', createdAt: '2026-04-10' },
                        { id: 'SM002', title: 'Garbage piling up video', platform: 'Instagram', category: 'sanitation', sentiment: 'negative', reach: '3.4K', createdAt: '2026-04-11' },
                        { id: 'SM003', title: 'Broken signal feedback', platform: 'Facebook', category: 'infrastructure', sentiment: 'negative', reach: '890', createdAt: '2026-04-09' },
                        { id: 'SM004', title: 'Water shortage petition', platform: 'Twitter/X', category: 'water', sentiment: 'negative', reach: '6.1K', createdAt: '2026-04-12' },
                        { id: 'SM005', title: 'Road repair appreciation', platform: 'Facebook', category: 'roads', sentiment: 'positive', reach: '540', createdAt: '2026-04-08' },
                        { id: 'SM006', title: 'Park cleaning request', platform: 'Twitter/X', category: 'environment', sentiment: 'neutral', reach: '310', createdAt: '2026-04-13' },
                        { id: 'SM007', title: 'Street light outage post', platform: 'Instagram', category: 'infrastructure', sentiment: 'negative', reach: '2.1K', createdAt: '2026-04-14' },
                        { id: 'SM008', title: 'Dog menace concern', platform: 'Facebook', category: 'animals', sentiment: 'negative', reach: '1.8K', createdAt: '2026-04-15' },
                      ].map(row => (
                        <tr key={row.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-zinc-400 text-xs">{row.id}</td>
                          <td className="py-3 px-4 max-w-[220px] truncate text-zinc-200">{row.title}</td>
                          <td className="py-3 px-4 text-zinc-400">{row.platform}</td>
                          <td className="py-3 px-4 capitalize text-zinc-400">{row.category}</td>
                          <td className="py-3 px-4">
                            <span style={{ borderRadius: '0.4rem' }} className="px-2 py-0.5 text-xs font-medium bg-zinc-700 text-zinc-300 capitalize">{row.sentiment}</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{row.reach}</td>
                          <td className="py-3 px-4 text-xs text-zinc-600">{new Date(row.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </motion.div>
            )}

          </motion.div>
        </div>

        {/* Review Modal — always mounted, outside tabs */}
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
                  <h2 className="text-lg font-bold text-white">Grievance Details</h2>
                  <p className="text-xs text-zinc-500 font-mono">{selectedComplaint.complaint_id || selectedComplaint.id}</p>
                </div>
                <button className="text-zinc-500 hover:text-white text-lg" onClick={() => setSelectedComplaint(null)}>✕</button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left column — read-only info */}
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
                          <div style={{ borderRadius: '0.4rem' }} className="overflow-hidden border border-zinc-700 max-h-52 bg-zinc-800">
                            <img src={selectedComplaint.before_photo} alt="Complaint evidence" className="w-full h-full object-cover" />
                          </div>
                          <a href={selectedComplaint.before_photo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white hover:underline">
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

                    {selectedComplaint.latitude && selectedComplaint.longitude && (
                      <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">Coordinates</p>
                        <p className="mt-1 text-sm text-zinc-300 font-mono">{selectedComplaint.latitude}, {selectedComplaint.longitude}</p>
                      </div>
                    )}
                  </div>

                  {/* Right column — editable fields */}
                  <div className="space-y-5">
                    {/* Category */}
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-5">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Category</p>
                      <div className="flex flex-wrap gap-2">
                        {['Water', 'Roads', 'Sanitation', 'Power', 'Infrastructure', 'Environment', 'General'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEditCategory(cat)}
                            style={{ borderRadius: '0.4rem' }}
                            className={`px-3 py-1.5 text-sm font-semibold transition ${editCategory === cat
                              ? 'bg-zinc-600 text-white border border-zinc-400'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Priority */}
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-5">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Priority</p>
                      <div className="flex flex-wrap gap-2">
                        {['critical', 'high', 'medium', 'low'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setEditPriority(level)}
                            style={{ borderRadius: '0.4rem' }}
                            className={`px-3 py-1.5 text-sm font-semibold transition capitalize ${editPriority === level
                              ? 'bg-zinc-600 text-white border border-zinc-400'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                              }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-5">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">Status</p>
                      <div className="flex flex-wrap gap-2">
                        {['pending', 'in_progress', 'resolved'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setEditStatus(s)}
                            style={{ borderRadius: '0.4rem' }}
                            className={`px-3 py-1.5 text-sm font-semibold transition capitalize ${editStatus === s
                              ? 'bg-zinc-600 text-white border border-zinc-400'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                              }`}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">Created</p>
                        <p className="mt-1 text-sm text-zinc-300">{selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleString() : '—'}</p>
                      </div>
                      <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">Updated</p>
                        <p className="mt-1 text-sm text-zinc-300">{selectedComplaint.updated_at ? new Date(selectedComplaint.updated_at).toLocaleString() : '—'}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={handleUpdateGrievance} isLoading={updating}>
                        Save Changes
                      </Button>
                      {editStatus !== 'resolved' && (
                        <Button variant="secondary" className="flex-1" onClick={handleResolve} isLoading={updating}>
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  )
}
