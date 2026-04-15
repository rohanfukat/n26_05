import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, BarChart3, PieChart as PieChartIcon, TrendingUp,
  AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronRight,
  RefreshCw, Users,
} from 'lucide-react'
import PageLayout from '../components/PageLayout'
import CitizenNav from '../components/CitizenNav'
import Card from '../components/ui/Card'
import { useUser } from '../context/UserContext'
import { getPriorityColor, getPriorityBadge } from '../utils/priorityCalculation'
import { BarChart, PieChart as PieChartComponent, LineChart } from '../components/Charts/Charts'
import { apiGetNeighborhoodComplaints } from '../services/api'

// ─── Mock data used when backend is unavailable ────────────────────────────
const MOCK_COMPLAINTS = [
  { id: 'N001', title: 'Broken streetlight on MG Road', category: 'infrastructure', priority: 'high', status: 'pending', citizenName: 'Priya S.', createdAt: new Date('2026-03-10'), description: 'Streetlight near junction is broken for 3 weeks.', updates: [] },
  { id: 'N002', title: 'Overflowing garbage bin near park', category: 'sanitation', priority: 'critical', status: 'in_progress', citizenName: 'Rahul M.', createdAt: new Date('2026-03-15'), description: 'Garbage bin overflowing since last week.', updates: [] },
  { id: 'N003', title: 'Pothole on main road', category: 'roads', priority: 'high', status: 'resolved', citizenName: 'Anjali K.', createdAt: new Date('2026-02-28'), description: 'Large pothole causing accidents.', updates: [] },
  { id: 'N004', title: 'Water leakage from pipeline', category: 'water', priority: 'critical', status: 'in_progress', citizenName: 'Vikram T.', createdAt: new Date('2026-03-20'), description: 'Water pipeline burst, wastage for 5 days.', updates: [] },
  { id: 'N005', title: 'No dustbin near bus stop', category: 'sanitation', priority: 'medium', status: 'pending', citizenName: 'Meena R.', createdAt: new Date('2026-04-01'), description: 'No dustbin available causing littering.', updates: [] },
  { id: 'N006', title: 'Park benches damaged', category: 'infrastructure', priority: 'low', status: 'resolved', citizenName: 'Suresh P.', createdAt: new Date('2026-03-05'), description: 'Park benches are broken and unsafe.', updates: [] },
  { id: 'N007', title: 'Noise from construction at night', category: 'noise', priority: 'medium', status: 'pending', citizenName: 'Kavya D.', createdAt: new Date('2026-04-08'), description: 'Construction work continues after midnight.', updates: [] },
  { id: 'N008', title: 'Blocked storm drain causing flooding', category: 'water', priority: 'high', status: 'pending', citizenName: 'Arun B.', createdAt: new Date('2026-04-10'), description: 'Storm drain blocked, flooding every rain.', updates: [] },
]

const STATUS_CONFIG = {
  resolved:    { color: '#10b981', label: 'Resolved',    icon: CheckCircle },
  in_progress: { color: '#3b82f6', label: 'In Progress', icon: Clock },
  pending:     { color: '#f59e0b', label: 'Pending',     icon: AlertTriangle },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

// ─── Category accordion row ─────────────────────────────────────────────────
function CategoryAccordion({ category, complaints }) {
  const [open, setOpen] = useState(false)
  const resolved = complaints.filter(c => c.status === 'resolved').length
  const total = complaints.length

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          <span className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{category}</span>
          <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-300">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{resolved} resolved</span>
          <span>·</span>
          <span>{total - resolved} open</span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/50 dark:bg-slate-950/40">
              {complaints.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending
                const Icon = cfg.icon
                return (
                  <div key={c.id} className="px-6 py-4 flex items-start gap-4">
                    <Icon className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{c.title}</p>
                        <span className="text-xs rounded-full px-2 py-0.5 font-semibold text-white" style={{ backgroundColor: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="text-xs">{getPriorityBadge(c.priority)}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Filed by {c.citizenName} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function NeighborhoodComplaints() {
  const { user } = useUser()
  const pinCode = user?.pinCode || user?.pin_code || ''

  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [usingMock, setUsingMock] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiGetNeighborhoodComplaints(pinCode)
      if (res.success && res.data.length > 0) {
        setComplaints(res.data)
        setUsingMock(false)
      } else {
        // Backend not ready or no data — use mock so UI is visible
        setComplaints(MOCK_COMPLAINTS)
        setUsingMock(true)
      }
    } catch {
      setComplaints(MOCK_COMPLAINTS)
      setUsingMock(true)
    } finally {
      setLoading(false)
    }
  }, [pinCode])

  useEffect(() => { load() }, [load])

  // ── Derived stats ──────────────────────────────────────────────────────
  const total      = complaints.length
  const resolved   = complaints.filter(c => c.status === 'resolved').length
  const inProgress = complaints.filter(c => c.status === 'in_progress').length
  const pending    = complaints.filter(c => c.status === 'pending').length

  const byCategory = complaints.reduce((acc, c) => {
    acc[c.category] = acc[c.category] || []
    acc[c.category].push(c)
    return acc
  }, {})

  const categoryEntries = Object.entries(byCategory).sort(([, a], [, b]) => b.length - a.length)

  // Month-wise timeline (last 6 months) for line chart
  const monthMap = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap[key] = 0
  }
  complaints.forEach(c => {
    if (!c.createdAt) return
    const d = new Date(c.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in monthMap) monthMap[key]++
  })
  const timelinePoints = Object.entries(monthMap).map(([k, v]) => ({
    label: k.slice(5), // MM
    value: v,
  }))

  const statCards = [
    { label: 'Total',       value: total,      color: 'from-blue-500 to-cyan-500',    icon: Users },
    { label: 'Resolved',    value: resolved,   color: 'from-emerald-500 to-teal-500', icon: CheckCircle },
    { label: 'In Progress', value: inProgress, color: 'from-indigo-500 to-blue-500',  icon: Clock },
    { label: 'Pending',     value: pending,    color: 'from-amber-500 to-orange-500', icon: AlertTriangle },
  ]

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] px-4 py-8">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <CitizenNav />

          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                <MapPin className="h-3.5 w-3.5" />
                {pinCode ? `Pin Code: ${pinCode}` : 'All Neighborhoods'}
                {usingMock && <span className="ml-1 text-amber-500">(preview data)</span>}
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Neighborhood Complaints</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Public grievances filed in your area — real-time visibility for citizens.
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </motion.div>

          {/* Stat cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, color, icon: Icon }) => (
              <Card key={label} className={`p-5 bg-gradient-to-br ${color} border-0`}>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">{label}</p>
                    <p className="text-4xl font-bold text-white mt-1">{value}</p>
                  </div>
                  <Icon className="h-10 w-10 text-white/20" />
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Charts row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Status Pie */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Status Distribution</h3>
              </div>
              <div className="flex justify-center mb-4">
                <PieChartComponent
                  data={[
                    { label: 'Resolved',    value: resolved,   color: '#10b981' },
                    { label: 'In Progress', value: inProgress, color: '#3b82f6' },
                    { label: 'Pending',     value: pending,    color: '#f59e0b' },
                  ]}
                  size={130}
                />
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  { label: 'Resolved',    color: '#10b981', count: resolved },
                  { label: 'In Progress', color: '#3b82f6', count: inProgress },
                  { label: 'Pending',     color: '#f59e0b', count: pending },
                ].map(({ label, color, count }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Priority Bar */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Priority Breakdown</h3>
              </div>
              <div className="flex justify-center">
                <BarChart
                  data={['critical', 'high', 'medium', 'low'].map(p => ({
                    label: p.slice(0, 3).toUpperCase(),
                    value: complaints.filter(c => c.priority === p).length,
                    color: getPriorityColor(p),
                  }))}
                  width={260}
                  height={160}
                />
              </div>
            </Card>

            {/* Category Bar */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Top Categories</h3>
              </div>
              <div className="flex justify-center">
                <BarChart
                  data={categoryEntries.slice(0, 5).map(([cat, items]) => ({
                    label: cat.slice(0, 4).toUpperCase(),
                    value: items.length,
                    color: '#6366f1',
                  }))}
                  width={260}
                  height={160}
                />
              </div>
            </Card>
          </motion.div>

          {/* Timeline line chart */}
          <motion.div variants={itemVariants} className="mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-cyan-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Complaints Over Last 6 Months</h3>
              </div>
              <LineChart
                points={timelinePoints}
                width={Math.min(900, typeof window !== 'undefined' ? window.innerWidth - 80 : 800)}
                height={140}
                stroke="#06b6d4"
              />
              <div className="flex justify-between mt-1 px-3 text-xs text-slate-400 dark:text-slate-500">
                {timelinePoints.map(p => (
                  <span key={p.label}>Month {p.label}</span>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Category-wise complaints accordion */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Category-wise Breakdown</h2>
              <span className="text-xs text-slate-400 dark:text-slate-500">— click to expand</span>
            </div>
            <div className="space-y-3">
              {categoryEntries.length === 0 ? (
                <Card className="p-10 text-center text-slate-400 dark:text-slate-500">No complaints found.</Card>
              ) : (
                categoryEntries.map(([cat, items]) => (
                  <CategoryAccordion key={cat} category={cat} complaints={items} />
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  )
}
