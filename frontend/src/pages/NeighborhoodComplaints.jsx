import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, X, MapPin, Calendar } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useUser } from '../context/UserContext'
import { getPriorityBadge } from '../utils/priorityCalculation'
import { apiGetNeighborhoodComplaints } from '../services/api'

// ─── Dummy / Mock data (replace with live API when ready) ─────────────────
const MOCK_COMPLAINTS = [
  {
    id: 'N001', title: 'Broken streetlight on MG Road', category: 'infrastructure',
    priority: 'high', status: 'pending', citizenName: 'Priya S.',
    createdAt: new Date('2026-03-10'),
    description: 'Streetlight near the MG Road junction has been broken for over 3 weeks now, causing safety hazards for pedestrians and vehicles after dark. Multiple residents have already complained to the local ward office.',
    imageUrl: null, pinCode: '400001',
  },
  {
    id: 'N002', title: 'Overflowing garbage bin near park', category: 'sanitation',
    priority: 'critical', status: 'in_progress', citizenName: 'Rahul M.',
    createdAt: new Date('2026-03-15'),
    description: 'The municipal garbage bin near Shivaji Park has been overflowing for the past week. The waste spills onto the pavement creating an unhygienic environment and a foul smell.',
    imageUrl: null, pinCode: '400028',
  },
  {
    id: 'N003', title: 'Pothole on main road causes accidents', category: 'roads',
    priority: 'high', status: 'resolved', citizenName: 'Anjali K.',
    createdAt: new Date('2026-02-28'),
    description: 'A large pothole on the main road near the central market has already caused 2 bike accidents. Despite multiple complaints to the PWD department, the pothole remains unfilled.',
    imageUrl: null, pinCode: '400001',
  },
  {
    id: 'N004', title: 'Water pipeline burst causing wastage', category: 'water',
    priority: 'critical', status: 'in_progress', citizenName: 'Vikram T.',
    createdAt: new Date('2026-03-20'),
    description: 'A water pipeline burst on Linking Road has been causing massive water wastage for 5 consecutive days. Gallons of water are lost daily while the surrounding area faces supply shortages.',
    imageUrl: null, pinCode: '400050',
  },
  {
    id: 'N005', title: 'No dustbin near bus stop', category: 'sanitation',
    priority: 'medium', status: 'pending', citizenName: 'Meena R.',
    createdAt: new Date('2026-04-01'),
    description: 'The bus stop on Station Road has no dustbin within 50 metres, leading to widespread littering. Commuters leave waste on the footpath as there is no designated disposal spot.',
    imageUrl: null, pinCode: '400012',
  },
  {
    id: 'N006', title: 'Park benches damaged and unsafe', category: 'infrastructure',
    priority: 'low', status: 'resolved', citizenName: 'Suresh P.',
    createdAt: new Date('2026-03-05'),
    description: 'Several benches in the municipal park are broken with exposed metal edges posing injury risks to children and elderly visitors. Maintenance has not been done for over a year.',
    imageUrl: null, pinCode: '400016',
  },
  {
    id: 'N007', title: 'Construction noise past midnight', category: 'noise',
    priority: 'medium', status: 'pending', citizenName: 'Kavya D.',
    createdAt: new Date('2026-04-08'),
    description: 'Construction work at the new building on Turner Road continues past midnight every night, violating municipal noise bylaws. Residents in 4 adjoining buildings are unable to sleep.',
    imageUrl: null, pinCode: '400036',
  },
  {
    id: 'N008', title: 'Blocked storm drain causes flooding', category: 'water',
    priority: 'high', status: 'pending', citizenName: 'Arun B.',
    createdAt: new Date('2026-04-10'),
    description: 'The storm drain at the junction of SV Road and Hill Road is completely blocked with debris, causing street flooding every time it rains, making the road impassable for vehicles.',
    imageUrl: null, pinCode: '400064',
  },
  {
    id: 'N009', title: 'Stray dogs near school gates', category: 'animals',
    priority: 'high', status: 'pending', citizenName: 'Pooja N.',
    createdAt: new Date('2026-04-12'),
    description: 'A pack of stray dogs has been aggressive near the school gate on Peddar Road. Three children have been chased and one was bitten last week. Parents are afraid to drop children to school.',
    imageUrl: null, pinCode: '400026',
  },
  {
    id: 'N010', title: 'Illegal hawkers blocking footpath', category: 'roads',
    priority: 'medium', status: 'in_progress', citizenName: 'Sanjay V.',
    createdAt: new Date('2026-04-05'),
    description: 'Unauthorised hawkers have set up permanent stalls on the footpath of FC Road, completely blocking pedestrian movement and forcing pedestrians onto the road, risking accidents.',
    imageUrl: null, pinCode: '400007',
  },
  {
    id: 'N011', title: 'Sewage overflow on residential lane', category: 'sanitation',
    priority: 'critical', status: 'pending', citizenName: 'Rekha G.',
    createdAt: new Date('2026-04-14'),
    description: 'Raw sewage has been overflowing into the residential lane behind Parel station for 3 days. The stench is unbearable and residents fear disease outbreak in the densely populated area.',
    imageUrl: null, pinCode: '400012',
  },
  {
    id: 'N012', title: 'Street signage missing on major junction', category: 'infrastructure',
    priority: 'medium', status: 'resolved', citizenName: 'Dilip M.',
    createdAt: new Date('2026-03-28'),
    description: 'Traffic direction signs at the Goregaon link road junction have been missing for 2 months, causing frequent wrong-way driving incidents and traffic confusion during peak hours.',
    imageUrl: null, pinCode: '400063',
  },
]

const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' }

export default function NeighborhoodComplaints() {
  const { user } = useUser()
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS)
  const [loading, setLoading] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const pin = user?.pinCode
    if (!pin) return
    setLoading(true)
    apiGetNeighborhoodComplaints(pin)
      .then(data => { if (data?.length) setComplaints(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.pinCode])

  const categories = ['all', ...Array.from(new Set(complaints.map(c => c.category))).sort()]
  const filtered = activeCategory === 'all' ? complaints : complaints.filter(c => c.category === activeCategory)

  return (
    <PageLayout>
      <div className="min-h-screen w-full px-6 py-5">

        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-white">Neighborhood Complaints</h1>
          <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {user?.pinCode ? `PIN ${user.pinCode}` : 'Nearby area'}
            <span className="text-zinc-700">·</span>
            {complaints.length} complaints total
          </p>
        </div>

        {/* ── Category-wise breakdown dropdown ─────────────────────────── */}
        <div
          style={{ borderRadius: '0.4rem' }}
          className="mb-6 border border-zinc-700/60 bg-zinc-900/70 overflow-hidden"
        >
          <button
            onClick={() => setCategoryOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-zinc-800/50 transition-colors duration-150"
          >
            <span className="text-sm font-semibold text-zinc-200">
              Category-wise breakdown
              {activeCategory !== 'all' && (
                <span className="ml-2 text-xs text-zinc-400 font-normal">— {activeCategory}</span>
              )}
            </span>
            {categoryOpen
              ? <ChevronUp className="h-4 w-4 text-zinc-500" />
              : <ChevronDown className="h-4 w-4 text-zinc-500" />}
          </button>

          <AnimatePresence>
            {categoryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-zinc-800"
              >
                <div className="p-4 flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const count = cat === 'all'
                      ? complaints.length
                      : complaints.filter(c => c.category === cat).length
                    const isActive = activeCategory === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setCategoryOpen(false) }}
                        style={{ borderRadius: '0.4rem' }}
                        className={`px-3 py-1.5 text-xs font-medium transition-all duration-150 border capitalize ${
                          isActive
                            ? 'bg-zinc-700 text-white border-zinc-500'
                            : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700/60 hover:text-zinc-200'
                        }`}
                      >
                        {cat} <span className="ml-1 opacity-60">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active filter badge */}
        {activeCategory !== 'all' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-zinc-500">Showing:</span>
            <span
              style={{ borderRadius: '0.4rem' }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs capitalize"
            >
              {activeCategory}
              <button
                onClick={() => setActiveCategory('all')}
                className="text-zinc-500 hover:text-white ml-1 leading-none"
              >✕</button>
            </span>
          </div>
        )}

        {/* ── Complaints grid — 3 columns ──────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="flex flex-col h-64 overflow-hidden hover:border-zinc-500/70 hover:bg-zinc-800/70 transition-all duration-150">
                  {/* Image area */}
                  <div
                    className="flex-shrink-0 h-24 bg-zinc-800 flex items-center justify-center border-b border-zinc-700/50 overflow-hidden relative"
                  >
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-zinc-600">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 4h.01M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                        </svg>
                        <span className="text-[10px]">No image</span>
                      </div>
                    )}
                    <span
                      style={{ borderRadius: '0.4rem' }}
                      className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-black/60 text-zinc-300 capitalize"
                    >{c.category}</span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4 min-h-0">
                    <p className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-1">{c.title}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 flex-1 mb-3">{c.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                        <span>{getPriorityBadge(c.priority)}</span>
                        <span className="capitalize">{STATUS_LABEL[c.status]}</span>
                      </div>
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        style={{ borderRadius: '0.4rem' }}
                        className="text-xs px-3 py-1 bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors duration-150"
                      >
                        Learn more
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-3 py-20 text-center text-zinc-500 text-sm">
                No complaints found in this category.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Learn More Modal ──────────────────────────────────────────── */}
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
              className="w-full max-w-xl max-h-[85vh] overflow-hidden bg-zinc-900 border border-zinc-700/60 shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col"
            >
              {/* Image */}
              {selectedComplaint.imageUrl ? (
                <div className="h-48 flex-shrink-0 overflow-hidden border-b border-zinc-800">
                  <img src={selectedComplaint.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 flex-shrink-0 bg-zinc-800 flex items-center justify-center border-b border-zinc-800 text-zinc-600">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 4h.01M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-zinc-800 flex-shrink-0">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 capitalize">{selectedComplaint.category}</p>
                  <h2 className="text-base font-bold text-white leading-tight">{selectedComplaint.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-zinc-500 hover:text-white text-lg leading-none ml-4 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-5 space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">{selectedComplaint.description}</p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Status',   val: STATUS_LABEL[selectedComplaint.status] || selectedComplaint.status },
                    { label: 'Priority', val: `${getPriorityBadge(selectedComplaint.priority)} ${selectedComplaint.priority?.toUpperCase()}` },
                    { label: 'Filed by', val: selectedComplaint.citizenName || '—' },
                    { label: 'Date',     val: selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleDateString() : '—' },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-zinc-200">{val}</p>
                    </div>
                  ))}
                </div>

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
