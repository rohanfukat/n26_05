import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, X, MapPin, Navigation, ThumbsUp } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useUser } from '../context/UserContext'
import { getPriorityBadge } from '../utils/priorityCalculation'
import { apiGetNeighborhoodComplaints, apiUpvoteGrievance } from '../services/api'

const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' }

export default function NeighborhoodComplaints() {
  const { user } = useUser()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [radiusKm, setRadiusKm] = useState(5)
  const [upvoting, setUpvoting] = useState(null)

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setLocationError(null)
      },
      () => {
        setLocationError('Unable to get your location. Please allow location access.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // Fetch nearby complaints when location or radius changes
  const fetchNearby = useCallback(async () => {
    if (!userLocation) return
    setLoading(true)
    try {
      const res = await apiGetNeighborhoodComplaints(userLocation.latitude, userLocation.longitude, radiusKm)
      if (res.success && res.data?.length) {
        setComplaints(res.data)
      } else {
        setComplaints([])
      }
    } catch {
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }, [userLocation, radiusKm])

  useEffect(() => { fetchNearby() }, [fetchNearby])

  // Handle upvote
  const handleUpvote = async (grievanceId) => {
    setUpvoting(grievanceId)
    try {
      const res = await apiUpvoteGrievance(grievanceId)
      if (res.success) {
        const updated = res.data
        setComplaints(prev => prev.map(c =>
          (c.id === updated.id || c.complaint_id === updated.complaint_id)
            ? { ...c, upvotes: updated.upvotes, upvoted_by: updated.upvoted_by, priority: updated.priority }
            : c
        ))
        if (selectedComplaint && (selectedComplaint.id === updated.id || selectedComplaint.complaint_id === updated.complaint_id)) {
          setSelectedComplaint(prev => ({ ...prev, upvotes: updated.upvotes, upvoted_by: updated.upvoted_by, priority: updated.priority }))
        }
      }
    } catch { /* ignore */ }
    setUpvoting(null)
  }

  const userId = user?.id || user?.user_id || ''
  const hasUpvoted = (c) => (c.upvoted_by || []).includes(userId)

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
            {userLocation
              ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
              : 'Detecting location…'}
            <span className="text-zinc-700">·</span>
            {complaints.length} complaints nearby
          </p>
        </div>

        {/* Location error */}
        {locationError && (
          <div className="mb-5 p-4 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            {locationError}
          </div>
        )}

        {/* Radius selector */}
        <div className="mb-5 flex items-center gap-3">
          <span className="text-xs text-zinc-400">Radius:</span>
          {[2, 5, 10, 25].map(r => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              style={{ borderRadius: '0.4rem' }}
              className={`px-3 py-1.5 text-xs font-medium border transition-all duration-150 ${radiusKm === r
                ? 'bg-zinc-700 text-white border-zinc-500'
                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:bg-zinc-700/60 hover:text-zinc-200'
                }`}
            >
              {r} km
            </button>
          ))}
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
                        className={`px-3 py-1.5 text-xs font-medium transition-all duration-150 border capitalize ${isActive
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
                <Card className="flex flex-col h-72 overflow-hidden hover:border-zinc-500/70 hover:bg-zinc-800/70 transition-all duration-150">
                  {/* Image area */}
                  <div className="flex-shrink-0 h-24 bg-zinc-800 flex items-center justify-center border-b border-zinc-700/50 overflow-hidden relative">
                    {(c.before_photo || c.imageUrl) ? (
                      <img src={c.before_photo || c.imageUrl} alt={c.issue || c.title} className="w-full h-full object-cover" />
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
                    <p className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-1">{c.issue || c.title}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 flex-1 mb-3">{c.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                        <span>{getPriorityBadge(c.priority)}</span>
                        <span className="capitalize">{STATUS_LABEL[c.status]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Upvote button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUpvote(c.id || c.complaint_id) }}
                          disabled={upvoting === (c.id || c.complaint_id)}
                          style={{ borderRadius: '0.4rem' }}
                          className={`flex items-center gap-1 text-xs px-2 py-1 border transition-all duration-150 ${hasUpvoted(c)
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                            : 'bg-zinc-800 border-zinc-700/60 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                            }`}
                        >
                          <ThumbsUp className="h-3 w-3" fill={hasUpvoted(c) ? 'currentColor' : 'none'} />
                          <span>{c.upvotes || 0}</span>
                        </button>
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          style={{ borderRadius: '0.4rem' }}
                          className="text-xs px-3 py-1 bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors duration-150"
                        >
                          Learn more
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filtered.length === 0 && !loading && (
              <div className="col-span-3 py-20 text-center text-zinc-500 text-sm">
                {userLocation ? 'No complaints found nearby. Try increasing the radius.' : 'Waiting for location access…'}
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
              className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-zinc-900 border border-zinc-700/60 shadow-[0_24px_80px_rgba(0,0,0,0.8)]"
            >
              {/* Image */}
              {(selectedComplaint.before_photo || selectedComplaint.imageUrl) ? (
                <div className="h-48 overflow-hidden border-b border-zinc-800">
                  <img src={selectedComplaint.before_photo || selectedComplaint.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-zinc-800 flex items-center justify-center border-b border-zinc-800 text-zinc-600">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 4h.01M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-zinc-800">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1 capitalize">{selectedComplaint.category}</p>
                  <h2 className="text-base font-bold text-white leading-tight">{selectedComplaint.issue || selectedComplaint.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-zinc-500 hover:text-white text-lg leading-none ml-4 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">{selectedComplaint.description}</p>

                {selectedComplaint.location && (
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedComplaint.location}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Status', val: STATUS_LABEL[selectedComplaint.status] || selectedComplaint.status },
                    { label: 'Priority', val: `${getPriorityBadge(selectedComplaint.priority)} ${selectedComplaint.priority?.toUpperCase()}` },
                    { label: 'Upvotes', val: `👍 ${selectedComplaint.upvotes || 0}` },
                    { label: 'Department', val: selectedComplaint.dept_allocated || 'Not Assigned' },
                    { label: 'Date', val: selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleDateString() : (selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleDateString() : '—') },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ borderRadius: '0.4rem' }} className="bg-zinc-800/60 border border-zinc-700/50 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-zinc-200">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Upvote button */}
                <button
                  onClick={() => handleUpvote(selectedComplaint.id || selectedComplaint.complaint_id)}
                  disabled={upvoting === (selectedComplaint.id || selectedComplaint.complaint_id)}
                  style={{ borderRadius: '0.4rem' }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 border transition-all duration-150 text-sm font-medium ${hasUpvoted(selectedComplaint)
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                    : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/60 hover:text-white'
                    }`}
                >
                  <ThumbsUp
                    className="h-4 w-4 transition-all duration-150"
                    fill={hasUpvoted(selectedComplaint) ? 'currentColor' : 'none'}
                  />
                  {hasUpvoted(selectedComplaint) ? 'Upvoted' : 'Upvote this complaint'}
                  <span className="text-zinc-500 font-normal text-xs ml-1">{selectedComplaint.upvotes || 0}</span>
                </button>

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
