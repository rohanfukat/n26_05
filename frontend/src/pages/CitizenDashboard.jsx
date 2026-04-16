import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, User, Phone, Mail } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useUserStats } from '../hooks/useUserStats'
import { useUser } from '../context/UserContext'
import { getPriorityBadge } from '../utils/priorityCalculation'
import {
  BarChart as ReBarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts'

// Demo activity data — shown when no real complaints exist
const DEMO_WEEKLY = [
  { week: 'W1', filed: 2 },
  { week: 'W2', filed: 1 },
  { week: 'W3', filed: 3 },
  { week: 'W4', filed: 2 },
  { week: 'W5', filed: 4 },
  { week: 'W6', filed: 3 },
]

function getWeeklyActivity(complaints) {
  if (!complaints || complaints.length === 0) return DEMO_WEEKLY
  const now = new Date()
  const weeks = []
  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - i * 7)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const count = complaints.filter(c => {
      const d = new Date(c.created_at)
      return d >= weekStart && d < weekEnd
    }).length
    weeks.push({ week: `W${6 - i}`, filed: count })
  }
  return weeks
}
const PIE_C = ['#f4f4f5', '#71717a', '#3f3f46']

export default function CitizenDashboard() {
  const navigate = useNavigate()
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const { user } = useUser()
  const { stats, loading, fetchUserStats } = useUserStats()

  useEffect(() => {
    fetchUserStats()
  }, [fetchUserStats])

  const myComplaints = stats?.complaints || []
  const totalComplaints = stats?.total_complaints || 0
  const resolvedCount = stats?.resolved || 0
  const inProgressCount = stats?.in_progress || 0
  const pendingCount = stats?.pending || 0

  const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' }
  const STATUS_DOT = { pending: 'bg-zinc-500', in_progress: 'bg-zinc-300', resolved: 'bg-white' }

  return (
    <PageLayout>
      {/* Full-height, no outer scroll */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="px-6 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-end justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold text-white">My Complaints</h1>
              <p className="text-sm text-zinc-500 mt-0.5">All grievances filed by you</p>
            </div>
            <Button size="sm" onClick={() => navigate('/complaint')}>
              <Plus className="h-3.5 w-3.5 mr-1" /> New Complaint
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-6 py-3 grid grid-cols-4 gap-3 flex-shrink-0">
          {[
            { label: 'Total', val: totalComplaints },
            { label: 'Resolved', val: resolvedCount },
            { label: 'In Progress', val: inProgressCount },
            { label: 'Pending', val: pendingCount },
          ].map(({ label, val }) => (
            <Card key={label} className="p-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">{label}</span>
              <span className="text-xl font-bold text-white">{val}</span>
            </Card>
          ))}
        </div>


        {/* Charts section */}
        <div className="px-6 pb-3 grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">

          {/* Bar chart: overview */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Complaint Overview</h3>
            <div className="h-[110px]">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={[
                  { label: 'Filed', value: totalComplaints },
                  { label: 'Resolved', value: resolvedCount },
                  { label: 'Pending', value: totalComplaints - resolvedCount },
                ]}>
                  <XAxis dataKey="label" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} width={20} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.4rem', fontSize: 11 }} />
                  <Bar dataKey="value" fill="#71717a" radius={[3, 3, 0, 0]} name="Count" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Donut pie: status */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Resolution Status</h3>
            {(() => {
              const pd = [
                { name: 'Resolved', value: resolvedCount },
                { name: 'In Progress', value: inProgressCount },
                { name: 'Pending', value: pendingCount },
              ]
              return (
                <>
                  <div className="h-[80px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie data={pd} cx="50%" cy="50%" innerRadius={28} outerRadius={38} paddingAngle={3} dataKey="value">
                          {pd.map((_, i) => <Cell key={i} fill={PIE_C[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.4rem', fontSize: 11 }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                    {pd.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: PIE_C[i] }} />
                        <span className="text-[10px] text-zinc-500">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
          </Card>

          {/* Area chart: weekly activity */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Weekly Activity</h3>
            <div className="h-[110px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getWeeklyActivity(myComplaints)}>
                  <defs>
                    <linearGradient id="cwa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#71717a" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} width={20} />
                  <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '0.4rem', fontSize: 11 }} />
                  <Area type="monotone" dataKey="filed" stroke="#a1a1aa" strokeWidth={1.5} fill="url(#cwa)" name="Filed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>

        {/* Complaints list — scrollable within fixed height */}
        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ borderTop: '1px solid #27272a' }}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="h-8 w-8 border-3 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
              <p className="text-sm text-zinc-500 font-medium">Fetching your complaints...</p>
            </div>
          )}

          {!loading && myComplaints.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <FileText className="h-12 w-12 text-zinc-700" />
              <p className="text-zinc-500 text-sm">No complaints yet. File your first one.</p>
              <Button onClick={() => navigate('/complaint')}>
                <Plus className="h-4 w-4 mr-1" /> File Complaint
              </Button>
            </motion.div>
          )}

          {!loading && myComplaints.length > 0 && (
            <div className="pt-4 space-y-2">
              {myComplaints.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.005 }}
                  onClick={() => setSelectedComplaint(c)}
                  className="cursor-pointer"
                >
                  <Card className="px-5 py-4 flex items-center gap-4 hover:bg-zinc-800/80">
                    <div
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${STATUS_DOT[c.status] || 'bg-zinc-600'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm truncate">{c.issue || c.title}</p>
                        <span className="text-xs font-mono text-zinc-600">{c.complaint_id || c.id}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-zinc-500">
                      <span className="capitalize">{c.category}</span>
                      <span
                        style={{ borderRadius: '0.4rem' }}
                        className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300"
                      >
                        {STATUS_LABEL[c.status] || c.status}
                      </span>
                      <span>{getPriorityBadge(c.priority)}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedComplaint(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              style={{ borderRadius: '0.4rem' }}
              className="w-full max-w-2xl max-h-[85vh] overflow-hidden bg-zinc-900 border border-zinc-700/60 shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between p-6 border-b border-zinc-800 flex-shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedComplaint.issue || selectedComplaint.title}</h2>
                  <p className="text-xs font-mono text-zinc-500 mt-1">{selectedComplaint.complaint_id || selectedComplaint.id}</p>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-zinc-500 hover:text-white text-xl leading-none ml-4"
                >
                  ✕
                </button>
              </div>

              {/* Modal body */}
              <div className="overflow-y-auto p-6 space-y-5">
                <p className="text-sm text-zinc-400">{selectedComplaint.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Status', val: STATUS_LABEL[selectedComplaint.status] || selectedComplaint.status },
                    { label: 'Priority', val: `${getPriorityBadge(selectedComplaint.priority)} ${selectedComplaint.priority?.toUpperCase()}` },
                    { label: 'Category', val: selectedComplaint.category },
                    { label: 'Department', val: selectedComplaint.dept_allocated || 'Not Assigned' },
                    { label: 'Filed On', val: selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleDateString() : '—' },
                    { label: 'Location', val: selectedComplaint.location || '—' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                      <p className="text-sm font-semibold text-zinc-200">{val}</p>
                    </div>
                  ))}
                </div>

                {selectedComplaint.before_photo && (
                  <div style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Evidence Image</p>
                    <div style={{ borderRadius: '0.4rem' }} className="overflow-hidden border border-zinc-700 max-h-52 bg-zinc-800">
                      <img src={selectedComplaint.before_photo} alt="Complaint evidence" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <Button variant="secondary" onClick={() => setSelectedComplaint(null)} className="w-full">
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  )
}
